"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Typography,
  Grid,
  CardContent,
  Avatar,
  Stack,
  Breadcrumbs,
  IconButton,
  Link as MuiLink,
} from "@mui/material";
import {
  Upload,
  Modal,
  Input,
  Form,
  message,
  Button,
  TimePicker,
  Row,
  Col,
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  ArrowLeftOutlined,
  ShoppingOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { UploadFile } from "antd/es/upload/interface";
import { ref as dbRef, onValue, set, update, remove } from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  getMetadata,
} from "firebase/storage";
import { db } from "@/utils/firebase";
import { ShopData } from "@/utils/Types";

const Dine = () => {
  const [dinePageCards, setDinePageCards] = useState<ShopData[]>([]);

  useEffect(() => {
    const starCountRef = dbRef(db, "Dines/");
    const unsubscribe = onValue(starCountRef, (snapshot) => {
      if (snapshot.exists()) {
        const pages: ShopData[] = [];
        snapshot.forEach((childSnapshot) => {
          const key = childSnapshot.key ? Number(childSnapshot.key) : NaN;
          const data = childSnapshot.val();
          pages.push({
            id: key!,
            title: data.title,
            photo: data.photo,
            contactInformation: data.contactInformation,
            openingHour: data.openingHour,
            closingHour: data.closingHour,
            description: data.description,
            email: data.email,
            location: data.location,
            searchs: data.searchs,
            clicks: data.clicks,
            cloudPanoSceneID: data.cloudPanoSceneID,
          });
        });
        setDinePageCards(pages);
      }
    });

    return () => unsubscribe();
  }, []);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editCard, setEditCard] = useState<ShopData | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();
  const [isUploading, setIsUploading] = useState(false);

  const showModal = (card?: ShopData) => {
    if (card) {
      setEditCard(card);
      form.setFieldsValue({
        title: card.title,
        description: card.description,
        email: card.email,
        location: card.location,
        cloudPanoSceneID: card.cloudPanoSceneID,
        contactInformation: card.contactInformation,
        openingHour: dayjs(card.openingHour, "HH:mm"),
        closingHour: dayjs(card.closingHour, "HH:mm"),
      });
      if (card.photo != "placeholder.png") setFileList([]);
    } else {
      setEditCard(null);
      form.resetFields();
      setFileList([]);
    }
    setIsModalVisible(true);
  };

  const handleChange = (info: { file: UploadFile; fileList: UploadFile[] }) => {
    if (info.file.status === "done") {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
    setFileList(info.fileList);
  };

  const handleSave = async (values: any) => {
    setIsUploading(true);
    const dineID = editCard
      ? editCard.id
      : dinePageCards.length == 0
      ? Math.floor(Math.random() * 1000000)
      : dinePageCards[dinePageCards.length - 1].id + 1;

    let dine: any = {
      id: dineID,
      title: values.title,
      contactInformation: values["contactInformation"],
      openingHour: values["openingHour"]?.format("HH:mm"),
      closingHour: values["closingHour"]?.format("HH:mm"),
      description: values["description"],
      email: values["email"],
      location: values["location"],
      cloudPanoSceneID: values["cloudPanoSceneID"],
    };

    if (fileList.length > 0) {
      const file = fileList[0].originFileObj!;
      const storageReference = storageRef(
        getStorage(),
        `Dines/${dineID}/${file.name}`
      );

      try {
        const snapshot = await uploadBytes(storageReference, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        dine.photo = downloadURL;
      } catch (error) {
        console.error("File upload failed:", error);
        message.error("File upload failed.");
      }
    }

    if (editCard) {
      await update(dbRef(db, "Dines/" + dine.id), dine);
    } else {
      await set(dbRef(db, "Dines/" + dine.id), dine);
    }

    setIsUploading(false);
    setIsModalVisible(false);
  };

  const handleDelete = (id: number) => {
    const storageReference = storageRef(getStorage(), `Dines/${id}`);

    getMetadata(storageReference)
      .then(() => {
        deleteObject(storageReference)
          .then(() => {
            remove(dbRef(db, `Dines/${id}`))
              .then(() => {
                setDinePageCards((prevCards) =>
                  prevCards.filter((card) => card.id !== id)
                );
              })
              .catch((error) => {
                console.error("Failed to remove database entry:", error);
              });
          })
          .catch((error) => {
            console.error("Failed to delete file:", error);
          });
      })
      .catch((error) => {
        if (error.code === "storage/object-not-found") {
          remove(dbRef(db, `Dines/${id}`))
            .then(() => {
              setDinePageCards((prevCards) =>
                prevCards.filter((card) => card.id !== id)
              );
            })
            .catch((error) => {
              console.error("Failed to remove database entry:", error);
            });
        } else {
          console.error("Error checking file metadata:", error);
        }
      });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditCard(null);
  };

  return (
    <PageContainer title="Dine">
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <MuiLink
          color="inherit"
          href="/components/shop-and-dine"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <ShoppingOutlined style={{ marginRight: "0.5rem" }} />
          Shop and Dine
        </MuiLink>
        <MuiLink color="inherit" href="#">
          Dine
        </MuiLink>
      </Breadcrumbs>
      <DashboardCard
        style={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <div>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <Link href="/components/shop-and-dine" passHref>
              <IconButton aria-label="back">
                <ArrowLeftOutlined
                  style={{ fontSize: "24px", color: "primary" }}
                />
              </IconButton>
            </Link>
            <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
              Dine
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {dinePageCards.map((card) => (
              <Grid item xs={12} md={4} lg={4} key={card.id}>
                <BlankCard>
                  <div style={{ position: "relative" }}>
                    <Avatar
                      src={card.photo}
                      variant="square"
                      sx={{ height: 250, width: "100%" }}
                    />
                  </div>
                  <CardContent sx={{ p: 3, pt: 2 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {card.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Contact: {card.contactInformation}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Opening Hour: {card.openingHour}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Closing Hour: {card.closingHour}
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
                    height: "40vh",
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

      {/* Modal for adding/editing dine or nested card */}
      <Modal
        title={editCard ? "Edit Card" : "Add New Card"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
        width={600}
        bodyStyle={{ padding: "24px" }}
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
            <Input placeholder="Enter the description." />
          </Form.Item>

          <Form.Item
            label="Location"
            name="location"
            rules={[{ required: true, message: "Please enter a location" }]}
          >
            <Input placeholder="Enter the location." />
          </Form.Item>

          <Form.Item
            label="Contact Information"
            name="contactInformation"
            rules={[
              {
                required: true,
                message: "Please enter the contact information",
              },
            ]}
          >
            <Input placeholder="Enter contact information" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: "Please enter the email address",
              },
            ]}
          >
            <Input placeholder="Enter Email Address" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Opening Hour"
                name="openingHour"
                rules={[
                  { required: true, message: "Please select the opening hour" },
                ]}
              >
                <TimePicker
                  format="HH:mm"
                  placeholder="Select opening hour"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Closing Hour"
                name="closingHour"
                rules={[
                  { required: true, message: "Please select the closing hour" },
                ]}
              >
                <TimePicker
                  format="HH:mm"
                  placeholder="Select closing hour"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Cloud Pano Scene ID"
            name="cloudPanoSceneID"
            rules={[
              {
                required: true,
                message: "Please enter the cloud pano scene ID",
              },
            ]}
          >
            <Input placeholder="Enter the Cloud Pano Scene ID" />
          </Form.Item>

          <Form.Item label="Upload Image" name="image">
            <Upload
              listType="picture"
              fileList={fileList}
              onChange={handleChange}
              showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
              accept="image/*"
              beforeUpload={() => false}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />} block>
                Upload Image
              </Button>
            </Upload>
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

export default Dine;
