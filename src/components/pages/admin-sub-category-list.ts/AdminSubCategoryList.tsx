import React, { FC, useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../../../helpers/hooks/use-firebase-config";
import {
  Box,
  Button,
  Container,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { Link, useParams, useNavigate } from "react-router-dom";

const db = getFirestore(app);

type SubCategory = {
  id: string;
  title: string;
};

export const AdminSubCategoryList: FC = () => {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (categoryId) {
        const subCategoriesCollection = collection(
          db,
          `/categories/${categoryId}/sub-categories`,
        );
        const subCategorySnapshot = await getDocs(subCategoriesCollection);
        const subCategoryList = subCategorySnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
        }));
        setSubCategories(subCategoryList);
      }
    };

    fetchSubCategories();
  }, [categoryId]);

  const handleAddSubCategory = () => {
    navigate(`/add-sub-category`);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Sub-Categories
        </Typography>
        <List>
          {subCategories.map((subCategory) => (
            <ListItem
              button
              key={subCategory.id}
              component={Link}
              to={`/add-sub-category/${categoryId}/sub-category/${subCategory.id}`}
            >
              <ListItemText primary={subCategory.title} />
            </ListItem>
          ))}
        </List>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddSubCategory}
          sx={{ mt: 2 }}
        >
          Add Sub-Category
        </Button>
      </Box>
    </Container>
  );
};
