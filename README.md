# AIReviewMate

The **AI Code Reviewer** is a web-based application that continuously analyzes your code as you type or paste it, providing instant, categorized feedback and improved code suggestions with clear explanations and side-by-side diffs.

---

## 🎥 Video Demonstration

Here's the complete video: [AIReviewMate Demo](https://drive.google.com/file/d/1AF8DXlj2feTFy9MZ59B-t3x7zxoWkYh8/view?usp=drive_link)

---

## Frontend

This document contains the complete setup and usage instructions for the **frontend** part of the project.

---

## 📋 Project Overview

The frontend provides an interactive in-browser code editor that:

- Analyzes your code using an AI backend (e.g., Gemini or OpenRouter)
- Highlights improvements for **Best Practices**, **Better Performance**, or **Bug Fixes**
- Displays side-by-side diffs between the original and improved code
- Allows users to accept or reject suggested improvements instantly

It ensures a smooth user experience with **debouncing**, **request cancellation**, and **live diff rendering** — no refresh required.

---

## 🚀 Features

**✅ Live Code Review**
- Type or paste code directly in the browser
- Debounced input ensures API calls only fire after you stop typing

**✅ Smart Request Control**
- Cancels in-progress requests when you start typing again
- Implements "latest-wins" logic to maintain responsiveness

**✅ Dynamic Diff View**
- Side-by-side diff between original and improved code
- Category badges (Best Practices / Performance / Bug Fix) for each suggestion

**✅ Actionable UI**
- Accept → replaces code in editor
- Decline → dismisses suggestion

**✅ Multi-Language Support**
- Works for JavaScript, TypeScript, Python, and Java (easily extendable)

**✅ Loading & Error States**
- Displays "Reviewing your code…" while analyzing
- Graceful error handling and retry prompts

**✅ GitHub PR Mode** *(optional)*
- Integrates with GitHub to automatically create Pull Requests with AI-suggested improvements

---

## 🧠 Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React (Functional Components + Hooks) |
| Bundler | Vite |
| Code Editor | Monaco Editor (`@monaco-editor/react`) |
| Diff Rendering | react-diff-viewer |
| Styling | Tailwind CSS |
| Networking | Fetch API + AbortController (smart request cancellation) |

---

## 🗂️ Folder Structure

```
AIREVIEWMATE/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── App.css
│   │   │   ├── App.jsx
│   │   │   ├── index.css
│   │   │   └── main.jsx
│   │   │
│   │   └── (other utility files or hooks)
│   │
│   ├── .env
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
└── server/
    ├── index.js
    ├── .env.example
    ├── package.json
    └── README.md
```

---

## ⚙️ Setup Instructions

### Frontend Setup

**1. Clone the repository**
```bash
git clone https://github.com/shaarvariprashanth/AIReviewMate.git
cd frontend
```

**2. Install dependencies**
```bash
npm install
# or
yarn
```

**3. Environment configuration**

Create a `.env.local` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:3000    # Backend URL
VITE_DEFAULT_LANGUAGE=javascript
VITE_DEBOUNCE_MS=700
VITE_FEATURE_GITHUB_PR=false               # Set true if enabling PR feature

# Optional (for OAuth):
# VITE_GITHUB_CLIENT_ID=your_github_oauth_client_id
```

### Server Setup

**1. Clone the repository** (if not already done above)

**2. Navigate to the server folder**
```bash
cd server
```

**3. Configure environment variables**

Create a `.env` file based on `.env.example` and add your API key:
```env
GEMINI_API_KEY=your_api_key_here
```

**4. Install dependencies and run the server**
```bash
npm install --legacy-peer-deps
node index
```

---

## 🖥️ Run the Application

### Development Mode
```bash
npm run dev
```
Then open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 🔄 Request Control (Debounce + Cancellation)

The frontend ensures that:
- A new request cancels the previous one if typing resumes
- Each review call carries a `requestId` (timestamp or UUID)
- Only responses matching the latest `requestId` are rendered
- The debounce interval (default: 700 ms) is adjustable via `.env.local`

**Example workflow:**
1. User types → debounce timer starts
2. Timer expires → send API request with `requestId`
3. If user types again before response → cancel previous request
4. Backend responds → frontend compares `requestId`; if it's stale, ignore it

---

## 🧩 Diff Viewer and Actions

- **Diff Rendering:** Uses `react-diff-viewer` to highlight changes between original and improved code
- **Accept Button:** Replaces code in the editor with the improved version and triggers reanalysis
- **Decline Button:** Dismisses the suggestion without applying changes

**Category Color Codes:**

| Color | Category |
|---|---|
| 🟢 | Best Practices |
| 🟡 | Better Performance |
| 🔴 | Bug Fix |

---

## ⚡ Troubleshooting

| Issue | Fix |
|---|---|
| Blank editor screen | Ensure the container div has fixed height and Tailwind doesn't overlay white divs |
| Outdated suggestions | Verify `requestId` logic to ensure "latest-wins" handling |
| Slow typing | Adjust debounce delay (`VITE_DEBOUNCE_MS`) |
| CORS issues | Allow correct origins in backend |

---

## 🧑‍💻 Contributing

1. Fork the repository
2. Create your feature branch:
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit and push your changes:
   ```bash
   git commit -m "Add feature: description"
   git push origin feature/your-feature
   ```
4. Open a Pull Request 🎉
