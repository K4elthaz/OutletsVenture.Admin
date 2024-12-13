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
  DatePicker,
  Row,
  Col,
  Checkbox,
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { DiscountOutlined } from "@mui/icons-material";
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
import { PromoData } from "@/utils/Types";
import moment from "moment";

const Deals = () => {
  const [promosPageCards, setPromosPageCards] = useState<PromoData[]>([]);

  useEffect(() => {
    const starCountRef = dbRef(db, "Promos/");
    const unsubscribe = onValue(starCountRef, (snapshot) => {
      if (snapshot.exists()) {
        const pages: PromoData[] = [];
        snapshot.forEach((childSnapshot) => {
          const key = childSnapshot.key ? Number(childSnapshot.key) : NaN;
          const data = childSnapshot.val();
          pages.push({
            id: key!,
            title: data.title,
            description: data.description,
            photo: data.photo,
            location: data.location,
            startDate: data.startDate,
            endDate: data.endDate,
            clicks: data.clicks,
            featured: data.featured,
            contactInformation: data.contactInformation,
            email: data.email,
          });
        });
        setPromosPageCards(pages);
      }
    });

    return () => unsubscribe();
  }, []);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editCard, setEditCard] = useState<PromoData | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();
  const [isUploading, setIsUploading] = useState(false);

  const showModal = (card?: any) => {
    if (card) {
      setEditCard(card);
      form.setFieldsValue({
        title: card.title,
        description: card.description,
        email: card.email,
        location: card.location,
        cloudPanoSceneID: card.cloudPanoSceneID,
        contactInformation: card.contactInformation,
        startDate: dayjs(card.startDate),
        endDate: dayjs(card.endDate),
        featured: card.featured,
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
    const promoID = editCard
      ? editCard.id
      : promosPageCards.length == 0
      ? 1
      : promosPageCards[promosPageCards.length - 1].id + 1;

    let promo: any = {
      id: promoID,
      title: values.title,
      contactInformation: values["contactInformation"],
      startDate: values.startDate.valueOf(),
      endDate: values.endDate.valueOf(),
      description: values["description"],
      email: values["email"],
      location: values["location"],
      featured: values["featured"],
    };

    if (fileList.length > 0) {
      const file = fileList[0].originFileObj!;
      const storageReference = storageRef(
        getStorage(),
        `Promos/${promoID}/${file.name}`
      );

      try {
        const snapshot = await uploadBytes(storageReference, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        promo.photo = downloadURL;
      } catch (error) {
        console.error("File upload failed:", error);
        message.error("File upload failed.");
      }
    }

    if (editCard) {
      await update(dbRef(db, "Promos/" + promo.id), promo);
    } else {
      await set(dbRef(db, "Promos/" + promo.id), promo);
    }

    setIsUploading(false);
    setIsModalVisible(false);
  };

  const handleDelete = (id: number) => {
    const storageReference = storageRef(getStorage(), `Promos/${id}`);

    getMetadata(storageReference)
      .then(() => {
        deleteObject(storageReference)
          .then(() => {
            remove(dbRef(db, `Promos/${id}`))
              .then(() => {
                setPromosPageCards((prevCards) =>
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
          remove(dbRef(db, `Promos/${id}`))
            .then(() => {
              setPromosPageCards((prevCards) =>
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
    <PageContainer title="Deals">
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <MuiLink
          color="inherit"
          href="/components/promos-and-events"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <DiscountOutlined style={{ marginRight: "0.5rem" }} />
          Promos And Events
        </MuiLink>
        <MuiLink color="inherit" href="#">
          Great Deals And Finds
        </MuiLink>
      </Breadcrumbs>
      <DashboardCard
        style={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <div>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <Link href="/components/promos-and-events" passHref>
              <IconButton aria-label="back">
                <ArrowLeftOutlined
                  style={{ fontSize: "24px", color: "primary" }}
                />
              </IconButton>
            </Link>
            <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
              Great Deals And Finds
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {promosPageCards.map((card) => (
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
                      Start Date: {moment(card.startDate).format("YYYY-MM-DD")}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      End Date: {moment(card.endDate).format("YYYY-MM-DD")}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Location: {card.location}
                    </Typography>

                    <div
                      style={{
                        position: "absolute",
                        bottom: 10,
                        right: 10,
                        display: "flex",
                        gap: "2px",
                        marginTop: "20px",
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
                    height: "41vh",
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

      {/* Modal for adding/editing deals or nested card */}
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
            rules={[{ required: true, message: "Please enter the title" }]}
          >
            <Input />
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

          <Form.Item
            label="Contact Information"
            name="contactInformation"
            rules={[
              {
                required: true,
                message: "Please enter the Contact Information",
              },
            ]}
          >
            <Input placeholder="Enter Contact Information" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Start Date"
                name="startDate"
                rules={[
                  { required: true, message: "Please enter the start date" },
                ]}
                style={{ width: "100%" }}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="End Date"
                name="endDate"
                rules={[
                  { required: true, message: "Please enter the end date" },
                ]}
                style={{ width: "100%" }}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Featured" name="featured" valuePropName="checked">
            <Checkbox>Featured</Checkbox>
          </Form.Item>

          <Form.Item label="Photo">
            <Upload
              listType="picture"
              fileList={fileList}
              onChange={handleChange}
              beforeUpload={() => false}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload Photo</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isUploading}
            >
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Deals;
