import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Button,
  Box,
  CircularProgress,
  Alert
} from "@mui/material";

import FavoriteIcon from "@mui/icons-material/Favorite";
import LocationOnIcon from "@mui/icons-material/LocationOn";

import api from "../../../services/api/apiClient";

const Favorites = () => {

  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {

      const res = await api.get("/favorites");

      setFavorites(res.data || []);

    } catch (err) {
      console.error("Favorites error:", err);
      setError("Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (apartmentId) => {

    try {

      await api.delete(`/favorites/apartment/${apartmentId}`);

      setFavorites(prev =>
        prev.filter(fav => fav.apartment._id !== apartmentId)
      );

    } catch (err) {
      console.error("Remove favorite error:", err);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <Box sx={{ display:"flex", justifyContent:"center", mt:8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt:6 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py:4 }}>

      <Typography variant="h4" sx={{ mb:4 }}>
        My Favorite Properties
      </Typography>

      {favorites.length === 0 ? (
        <Typography color="text.secondary">
          You haven't saved any properties yet.
        </Typography>
      ) : (

        <Grid container spacing={3}>

          {favorites.map((fav) => {

            const property = fav.apartment;

            return (

              <Grid item xs={12} sm={6} md={4} key={fav.id}>

                <Card>

                  <CardMedia
                    component="img"
                    height="200"
                    image={
                        property.images?.[0]?.startsWith("http")
                            ? property.images[0]
                            : `http://localhost:5006/${property.images?.[0]}`
                        }
                    alt={property.location}
                    sx={{ cursor:"pointer" }}
                    onClick={() => navigate(`/properties/${property._id}`)}
                  />

                  <CardContent>

                    <Typography variant="h6">
                      {property.location}
                    </Typography>

                    <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
                      <LocationOnIcon fontSize="small" />
                      <Typography variant="body2">
                        {property.category}
                      </Typography>
                    </Box>

                    <Typography
                      variant="h6"
                      color="primary"
                      sx={{ mt:2 }}
                    >
                      {formatPrice(property.price)}
                    </Typography>

                  </CardContent>

                  <CardActions sx={{ justifyContent:"space-between" }}>

                    <Button
                      size="small"
                      onClick={() => navigate(`/properties/${property._id}`)}
                    >
                      View
                    </Button>

                    <IconButton
                      color="error"
                      onClick={() => removeFavorite(property._id)}
                    >
                      <FavoriteIcon />
                    </IconButton>

                  </CardActions>

                </Card>

              </Grid>

            );
          })}

        </Grid>

      )}

    </Container>
  );
};

export default Favorites;