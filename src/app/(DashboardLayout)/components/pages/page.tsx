"use client";
import { useState, useEffect } from "react";
import {
  Typography,
  Grid,
  CardContent,
  Avatar,
  Stack,
  useTheme,
  IconButton,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import Link from "next/link";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { uniqueId } from "lodash";
import { Spin, Space } from "antd";

const initialHomeCards = [
  {
    id: uniqueId(),
    title: "Landing Page",
    photo: "/images/products/s4.jpg",
    href: "/components/pages/landing",
  },
  {
    id: uniqueId(),
    title: "Home Page",
    photo: "/images/products/s5.jpg",
    href: "/components/pages/home",
  },
];

const MainPage = () => {
  const [loading, setLoading] = useState(true);
  const [homeCards, setHomeCards] = useState(initialHomeCards);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<{
    id: string;
    title: string;
    photo: string;
    href: string;
  } | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState("");

  const theme = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleEditClick = (card: { id: string; title: string; photo: string; href: string }) => {
    setSelectedCard(card);
    setEditedTitle(card.title);
    setPreviewPhoto(card.photo);
    setEditDialogOpen(true);
  };

  const handleSaveChanges = () => {
    if (selectedCard) {
      const photoUrl = previewPhoto; // In real-world, this would be the uploaded URL
      setHomeCards((prevCards) =>
        prevCards.map((card) =>
          card.id === selectedCard.id
            ? { ...card, title: editedTitle, photo: photoUrl }
            : card
        )
      );
    }
    setEditDialogOpen(false);
    setSelectedCard(null);
    setUploadedPhoto(null);
    setPreviewPhoto("");
  };

  const handleDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedCard(null);
    setUploadedPhoto(null);
    setPreviewPhoto("");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedPhoto(file);
      setPreviewPhoto(URL.createObjectURL(file)); // For previewing image before uploading
    }
  };

  return (
    <PageContainer style={{ height: "100vh" }}>
      <DashboardCard
        style={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <div>
          <Typography
            variant="h4"
            component="h1"
            sx={{ mb: 3, textAlign: "start" }}
          >
            Home
          </Typography>
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Space direction="vertical" size="large">
                <Spin size="large" />
              </Space>
            </div>
          ) : (
            <Grid container spacing={3}>
              {homeCards.map((product) => (
                <Grid item xs={12} md={4} lg={4} key={product.id}>
                  <BlankCard>
                    <Link href={product.href}>
                      <Avatar
                        src={product.photo}
                        variant="square"
                        sx={{
                          height: 250,
                          width: "100%",
                        }}
                      />
                    </Link>
                    <CardContent sx={{ p: 3, pt: 2 }}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography variant="h6">{product.title}</Typography>
                        <IconButton
                          onClick={() => handleEditClick(product)}
                          aria-label="edit"
                        >
                          <EditIcon />
                        </IconButton>
                      </Stack>
                    </CardContent>
                  </BlankCard>
                </Grid>
              ))}
            </Grid>
          )}
        </div>
      </DashboardCard>

      <Dialog open={editDialogOpen} onClose={handleDialogClose}>
        {selectedCard && (
          <>
            <DialogTitle>Edit Card</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                margin="normal"
                label="Title"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
              />
              <Button
                variant="outlined"
                component="label"
                sx={{ mt: 2 }}
              >
                Upload Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
              {previewPhoto && (
                <div
                  style={{
                    marginTop: "16px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Avatar
                    src={previewPhoto}
                    variant="square"
                    sx={{ width: "100%", height: 250 }}
                  />
                </div>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose} color="error">
                Cancel
              </Button>
              <Button
                color="primary"
                onClick={handleSaveChanges}
                disabled={!previewPhoto}
              >
                Save
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </PageContainer>
  );
};

export default MainPage;
