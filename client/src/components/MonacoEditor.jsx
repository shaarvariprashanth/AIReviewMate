import React, { useEffect, useRef, useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import DiffViewer from "react-diff-viewer";

/*
  AI Code Reviewer — App.jsx (JavaScript + React + Tailwind)
  - Debounced auto-review with AbortController (latest-wins)
  - Ctrl/Cmd+Enter to review now
  - Many language options
  - Side-by-side diff, Accept / Decline
  - Tailwind-based polished UI
  Backend contract (your friend): POST /api/review
    Request: { code, language, operation }
    Response: { improved_code, message, category }
*/

const LANGUAGE_OPTIONS = [
  { label: "Auto-detect", value: "plaintext" },
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "C#", value: "csharp" },
  { label: "C++", value: "cpp" },
  { label: "Go", value: "go" },
  { label: "Rust", value: "rust" },
  { label: "Ruby", value: "ruby" },
  { label: "PHP", value: "php" },
  { label: "HTML", value: "html" },
  { label: "CSS", value: "css" },
  { label: "JSON", value: "json" },
  { label: "YAML", value: "yaml" },
  { label: "Shell", value: "shell" },
  { label: "SQL", value: "sql" },
  { label: "Kotlin", value: "kotlin" },
  { label: "Swift", value: "swift" },
  { label: "Objective-C", value: "objective-c" },
];

const OPERATION_OPTIONS = [
  { label: "Bug Fixes", value: "Bug Fix" },
  { label: "Code Optimisation", value: "Better Performance" },
  { label: "Best Practices", value: "Best Practices" },
  { label: "Security", value: "Security" },
  { label: "Readability", value: "Readability" },
];

