"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Typography,
  Grid,
  CardContent,
  Stack,
  IconButton,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";
import { Modal, Input, Form, Button, Upload, message } from "antd";
import {
  EditOutlined,
  UploadOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";
import { ref as dbRef, onValue, set, update } from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { db } from "@/utils/firebase";
import {
  disasterEarthquakeMap,
  disasterEmergencyMap,
  disasterHarazardMap,
} from "@/utils/References";

const DisasterMapPage = () => {
  const [disasterMapCards, setDisasterMapCards] = useState([
    { id: 1, title: "Hazard Route" },
    { id: 2, title: "Fire Route" },
    { id: 3, title: "Earthquake Route" },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // Track if we're editing a card
  const [editingCard, setEditingCard] = useState<any>(null); // Hold the card being edited
  const [selectedCard, setSelectedCard] = useState<any>(null); // Track selected card
  const [form] = Form.useForm();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const hazardMapRef = dbRef(db, disasterHarazardMap);
    onValue(hazardMapRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDisasterMapCards((prev) =>
          prev.map((card) => {
            if (card.id === 1) {
              return { ...card, ...{ hazard: data } };
            }
            return card;
          })
        );
      }
    });

    const emergencyMapRef = dbRef(db, disasterEmergencyMap);
    onValue(emergencyMapRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDisasterMapCards((prev) =>
          prev.map((card) => {
            if (card.id === 2) {
              return { ...card, ...{ emergency: data } };
            }
            return card;
          })
        );
      }
    });

    const earthquakeMapRef = dbRef(db, disasterEarthquakeMap);
    onValue(earthquakeMapRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDisasterMapCards((prev) =>
          prev.map((card) => {
            if (card.id === 3) {
              return { ...card, ...{ earthquake: data } };
            }
            return card;
          })
        );
      }
    });
  }, []);

  const showModal = (card: any) => {
    setSelectedCard(card);
    setEditingCard(card);
    form.resetFields();
    setIsModalVisible(true);
    setIsEditMode(true);
  };

  const handleSaveCard = async (values: any) => {
    setIsSubmitting(true);
    let map2DURL = null;
    let type = "hazard";

    if (editingCard.id === 1) type = "hazard";
    else if (editingCard.id === 2) type = "emergency";
    else if (editingCard.id === 3) type = "earthquake";

    values = values?.map2D?.pop()?.originFileObj;

    if (values) {
      const map2DRef = storageRef(
        getStorage(),
        `disasterMap/${type}/${values?.name}`
      );
      await uploadBytes(map2DRef, values).then(async (snapshot) => {
        await getDownloadURL(map2DRef).then((url) => {
          map2DURL = url;
        });
      });
    }

    const updatedCard = {
      ...editingCard,
      map2D: map2DURL || editingCard[type]["map2D"],
    };

    setDisasterMapCards((prevCards) =>
      prevCards.map((card) => (card.id === editingCard.id ? updatedCard : card))
    );

    if (editingCard.id === 1) {
      const hazardMapRef = dbRef(db, disasterHarazardMap);
      if (!editingCard) set(hazardMapRef, updatedCard);
      else update(hazardMapRef, updatedCard);
    } else if (editingCard.id === 2) {
      const emergencyMapRef = dbRef(db, disasterEmergencyMap);
      if (!editingCard) set(emergencyMapRef, updatedCard);
      else update(emergencyMapRef, updatedCard);
    } else if (editingCard.id === 3) {
      const earthquakeMapRef = dbRef(db, disasterEarthquakeMap);
      if (!editingCard) set(earthquakeMapRef, updatedCard);
      else update(earthquakeMapRef, updatedCard);
    }

    setIsModalVisible(false);
    setEditingCard(null);
    setIsSubmitting(false);
    message.success("Map uploaded successfully!");
  };

  const handleEditCard = (card: any) => {
    setIsEditMode(true);
    setEditingCard(card);

    // form.setFieldsValue({
    //   title: card.title,
    //   // tags: card.tags?.join(", "),
    //   map2D: card.map2D
    //     ? [
    //         {
    //           uid: card.map2D,
    //           name: "existing-map.png",
    //           status: "done",
    //           url: card.map2D,
    //         },
    //       ]
    //     : [],
    // });

    setIsModalVisible(true);
  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <PageContainer title="Emeregency Routes">
      {/* Breadcrumbs for navigation */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <MuiLink
          color="inherit"
          href="/"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <HomeOutlined style={{ marginRight: "0.5rem" }} />
          Home
        </MuiLink>
        <Typography color="text.primary">Emeregency Routes</Typography>
      </Breadcrumbs>

      {/* Back Button and Title */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <IconButton onClick={() => router.back()} aria-label="back">
          <ArrowLeftOutlined style={{ fontSize: "24px", color: "primary" }} />
        </IconButton>
        <Typography variant="h4" component="h1">
          Emeregency Routes
        </Typography>
      </Stack>

      {/* Shadowed Container */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "15px",
          boxShadow: "0px 4px 15px rgba(0,0,0,0.1)",
        }}
      >
        <Grid container spacing={3} justifyContent="center">
          {disasterMapCards.map((card) => (
            <Grid item xs={12} md={4} lg={3} key={card.id}>
              <BlankCard
                onClick={() => showModal(card)}
                style={{
                  backgroundColor: "#C62828", // Red color for the card
                  color: "white",
                  height: "120px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "10px",
                  boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.16)",
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                <CardContent sx={{ textAlign: "center", p: 2 }}>
                  <Typography variant="h6" style={{ color: "white" }}>
                    {card.title}
                  </Typography>
                  {/* Edit Button on the Card itself */}
                  <IconButton
                    aria-label="edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCard(card);
                      handleEditCard(card);
                    }}
                    style={{
                      color: "white",
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      backgroundColor: "rgba(0,0,0,0.2)",
                      borderRadius: "50%",
                    }}
                  >
                    <EditOutlined />
                  </IconButton>
                </CardContent>
              </BlankCard>
            </Grid>
          ))}
        </Grid>
      </div>

      {/* Modal for adding/editing disaster route information */}
      <Modal
        title={
          isEditMode
            ? `Edit ${selectedCard?.title}`
            : `Add Information for ${selectedCard?.title}`
        }
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} onFinish={handleSaveCard}>
          <Form.Item
            label="Attach 2D Map"
            name="map2D"
            valuePropName="file"
            rules={[
              { required: !isEditMode, message: "Please attach 2D map!" },
              {
                validator(_, value) {
                  // if (value && value?.file?.type !== "image/png") {
                  //   return Promise.reject(
                  //     new Error("Only PNG files are allowed for 2D map!")
                  //   );
                  // }
                  console.log("value", value);
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Upload
              beforeUpload={() => false}
              fileList={form.getFieldValue("map2D") || []}
              onChange={({ fileList }) => {
                form.setFieldsValue({ map2D: fileList });
              }}
            >
              <Button icon={<UploadOutlined />}>Click to Upload 2D Map</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              {isEditMode ? "Save Changes" : "Save"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default DisasterMapPage;
