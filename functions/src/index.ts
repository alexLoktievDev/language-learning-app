import * as functions from "firebase-functions";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: functions.config().openai.key,
});

// Define the callable function
export const chatWithOpenAI = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated.",
    );
  }

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: data.prompt }],
      stream: true,
    });

    let reply = "";
    for await (const chunk of stream) {
      reply += chunk.choices[0]?.delta?.content || "";
    }

    return { reply };
  } catch (error) {
    console.error("OpenAI error:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to connect to OpenAI",
    );
  }
});