export default function App(props) {
  const initialTheme = (props && props.initialTheme) || "dark";
  const [code, setCode] = useState(
    `// Welcome to AI Code Reviewer\n// Type or paste code on the left. Suggestions will appear on the right.`
  );
  const [language, setLanguage] = useState("javascript");
  const [operation, setOperation] = useState(OPERATION_OPTIONS[0].value);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(initialTheme);

  const typingTimeout = useRef(null);
  const abortControllerRef = useRef(null);
  const lastRequestSeq = useRef(0);
  const editorRef = useRef(null);

  const categoryColor = useCallback(function (cat) {
    if (!cat) return "bg-gray-100 text-gray-800";
    switch (cat.toLowerCase()) {
      case "bug fix":
        return "bg-red-100 text-red-800";
      case "better performance":
        return "bg-amber-100 text-amber-800";
      case "best practices":
        return "bg-blue-100 text-blue-800";
      case "security":
        return "bg-purple-100 text-purple-800";
      case "readability":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, []);

  function handleEditorMount(editor) {
    editorRef.current = editor;
    editor.focus();
  }

  function acceptSuggestion() {
    if (!review) return;
    setCode(review.improved_code);
    setReview(null);
  }

  function declineSuggestion() {
    setReview(null);
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.warn("Copy failed", e);
    }
  }

  async function requestReview(payloadCode, signal, seq) {
    try {
      setError(null);
      setLoading(true);
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: payloadCode, language, operation }),
        signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server returned ${res.status}`);
      }

      const data = await res.json();

      if (!data || !data.improved_code || !data.message || !data.category) {
        throw new Error("Invalid response shape from review API");
      }

      // ignore outdated responses (latest-wins)
      if (seq < lastRequestSeq.current) return;

      setReview({
        improved_code: data.improved_code,
        message: data.message,
        category: data.category,
      });
    } catch (err) {
      if (err && err.name === "AbortError") {
        // expected cancellation
      } else {
        console.error("Review request failed:", err);
        setError((err && err.message) || "Review failed");
        setReview(null);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleChange(value) {
    setCode(value);

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    typingTimeout.current = setTimeout(function () {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const seq = ++lastRequestSeq.current;
      requestReview(value, controller.signal, seq);
    }, 800);
  }

  function triggerImmediateReview() {
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
      typingTimeout.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const seq = ++lastRequestSeq.current;
    requestReview(code, controller.signal, seq);
  }

  useEffect(function () {
    const handler = function (e) {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      if ((isMac && e.metaKey && e.key === "Enter") || (!isMac && e.ctrlKey && e.key === "Enter")) {
        e.preventDefault();
        triggerImmediateReview();
      }
    };
    window.addEventListener("keydown", handler);
    return function () {
      window.removeEventListener("keydown", handler);
    };
  }, [code, language, operation]);

  useEffect(function () {
    return function () {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  return (
    <div className={`h-screen flex flex-col ${theme === "dark" ? "bg-slate-900" : "bg-gray-50"}`}>
      {/* Top bar */}
      <div className="flex items-center gap-4 px-4 py-3 shadow-sm bg-gradient-to-r from-slate-800 to-indigo-800 text-white">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" />
            <path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <div>
            <div className="font-semibold text-lg">AI Code Reviewer</div>
            <div className="text-xs opacity-80">Live suggestions · Ctrl/Cmd+Enter to review now</div>
          </div>
        </div>

        {/* Selects */}
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded">
            <label className="text-xs opacity-80 mr-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-sm outline-none pr-4"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded">
            <label className="text-xs opacity-80 mr-1">Operation</label>
            <select
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
              className="bg-transparent text-sm outline-none pr-4"
            >
              {OPERATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} className="px-3 py-1 rounded bg-white/6 text-sm">
            {theme === "dark" ? "Light" : "Dark"}
          </button>

          <button onClick={() => triggerImmediateReview()} className="px-3 py-1 rounded bg-emerald-500 hover:bg-emerald-600 text-white text-sm">
            Review now
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor pane */}
        <div className={`${review ? "w-1/2" : "w-full"} transition-all duration-200`}>
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b bg-white/5">
              <div className="text-sm text-gray-200">Editor</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (editorRef.current) copyToClipboard(code);
                  }}
                  className="text-xs px-2 py-1 rounded bg-white/6"
                >
                  Copy
                </button>

                <button
                  onClick={() => {
                    setCode("// New file\n");
                    if (editorRef.current) editorRef.current.focus();
                  }}
                  className="text-xs px-2 py-1 rounded bg-white/6"
                >
                  New
                </button>

                <div className="text-xs opacity-70">{loading ? "Reviewing your code… " : "Idle"}</div>
              </div>
            </div>

            <div className="flex-1 bg-white">
              <Editor
                height="100%"
                theme={theme === "light" ? "vs-light" : "vs-dark"}
                language={language}
                value={code}
                onMount={(editor) => handleEditorMount(editor)}
                onChange={(v) => handleChange(v || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  tabSize: 2,
                }}
              />
            </div>
          </div>
        </div>

        {/* Review pane */}
        {review && (
          <div className="w-1/2 border-l flex flex-col bg-gray-50">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-3">
                <div className={`px-2 py-1 rounded text-xs font-medium ${categoryColor(review.category)}`}>{review.category}</div>
                <div className="text-sm font-semibold">Suggested Change</div>
                <div className="text-xs text-gray-500">{review.message}</div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => copyToClipboard(review.improved_code)} className="text-sm px-3 py-1 rounded bg-white/5">
                  Copy Improved
                </button>

                <button onClick={acceptSuggestion} className="text-sm px-3 py-1 rounded bg-emerald-500 text-white">
                  Accept
                </button>

                <button onClick={declineSuggestion} className="text-sm px-3 py-1 rounded bg-gray-200">
                  Decline
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-3">
              <div className="mb-3 text-xs text-gray-600">Diff (original → improved)</div>

              <div className="bg-white rounded shadow-sm overflow-auto">
                <DiffViewer oldValue={code} newValue={review.improved_code} splitView={true} showDiffOnly={false} useDarkTheme={theme !== "light"} leftTitle="Original" rightTitle="Improved" />
              </div>
            </div>

            <div className="px-4 py-3 border-t bg-white/50 flex items-center justify-between">
              <div className="text-xs text-gray-600">Model message</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    triggerImmediateReview();
                  }}
                  className="text-xs px-2 py-1 rounded bg-white/5"
                >
                  Re-run Review
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-2 text-xs text-gray-400 border-t flex items-center gap-3">
        <div>{error ? `Error: ${error}` : review ? `Suggestion ready — ${review.category}` : "No suggestions yet"}</div>
        <div className="ml-auto">
          Tip: Press <span className="font-medium">Ctrl/Cmd+Enter</span> to run review instantly
        </div>
      </div>
    </div>
  );
}
