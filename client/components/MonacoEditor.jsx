import Editor from "@monaco-editor/react";
import { useState } from "react";
import { generateGeminiReply } from "../gemini";
export default function MonacoEditor() {
  const [Value,setValue]=useState("");
  const [Value2,setValue2]=useState("");
  
  return (
    <div style={{display:'flex'}}>
      <Editor
        height="100vh"
        width="50vw"
        defaultLanguage="javascript"
        defaultValue="// Start coding here..."
        theme="vs-light"
        onChange={(value, event) => {
          setValue(value);
          console.log(value)
          const reply=generateGeminiReply(value)
          console.log(reply)
        }}
        />

      <Editor 
        height="100vh"
        width="50vw"
        defaultLanguage="javascript"
        defaultValue="// Start coding here..."
        theme="vs-dark"
      />
    </div>
  );
}
