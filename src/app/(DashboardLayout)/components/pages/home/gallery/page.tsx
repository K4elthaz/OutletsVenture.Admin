"use client";
import React, { useState, useEffect } from "react";
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
import { Upload, Modal, Input, Form, message, Button } from "antd";
import {
  HomeOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { UploadFile } from "antd/es/upload/interface";
import Link from "next/link";
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
import { PhotoData } from "@/utils/Types";
import { homePageGallery, homePageGalleryRef } from "@/utils/References";

const Page = () => {
  const [form] = Form.useForm();
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [editCard, setEditCard] = useState<PhotoData | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const ref = dbRef(db, homePageGallery);
    const unsubscribe = onValue(ref, (snapshot) => {
      if (snapshot.exists()) {
        const photos: PhotoData[] = [];
        snapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();

          photos.push({
            id: data.id,
            name: data.name,
            url: data.url,
          });
        });
        setPhotos(photos);
      }
    });

    return () => unsubscribe();
  }, []);

  const showModal = (photo?: PhotoData) => {
    if (photo) {
      setEditCard(photo);
      form.setFieldsValue({
        name: photo.name,
      });
      if (photo.url != "placeholder.png") setFileList([]);
    } else {
      setEditCard(null);
      form.resetFields();
      setFileList([]);
    }
    setIsModalVisible(true);
  };

  const handleSave = async (values: any) => {
    setIsUploading(true);
    const photoID = editCard
      ? editCard.id
      : photos.length == 0
      ? 1
      : photos[photos.length - 1].id + 1;

    const picture: PhotoData = {
      id: photoID,
      name: values.name,
      url: "placeholder.png",
    };

    if (fileList.length > 0) {
      const file = fileList[0].originFileObj!;
      const storageReference = storageRef(
        getStorage(),
        homePageGalleryRef(photoID, file.name)
      );

      try {
        const snapshot = await uploadBytes(storageReference, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        picture.url = downloadURL;
      } catch (error) {
        console.error("File upload failed:", error);
        message.error("File upload failed.");
      }
    }

    if (editCard) {
      await update(dbRef(db, `${homePageGallery}/${picture.id}`), picture);
    } else {
      await set(dbRef(db, `${homePageGallery}/${picture.id}`), picture);
    }

    setIsUploading(false);
    setIsModalVisible(false);
  };

  const handleDelete = (id: number) => {
    const storageReference = storageRef(
      getStorage(),
      `${homePageGallery}/${id}`
    );

    getMetadata(storageReference)
      .then(() => {
        deleteObject(storageReference)
          .then(() => {
            remove(dbRef(db, `${homePageGallery}/${id}`))
              .then(() => {
                setPhotos((photos) =>
                  photos.filter((picture) => picture.id !== id)
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
          remove(dbRef(db, `${homePageGallery}/${id}`))
            .then(() => {
              setPhotos((photos) =>
                photos.filter((picture) => picture.id !== id)
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

  const handleFileUpload = (info: {
    file: UploadFile;
    fileList: UploadFile[];
  }) => {
    if (info.file.status === "done") {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
    setFileList(info.fileList);
  };

  return (
    <PageContainer title="Home Page">
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <MuiLink
          color="inherit"
          href="/components/pages"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <HomeOutlined style={{ marginRight: "0.5rem" }} />
          Home
        </MuiLink>
        <MuiLink href="/components/pages/home" color="inherit">
          Home Page
        </MuiLink>
        <Typography color="text.primary">Gallery</Typography>
      </Breadcrumbs>

      <DashboardCard
        style={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <div>
          {
            // Landing page cards
            <div>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 3 }}
              >
                <Link href="/components/pages/home" passHref>
                  <IconButton aria-label="back">
                    <ArrowLeftOutlined
                      style={{ fontSize: "24px", color: "primary" }}
                    />
                  </IconButton>
                </Link>
                <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
                  Gallery
                </Typography>
              </Stack>

              <Grid container spacing={3}>
                {photos.map((picture) => (
                  <Grid item xs={12} md={4} lg={4} key={picture.id}>
                    <BlankCard>
                      <Avatar
                        src={picture.url}
                        variant="square"
                        sx={{ height: 250, width: "100%" }}
                      />
                      <CardContent sx={{ p: 3, pt: 2 }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="h6">{picture.name}</Typography>
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
                                showModal(picture);
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
                                handleDelete(picture.id);
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
                        </Stack>
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
                        height: "33vh",
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
          }
        </div>
      </DashboardCard>

      {/* Modal for adding/editing landing or nested card */}
      <Modal
        title={editCard ? "Update" : "Add"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
        width={600}
        bodyStyle={{ padding: "24px" }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            label="Picture's Name/Title"
            name="name"
            rules={[
              {
                required: true,
                message: "Please enter the picture's name/title",
              },
            ]}
          >
            <Input placeholder="Enter picture's name/title" />
          </Form.Item>

          <Form.Item label="Upload Image" name="image">
            <Upload
              listType="picture"
              fileList={fileList}
              onChange={handleFileUpload}
              showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
              accept="image/*"
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
              {editCard ? "Save Changes" : "Add"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Page;
