const express = require("express");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");
const app = express();
const cors =require("cors")

dotenv.config();

// Middleware
app.use(cors())
// app.use(express.urlencoded({extended:false}))
app.use(express.text());
// app.use(express.json())


//using Gemini 
const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

// app.get("/", (req, res) => {
//   res.send("Hey, Welcome to AIReviewMate.To check the backend server,just put a code through post request on the same url with urlencoded body through postman with key as text.")
// });

app.post("/", async (req, res) => {
  try {
    const body = req.body;
    const prompt = `
    Rewrite the entire code with all necessary improvements for better performance, readability, efficiency, and maintainability.Give a short summary (2–3 lines) explaining what the code does and what improvements were made.Assign one category tag also to the improvement. The possible tags are:
    Best Practices (for cleaner, more maintainable, or more readable code)
    Better Performance (for optimized speed, memory usage, or algorithmic efficiency)
    Bug Fix (for corrections that fix errors or potential issues)
    And at last, also add all the line numbers in which changes are made in an array"${body}"
    Output in JSON: { "improvised": "...", "summary": "...", "tags": ["..."],"lines changed":[".."] }
    `;

    const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents:prompt
    });
    let result=response.text;

    // seperating the json part in string format from the response
    const start=result.indexOf("{")
    const end=result.lastIndexOf("}")
    if (start!=0 || end!=-1){
        result=result.slice(start,end+1) 
    }

    console.log(result)
    res.json(JSON.parse(result)) // we are parsing it the string result to json format
  } catch (error) {
    console.log("Backend Error", error);
    res.status(500).json({ error: "Internal Server Error",error });
}
});

app.listen(5174, () => console.log("Server started at PORT", 5174));
