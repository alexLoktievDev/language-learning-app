import { FC } from "react";
import { Outlet, useParams } from "react-router-dom";
import { Container, Typography } from "@mui/material";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { useQuery } from "react-query";
import { app } from "@helpers";
import CardsList from "@components/cards-list/CardsList";

const db = getFirestore(app);

export interface ICategory {
  id: string;
  title: string;
  description: string;
  image: string;
  navigateTo?: string;
}

const getAllCategories = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "categories"));

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      navigateTo: `/dashboard/categories/${doc.id}`,
    })) as ICategory[];
  } catch (error) {
    console.error("Error getting documents:", error);
    throw error; // This ensures React Query catches the error for error handling
  }
};

export const Categories: FC = () => {
  const { categoryId } = useParams();
  const { data, isFetching } = useQuery("categories", getAllCategories);

  return (
    <Container maxWidth="xl" sx={{ maxWidth: 1400, height: "100%" }}>
      {categoryId ? (
        <Outlet />
      ) : (
        <>
          <Typography variant="h4" align="left">
            Categories
          </Typography>

          <CardsList isFetching={isFetching} data={data} />
        </>
      )}
    </Container>
  );
};
