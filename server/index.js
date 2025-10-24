const express = require("express");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");
const cors = require("cors");
const app = express();

dotenv.config();

// Middleware
app.use(cors());
app.use(express.text({ type: "*/*" }));

// Initialize Gemini
const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

// --- Main Route ---
app.post("/", async (req, res) => {
  try {
    const code = req.body; // raw code string

    const prompt = `
    You are a professional code reviewer and optimizer.
    Rewrite the given code by improving performance, efficiency, readability, and fixing any issues.
    ${req.body}
    Return the result strictly in valid JSON format with the following fields:

    {
      "improvised_code": "The full improved code that can completely replace the old one",
      "summary_of_changes": ["List of clear, short explanations of what was changed and why"],
      "categorized_tags": {
        "better_performance": ["Changes that make the code run faster or use fewer resources"],
        "best_practices": ["Changes that follow standard coding conventions or structure"],
        "bug_fix": ["Fixes for any logical, syntax, or runtime errors"],
        "readability": ["Formatting, naming, or comments that make code easier to read"]
        },
      "lines_changed": [list of line numbers where modifications were made]
    }

    Make sure:
    - The output is **only** valid JSON (no text outside the JSON).
`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents: prompt,
    });

    //to sort out the json part in case LLM returns some text with JSON part
    let result = response.text;
    const start = result.indexOf("{");
    const end = result.lastIndexOf("}");

    if (start !== -1 && end !== -1) {
      result = result.slice(start, end + 1);
    }
    console.log(result);
    res.send(result);
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(5174, () => console.log("✅ Server started at PORT 5174"));
