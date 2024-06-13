import "firebase/auth";
import "firebase/firestore";

import { app } from "../hooks/use-firebase-config";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { setAccessTokenToLocalStorage } from "@helpers/functions/local-storage";

const auth = getAuth(app);
const firestore = getFirestore(app);

export const registerWithEmailPassword = async (
  email: string,
  password: string,
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    // Handle userCredential if needed
  } catch (error) {
    console.error("Error registering new user:", error);
  }
};

const onLoginSucess = (result: UserCredential, callback?: () => void) => {
  // Signed in
  const user = result.user;

  // Get the ID Token
  user.getIdToken().then((idToken) => {
    setAccessTokenToLocalStorage(idToken);
    callback?.();
  });

  return result;
};

// Login with email and password
export const loginWithEmailPassword = async (
  {
    email,
    password,
  }: {
    email: string;
    password: string;
  },
  callback?: () => void,
) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);

    onLoginSucess(result, callback);
  } catch (error: unknown) {
    throw error;
  }
};

// Google login
export const loginWithGoogle = async (callback?: () => void) => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    onLoginSucess(result, callback);
    // Handle result if needed
  } catch (error) {
    console.error("Error with Google login:", error);
  }
};
