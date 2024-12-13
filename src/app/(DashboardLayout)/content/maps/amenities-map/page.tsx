"use client";
import React, { useEffect, useState } from "react";
import {
  Typography,
  Grid,
  CardContent,
  Box,
  Stack,
  IconButton,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";
import { Modal, Input, Form, Button, Upload } from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";
import { ref as dbRef, onValue, push, update, remove } from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { db } from "@/utils/firebase";
import { EditOutlined } from "@mui/icons-material";

const AmenitiesPage = () => {
  const [amenities, setAmenities] = useState<any[]>([]); // Dynamic cards
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<any>(null); // Hold amenity being edited
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    // Listen for real-time updates from Firebase
    const amenitiesRef = dbRef(db, "amenities");
    onValue(amenitiesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const amenitiesArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setAmenities(amenitiesArray);
      } else {
        setAmenities([]);
      }
    });
  }, []);

  interface Amenity {
    id: string;
    name: string;
    map2D?: string;
  }

  const showModal = (amenity: Amenity | null = null) => {
    setEditingAmenity(amenity);
    form.resetFields();
    if (amenity) {
      form.setFieldsValue({ name: amenity.name });
    }
    setIsModalVisible(true);
  };

  const handleSaveAmenity = async (values: any) => {
    setIsSubmitting(true);
    let map2DURL = editingAmenity?.map2D || null;

    // Upload 2D map if a new file is provided
    if (values.map2D) {
      const map2DRef = storageRef(
        getStorage(),
        `amenities/${values.map2D.file.name}`
      );
      await uploadBytes(map2DRef, values.map2D.file).then(async () => {
        map2DURL = await getDownloadURL(map2DRef);
      });
    }

    const newAmenity = {
      name: values.name,
      map2D: map2DURL,
    };

    if (editingAmenity) {
      // Update existing amenity
      const amenityRef = dbRef(db, `amenities/${editingAmenity.id}`);
      await update(amenityRef, newAmenity);
    } else {
      // Add new amenity
      const amenitiesRef = dbRef(db, "amenities");
      await push(amenitiesRef, newAmenity);
    }

    setIsModalVisible(false);
    setIsSubmitting(false);
  };

  const handleDeleteAmenity = async (amenityId: string) => {
    const amenityRef = dbRef(db, `amenities/${amenityId}`);
    await remove(amenityRef);
  };

  return (
    <PageContainer title="Amenities">
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <MuiLink
          color="inherit"
          href="/"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <HomeOutlined style={{ marginRight: "0.5rem" }} />
          Home
        </MuiLink>
        <Typography color="text.primary">Amenities</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => window.history.back()} aria-label="back">
          <ArrowLeftOutlined />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Amenities
        </Typography>
        <IconButton
          color="primary"
          onClick={() => showModal()}
          aria-label="add amenity"
          sx={{
            backgroundColor: "#d32f2f",
            color: "white",
            "&:hover": {
              backgroundColor: "#f44336",
            },
          }}
        >
          <PlusOutlined />
        </IconButton>
      </Stack>

      <div
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "15px",
          boxShadow: "0px 4px 15px rgba(0,0,0,0.1)",
          width: "100%",
        }}
      >
      {/* Amenities Cards */}
      <Grid container spacing={3}>
        {amenities.map((amenity) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={amenity.id}>
            <BlankCard
              style={{
                height: "150px",
                background: "linear-gradient(135deg, #ff1744, #ff8a80)",
                color: "white",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                padding: "10px",
              }}
            >
              <CardContent
                style={{
                  textAlign: "center",
                  marginTop: "10px",
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: "bold",
                    marginBottom: 0,
                  }}
                >
                  {amenity.name}
                </Typography>
              </CardContent>

              <Box
                sx={{
                  position: "absolute",
                  bottom: "10px",
                  right: "10px",
                  display: "flex",
                  gap: 1,
                }}
              >
                <IconButton
                  aria-label="edit"
                  onClick={() => showModal(amenity)}
                  sx={{
                    backgroundColor: "rgba(0,0,0,0.4)",
                    color: "white",
                    "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" },
                  }}
                >
                  <EditOutlined />
                </IconButton>
                <IconButton
                  aria-label="delete"
                  onClick={() => handleDeleteAmenity(amenity.id)}
                  sx={{
                    backgroundColor: "rgba(0,0,0,0.4)",
                    color: "white",
                    "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" },
                  }}
                >
                  <DeleteOutlined />
                </IconButton>
              </Box>
            </BlankCard>
          </Grid>
        ))}
      </Grid>
      {/* Modal for Add/Edit Amenity */}
      <Modal
        title={editingAmenity ? "Edit Amenity" : "Add Amenity"}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleSaveAmenity}>
          <Form.Item
            label="Amenity Name"
            name="name"
            rules={[{ required: true, message: "Please enter amenity name!" }]}
          >
            <Input placeholder="Enter amenity name" />
          </Form.Item>
          <Form.Item
            label="Attach 2D Map (PNG only)"
            name="map2D"
            valuePropName="file"
            rules={[
              {
                validator(_, value) {
                  if (value && value.file.type !== "image/png") {
                    return Promise.reject(
                      new Error("Only PNG files are allowed for 2D map!")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Upload beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              {editingAmenity ? "Save Changes" : "Add Amenity"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      
    
      </div>

    </PageContainer>
  );
};

export default AmenitiesPage;
