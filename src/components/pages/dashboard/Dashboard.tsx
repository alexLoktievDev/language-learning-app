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
import { Link, useNavigate } from "react-router-dom";

const db = getFirestore(app);

type Category = {
  id: string;
  title: string;
};

export const Dashboard: FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesCollection = collection(db, "categories");
      const categorySnapshot = await getDocs(categoriesCollection);
      const categoryList = categorySnapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title,
      }));
      setCategories(categoryList);
    };

    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    navigate("/add-category");
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Categories
        </Typography>
        <List>
          {categories.map((category) => (
            <ListItem
              button
              key={category.id}
              component={Link}
              to={`/category/${category.id}`}
            >
              <ListItemText primary={category.title} />
            </ListItem>
          ))}
        </List>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddCategory}
          sx={{ mt: 2 }}
        >
          Add Category
        </Button>
      </Box>
    </Container>
  );
};
