import { FC } from "react";
import { Chat } from "@components/chat";
import { Typography, Box } from "@mui/material";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { useQuery } from "react-query";
import { app } from "@helpers";
import CardsList from "@components/cards-list/CardsList";
import { ICategory } from "@components/pages";
import { useNavigate, useParams } from "react-router-dom";

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
    ...doc.data(),
  })) as ISubCategory[];
  return subcategories;
};

export const SubCategories: FC = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const { data, isFetching, isFetched } = useQuery("sub-categories", () =>
    getSubCategoriesByCategoryId(categoryId),
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
            onCloseButtonClick={() => navigate("/dashboard/categories")}
          />
        </Box>
      )}
    </>
  );
};
