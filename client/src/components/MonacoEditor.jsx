import React, { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import DiffViewer from "react-diff-viewer";
import { generateGeminiReply } from "../gemini";

// ✅ Language starter templates
const LANGUAGE_TEMPLATES = {
  javascript: `// JavaScript Example
function greet(name) {
  console.log("Hello " + name);
}
greet("World");`,
  python: `# Python Example
def greet(name):
    print("Hello", name)

greet("World")`,
  java: `// Java Example
public class Main {
    public static void main(String[] args) {
        greet("World");
    }
    public static void greet(String name) {
        System.out.println("Hello " + name);
    }
}`,
  cpp: `// C++ Example
#include <iostream>
using namespace std;

void greet(string name) {
    cout << "Hello " << name << endl;
}

int main() {
    greet("World");
    return 0;
}`,
  c: `// C Example
#include <stdio.h>

void greet(char name[]) {
    printf("Hello %s\\n", name);
}

int main() {
    greet("World");
    return 0;
}`,
  csharp: `// C# Example
using System;

class Program {
    static void Main() {
        Greet("World");
    }
    static void Greet(string name) {
        Console.WriteLine("Hello " + name);
    }
}`,
  go: `// Go Example
package main
import "fmt"

func greet(name string) {
    fmt.Println("Hello", name)
}

func main() {
    greet("World")
}`,
  ruby: `# Ruby Example
def greet(name)
  puts "Hello #{name}"
end

greet("World")`,
  php: `<?php
function greet($name) {
  echo "Hello " . $name;
}

greet("World");
?>`,
  swift: `// Swift Example
func greet(_ name: String) {
    print("Hello \\(name)")
}

greet("World")`,
  kotlin: `// Kotlin Example
fun greet(name: String) {
    println("Hello " + name)
}

fun main() {
    greet("World")
}`,
};

// Dropdown options
const LANGUAGE_OPTIONS = Object.keys(LANGUAGE_TEMPLATES).map((lang) => ({
  label: lang.charAt(0).toUpperCase() + lang.slice(1),
  value: lang,
}));

const OPERATION_OPTIONS = [
  { label: "Bug Fixes", value: "Bug Fixes" },
  { label: "Optimisation", value: "Optimisation" },
  { label: "Best Practices", value: "Best Practices" },
];

export default function App() {

  const [language, setLanguage] = useState("javascript");
  const [operation, setOperation] = useState({ value: "Bug Fixes"});
  const [code, setCode] = useState(LANGUAGE_TEMPLATES["javascript"]);
  const [status, setStatus] = useState("idle"); // idle | thinking | done
  const [improvedCode, setImprovedCode] = useState("");
  const typingTimeout = useRef(null);
  const [CatTags, SetCatTags] = useState(
    '{"better_performance":[],"best_practices":[],"bug_fix":[],"readability":[]}'
  );

  // --- Simulated analysis logic ---

  const analyseCode = async (userCode) => {
    const response = await generateGeminiReply(userCode);
    const improved = await response.improvised_code;
    const tags =
      typeof response.categorized_tags === "string"
        ? JSON.parse(response.categorized_tags)
        : response.categorized_tags; 
     //we did conditional parsing here because the categorized tags response given by LLM isn't consistent.sometimes it's array sometimes it gives JSON string 
    setImprovedCode(improved);
    SetCatTags(tags);
    setStatus("done");
  };

  // --- Handle typing(Debounce Logic) ---
  const handleChange = (value) => {
    setCode(value || "");
    if (status !== "thinking") setStatus("thinking");
    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      analyseCode(value || "");
    }, 1000);
  };

  // --- Language switch ---
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(LANGUAGE_TEMPLATES[lang]);
    setImprovedCode("");
    setStatus("idle");
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-indigo-700 to-purple-700 shadow-md">
        <h1 className="text-lg font-semibold">AI Code Reviewer</h1>

        <div className="flex gap-4 items-center">
          {/* Language Dropdown */}
          <div>
            <label className="text-sm mr-2">Language:</label>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-indigo-600 text-white px-2 py-1 rounded-md text-sm"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Operation Dropdown<Hidden> */}  
          <div className="invisible">
            <label className="text-sm mr-2">Operation:</label>
            <select
              value={operation.value}
              onChange={(e) =>
                setOperation({
                  value: e.target.value,
                })
              }
              className="bg-indigo-600 text-white px-2 py-1 rounded-md text-sm"
            >
              {OPERATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Editor + Output */}
      <div className="flex flex-1">
        {/* Left editor */}
        <div className="w-1/2 border-r border-gray-800">
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={handleChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              automaticLayout: true,
              scrollBeyondLastLine: false,
            }}
          />
        </div>

        {/* Right panel */}
        <div className="w-1/2 bg-gradient-to-br from-gray-800 to-gray-900 p-4 overflow-y-auto">
          {status === "idle" && (
            <div className="flex flex-col h-full items-center justify-center text-gray-400">
              <h2 className="text-xl mb-2 font-medium">Ready to Review 👀</h2>
              <p className="text-sm text-gray-500">
                Start typing your code to begin AI analysis.
              </p>
            </div>
          )}

          {status === "thinking" && (
            <div className="flex flex-col h-full items-center justify-center">
              <div className="flex space-x-1 mb-2">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-300"></span>
              </div>
              <p className="text-lg text-indigo-300 font-medium animate-pulse">
                Thinking...
              </p>
            </div>
          )}

          {status === "done" && (
            <div className="animate-fadeIn">
              <h2 className="text-xl font-semibold text-emerald-400 mb-3">
                {operation.value} Results:
              </h2>
              {/* --- Categorized Tags Display --- */}
              <div className="space-y-3 text-sm text-gray-300 mb-4">
                {Object.entries(CatTags || {}).map(([category, items]) => {
                  const list = Array.isArray(items)
                    ? items
                    : items
                    ? [items] // convert string/object into array
                    : [];

                  return (
                    <div key={category}>
                      <span className="font-semibold capitalize text-indigo-400">
                        {category.replace("_", " ")}:
                      </span>
                      {list.length > 0 ? (
                        <ul className="list-disc list-inside ml-4 text-gray-400">
                          {list.map((item, i) => (
                            <li key={i}>{String(item)}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="ml-2 text-gray-500">
                          No improvements found.
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <DiffViewer
                oldValue={code}
                newValue={improvedCode}
                splitView={true}
                hideLineNumbers={false}
                useDarkTheme={true}
                styles={{
                  variables: {
                    light: { diffViewerBackground: "#fff" },
                    dark: { diffViewerBackground: "#111827" },
                  },
                  diffRemoved: {
                    background: "rgba(239,68,68,0.25)",
                  },
                  diffAdded: {
                    background: "rgba(34,197,94,0.25)",
                  },
                  diffChanged: {
                    background: "rgba(234,179,8,0.25)",
                  },
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="px-4 py-2 text-xs text-gray-400 bg-gray-950 border-t border-gray-800 text-center">
        Type, paste, or edit code freely — AI analyses when you pause.
      </footer>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.6s ease-in-out; }
        .delay-150 { animation-delay: 150ms; }
        .delay-300 { animation-delay: 300ms; }
      `}</style>
    </div>
  );
}
