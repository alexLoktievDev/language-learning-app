import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyB035BeFRnThJQ2GnsDEEjL7iI1deGP3jE",
  authDomain: "language-learning-app-41e88.firebaseapp.com",
  projectId: "language-learning-app-41e88",
  storageBucket: "language-learning-app-41e88.appspot.com",
  messagingSenderId: "690516939548",
  appId: "1:690516939548:web:d4f19e6e94bafea95f60d9",
  measurementId: "G-BBJ1TBZCG3",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

export const functions = getFunctions(app);

connectFunctionsEmulator(functions, "127.0.0.1", 5001);

export interface OpenAIResponse {
  reply: string;
}

// Define the callable function type
export const chatWithOpenAI = httpsCallable<{ prompt: string }, OpenAIResponse>(
  functions,
  "chatWithOpenAI",
);

export const useFirebaseConfig = () => ({
  app,
  analytics,
  functions,
  chatWithOpenAI,
  firebaseConfig,
});
