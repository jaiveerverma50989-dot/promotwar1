# 🇮🇳 VoterBuddy India: Indian Election Assistant

**VoterBuddy India** is a premium, interactive web application designed to help citizens understand the Indian electoral process. Built with a sleek, dark-mode UI inspired by the colors of the Indian flag, it provides an engaging way to learn about the world's largest democracy.

## 🚀 Live Demo
**[View the Live App on Google Cloud Run](https://election-assistant-325019738133.us-central1.run.app)**

---

## ✨ Key Features

### 📖 Interactive Election Guide
A step-by-step timeline that breaks down the entire process—from checking eligibility and registering via Form 6 to the final steps of voting at a polling station.

### 📇 3D Interactive Flashcards
Master essential election terminology (like VVPAT, NOTA, and EPIC) using 3D flipping cards with smooth animations and intuitive navigation.

### 📝 Knowledge Quiz
Test your understanding of the Indian democratic system with an interactive quiz module featuring live feedback, detailed explanations, and a final scoring summary.

### 🤖 AI-Powered Assistant
A conversational chat assistant that answers your specific questions about voter registration, polling procedures, and more. Powered by **Google Gemini AI**.

---

## 🛠️ Tech Stack
- **Frontend:** Vanilla HTML5, CSS3 (Glassmorphism), JavaScript (ES6)
- **Backend:** Node.js, Express
- **AI Integration:** Google Generative AI (Gemini) SDK
- **Deployment:** Docker, Google Cloud Run
- **Design:** Google Fonts (Outfit & Inter), Font Awesome Icons

---

## 💻 Local Development

### Prerequisites
- Node.js (v18 or higher)
- A Google Gemini API Key (optional, for AI chat)

### Installation
1. Clone the repository:
   ```bash
   git clone git@github.com:jaiveerverma50989-dot/promotwar1.git
   cd promotwar1
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file in the root and add:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=8080
   ```
4. Start the server:
   ```bash
   npm start
   ```
   The app will be available at `http://localhost:8080`.

---

## ☁️ Deployment to Google Cloud Run

The project is containerized and ready for Google Cloud Run.

1. Authenticate with Google Cloud:
   ```bash
   gcloud auth login
   ```
2. Set your project:
   ```bash
   gcloud config set project promotwar1
   ```
3. Run the deployment script:
   ```bash
   sh deploy.sh
   ```

---

## 📄 License
This project is for educational purposes. All data is based on official procedures from the **Election Commission of India**.
