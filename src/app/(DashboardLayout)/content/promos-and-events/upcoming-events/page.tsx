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
  Tabs,
  List,
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import moment from "moment";
import { DiscountOutlined } from "@mui/icons-material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { UploadFile } from "antd/es/upload/interface";
import { ref as dbRef, onValue, set, update } from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db } from "@/utils/firebase";
import { EventData, GuestData } from "@/utils/Types";

const Events = () => {
  const [eventsPageCards, setEventsPageCards] = useState<EventData[]>([]);
  const [guests, setGuests] = useState<GuestData[]>([]);
  const [eventFileList, setEventFileList] = useState<UploadFile[]>([]);
  const [guestFileList, setGuestFileList] = useState<UploadFile[]>([]);
  const [editingGuest, setEditingGuest] = useState<GuestData | null>(null);

  useEffect(() => {
    const starCountRef = dbRef(db, "Events/");
    const unsubscribe = onValue(starCountRef, (snapshot) => {
      if (snapshot.exists()) {
        const pages: EventData[] = [];
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
            contactInformation: data.contactInformation || "",
            featured: data.featured,
            email: data.email,
            guests: data.guests || [],
          });
        });
        setEventsPageCards(pages);
      }
    });

    return () => unsubscribe();
  }, []);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editCard, setEditCard] = useState<EventData | null>(null);
  const [form] = Form.useForm();
  const [guestForm] = Form.useForm();
  const [isUploading, setIsUploading] = useState(false);

  const showModal = (card?: any) => {
    if (card) {
      setEditCard(card);
      form.setFieldsValue({
        title: card.title,
        description: card.description,
        email: card.email,
        location: card.location,
        startDate: dayjs(card.startDate),
        endDate: dayjs(card.endDate),
        contactInformation: card.contactInformation,
        featured: card.featured,
      });
      setGuests(card.guests || []);
      setEventFileList([]);
      setGuestFileList([]);
    } else {
      setEditCard(null);
      form.resetFields();
      guestForm.resetFields();
      setGuests([]);
      setEventFileList([]);
      setGuestFileList([]);
    }
    setIsModalVisible(true);
  };

  const handleEventPhotoChange = (info: {
    file: UploadFile;
    fileList: UploadFile[];
  }) => {
    setEventFileList(info.fileList);
  };

  const handleGuestPhotoChange = (info: {
    file: UploadFile;
    fileList: UploadFile[];
  }) => {
    setGuestFileList(info.fileList);
  };

  const handleSave = async (values: any) => {
    
    setIsUploading(true);
    const eventID = editCard
      ? editCard.id
      : eventsPageCards.length == 0
      ? 1
      : eventsPageCards[eventsPageCards.length - 1].id + 1;

    let event: any = {
      id: eventID,
      title: values.title,
      startDate: values.startDate.valueOf(),
      endDate: values.endDate.valueOf(),
      description: values.description,
      email: values.email,
      location: values.location,
      contactInformation: values.contactInformation,
      featured: values.featured,
      guests: guests,
    };

    if (eventFileList.length > 0) {
      const file = eventFileList[0].originFileObj!;
      const storageReference = storageRef(
        getStorage(),
        `Events/${eventID}/${file.name}`
      );

      try {
        const snapshot = await uploadBytes(storageReference, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        event.photo = downloadURL;
      } catch (error) {
        console.error("File upload failed:", error);
        message.error("File upload failed.");
      }
    }

    if (editCard) {
      await update(dbRef(db, "Events/" + event.id), event);
    } else {
      await set(dbRef(db, "Events/" + event.id), event);
    }

    setIsUploading(false);
    setIsModalVisible(false);

  };

  const handleAddGuest = async (values: any) => {
    let guestPhotoUrl = "";

    if (guestFileList.length > 0) {
      const file = guestFileList[0].originFileObj!;
      const guestID = editingGuest ? editingGuest.id : guests.length + 1;
      if (file !== undefined) {
        const storageReference = storageRef(
          getStorage(),
          `Events/Guests/${guestID}/${file.name}`
        );

        try {
          const snapshot = await uploadBytes(storageReference, file);
          guestPhotoUrl = await getDownloadURL(snapshot.ref);
        } catch (error) {
          console.error("Failed to upload guest photo:", error);
          message.error("Guest photo upload failed.");
          return;
        }
      }
    }

    if (editingGuest) {
      const updatedGuests = guests.map((guest) =>
        guest.id === editingGuest.id
          ? {
              ...guest,
              name: values.name,
              photo: guestPhotoUrl == "" ? guest.photo : guestPhotoUrl,
            }
          : guest
      );
      setGuests(updatedGuests);
      setEditingGuest(null);
    } else {
      const guestID = guests.length + 1;
      const newGuest: GuestData = {
        id: guestID,
        name: values.name,
        photo: guestPhotoUrl || "placeholder.png",
      };
      setGuests([...guests, newGuest]);
    }

    guestForm.resetFields();
    setGuestFileList([]);
  };

  const handleEditGuest = (guest: GuestData) => {
    setEditingGuest(guest);
    guestForm.setFieldsValue({
      name: guest.name,
    });

    setGuestFileList([
      {
        uid: guest.id.toString(),
        name: guest.photo,
        status: "done",
        url: guest.photo,
      } as UploadFile,
    ]);
  };

  // Handle removing a guest
  const handleRemoveGuest = async (guestID: number) => {
    const guestToRemove = guests.find((guest) => guest.id === guestID);

    if (guestToRemove && guestToRemove.photo !== "placeholder.png") {
      const storageReference = storageRef(
        getStorage(),
        `Events/Guests/${guestID}/${guestToRemove.photo}`
      );

      try {
        await deleteObject(storageReference);
      } catch (error) {
        console.error(
          "Failed to delete guest photo from Firebase Storage:",
          error
        );
        message.error("Failed to delete guest photo.");
      }
    }

    setGuests(guests.filter((guest) => guest.id !== guestID));
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditCard(null);
    setEditingGuest(null); // Reset editing state on modal close
  };

  const handleDelete = async (eventId: number) => {
    try {
      await set(dbRef(db, "Events/" + eventId), null);

      const storageReference = storageRef(getStorage(), `Events/${eventId}/`);
      try {
        await deleteObject(storageReference);
      } catch (error) {
        console.error("Failed to delete event photo:", error);
      }

      setEventsPageCards((prevEvents) =>
        prevEvents.filter((event) => event.id !== eventId)
      );

      message.success("Event deleted successfully!");
    } catch (error) {
      console.error("Failed to delete event:", error);
      message.error("Failed to delete event.");
    }
  };

  return (
    <PageContainer title="Events">
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
          Upcoming Events
        </MuiLink>
      </Breadcrumbs>

      <DashboardCard
        style={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <Link href="/components/promos-and-events" passHref>
            <IconButton aria-label="back">
              <ArrowLeftOutlined
                style={{ fontSize: "24px", color: "primary" }}
              />
            </IconButton>
          </Link>
          <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
            Events
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {eventsPageCards.map((card) => (
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
                      gap: "4px",
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
                        fontSize: "10px",
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
      </DashboardCard>

      <Modal
        title={editCard ? "Edit Card" : "Add New Card"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
        width={600}
        bodyStyle={{ padding: "24px" }}
      >
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Details" key="1">
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
                rules={[
                  { required: true, message: "Please enter a description" },
                ]}
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
                  { required: true, message: "Please enter the email address" },
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
                      {
                        required: true,
                        message: "Please enter the start date",
                      },
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

              <Form.Item
                label="Featured"
                name="featured"
                valuePropName="checked"
              >
                <Checkbox>Featured</Checkbox>
              </Form.Item>

              <Form.Item label="Photo">
                <Upload
                  listType="picture"
                  fileList={eventFileList}
                  onChange={handleEventPhotoChange}
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
          </Tabs.TabPane>

          <Tabs.TabPane tab="Guests" key="2">
            <Form form={guestForm} layout="vertical" onFinish={handleAddGuest}>
              <Form.Item
                label="Guest Name"
                name="name"
                rules={[{ required: true, message: "Please enter guest name" }]}
              >
                <Input placeholder="Enter Guest Name" />
              </Form.Item>

              <Form.Item label="Photo">
                <Upload
                  listType="picture"
                  fileList={guestFileList}
                  onChange={handleGuestPhotoChange}
                  beforeUpload={() => false}
                  maxCount={1}
                >
                  <Button icon={<UploadOutlined />}>Upload Photo</Button>
                </Upload>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  {editingGuest ? "Update Guest" : "Add Guest"}
                </Button>
              </Form.Item>
            </Form>

            <Typography variant="h6" style={{ marginTop: "20px" }}>
              Guests List
            </Typography>
            <List
              dataSource={guests}
              renderItem={(guest) => (
                <List.Item
                  actions={[
                    <Button
                      key={`edit-${guest.id}`}
                      onClick={() => handleEditGuest(guest)}
                    >
                      Edit
                    </Button>,
                    <Button
                      key={`remove-${guest.id}`}
                      danger
                      onClick={() => handleRemoveGuest(guest.id)}
                    >
                      Remove
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={guest.photo} />}
                    title={guest.name}
                  />
                </List.Item>
              )}
            />
          </Tabs.TabPane>
        </Tabs>
      </Modal>
    </PageContainer>
  );
};

export default Events;
