# 🚀 AI-Powered Lead Capture Widget

An intelligent, full-stack lead capture assistant built with **Next.js App Router**, **MongoDB Atlas**, **Google Gemini API**, and **Discord Webhooks**. Designed to seamlessly engage website visitors, extract contact details, persist transcripts, and alert sales teams in real time.

---

## ✨ Key Features

- **Conversational AI Assistant**: Powered by Google's `gemini-3.8-flash` model to engage users and answer queries naturally.
- **Automated Regex Lead Extraction**: Scans chat messages in real time to automatically detect and extract user email addresses.
- **Persistent Database Storage**: Automatically logs leads and full conversation transcripts to **MongoDB Atlas** via Mongoose.
- **Real-Time Discord Webhook Alerts**: Instantly pings a designated Discord channel with lead details and chat metrics the moment an email is captured.
- **Non-Blocking Architecture**: Features robust asynchronous handling and timeout safeguards to ensure chat responses remain snappy and error-free.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, React, TypeScript)
- **Styling**: Tailwind CSS
- **Database**: MongoDB Atlas, Mongoose
- **AI Integration**: Google Gen AI SDK (`@google/genai`)
- **Notifications**: Discord Webhooks

---

## ⚙️ Getting Started Locally

1. **Clone the repository**:
   ```bash
   git clone [https://github.com/YOUR_USERNAME/ai-lead-widget.git](https://github.com/YOUR_USERNAME/ai-lead-widget.git)
   cd ai-lead-widget