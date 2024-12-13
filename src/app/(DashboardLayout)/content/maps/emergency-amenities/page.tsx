"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Typography,
  Grid,
  CardContent,
  Stack,
  Breadcrumbs,
  IconButton,
  Link as MuiLink,
} from "@mui/material";
import { Upload, Modal, Input, Form, message, Button } from "antd";
import {
  EditOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  ShoppingOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { ref as dbRef, onValue, set, update, remove } from "firebase/database";
import { db } from "@/utils/firebase";
import TextArea from "antd/lib/input/TextArea";

type ShopData = {
  id: number;
  title: string;
  description: string;
};

const EmergencyAmenities = () => {
  const [shopPageCards, setShopPageCards] = useState<ShopData[]>([]);

  useEffect(() => {
    const starCountRef = dbRef(db, "EmergencyAmenities/");
    const unsubscribe = onValue(starCountRef, (snapshot) => {
      if (snapshot.exists()) {
        const shopPages: any[] = [];
        snapshot.forEach((childSnapshot) => {
          const key = childSnapshot.key ? Number(childSnapshot.key) : NaN;
          const data = childSnapshot.val();
          console.log("Emergency and Amenities", data);
          shopPages.push({
            id: key!,
            title: data.title,
            description: data.description,
          });
        });
        setShopPageCards(shopPages);
      }
    });

    return () => unsubscribe();
  }, []);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editCard, setEditCard] = useState<ShopData | null>(null);
  const [form] = Form.useForm();
  const [isUploading, setIsUploading] = useState(false);

  const showModal = (card?: ShopData) => {
    if (card) {
      setEditCard(card);
      form.setFieldsValue({
        title: card.title,
        description: card.description,
      });
    } else {
      setEditCard(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleSave = async (values: any) => {
    setIsUploading(true);
    const id = editCard
      ? editCard.id
      : shopPageCards.length == 0
      ? Math.floor(Math.random() * 1000000)
      : shopPageCards[shopPageCards.length - 1].id + 1;

    let shop: any = {
      id,
      title: values.title,
      description: values["description"],
    };

    if (editCard) {
      await update(dbRef(db, "EmergencyAmenities/" + shop.id), shop);
    } else {
      // Use set() for new entries
      await set(dbRef(db, "EmergencyAmenities/" + shop.id), shop);
    }

    setIsUploading(false);
    setIsModalVisible(false);
  };

  const handleDelete = (id: number) => {
    remove(dbRef(db, `EmergencyAmenities/${id}`))
      .then(() => {
        setShopPageCards((prevCards) =>
          prevCards.filter((card) => card.id !== id)
        );
        message.success("Card deleted successfully");
      })
      .catch((error) => {
        console.error("Failed to remove database entry:", error);
      });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditCard(null);
  };

  return (
    <PageContainer title="Shop">
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <MuiLink
          color="inherit"
          href="/components/mall-map"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <ShoppingOutlined style={{ marginRight: "0.5rem" }} />
          Mall Map
        </MuiLink>
        <MuiLink color="inherit" href="#">
          Emergency and Amenities
        </MuiLink>
      </Breadcrumbs>
      <DashboardCard
        style={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <div>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <Link href="/components/mall-map" passHref>
              <IconButton aria-label="back">
                <ArrowLeftOutlined
                  style={{ fontSize: "24px", color: "primary" }}
                />
              </IconButton>
            </Link>
            <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
              Emergency and Amenities
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {shopPageCards.map((card) => (
              <Grid item xs={12} md={4} lg={4} key={card.id}>
                <BlankCard>
                  <CardContent sx={{ p: 3, pt: 2 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {card.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {card.description}
                    </Typography>

                    <div
                      style={{
                        position: "absolute",
                        bottom: 10,
                        right: 10,
                        display: "flex",
                        gap: "2px",
                      }}
                    >
                      <IconButton
                        aria-label="edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          showModal(card);
                        }}
                        sx={{
                          backgroundColor: "white",
                          borderRadius: "50%",
                          padding: "10px",
                          fontSize: "10px",
                        }}
                      >
                        <EditOutlined
                          style={{ color: "green", fontSize: "18px" }}
                        />
                      </IconButton>
                      <IconButton
                        aria-label="delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(card.id);
                        }}
                        sx={{
                          backgroundColor: "white",
                          borderRadius: "50%",
                          padding: "10px",
                          fontSize: "17px",
                        }}
                      >
                        <DeleteOutlined
                          style={{ color: "red", fontSize: "18px" }}
                        />
                      </IconButton>
                    </div>
                  </CardContent>
                </BlankCard>
              </Grid>
            ))}
            <Grid item xs={12} md={4} lg={4}>
              <BlankCard onClick={() => showModal()}>
                <CardContent
                  sx={{
                    padding: "12px",
                    paddingTop: "8px",
                    // height: "40vh",
                    textAlign: "center",
                    border: "2px dashed #ccc",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    "&:hover": { borderColor: "red" },
                  }}
                >
                  <PlusOutlined
                    style={{ fontSize: "24px", marginBottom: "8px" }}
                  />
                  <Typography variant="h6">Add New Item</Typography>
                </CardContent>
              </BlankCard>
            </Grid>
          </Grid>
        </div>
      </DashboardCard>

      {/* Modal for adding/editing shop or nested card */}
      <Modal
        title={editCard ? "Edit Card" : "Add New Card"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
        width={600}
        // bodyStyle={{ padding: "24px" }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input placeholder="Enter card title" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter a description" }]}
          >
            <TextArea />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isUploading}
            >
              {editCard ? "Save Changes" : "Save"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default EmergencyAmenities;
