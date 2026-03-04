from flask import Flask, request, jsonify
from pinecone import Pinecone
from google import genai
from google.genai import types
import os
from dotenv import load_dotenv
from flask_cors import CORS


# ==== LOAD ENV ====
load_dotenv()


# ==== CONFIGURATION ====
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
INDEX_NAME = os.getenv("INDEX_NAME")


# ==== INIT APP ====
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


# ==== INIT SERVICES ====
print("🔗 Connecting to Pinecone...")
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(INDEX_NAME)
print("✅ Pinecone connected and index loaded.")

print("🔗 Connecting to Gemini...")
client = genai.Client(api_key=GEMINI_API_KEY)
print("✅ Gemini GenAI client initialized.")


# ==== QUERY EXPANSION ====
def expand_query(question: str, lang: str) -> str:
    """
    Rewrites the user's question into a spiritually-rich query
    to improve Pinecone retrieval scores.
    """
    prompt = f"""
You are a Bhagavad Gita scholar. Rewrite the following question into a
spiritual search query using Gita-relevant keywords (e.g., duty, mind, 
attachment, fear, action, surrender, self, devotion, knowledge).
Keep it under 20 words. Return ONLY the rewritten query, nothing else.

Question: {question}
Rewritten Query:"""
    try:
        result = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        expanded = result.text.strip()
        print(f"🔄 Expanded query: {expanded}")
        return expanded
    except Exception as e:
        print(f"⚠️ Query expansion failed, using original: {e}")
        return question


def classify_question_depth(question: str) -> str:
    """
    Classifies the question as 'brief', 'moderate', or 'detailed'
    so the LLM knows how long to respond.
    """
    brief_keywords = [
        "what is", "who is", "define", "meaning of", "which chapter",
        "how many", "name", "list", "verse number"
    ]
    detailed_keywords = [
        "explain", "elaborate", "in detail", "describe", "how does",
        "why does", "tell me about", "what does gita say about",
        "heal", "help me understand", "guide me"
    ]

    q_lower = question.lower()

    if any(kw in q_lower for kw in brief_keywords):
        return "brief"
    elif any(kw in q_lower for kw in detailed_keywords):
        return "detailed"
    else:
        return "moderate"


# ==== HEALTH CHECK ENDPOINT ====
@app.route("/keep-alive", methods=["POST"])
def keep_alive():
    data = request.get_json()
    query = data.get("query", "Are you awake?")
    now = request.args.get("now", "Yes")
    return jsonify({"response": f"I am awake at {now}. You asked: {query}"})


# ==== MAIN QA ENDPOINT ====
@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    question = data.get("question")
    lang = data.get("lang", "en")

    if not question:
        return jsonify({"error": "No question provided."}), 400

    try:
        # Step 1: Classify question depth
        depth = classify_question_depth(question)
        print(f"📏 Question depth: {depth}")

        # Step 2: Expand query for better retrieval
        search_query = expand_query(question, lang)

        # Step 3: Embed expanded query
        embed_result = client.models.embed_content(
            model="gemini-embedding-001",
            contents=search_query,
            config=types.EmbedContentConfig(task_type="RETRIEVAL_QUERY")
        )
        query_embedding = embed_result.embeddings[0].values

        # Step 4: Query Pinecone
        # Use top_k=3 for brief, top_k=5 for moderate/detailed
        top_k = 3 if depth == "brief" else 5
        res = index.query(vector=query_embedding, top_k=top_k, include_metadata=True)
        matches = res.get("matches", [])

        print(f"🧠 User Question: {question}")
        print(f"🔍 Retrieved {len(matches)} relevant contexts from Pinecone.")
        scores = [round(m["score"], 4) for m in matches]
        print(f"📊 Scores: {', '.join(map(str, scores))}")

        # Step 5: Threshold check — use only matches above 0.5
        strong_matches = [m for m in matches if m["score"] >= 0.5]

        if not strong_matches:
            print("⚠️ No strong context found. Using fallback response.")
            fallback_prompt = f"""
You are Lord Krishna from the Bhagavad Gita, responding with divine wisdom.
Answer this question directly and concisely in {'Hindi' if lang == 'hi' else 'English'}.
Be warm but brief — 2 to 4 sentences max unless the question demands more depth.

Question: {question}
"""
            fallback_reply = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=fallback_prompt
            )
            print("LLM fallback response -\n", fallback_reply.text)
            return jsonify({"response": fallback_reply.text})

        # Step 6: Build verse context
        verses = []
        for match in strong_matches:
            meta = match["metadata"]
            chapter = meta.get("chapter_number", "N/A")
            verse_no = meta.get("verse", "N/A")
            sanskrit = meta.get("sanskrit", "")
            english = meta.get("english", "")
            hindi = meta.get("hindi", "")
            translated = hindi if lang == "hi" else english

            verses.append(f"📖 {chapter}, Verse {verse_no}\n> _{sanskrit}_\n**Meaning:** {translated}")

        context = "\n\n".join(verses)

        # Step 7: Response length instructions based on depth
        length_instruction = {
            "brief": (
                "Give a SHORT, direct answer — 2 to 4 sentences max. "
                "Quote ONE verse only if directly relevant. No long explanations."
            ),
            "moderate": (
                "Give a FOCUSED answer — 1 short paragraph + 1 or 2 relevant verses. "
                "Stay on point. Don't over-explain."
            ),
            "detailed": (
                "Give a THOROUGH response with compassion and depth. "
                "Use 2 to 3 verses. Explain each verse's relevance to the question. "
                "Offer practical spiritual guidance."
            )
        }[depth]

        # Step 8: Final prompt
        system_prompt = f"""
You are Lord Krishna from the Bhagavad Gita, responding to a seeker with calm wisdom.
Respond in {'Hindi' if lang == 'hi' else 'English'} using Markdown.

**Response Length Rule:** {length_instruction}

**Strict Rules:**
- Answer the EXACT question asked. Don't go off on tangents.
- Only use the verses provided below. Don't invent or paraphrase other verses.
- If a verse isn't directly relevant to the question, don't include it.
- Sanskrit shloka in blockquote (`>`), meaning in plain text below it.
- Do NOT start with lengthy introductions. Get to the point.
- End with ONE closing line — brief and meaningful.

**Relevant Verses from the Gita:**
{context}

**Seeker's Question:** {question}

Lord Krishna's Response:
"""

        reply = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=system_prompt,
            config=types.GenerateContentConfig(
                temperature=0.4,
                top_p=0.85,
                top_k=10
            )
        )

        print("LLM response -\n", reply.text)
        return jsonify({"response": reply.text})

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"error": str(e)}), 500


# ==== START SERVER ====
if __name__ == "__main__":
    print("🚀 Starting Geeta AI Flask Server...")
    app.run(debug=True, port=5000)