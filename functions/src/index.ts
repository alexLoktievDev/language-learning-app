import * as functions from "firebase-functions";
import * as cors from "cors";
import * as bodyParser from "body-parser";
import * as admin from "firebase-admin";
import { TextToSpeechClient, protos } from "@google-cloud/text-to-speech";
import OpenAI from "openai";
import * as dotenv from "dotenv";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Load environment variables from .env file
dotenv.config();

// Initialize Google Cloud Text-to-Speech Client
const client = new TextToSpeechClient();

// Get OpenAI API key from environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_ORGANIZATION = process.env.OPENAI_ORGANIZATION;

if (!OPENAI_API_KEY) {
  throw new Error(
    "The OPENAI_API_KEY environment variable is missing or empty.",
  );
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  organization: OPENAI_ORGANIZATION,
});

// CORS configuration
const corsHandler = cors({ origin: true });

// Use bodyParser middleware
const jsonParser = bodyParser.json();

// Supported voice languages and their respective voice names
const VOICE_NAMES: { [key: string]: string } = {
  "en-US": "en-US-Wavenet-D",
  "es-ES": "es-ES-Wavenet-A",
  "fr-FR": "fr-FR-Wavenet-A",
  "de-DE": "de-DE-Wavenet-A",
  "zh-CN": "cmn-CN-Wavenet-A",
  "uk-UA": "uk-UA-Wavenet-A", // Replace with actual Ukrainian voice if available
  "ru-RU": "ru-RU-Wavenet-A",
};

/**
 * Generate an audio file from text using Google Cloud Text-to-Speech
 */
export const synthesizeSpeech = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    jsonParser(req, res, async () => {
      const { text, language } = req.body;
      if (!text || !language) {
        res.status(400).send({ message: "Missing text or language parameter" });
        return;
      }

      try {
        const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest =
          {
            input: { text: text.replace(/[\u{1F600}-\u{1F64F}]/gu, "") }, // Remove emojis
            voice: {
              languageCode: language,
              name: VOICE_NAMES[language] || VOICE_NAMES["en-US"],
              ssmlGender:
                protos.google.cloud.texttospeech.v1.SsmlVoiceGender
                  .SSML_VOICE_GENDER_UNSPECIFIED,
            },
            audioConfig: {
              audioEncoding:
                protos.google.cloud.texttospeech.v1.AudioEncoding.MP3,
            },
          };

        const [response] = await client.synthesizeSpeech(request);
        const audioContent = response.audioContent;

        res.set("Content-Type", "audio/mpeg");
        res.send(audioContent);
      } catch (error) {
        console.error("Error synthesizing speech:", error);
        res.status(500).send({
          message: "Error synthesizing speech",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });
  });
});

/**
 * New HTTPS function for chat with OpenAI
 */
export const chatWithOpenAIHttp = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    jsonParser(req, res, async () => {
      const {
        prompt,
        assistantContext = `
          System Role: You are an AI language tutor dedicated
          to helping users improve their speaking skills.
          Engage users in friendly and humorous conversations,
          ask thoughtful questions, provide comments on their answers,
          and offer encouraging feedback.

          Instructions:

          Engage in Dialogue:
          - Start conversations with warm greetings and engaging questions.
          - Encourage users to respond with full sentences and details.
          - Keep the conversation dynamic by introducing new topics and 
            asking follow-up questions.
          - By the end of your message, always ask the user an open question
            to keep the conversation going.

          Ask Questions:
          - Pose a mix of open-ended and specific questions to elicit detailed 
            responses.
          - Tailor questions to the user's proficiency level and interests.
          - Use questions to guide the user through practice scenarios 
            (e.g., ordering food, describing their day, discussing hobbies).

          Comment on Answers:
          - Provide positive reinforcement and constructive feedback on the 
            user's responses.
          - Correct mistakes gently and offer explanations or alternatives.
          - Use humor to make the learning experience enjoyable and memorable.

          Friendly and Humorous Style:
          - Maintain a friendly, conversational tone.
          - Incorporate light humor and playful remarks to keep users 
            engaged and relaxed.
          - Show empathy and encouragement, celebrating the user's progress 
            and effort.
        `,
      } = req.body;

      if (!prompt) {
        res.status(400).send({ message: "Missing prompt parameter" });
        return;
      }

      try {
        console.log("Calling OpenAI API");

        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: assistantContext },
            { role: "user", content: prompt.trim() },
          ],
        });

        console.log("OpenAI response:", response);

        const reply = response.choices[0]?.message?.content || "";
        console.log("Reply:", reply);

        res.send({ reply });
      } catch (error) {
        console.error("Error during OpenAI call:", error);
        res.status(500).send({
          message: "Error during OpenAI call",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });
  });
});
