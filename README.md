# UniVoice

A browser-based demo of a multilingual University Admissions Voice Assistant built with Vapi and Next.js. It lets prospective students call a simulated admissions agent, ask questions about deadlines, courses, fees, campus tours, and more, and see a live transcript—all directly in the browser.

---

## 🏆 Hackathon Submission

**Vapi Build Challenge 2025**

- **Team / Creator:** Danh
- **Category:** Creative Use Cases & Real-World Applications
- **Prize Sought:** Up to \$15,000 + 100K Vapi minutes
- **Demo Link:** [https://your-deployment-url.vercel.app](https://your-deployment-url.vercel.app)

**Why UniVoice?**

- **Cost Savings:** Automates seasonal inquiry volume for university admissions offices.
- **Multilingual:** Auto-detects and responds in English, Vietnamese, Japanese, Mandarin, and more.
- **Instant Deployment:** Built in days, deployable to any static host (Vercel recommended).
- **Open Source:** Full code on GitHub, extensible with Supabase or other backends.

---

## ✨ Features

- **Real-Time Voice Calls:** Users click **Start Call**, grant mic access, and dial into the assistant.
- **Live Transcript:** Displays user questions and assistant responses with timestamps.
- **Call Duration Timer:** Shows elapsed call time.
- **Multilingual Support:** Detects and displays language badge; can speak in multiple languages.
- **Barge-In:** Users can interrupt the assistant at any point.
- **Clean UI:** One-page, mobile-responsive layout with Tailwind CSS.

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/univoice.git
cd univoice
npm install
# or yarn / pnpm
```

### 2. Environment Variables

Create a `.env.local` in the project root:

```env
NEXT_PUBLIC_VAPI_API_KEY=pk_live_…      # Your Vapi public key
NEXT_PUBLIC_VAPI_ASSISTANT_ID=utsv1_…  # Your Vapi Assistant ID
```

### 3. Run Locally

```bash
npm run dev
# or yarn dev
# then open http://localhost:3000
```

### 4. Grant Microphone Access

Your browser will prompt for microphone access when you click **Start Call**. If denied, update site permissions and reload.

---

## 🏗️ Architecture

- **Next.js App (app/page.tsx):** Client component with `useEffect` hooks wiring Vapi Web SDK events.
- **Vapi Web SDK:** Handles real-time streaming, transcription, TTS, and call management.
- **Tailwind CSS:** Utility-first styling for rapid UI development.
- **Env Config:** Public keys in `.env.local`, no server-side secret exposure.

---

## 📁 Project Structure

```
├── app
│   └── page.tsx        # Main UI + Vapi logic
├── public
│   └── ...             # Static assets
├── styles              # Tailwind config (if custom)
├── .env.local          # Public API keys
├── next.config.js      # Next.js config (CSP, headers)
└── package.json
```

---

## 📸 Screenshots

![UniVoice Demo](./public/screenshot-demo.png)

---

## 🤝 Contributing

Feel free to open issues or PRs. We welcome improvements:

- Add Supabase integration for user logins.
- Include more languages and voices.
- Improve transcript styling or accessibility.

---

## 📄 License

MIT © Danh

---

Built with ❤️ using Vapi • Next.js • Tailwind CSS • GPT-4
