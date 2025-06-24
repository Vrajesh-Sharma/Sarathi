from flask import Flask, request, jsonify
from pinecone import Pinecone
import google.generativeai as genai
import os

# ==== CONFIGURATION ====
PINECONE_API_KEY = "your-pinecone-api-key"
GEMINI_API_KEY = "your-gemini-api-key"
INDEX_NAME = "bhagwad-geeta"

# ==== INIT APP ====
app = Flask(__name__)

# ==== INIT SERVICES ====
print("🔗 Connecting to Pinecone...")
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(INDEX_NAME)
print("✅ Pinecone connected and index loaded.")

print("🔗 Connecting to Gemini...")
genai.configure(api_key=GEMINI_API_KEY)
chat_model = genai.GenerativeModel("gemini-pro")
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

            verses.append(f"""### 📖 {chapter} – Verse {verse_no}

**Sanskrit:**  
```text
{sanskrit}
```

**Meaning:**  
{translated}
""")

        context = "\n\n".join(verses)

        # Step 4: Compose system prompt
        system_prompt = f"""
You are the Bhagavad Gita, responding in a calm, wise, saintly tone.
Use the verses below to guide your answer.

Respond in {'Hindi' if lang == 'hi' else 'English'} in Markdown format.
Keep your answer spiritual, practical, and graceful.

{context}

Now answer this question:

**{question}**
"""

        # Step 5: Generate final answer
        chat = chat_model.start_chat()
        reply = chat.send_message(system_prompt)

        return jsonify({"response": reply.text})

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"error": str(e)}), 500

# ==== START SERVER ====
if __name__ == "__main__":
    print("🚀 Starting Geeta AI Flask Server...")
    app.run(debug=True, port=5000)
