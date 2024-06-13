import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { app } from "../../../helpers/hooks/use-firebase-config";
import {
  Box,
  Button,
  Container,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const db = getFirestore(app);

type Inputs = {
  category: string;
  prompt?: string;
  description?: string;
  image?: string;
  title: string;
};

export const AddSubCategory: React.FC = () => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<Inputs>();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [fields, setFields] = useState<string[]>([]);
  const { subCategoryId, categoryId } = useParams<{
    subCategoryId?: string;
    categoryId?: string;
  }>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesCollection = collection(db, "categories");
      const categorySnapshot = await getDocs(categoriesCollection);
      const categoryList = categorySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().title,
      }));
      setCategories(categoryList);
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (subCategoryId && categoryId) {
      const fetchSubCategory = async () => {
        const subCategoryDoc = doc(
          db,
          `categories/${categoryId}/sub-categories`,
          subCategoryId,
        );
        const subCategorySnapshot = await getDoc(subCategoryDoc);
        if (subCategorySnapshot.exists()) {
          const subCategoryData = subCategorySnapshot.data();
          setValue("category", categoryId); // Set category value
          setFields(Object.keys(subCategoryData));
          if (subCategoryData.prompt)
            setValue("prompt", subCategoryData.prompt);
          if (subCategoryData.description)
            setValue("description", subCategoryData.description);
          if (subCategoryData.image) setValue("image", subCategoryData.image);
          if (subCategoryData.title) setValue("title", subCategoryData.title);
        }
      };

      fetchSubCategory();
    }
  }, [subCategoryId, categoryId, setValue]);

  /**
   * Handle form submission to add or update a sub-category.
   * @param data - The form data.
   */
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const { category, prompt, description, image, title } = data;

    // Fetch existing sub-category data if updating
    let existingSubCategoryData = {};
    if (subCategoryId && categoryId) {
      const subCategoryDoc = doc(
        db,
        `categories/${categoryId}/sub-categories`,
        subCategoryId,
      );
      const subCategorySnapshot = await getDoc(subCategoryDoc);
      if (subCategorySnapshot.exists()) {
        existingSubCategoryData = subCategorySnapshot.data();
      }
    }

    // Prepare sub-category data, only including fields that exist in the database
    const subCategory = Object.fromEntries(
      Object.entries({ prompt, description, image, title }).filter(
        ([key, value]) => value !== undefined && key in existingSubCategoryData,
      ),
    );

    try {
      if (subCategoryId && categoryId) {
        // Update existing sub-category
        const subCategoryDoc = doc(
          db,
          `categories/${categoryId}/sub-categories`,
          subCategoryId,
        );
        await updateDoc(subCategoryDoc, subCategory);
        alert(t("Sub-category updated successfully!"));
      } else {
        // Add new sub-category
        await addDoc(
          collection(db, `categories/${category}/sub-categories`),
          subCategory,
        );
        reset();
        alert(t("Sub-category added successfully!"));
      }
      navigate(`/category/${category}`);
    } catch (error) {
      console.error(t("Error adding/updating sub-category:"), error);
      alert(t("Failed to add/update sub-category"));
    }
  };

  return (
    <Container maxWidth="md">
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          {subCategoryId ? t("Edit Sub-Category") : t("Add Sub-Category")}
        </Typography>
        <Controller
          name="category"
          control={control}
          defaultValue={categoryId || ""}
          render={({ field }) => (
            <TextField
              select
              label={t("Category")}
              fullWidth
              margin="normal"
              {...field}
              error={!!errors.category}
              helperText={errors.category?.message}
              disabled={!!subCategoryId}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        {fields.includes("prompt") && (
          <Controller
            name="prompt"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                label={t("Prompt")}
                fullWidth
                margin="normal"
                multiline
                rows={4}
                {...field}
                error={!!errors.prompt}
                helperText={errors.prompt?.message}
              />
            )}
          />
        )}

        {fields.includes("description") && (
          <Controller
            name="description"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                label={t("Description")}
                fullWidth
                margin="normal"
                multiline
                rows={4}
                {...field}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            )}
          />
        )}

        {fields.includes("image") && (
          <Controller
            name="image"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                label={t("Image URL")}
                fullWidth
                margin="normal"
                {...field}
                error={!!errors.image}
                helperText={errors.image?.message}
              />
            )}
          />
        )}

        <Controller
          name="title"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              label={t("Title")}
              fullWidth
              margin="normal"
              {...field}
              error={!!errors.title}
              helperText={errors.title?.message}
            />
          )}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
        >
          {subCategoryId ? t("Update Sub-Category") : t("Add Sub-Category")}
        </Button>
      </Box>
    </Container>
  );
};
