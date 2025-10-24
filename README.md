# AIReviewMate
WEC Recruitment Task

# Frontend

The **AI Code Reviewer** is a web-based application that continuously analyzes your code as you type or paste it, providing instant, categorized feedback and improved code suggestions with clear explanations and side-by-side diffs.

This document contains the complete setup and usage instructions for the **frontend** part of the project.

---

## 📋 Project Overview

The frontend provides an interactive in-browser code editor that:
- Analyzes your code using an AI backend (e.g., Gemini or OpenRouter).
- Highlights improvements for **Best Practices**, **Better Performance**, or **Bug Fixes**.
- Displays side-by-side diffs between the original and improved code.
- Allows users to accept or reject suggested improvements instantly.

It ensures smooth user experience with **debouncing**, **request cancellation**, and **live diff rendering** — no refresh required.

---

## 🚀 Features

✅ **Live Code Review**
- Type or paste code directly in the browser.
- Debounced input ensures API calls only after you stop typing.

✅ **Smart Request Control**
- Cancels in-progress requests when you start typing again.
- Implements “latest-wins” logic to maintain responsiveness.

✅ **Dynamic Diff View**
- Side-by-side diff between original and improved code.
- Category badges (Best Practices / Performance / Bug Fix) for each suggestion.

✅ **Actionable UI**
- Accept → replaces code in editor.
- Decline → dismisses suggestion.

✅ **Multi-Language Support**
- Works for JavaScript, TypeScript, Python, and Java (easily extendable).

✅ **Loading & Error States**
- Displays “Reviewing your code…” when analyzing.
- Graceful error handling and retry prompts.

✅ *(Optional)* **GitHub PR Mode**
- Integrates with GitHub to automatically create Pull Requests with AI-suggested improvements.

---

## 🧠 Tech Stack

- **React** (Functional Components + Hooks)
- **Vite** (Development Bundler)
- **Monaco Editor** (`@monaco-editor/react`)
- **react-diff-viewer** (Side-by-side diffs)
- **Tailwind CSS** (UI styling)
- **Fetch API + AbortController** (for smart request cancellation)

---

## 🗂️ Folder Structure

```
AIREVIEWMATE/
│
├── client/
│ ├── src/
│ │ ├── components/
│ │ │ ├── App.css
│ │ │ ├── App.jsx
│ │ │ ├── index.css
│ │ │ └── main.jsx
│ │ │
│ │ └── (other utility files or hooks)
│ │
│ ├── .env
│ ├── .gitignore
│ ├── eslint.config.js
│ ├── index.html
│ ├── package.json
│ ├── vite.config.js
│ └── README.md
│
└── server/
├── index.js
├── .env.example
├── package.json
└── README.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository
```bash
git clone <your-repo-url>
cd frontend
```

### 2️⃣ Install Dependencies
```bash
npm install
# or
yarn
```

### 3️⃣ Environment Configuration

Create a `.env.local` file in the project root:

```
VITE_API_BASE_URL=http://localhost:3000   # Backend URL
VITE_DEFAULT_LANGUAGE=javascript
VITE_DEBOUNCE_MS=700
VITE_FEATURE_GITHUB_PR=false               # Set true if enabling PR feature
# Optional (for OAuth):
# VITE_GITHUB_CLIENT_ID=your_github_oauth_client_id
```

> ⚠️ Never commit `.env.local` — it should be listed in `.gitignore`.

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

## 🌐 API Contract

### **Request** (`POST /api/review`)
```json
{
  "code": "function add(a,b){return a+b}",
  "language": "javascript",
  "requestId": "1697038400000"
}
```

### **Response**
```json
{
  "requestId": "1697038400000",
  "suggestions": [
    {
      "id": "s1",
      "category": "Best Practices",
      "shortMessage": "Add semicolon and validate inputs.",
      "improvedCode": "function add(a, b) { if (typeof a !== 'number' || typeof b !== 'number') throw new Error('Invalid input'); return a + b; }"
    }
  ]
}
```

### **Error Example**
```json
{ "error": "Rate limited. Try again later." }
```

---

## ⚡ Core Components

| Component | Description |
|------------|--------------|
| `CodeEditor.jsx` | Monaco-based editor with language selector |
| `useDebouncedReview.js` | Custom hook for debouncing, cancellation, and API requests |
| `DiffViewer.jsx` | Renders side-by-side code differences |
| `SuggestionCard.jsx` | Displays AI suggestion, category, and Accept/Decline buttons |
| `EditorPage.jsx` | Parent layout combining editor, loader, and diff viewer |

---

## 🔄 Request Control (Debounce + Cancellation)

The frontend ensures that:
- A new request cancels the previous one if typing resumes.
- Each review call carries a `requestId` (timestamp or UUID).
- Only responses matching the latest `requestId` are rendered.
- Debounce interval (default: 700 ms) is adjustable via `.env.local`.

**Example workflow:**
1. User types → debounce timer starts.
2. Timer expires → send API request with `requestId`.
3. If user types again before response → cancel previous request.
4. Backend responds → frontend compares `requestId`. If it’s stale, ignore it.

---

## 🧩 Diff Viewer and Actions

- **Diff Rendering:** Uses `react-diff-viewer` to highlight changes between original and improved code.
- **Accept Button:** Replaces code in the editor with improved version and triggers reanalysis.
- **Decline Button:** Dismisses the suggestion without applying changes.

**Category Color Codes:**
- 🟢 **Best Practices**
- 🟡 **Better Performance**
- 🔴 **Bug Fix**

---

## 🧩 GitHub PR Mode (Optional Feature)

When enabled:
1. User connects their GitHub account via OAuth (handled by backend).
2. Select a repository and branch.
3. On accepting a suggestion → a new branch and PR are created automatically.

Environment variable:
```
VITE_FEATURE_GITHUB_PR=true
```

> ⚠️ All token handling should be done securely in the backend.

---

## 🧪 Scripts

| Command | Description |
|----------|--------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint checks |

---

## ⚡ Troubleshooting

- **Blank editor screen:** Ensure the container div has fixed height and Tailwind doesn’t overlay white divs.
- **Outdated suggestions:** Verify `requestId` logic to ensure “latest-wins” handling.
- **Slow typing:** Adjust debounce delay (`VITE_DEBOUNCE_MS`).
- **CORS issues:** Allow correct origins in backend.

---

## 🧑‍💻 Contributing

1. Fork the repository.
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

---

### Server Setup Instructions
1. Clone the repository
2. Navigate to the server folder:
3. Create a `.env` file based on `.env.example` and Add your API key in this format:
   GEMINI_API_KEY=your_api_key_here
4. Install dependencies and run:
   npm install
   node index

