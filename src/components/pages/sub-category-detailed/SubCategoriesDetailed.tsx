import { FC, useEffect } from "react";
import { Chat } from "@components/chat/Chat";
import { Box } from "@mui/material";
import { app } from "../../../helpers/hooks/use-firebase-config";
import { useNavigate, useParams } from "react-router-dom";
import {
  getFirestore,
  collection,
  query,
  where,
  getDoc,
  doc,
} from "firebase/firestore";

import "firebase/auth";
import { useQuery } from "react-query";

const db = getFirestore(app);

/**
 * Fetches prompt by subCategoryId from Firestore
 * @param {string} subCategoryId - The subCategoryId to fetch data for
 * @returns {Promise<string>} - The prompt field
 */

export const fetchPromptBySubCategoryId = async (
  categoryId: string,
  subCategoryId: string,
) => {
  const docRef = doc(
    db,
    `categories/${categoryId}/sub-categories`,
    subCategoryId,
  );
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return data.prompt;
  } else {
    throw new Error("No such document!");
  }
};

export const SubCategoriesDetailed: FC = () => {
  const { categoryId, subCategoryId } = useParams();
  const navigate = useNavigate();

  const { data: prompt, isFetching } = useQuery(
    "sub-categories",
    () => {
      return fetchPromptBySubCategoryId(categoryId!, subCategoryId!);
    },
    {
      enabled: Boolean(categoryId) && Boolean(subCategoryId),
    },
  );

  return (
    <>
      {subCategoryId && (
        <Box height="90%">
          <Chat
            fullWidth
            onCloseButtonClick={() => navigate(-1)}
            assistantContext={prompt}
          />
        </Box>
      )}
    </>
  );
};
