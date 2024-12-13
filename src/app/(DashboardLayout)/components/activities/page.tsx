"use client";
import React, { useEffect, useState } from "react";
import {
  Typography,
  Grid,
  CardContent,
  Avatar,
  Stack,
  Box,
  IconButton,
} from "@mui/material";
import { Upload, Modal, Input, Form, message, Button, Spin, Space } from "antd";
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { UploadFile } from "antd/es/upload/interface";
import { ActivityData, ActivitySubData } from "@/utils/Types";
import { ref as dbRef, onValue, set, update, remove } from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db } from "@/utils/firebase";
import { ActivityRef } from "@/utils/References";
import { merge } from "lodash";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const Activities = () => {
  const defaultCards: ActivityData[] = [
    {
      id: 1,
      title: "Field of Rides",
      photo: "/images/products/s8.jpg",
      subData: [],
    },
    {
      id: 2,
      title: "Playground",
      photo: "/images/products/s8.jpg",
      subData: [],
    },
    {
      id: 3,
      title: "Dog Park",
      photo: "/images/products/s8.jpg",
      subData: [],
    },
    {
      id: 4,
      title: "Bike and Running Lane",
      photo: "/images/products/s8.jpg",
      subData: [],
    },
  ];

  const [aboitizPitchPageCards, setAboitizPitchPageCards] = useState<
    ActivityData[]
  >([]);
  const [dynamicCards, setDynamicCards] = useState<ActivitySubData[]>([]); // Dynamic cards for subdata
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editCard, setEditCard] = useState<any>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [viewDynamic, setViewDynamic] = useState<number | null>(null);
  const [currentCardId, setCurrentCardId] = useState<number>(1);
  const [isSavedInDatabase, setIsSavedInDatabase] = useState(false);
  const [dynamicTitle, setDynamicTitle] = useState<string>("Activities");

  useEffect(() => {
    const activityRef = dbRef(db, ActivityRef);
    onValue(activityRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        let firebaseCards = Object.values(data) as any;
        // Remove any cards with null ID (due to Firebase bug)
        firebaseCards = firebaseCards
          ?.filter((card: any) => card.id)
          ?.map((data: any) => {
            return {
              ...data,
              subData: data?.subData ? Object.values(data?.subData) : [],
            };
          });

        // Merge default cards with Firebase data, keeping default cards intact if not present in Firebase
        // const mergedCards: ActivityData[] = defaultCards.map((defaultCard) => {
        //   const foundCard = firebaseCards.find(
        //     (card: any) => card.id === defaultCard.id
        //   );
        //   return (foundCard as ActivityData) || (defaultCard as ActivityData);
        // });

        setAboitizPitchPageCards(firebaseCards);
        console.log(currentCardId);
        // setDynamicCards(firebaseCards[currentCardId - 1].subData || []);
        setIsSavedInDatabase(true);
      } else {
        // If no Firebase data, use default cards
        setAboitizPitchPageCards(defaultCards);
      }
    });
  }, []);

  const showModal = (card?: any) => {
    if (card) {
      setEditCard(card);
      form.setFieldsValue({
        title: card.title,
        essay: card.essay || "", // If editing a dynamic card, load essay
      });
      setFileList([
        {
          uid: "-1",
          name: card.title,
          status: "done",
          url: card.photo,
        },
      ]);
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
    setLoading(true);
    // const id = editCard
    //   ? editCard.id
    //   : aboitizPitchPageCards
    //   ? aboitizPitchPageCards.length > 1
    //     ? aboitizPitchPageCards[aboitizPitchPageCards.length - 1].id + 1
    //     : 1
    //   : 1;
    const id = editCard?.id ?? Math.floor(Math.random() * 1000000);

    try {
      let newCard: any = {
        id: id,
        title: values.title,
      };

      if (fileList.length > 0) {
        const file = fileList[0].originFileObj!;
        if (file !== undefined) {
          let path = null;
          if (viewDynamic !== null)
            path = `${ActivityRef}/${currentCardId}/subData/${id}/${file.name}`;
          else path = `${ActivityRef}/${id}/${file.name}`;
          const storageReference = storageRef(getStorage(), path);

          try {
            const snapshot = await uploadBytes(storageReference, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            newCard.photo = downloadURL;
          } catch (error) {
            message.error("File upload failed.");
          }
        }
      }

      if (editCard) {
        if (viewDynamic !== null) {
          newCard.essay = values.essay;
          update(
            dbRef(db, `${ActivityRef}/${currentCardId}/subData/${newCard.id}`),
            newCard
          ).catch((e) => {
            console.log(e);
          });
          setViewDynamic(null);
          message.success("Subdata updated successfully");
        } else {
          if (!isSavedInDatabase) {
            newCard.subData = [];
            set(dbRef(db, `${ActivityRef}/${newCard.id}`), newCard);
          } else {
            update(dbRef(db, `${ActivityRef}/${newCard.id}`), newCard);
          }
          message.success("Card updated successfully");
        }
      } else {
        // Adding new subdata
        if (viewDynamic !== null) {
          newCard.essay = values.essay;
          set(
            dbRef(db, `${ActivityRef}/${currentCardId}/subData/${newCard.id}`),
            newCard
          );
          if (dynamicCards.length > 0) {
            setDynamicCards([...dynamicCards, newCard]);
          } else {
            setDynamicCards([newCard]);
          }
          message.success("Subdata added successfully");
        } else {
          // Adding new card
          newCard.subData = [];
          update(dbRef(db, `${ActivityRef}/${newCard.id}`), newCard);
          message.success("Card added successfully");
        }
      }
    } catch (error) {
      message.error("An error occurred while saving.");
      console.log("Error saving card:", error);
    } finally {
      setLoading(false);
      setIsModalVisible(false);
    }
  };

  const handleDelete = (id: number) => {
    const storageReference = storageRef(
      getStorage(),
      `${ActivityRef}/${currentCardId}/subData/${id}`
    );

    deleteObject(storageReference)
      .then(() => {
        remove(dbRef(db, `${ActivityRef}/${currentCardId}/subData/${id}`)).then(
          () => {
            setDynamicCards(dynamicCards.filter((card) => card.id !== id));
          }
        );
      })
      .catch((error) => {
        if (error.code === "storage/object-not-found") {
          remove(
            dbRef(db, `${ActivityRef}/${currentCardId}/subData/${id}`)
          ).then(() => {
            setDynamicCards(dynamicCards.filter((card) => card.id !== id));
          });
          console.log("storage/object-not-found", error);
        } else {
          throw error;
        }
      })
      .then(() => {
        message.success("Card deleted successfully.");
      })
      .catch(() => {});
  };

  const handleDeleteCard = async (id: number) => {
    // const storageReference = storageRef(getStorage(), `${ActivityRef}/${id}`);

    await remove(dbRef(db, `${ActivityRef}/${id}`))
      .then(() => {
        message.success("Card deleted successfully.");
      })
      .catch((error) => {
        if (error.code === "storage/object-not-found") {
          // return remove(dbRef(db, `${ActivityRef}/${id}`));
          console.log("storage/object-not-found", error);
        } else {
          throw error;
        }
      });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditCard(null);
  };

  const handleViewDynamic = (id: number) => {
    const selectedCard = aboitizPitchPageCards.find((card) => card.id === id);
    if (selectedCard) {
      setDynamicCards(selectedCard.subData);
      setCurrentCardId(id);
      setViewDynamic(id);

      document.title = `${selectedCard.title} - Activities`;
      setDynamicTitle(selectedCard.title);
    }
  };

  const handleBackToMain = () => {
    setViewDynamic(null);
    setDynamicCards([]); // Clear dynamicCards when returning to the main view
  };

  // if (!aboitizPitchPageCards.length) return null;

  return (
    <PageContainer title="Activities">
      <DashboardCard
        style={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <div>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
              Activities
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {loading ? (
              <Grid item xs={12} style={{ textAlign: "center" }}>
                <Space
                  size="large"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "20px",
                  }}
                >
                  <Spin size="large" />
                </Space>
              </Grid>
            ) : viewDynamic === null ? (
              <>
                {/* Main card view */}
                {aboitizPitchPageCards.map((card) => (
                  <Grid item xs={12} md={4} lg={4} key={card.id}>
                    <BlankCard onClick={() => handleViewDynamic(card.id)}>
                      <div style={{ position: "relative" }}>
                        <Avatar
                          src={
                            card.photo ? card.photo : "/images/products/s8.jpg"
                          }
                          variant="square"
                          sx={{ height: 250, width: "100%" }}
                        />
                      </div>
                      <CardContent sx={{ p: 3, pt: 2 }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          {card.title}
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
                              handleDeleteCard(card.id);
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
              </>
            ) : (
              <>
                {/* Dynamic card list view */}
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center">
                    <IconButton onClick={handleBackToMain} color="primary">
                      <ArrowBackIcon />
                    </IconButton>

                    <Typography variant="h4" component="h1" sx={{ ml: 2 }}>
                      {dynamicTitle}
                    </Typography>
                  </Box>
                </Grid>

                {dynamicCards?.map((dynamicCard) => (
                  <Grid item xs={12} md={4} lg={4} key={dynamicCard.id}>
                    <BlankCard>
                      <div style={{ position: "relative" }}>
                        <Avatar
                          src={dynamicCard.photo}
                          variant="square"
                          sx={{ height: 200, width: "100%" }}
                        />
                      </div>
                      <CardContent sx={{ p: 3, pt: 2 }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          {dynamicCard.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Essay: {dynamicCard.essay}
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
                              showModal(dynamicCard);
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
                              handleDelete(dynamicCard.id);
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
                      <Typography variant="h6">Add New Dynamic Card</Typography>
                    </CardContent>
                  </BlankCard>
                </Grid>
              </>
            )}
          </Grid>
        </div>
      </DashboardCard>

      {/* Modal for adding/editing cards */}
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

          {viewDynamic !== null && (
            <Form.Item
              label="Essay"
              name="essay"
              rules={[{ required: true, message: "Please enter an essay" }]}
            >
              <Input.TextArea placeholder="Enter essay content" />
            </Form.Item>
          )}

          <Form.Item label="Upload Image" name="image">
            <Upload
              listType="picture"
              fileList={fileList}
              onChange={handleChange}
              showUploadList={{
                showPreviewIcon: true,
                showRemoveIcon: true,
              }}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />} block>
                Upload Image
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              {editCard ? "Save Changes" : "Save"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Activities;
