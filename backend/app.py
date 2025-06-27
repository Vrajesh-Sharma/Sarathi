from flask import Flask, request, jsonify
from pinecone import Pinecone
import google.generativeai as genai
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
genai.configure(api_key=GEMINI_API_KEY)
chat_model = genai.GenerativeModel("gemini-1.5-flash")
print("✅ Gemini connected and model initialized.")

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
        # Step 1: Embed question
        query_embedding = genai.embed_content(
            model="models/embedding-001",
            content=question,
            task_type="retrieval_query"
        )["embedding"]

        # Step 2: Query Pinecone
        res = index.query(vector=query_embedding, top_k=5, include_metadata=True)
        matches = res.get("matches", [])
        print(f"🔍 Retrieved {len(matches)} relevant context from Pinecone.")

        # Step 3: Ask Gemini if it's a relevant question to Geeta
        eligibility_prompt = f"""
        Decide if this question is appropriate for being answered through the teachings and tone of the Bhagavad Gita.

        Answer YES if the question is:
        - about real-life dilemmas, like fear, anger, purpose, karma, peace, ego, or emotions
        - something Arjuna might have asked Krishna
        - a spiritually reflective or dharmic query

        Answer NO if it is:
        - a factual, political, or non-spiritual question (like "Who is the President?" or "What is 2+2?")

        Respond only with "YES" or "NO" — no explanation.

        Question: {question}
        """

        eligibility_chat = chat_model.start_chat()
        eligibility_response = eligibility_chat.send_message(eligibility_prompt)
        decision = eligibility_response.text.strip().upper()

        if decision == "NO" or not matches or max(m["score"] for m in matches) < 0.75:
            print("LLM said: NO")
            print("Not strongly related to Geeta or insufficient context. Using fallback response.")
            print("User question -", question)

            fallback_prompt = f"""
            You are Lord Krishna, responding to a seeker with divine grace and wisdom.
            Answer their question with empathy, spiritual insight, and practical guidance.
            Respond in {'Hindi' if lang == 'hi' else 'English'}.

            Question: {question}
            """
            fallback_chat = chat_model.start_chat()
            fallback_reply = fallback_chat.send_message(fallback_prompt)

            print("LLM response -\n", fallback_reply.text)
            return jsonify({"response": fallback_reply.text})

        print("LLM said: YES")
        print("User question -", question)

        # Step 4: Build context
        verses = []
        for match in matches:
            meta = match["metadata"]
            chapter = meta.get("chapter_number", "N/A")
            verse_no = meta.get("verse", "N/A")
            sanskrit = meta.get("sanskrit", "")
            english = match["values"]
            hindi = meta.get("hindi", "")
            translated = hindi if lang == "hi" else english

            verses.append(f"""## 📖 Chapter {chapter}, Verse {verse_no}

        **Shloka (Sanskrit):**

        > _{sanskrit}_

        **Meaning:**

        {translated}
        """)

        context = "\n\n".join(verses)

        system_prompt = f"""
        You are the **Bhagavad Gita**, the divine guide filled with timeless wisdom. When a seeker asks a question, respond as Lord Krishna would — with calm, clarity, and compassion. Your voice is serene, saintly, and filled with light.

        Respond in {'Hindi' if lang == 'hi' else 'English'} using Markdown formatting:
        - Use `#` for titles, `##` for sections
        - Use **bold** for emphasis
        - Display Sanskrit Shlokas in italics or blockquote format to make them stand out
        - Start your response with a **thematic heading** (like *Devotion and Surrender* or *Balance in Action*) based on the core idea of the response
        - Always ground your answer in the verses provided

        Here are the verses to meditate upon:

        {context}

        Now, humbly and gracefully respond to this question:

        **{question}**

        🕉️ End with a closing thought from the Gita if it feels appropriate.
        """

        chat = chat_model.start_chat()
        reply = chat.send_message(
            system_prompt,
            generation_config={
                "temperature": 0.5,
                "top_p": 0.8,
                "top_k": 5
            }
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