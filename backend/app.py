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
CORS(app, resources={r"/*": {"origins": "*"}})  # Or set to frontend domain

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

        # Step 3: Build context
        verses = []
        for match in res["matches"]:
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
        - Use `**bold**` for emphasis
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
        reply = chat.send_message(system_prompt)

        # 🌟 Log user query and LLM response
        print("📥 User Question:", question)
        print("🧠 Gemini Response:\n", reply.text)
        return jsonify({"response": reply.text})

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"error": str(e)}), 500

# ==== START SERVER ====
if __name__ == "__main__":
    print("🚀 Starting Geeta AI Flask Server...")
    app.run(debug=True, port=5000)