"use client";
import React, { useEffect, useState } from "react";
import {
  Typography,
  Grid,
  CardContent,
  Avatar,
  Stack,
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
import { AboitizPitchData, AboitizPitchSubData } from "@/utils/Types";
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
import { AboitizPitchRef } from "@/utils/References";

const AboitizPitch = () => {
  const [aboitizPitchPageCards, setAboitizPitchPageCards] = useState<
    AboitizPitchData[]
  >([
    // {
    //   id: 1,
    //   title: "Aboitiz Pitch Card 1",
    //   description: "This is the main card description",
    //   photo: "/images/products/s8.jpg",
    //   dynamicCards: [],
    // },
  ]);

  const [dynamicCards, setDynamicCards] = useState<AboitizPitchSubData[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editCard, setEditCard] = useState<any>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [viewDynamic, setViewDynamic] = useState<number | null>(null);
  const [isSavedInDatabase, setIsSavedInDatabase] = useState(false);
  const [featuredCard, setFeaturedCard] = useState<AboitizPitchData>();

  useEffect(() => {
    const aboitizPitchRef = dbRef(db, AboitizPitchRef);
    onValue(aboitizPitchRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAboitizPitchPageCards([data[1]]);
        if (data[1] !== undefined) setDynamicCards(data[1].subData);
        setIsSavedInDatabase(true);
      } else {
        setAboitizPitchPageCards([
          {
            id: 1,
            title: "Aboitiz Pitch Card 1",
            description: "This is the main card description",
            photo: "/images/products/s8.jpg",
            subData: [],
          },
        ]);
      }
    });

    const aboitizPitchFeaturedRef = dbRef(db, `${AboitizPitchRef}/2`);
    onValue(aboitizPitchFeaturedRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setFeaturedCard(data);
      } else {
        setFeaturedCard({
          id: 2,
          title: "Featured Aboitiz Pitch",
          description: "This is the featured card description",
          photo: "/images/products/s8.jpg",
          subData: [],
        });
      }
    });
  }, []);

  const showModal = (card?: any) => {
    if (card) {
      setEditCard(card);
      form.setFieldsValue({
        title: card.title,
        description: card.description,
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
    const id = editCard
      ? editCard.id
      : dynamicCards
      ? dynamicCards.length > 1
        ? dynamicCards[dynamicCards.length - 1].id + 1
        : 1
      : 1;

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
            path = `${AboitizPitchRef}/1/subData/${id}/${file.name}`;
          else path = `${AboitizPitchRef}/${id}/${file.name}`;
          const storageReference = storageRef(
            getStorage(),
            `${AboitizPitchRef}/${id}/${file.name}`
          );

          console.log("Uploading file:", file);
          try {
            const snapshot = await uploadBytes(storageReference, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            newCard.photo = downloadURL;
          } catch (error) {
            console.error("File upload failed:", error);
            message.error("File upload failed.");
          }
        }
      }

      if (editCard) {
        if (viewDynamic !== null) {
          newCard.essay = values.essay;
          update(
            dbRef(db, `${AboitizPitchRef}/1/subData/${newCard.id}`),
            newCard
          );
        } else {
          newCard.description = values.description;
          newCard.subData = [];
          if (!isSavedInDatabase) {
            set(dbRef(db, `${AboitizPitchRef}/${newCard.id}`), newCard);
          } else {
            update(dbRef(db, `${AboitizPitchRef}/${newCard.id}`), newCard);
          }
        }
      } else {
        newCard.essay = values.essay;
        set(dbRef(db, `${AboitizPitchRef}/1/subData/${newCard.id}`), newCard);
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
      `${AboitizPitchRef}/1/subData/${id}`
    );

    deleteObject(storageReference)
      .then(() => {
        return remove(dbRef(db, `${AboitizPitchRef}/1/subData/${id}`));
      })
      .catch((error) => {
        if (error.code === "storage/object-not-found") {
          return remove(dbRef(db, `${AboitizPitchRef}/1/subData/${id}`));
        } else {
          throw error;
        }
      })
      .then(() => {
        message.success("Card deleted successfully.");
      })
      .catch(() => {});
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditCard(null);
  };

  const handleViewDynamic = (id: number) => {
    setViewDynamic(id);
  };

  const handleBackToMain = () => {
    setViewDynamic(null);
  };

  if (featuredCard === undefined || aboitizPitchPageCards[0] === undefined)
    return null;

  return (
    <PageContainer title="Aboitiz Pitch">
      <DashboardCard
        style={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <div>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
              Aboitiz Pitch
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
                  <Grid item xs={12} md={4} lg={4} key={1}>
                    <BlankCard onClick={() => handleViewDynamic(1)}>
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
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          Description: {card.description}
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
                        </div>
                      </CardContent>
                    </BlankCard>
                  </Grid>
                ))}
                <Grid item xs={12} md={4} lg={4} key={1}>
                  <BlankCard onClick={() => showModal(featuredCard)}>
                    <div style={{ position: "relative" }}>
                      <Avatar
                        src={featuredCard.photo}
                        variant="square"
                        sx={{ height: 250, width: "100%" }}
                      />
                    </div>
                    <CardContent sx={{ p: 3, pt: 2 }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        Featured Aboitiz Pitch
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
                            showModal(featuredCard);
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
                      </div>
                    </CardContent>
                  </BlankCard>
                </Grid>
              </>
            ) : (
              <>
                {/* Dynamic card list view */}
                <Grid item xs={12}>
                  <Button onClick={handleBackToMain}>Back</Button>
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

          {viewDynamic === null && (
            <Form.Item
              label="Description"
              name="description"
              rules={[
                { required: true, message: "Please enter a description" },
              ]}
            >
              <Input placeholder="Enter description" />
            </Form.Item>
          )}

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

export default AboitizPitch;
