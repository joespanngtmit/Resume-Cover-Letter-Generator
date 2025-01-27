const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const app = express();
const PORT = 4000;
const dotenv = require("dotenv");
const {workHistory} = require("./constants")
dotenv.config();

app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use(express.json());
app.use(cors());

const generateID = () => Math.random().toString(36).substring(2, 10);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
});

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-thinking-exp-01-21",
});

const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 65536,
  responseMimeType: "text/plain",
};
const database = [];

const ChatGPTFunction = async (text) => {
  try {
    const chatSession = model.startChat({
      generationConfig,
      history: [
      ],
    });
    const result = await chatSession.sendMessage(text);
    console.log(result);
    return result.response.text()
  } catch (error) {
      console.error("Error with ChatGPT API:", error);
      throw error;
  }
};
//#TODO Bring this back if you want to upload a new headshot everytime
app.post("/resume/create", upload.single("headshotImage"), async (req, res) => {
// app.post("/resume/create", async (req, res) => {  
  const {
    fullName,
    currentPosition,
    currentLength,
    currentTechnologies,
    jobDescription,
    totalWork
  } = req.body;
  
  const workArray = workHistory;
  //#TODO Bring this back if you want to upload a new headshot everytime
  // image_url: `http://localhost:4000/uploads/${req.file.filename}`,
  const newEntry = {
    id: generateID(),
    fullName,
    image_url: `http://localhost:4000/uploads/headshot.jpg`,
    currentPosition,
    currentLength,
    currentTechnologies,
    totalWork,
    workHistory: workArray,
  };

  const personalInfo = {
    "fullName" : fullName,
    "phoneNumber" : process.env.PHONE,
    "email" : process.env.EMAIL,
    "github" : process.env.GITHUB_URL,
    "portfolio" : process.env.PORTFOLIO_URL,
    "city" : process.env.CITY
  }

  const prompt1 = `I am writing a resume, for the following job description: ${jobDescription} 
  \n My details in a json object: ${personalInfo} 
  \n role: ${currentPosition} (${currentLength} years). 
  \n I current use the following technologies: ${currentTechnologies}.  
  \n Can you write a 100 words description for the top of the resume(first person writing)?
  \n Please do not include any bolding, since it will not come through in text properly
  \n Also do not include anything else in the response but the data asked for, no text like "Okay, here is what you asked for"`;

  const prompt2 = `I am writing a resume, for the following job description: ${jobDescription} 
  \n My details in a json object: ${personalInfo} 
  \n role: ${currentPosition} (${currentLength} years). 
  \n I write in the technologies: ${currentTechnologies}. 
  \n Can you write 10 points for a resume on what I am good at?
  \n Please do not include any bolding, since it will not come through in text properly
  \n Also do not include anything else in the response but the data asked for, no text like "Okay, here is what you asked for"`;

  const remainderText = () => {
    let stringText = "";
    for (let i = 0; i < workArray.length; i++) {
      stringText += ` ${workArray[i].name} as a ${workArray[i].position}.`;
    }
    return stringText;
  };
  
  const prompt3 = `I am writing a resume, for the following job description: ${jobDescription}
  \n My details in a json object: ${personalInfo} 
  \n role: ${currentPosition} (${currentLength} years). 
  \n During my years I worked at ${workArray.length} companies. ${remainderText()} 
  \n Can you write me 50 words for each company separated in numbers of my succession in the company (in first person)?
  \n Please do not include any bolding, since it will not come through in text properly
  \n Also do not include anything else in the response but the data asked for, no text like "Okay, here is what you asked for"`;
  
  const prompt4 = `I am writing a cover letter, for the following job description: ${jobDescription}
  \n My details in a json object: ${personalInfo} 
  \n Current role: ${currentPosition} (${currentLength} years). 
  \n During my years I worked at ${workArray.length} companies. ${remainderText()} 
  \n Can you write me a cover letter with all of this information (in first person)?
  \n Please do not include any bolding, since it will not come through in text properly
  \n Also do not include anything else in the response but the data asked for, no text like "Okay, here is what you asked for"`;

  const objective = await ChatGPTFunction(prompt1);
  const keypoints = await ChatGPTFunction(prompt2);
  const jobResponsibilities = await ChatGPTFunction(prompt3);
  const coverLetter = await ChatGPTFunction(prompt4)
  
  const chatgptData = { objective, keypoints, jobResponsibilities, coverLetter };
  const data = { ...newEntry, ...chatgptData, ...personalInfo };
  database.push(data);

  //TODO Save data to a database or a google file for tracking
  res.json({
    message: "Request successful!",
    data,
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
