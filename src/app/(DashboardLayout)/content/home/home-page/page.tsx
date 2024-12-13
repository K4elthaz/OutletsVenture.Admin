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

type Data = {
  id: number;
  title: string;
  photo: string;
  nestedCards?: Data[];
};

const HomePage = () => {
  const [homePageCards, setHomePageCards] = useState<Data[]>([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editCard, setEditCard] = useState<any>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [selectedParentCard, setSelectedParentCard] = useState<any>(null); // State to track the selected card
  const [selectedNestedCard, setSelectedNestedCard] = useState<any>(null); // State to track the selected nested card
  const [form] = Form.useForm();
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const starCountRef = dbRef(db, "Home/Home");
    const unsubscribe = onValue(starCountRef, (snapshot) => {
      if (snapshot.exists()) {
        const pages: Data[] = [];
        snapshot.forEach((childSnapshot) => {
          const key = childSnapshot.key ? Number(childSnapshot.key) : NaN;
          const data = childSnapshot.val();

          // Ensure nestedCards is initialized as an empty array if missing
          pages.push({
            id: key!,
            title: data.title,
            photo: data.photo,
            nestedCards: data.nestedCards ? data.nestedCards : [], // Initialize as empty array if undefined
          });
        });
        setHomePageCards(pages);
      }
    });

    return () => unsubscribe();
  }, []);

  const showModal = (card?: any, isNested: boolean = false) => {
    if (card) {
      setEditCard(card);
      form.setFieldsValue({ title: card.title });
    } else {
      setEditCard(null);
      form.resetFields();
    }
    setFileList([]);
    setIsModalVisible(true);
    setSelectedNestedCard(isNested ? card : null);
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
      : homePageCards.length === 0
      ? 1
      : homePageCards[homePageCards.length - 1].id + 1;

    const item: Data = {
      id: promoID,
      title: values.title,
      photo: editCard ? editCard.photo : "placeholder.png",
    };

    if (fileList && fileList.length > 0) {
      const file = fileList[0].originFileObj!;
      const storageReference = storageRef(
        getStorage(),
        `Home/Home/${promoID}/${file.name}`
      );

      try {
        const snapshot = await uploadBytes(storageReference, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        item.photo = downloadURL;
      } catch (error) {
        console.error("File upload failed:", error);
        message.error("File upload failed.");
      }
    }

    if (editCard) {
      await update(dbRef(db, "Home/Home/" + item.id), item);
    } else {
      await set(dbRef(db, "Home/Home/" + item.id), item);
    }

    setIsUploading(false);
    setIsModalVisible(false);
  };

  const handleNestedSave = async (values: any) => {
    setIsUploading(true);

    const newNestedCardId =
      selectedParentCard.nestedCards.length === 0
        ? 1
        : selectedParentCard.nestedCards[
            selectedParentCard.nestedCards.length - 1
          ].id + 1;

    const newNestedCard = {
      id: newNestedCardId,
      title: values.title,
      photo: "placeholder.png",
    };

    if (fileList.length > 0) {
      const file = fileList[0].originFileObj!;
      const storageReference = storageRef(
        getStorage(),
        `Home/Home/${selectedParentCard.id}/NestedCards/${newNestedCardId}/${file.name}`
      );

      try {
        const snapshot = await uploadBytes(storageReference, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        newNestedCard.photo = downloadURL;
      } catch (error) {
        console.error("File upload failed:", error);
        message.error("File upload failed.");
      }
    }

    const updatedParentCard = {
      ...selectedParentCard,
      nestedCards: [...selectedParentCard.nestedCards, newNestedCard],
    };

    await update(
      dbRef(db, `Home/Home/${selectedParentCard.id}`),
      updatedParentCard
    );

    setHomePageCards(
      homePageCards.map((card) =>
        card.id === selectedParentCard.id ? updatedParentCard : card
      )
    );

    setSelectedParentCard(updatedParentCard);
    setIsUploading(false);
    setIsModalVisible(false);
  };

  const handleEditNestedSave = async (values: any) => {
    setIsUploading(true);

    const updatedNestedCard = {
      ...selectedNestedCard,
      title: values.title,
      photo: selectedNestedCard.photo,
    };

    // If there is a new file to upload
    if (fileList.length > 0) {
      const file = fileList[0].originFileObj!;
      const storageReference = storageRef(
        getStorage(),
        `Home/Home/${selectedParentCard.id}/NestedCards/${selectedNestedCard.id}/${file.name}`
      );

      try {
        const snapshot = await uploadBytes(storageReference, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        updatedNestedCard.photo = downloadURL;
      } catch (error) {
        console.error("File upload failed:", error);
        message.error("File upload failed.");
      }
    }

    // Update the nested card in the selectedParentCard's nestedCards array
    const updatedParentCard = {
      ...selectedParentCard,
      nestedCards: selectedParentCard.nestedCards.map((card: any) =>
        card.id === selectedNestedCard.id ? updatedNestedCard : card
      ),
    };

    // Update Firebase database with the updated parent card
    await update(
      dbRef(db, `Home/Home/${selectedParentCard.id}`),
      updatedParentCard
    );

    setHomePageCards(
      homePageCards.map((card) =>
        card.id === selectedParentCard.id ? updatedParentCard : card
      )
    );

    setSelectedParentCard(updatedParentCard);
    setIsUploading(false);
    setIsModalVisible(false);
    setSelectedNestedCard(null);
  };

  const handleCardClick = (card: any) => {
    setSelectedParentCard(card); // Set the selected card to view its nested cards
  };

  const handleDelete = (id: number) => {
    const storageReference = storageRef(getStorage(), `Home/Home/${id}`);

    getMetadata(storageReference)
      .then(() => {
        deleteObject(storageReference)
          .then(() => {
            remove(dbRef(db, `Home/Home/${id}`))
              .then(() => {
                setHomePageCards((prevCards) =>
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
          remove(dbRef(db, `Home/Home/${id}`))
            .then(() => {
              setHomePageCards((prevCards) =>
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

  const handleDeleteNestedCard = async (nestedId: number) => {
    const updatedParentCard = {
      ...selectedParentCard,
      nestedCards: selectedParentCard.nestedCards.filter(
        (nestedCard: any) => nestedCard.id !== nestedId
      ),
    };

    // Optionally, delete the nested card's image from Firebase Storage
    const storageReference = storageRef(
      getStorage(),
      `Home/Home/${selectedParentCard.id}/NestedCards/${nestedId}`
    );

    try {
      await deleteObject(storageReference);
    } catch (error) {}

    // Update Firebase database with the updated parent card
    await update(
      dbRef(db, `Home/Home/${selectedParentCard.id}`),
      updatedParentCard
    );

    setHomePageCards(
      homePageCards.map((card) =>
        card.id === selectedParentCard.id ? updatedParentCard : card
      )
    );
    setSelectedParentCard(updatedParentCard); // Update the selected parent card
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditCard(null);
    setSelectedNestedCard(null);
  };

  const handleBack = () => {
    setSelectedParentCard(null); // Return to the home page
  };

  return (
    <PageContainer title="Home Page" description="This is the Home Page">
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <MuiLink
          color="inherit"
          href="/components/home"
          onClick={() => setSelectedParentCard(null)}
          sx={{ display: "flex", alignItems: "center" }}
        >
          <HomeOutlined style={{ marginRight: "0.5rem" }} />
          Home
        </MuiLink>
        <MuiLink
          color="inherit"
          href="#"
          onClick={() => setSelectedParentCard(null)}
        >
          Home Page
        </MuiLink>
        {selectedParentCard && (
          <Typography color="text.primary">
            {selectedParentCard.title}
          </Typography>
        )}
      </Breadcrumbs>
      <DashboardCard
        style={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <div>
          {selectedParentCard ? (
            // Nested cards view for the selected card
            <div>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 3 }}
              >
                <IconButton onClick={handleBack} aria-label="back">
                  <ArrowLeftOutlined
                    style={{ fontSize: "24px", color: "primary" }}
                  />
                </IconButton>
                <Typography variant="h4" component="h1">
                  {selectedParentCard.title}
                </Typography>
              </Stack>
              <Grid container spacing={3}>
                {selectedParentCard.nestedCards.map((nestedCard: any) => (
                  <Grid item xs={12} md={4} lg={3} key={nestedCard.id}>
                    <BlankCard>
                      <Avatar
                        src={nestedCard.photo}
                        variant="square"
                        sx={{ height: 250, width: "100%" }}
                      />
                      <CardContent sx={{ p: 3, pt: 2 }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="h6">
                            {nestedCard.title}
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
                                showModal(nestedCard, true);
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
                                handleDeleteNestedCard(nestedCard.id);
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
          ) : (
            // Home page cards
            <div>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 3 }}
              >
                <Link href="/components/home" passHref>
                  <IconButton aria-label="back">
                    <ArrowLeftOutlined
                      style={{ fontSize: "24px", color: "primary" }}
                    />
                  </IconButton>
                </Link>
                <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
                  Home Page
                </Typography>
              </Stack>

              <Grid container spacing={3}>
                {homePageCards.map((card) => (
                  <Grid item xs={12} md={4} lg={4} key={card.id}>
                    <BlankCard onClick={() => handleCardClick(card)}>
                      <Avatar
                        src={card.photo}
                        variant="square"
                        sx={{ height: 250, width: "100%" }}
                      />
                      <CardContent sx={{ p: 3, pt: 2 }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="h6">{card.title}</Typography>
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
          )}
        </div>
      </DashboardCard>

      {/* Modal for adding/editing home or nested card */}
      <Modal
        title={editCard ? "Edit Card" : "Add New Card"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
        width={600}
        bodyStyle={{ padding: "24px" }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={
            selectedNestedCard
              ? handleEditNestedSave
              : selectedParentCard
              ? handleNestedSave
              : handleSave
          }
        >
          <Form.Item
            label="Card Title"
            name="title"
            rules={[{ required: true, message: "Please enter a card title" }]}
          >
            <Input placeholder="Enter card title" />
          </Form.Item>

          <Form.Item label="Upload Image" name="image">
            <Upload
              listType="picture"
              fileList={fileList}
              onChange={handleChange}
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
              {editCard ? "Save Changes" : "Save"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default HomePage;
