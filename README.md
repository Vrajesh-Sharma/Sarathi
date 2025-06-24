# 🌸 Sarathi – Krishna for Everyone
A spiritually guided chatbot offering divine wisdom inspired by the Bhagavad Gita.

## 🌟 Overview
Sarathi is a spiritual chatbot designed to simulate conversations with **Shree Krishna**, offering responses rooted in the teachings of the *Bhagavad Gita*. Built with modern web technologies and powered by a Language Model (LLM), the chatbot allows users to ask personal or philosophical questions and receive compassionate, scripture-inspired answers.

## ✨ Features
- Divine responses based on Bhagavad Gita verses.
- Voice response (text-to-speech) in both English and Hindi.
- Language toggle support (English 🇬🇧 / Hindi 🇮🇳).
- Krishna-style emotional welcome and response tones.
- Typing animation mimicking divine response generation.
- Scrollable, modern chat UI with speech synthesis.
- Intelligent backend powered by LLM + Pinecone + Gemini.

## 🛠️ Tech Stack
**Frontend:**
- React with TypeScript
- Framer Motion for animations
- Tailwind CSS
- React Markdown
- Lucide React icons
- Web Speech API (Text-to-Speech)
**Backend:**
- Flask (Python)
- Gemini LLM API
- Pinecone Vector DB
- Render for deployment

## 🚀 Getting Started
### 1. Clone the repository
```bash
git clone https://github.com/Vrajesh-Sharma/sarathi.git
cd sarathi
```
Install frontend dependencies
```bash
cd frontend
npm install
npm run dev
```
Run backend server
```bash
cd backend
pip install -r requirements.txt
python app.py
```

📌 Note: Make sure your `.env` contains valid keys for Pinecone and Gemini API.

## 🌍 Deployment
This project is hosted using:
- **Frontend:** Vercel (https://sarathi-ai-swart.vercel.app)
- **Backend:** Render - To deploy your own version, update environment variables and deploy with your preferred platforms.

## 🙏 How to Use
1. Open the web app.
2. You'll be greeted by Krishna with a warm spiritual message.
3. Ask any question about:
   - Life struggles
   - Work and business dilemmas
   - Family issues
   - Spiritual confusions
4. Krishna responds based on Bhagavad Gita teachings.

> Example Questions:
> - “I’m feeling lost in my career. What should I do?”
> - “How do I handle separation in a marriage?”
> - “What does Krishna say about material desires?”

---

> _“You have the right to perform your actions, but not the fruits of them.”_  
> — Bhagavad Gita 2.47
