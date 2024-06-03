import * as functions from "firebase-functions";
import OpenAI from "openai";
import * as cors from "cors";
import axios, { AxiosError } from "axios";
import * as dotenv from "dotenv";
import { createWriteStream } from "node:fs"; // Correct import for createWriteStream
import { v4 as uuid } from "uuid";
import { ElevenLabsClient } from "elevenlabs";
import * as bodyParser from "body-parser";
import * as multer from "multer";

// Load environment variables from .env file in local development
dotenv.config();

const OPENAI_API_KEY =
  process.env.OPENAI_API_KEY || functions.config().openai?.key;
const OPENAI_ORGANIZATION =
  process.env.OPENAI_ORGANIZATION || functions.config().openai?.organization;
const ELEVENLABS_API_KEY =
  process.env.ELEVENLABS_API_KEY || functions.config().elevenlabs?.key;
const ELEVENLABS_DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

// Supported voice IDs for different languages
const VOICE_IDS = {
  "en-US": ELEVENLABS_DEFAULT_VOICE_ID,
  "es-ES": "AZnzlk1XvdvUeBnXmlld",
  "fr-FR": "EXAVITQu4vr4xnSDxMaL",
  "de-DE": "VR6AewLTigWG4xSOukaG",
  "zh-CN": "YOUR_CHINESE_VOICE_ID",
  "uk-UA": "YOUR_UKRAINIAN_VOICE_ID", // Replace with actual Ukrainian voice ID
  "ru-RU": "YOUR_RUSSIAN_VOICE_ID",
};

// Debugging logs
console.log("OPENAI_API_KEY:", OPENAI_API_KEY ? "Loaded" : "Not Loaded");
console.log(
  "OPENAI_ORGANIZATION:",
  OPENAI_ORGANIZATION ? "Loaded" : "Not Loaded",
);
console.log(
  "ELEVENLABS_API_KEY:",
  ELEVENLABS_API_KEY ? "Loaded" : "Not Loaded",
);

if (!OPENAI_API_KEY) {
  throw new Error("OpenAI API key is missing");
}

if (!ELEVENLABS_API_KEY) {
  throw new Error("ElevenLabs API key is missing");
}

// Initialize OpenAI and ElevenLabs API clients
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  organization: OPENAI_ORGANIZATION,
});

const client = new ElevenLabsClient({
  apiKey: ELEVENLABS_API_KEY,
});

const corsHandler = cors({ origin: true });

// Use bodyParser middleware
const jsonParser = bodyParser.json();

/**
 * Type guard for AxiosError
 * @param {unknown} error - Error to check
 * @return {boolean} - True if error is AxiosError
 */
const isAxiosError = (error: unknown): error is AxiosError => {
  return (error as AxiosError).isAxiosError !== undefined;
};

/**
 * Create audio stream from text using ElevenLabs API
 * @param {string} text - Text to convert to audio stream
 * @param {string} voiceId - Voice ID for the selected language
 * @return {Promise<Buffer>} - Promise resolving with the audio buffer
 */
const createAudioStreamFromText = async (
  text: string,
  voiceId: string,
): Promise<Buffer> => {
  const audioStream = await client.generate({
    voice: voiceId,
    model_id: "eleven_turbo_v2",
    text,
  });

  const chunks: Buffer[] = [];
  for await (const chunk of audioStream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
};

/**
 * Generate an audio file from text using ElevenLabs
 */
export const generateAudioFile = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    jsonParser(req, res, async () => {
      const { text, language } = req.body;
      if (!text || !language) {
        res.status(400).send({ message: "Missing text or language parameter" });
        return;
      }
      console.log("Generating audio file from text:", text);
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const voiceId = VOICE_IDS[language] || ELEVENLABS_DEFAULT_VOICE_ID;
        const audioBuffer = await createAudioStreamFromText(text, voiceId);

        const fileName = `${uuid()}.mp3`;
        const fileStream = createWriteStream(fileName);
        fileStream.write(audioBuffer);
        fileStream.end();

        fileStream.on("finish", () => {
          res.send({ fileName });
        });
        fileStream.on("error", (error: Error) => {
          console.error("Error writing audio file:", error);
          res.status(500).send({
            message: "Error generating audio file",
            error: error instanceof Error ? error.message : "Unknown error",
          });
        });
      } catch (error: unknown) {
        console.error("Error generating audio file:", error);
        res.status(500).send({
          message: "Error generating audio file",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });
  });
});

/**
 * Handles errors during TTS synthesis
 * @param {unknown} error - The error object
 * @param {object} res - The response object
 */
function handleTtsError(error: unknown, res: any) {
  if (isAxiosError(error)) {
    console.error("Axios error during TTS:", error.toJSON());
    console.error(
      "Error during TTS:",
      error.response ? error.response.data : error.message,
    );
    res.status(500).send({
      message: "Error during TTS",
      error: error.response
        ? JSON.stringify(error.response.data)
        : error.message,
    });
  } else {
    console.error("Unexpected error during TTS:", error);
    res.status(500).send({
      message: "Unexpected error during TTS",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Handles Text-to-Speech (TTS) synthesis
 * @param {object} req - The HTTP request object
 * @param {object} res - The HTTP response object
 */
export const synthesizeSpeech = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send({ message: "Method not allowed" });
      return;
    }

    jsonParser(req, res, async () => {
      const { text, language } = req.body;
      if (!text || !language) {
        res.status(400).send({ message: "Missing text or language parameter" });
        return;
      }

      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const voiceId = VOICE_IDS[language] || ELEVENLABS_DEFAULT_VOICE_ID;
        const audioBuffer = await createAudioStreamFromText(text, voiceId);

        res.set("Content-Type", "audio/mpeg");
        res.send(audioBuffer);
      } catch (error: unknown) {
        handleTtsError(error, res);
      }
    });
  });
});

/**
 * Function for stopping STT (if applicable)
 */
export const stopListening = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      console.log("Stopping STT...");
      res.send({ message: "STT stopped" });
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error("Axios error stopping STT:", error.toJSON());
        console.error(
          "Error stopping STT:",
          error.response ? error.response.data : error.message,
        );
        res.status(500).send({
          message: "Error stopping STT",
          error: error.response
            ? JSON.stringify(error.response.data)
            : error.message,
        });
      } else {
        console.error("Unexpected error stopping STT:", error);
        res.status(500).send({
          message: "Unexpected error stopping STT",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  });
});

/**
 * New HTTPS function for chat with OpenAI
 */
export const chatWithOpenAIHttp = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    jsonParser(req, res, async () => {
      const { prompt } = req.body;

      if (!prompt) {
        res.status(400).send({ message: "Missing prompt parameter" });
        return;
      }

      try {
        console.log("Calling OpenAI API");

        const model = "gpt-4";
        const assistantContext = `
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
        `;

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
      } catch (error: unknown) {
        if (isAxiosError(error)) {
          console.error("Axios error during OpenAI call:", error.toJSON());
          console.error(
            "OpenAI error:",
            error.response ? error.response.data : error.message,
          );
          res.status(500).send({
            message: "Error during OpenAI call",
            error: error.response
              ? JSON.stringify(error.response.data)
              : error.message,
          });
        } else {
          console.error("Unexpected error during OpenAI call:", error);
          res.status(500).send({
            message: "Unexpected error during OpenAI call",
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    });
  });
});
