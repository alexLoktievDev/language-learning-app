import React, { FC } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Grid,
  Skeleton,
  Typography,
} from "@mui/material";
import { ICategory } from "@components/pages";
import { useNavigate } from "react-router-dom";

const CardsList: FC<{
  data: ICategory[] | undefined;
  isFetching?: boolean;
  isFetced?: boolean;
}> = ({ isFetching, isFetced, data }) => {
  const navigate = useNavigate();

  if (isFetced && !data?.length) {
    return <Typography variant="h6">No Items</Typography>;
  }

  return (
    <Grid container spacing={3} marginTop={0}>
      {isFetching
        ? Array.from({ length: 9 }, () => (
            <Grid item xs={12} sm={12} md={12}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" />
                  <Skeleton variant="text" />
                </CardContent>
              </Card>
            </Grid>
          ))
        : data?.map(({ id, title, description, navigateTo, image }) => (
            <Grid
              item
              xs={12}
              sm={12}
              md={12}
              key={id}
              onClick={() => {
                if (navigateTo) navigate(navigateTo);
              }}
            >
              <Card id={id}>
                <CardMedia sx={{ height: 200 }} image={image} title={title} />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
    </Grid>
  );
};

export default CardsList;
