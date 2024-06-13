import { FC, useEffect } from "react";
import { Chat } from "@components/chat/Chat";
import { Typography, Box } from "@mui/material";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { useQuery } from "react-query";
import { app } from "@helpers";
import CardsList from "@components/cards-list/CardsList";
import { ICategory } from "@components/pages";
import { useNavigate, useParams } from "react-router-dom";
import firebase from "firebase/app";
import "firebase/auth";
import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";
import { getAuth } from "firebase/auth";
import { fetchPromptBySubCategoryId } from "@components/pages/sub-category-detailed/SubCategoriesDetailed";

const db = getFirestore(app);

export interface ISubCategory extends ICategory {}

export const getSubCategoriesByCategoryId = async (
  categoryId: string | undefined,
): Promise<ISubCategory[]> => {
  if (!categoryId) {
    return [];
  }

  const subcategoriesCol = collection(
    db,
    `categories/${categoryId}/sub-categories`,
  );
  const subcategorySnapshot = await getDocs(subcategoriesCol);
  const subcategories = subcategorySnapshot.docs.map((doc) => ({
    id: doc.id,
    navigateTo: `/dashboard/categories/${categoryId}/sub-category/${doc.id}`,
    ...doc.data(),
  })) as ISubCategory[];
  return subcategories;
};

export const functions = getFunctions(app);

// Define the callable function
const setUserRole = httpsCallable(functions, "setUserRole");

async function assignUserRole(uid: string, role: string): Promise<void> {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    try {
      const idToken = await user.getIdToken();

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/setUserRoleHttp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ uid, role }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.log(data.message);

        // Refresh the ID token to get updated claims
        await user.getIdToken(true);
      } else {
        const error = await response.json();
        console.error("Error setting user role:", error);
      }
    } catch (error) {
      console.error("Error setting user role:", error);
    }
  } else {
    console.error("No user is signed in.");
  }
}

// Example usage
const userId = "ngDi7IZQqUPEbvaXIQDN0JEMYQN2"; // Replace with actual user ID
const role = "admin";

export const SubCategories: FC = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const { data, isFetching, isFetched } = useQuery("sub-categories", () =>
    getSubCategoriesByCategoryId(categoryId),
  );

  useEffect(() => {
    // assignUserRole(userId, role);
  }, []);

  const { data: chatData } = useQuery(
    "sub-categories",
    () => {
      return fetchPromptBySubCategoryId(categoryId!, "Chat");
    },
    {
      enabled: Boolean(categoryId),
    },
  );

  return (
    <>
      {categoryId !== "chat" && (
        <>
          <Typography variant="h4" align="left">
            Sub Categories
          </Typography>

          <CardsList isFetching={isFetching} isFetced={isFetched} data={data} />
        </>
      )}

      {categoryId === "chat" && (
        <Box height="90%">
          <Chat
            fullWidth
            assistantContext={chatData?.[0]?.prompt}
            onCloseButtonClick={() => navigate("/dashboard/categories")}
          />
        </Box>
      )}
    </>
  );
};
