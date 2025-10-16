import Editor from "@monaco-editor/react";
import { useState } from "react";

export default function MonacoEditor() {
  const [Value,setValue]=useState("");
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
          console.log(value)}
        }
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
