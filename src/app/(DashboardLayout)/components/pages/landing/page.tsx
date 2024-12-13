"use client";
import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player/lazy";
import { useRouter } from "next/navigation";
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
import { Modal, Upload, Form, message, Button, UploadFile } from "antd";
import {
  HomeOutlined,
  ArrowLeftOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import Link from "next/link";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { ref as dbRef, onValue, set, update, remove } from "firebase/database";
import { db } from "@/utils/firebase";
import { landingPageVideoURL } from "@/utils/References";

const Page = () => {
  const router = useRouter();
  const [videoURL, setVideoURL] = useState<string>("");
  const [isEditingVideo, setIsEditingVideo] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [videoFile, setVideoFile] = useState<UploadFile[]>([]);

  useEffect(() => {
    const fetchVideoURL = async () => {
      try {
        const downloadURL = await getDownloadURL(
          storageRef(getStorage(), landingPageVideoURL)
        );
        setVideoURL(downloadURL);
      } catch (error) {
        console.error("Error fetching video URL:", error);
      }
    };

    fetchVideoURL();
  }, []);

  const handleVideoClick = () => {
    setIsEditingVideo(true);
  };

  const handleVideoSave = async () => {
    setIsLoading(true);
    if (videoFile.length > 0) {
      const file = videoFile[0].originFileObj!;
      const storageReference = storageRef(getStorage(), landingPageVideoURL);

      try {
        const snapshot = await uploadBytes(storageReference, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        await set(dbRef(db, landingPageVideoURL), downloadURL);
        setVideoURL(downloadURL);
      } catch (error) {
        console.error("File upload failed:", error);
        message.error("File upload failed.");
      }
    }
    setIsLoading(false);
    setIsEditingVideo(false);
    setVideoFile([]);
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
    setVideoFile(info.fileList);
  };

  const handleFooterInfoClick = () => {};
  const handleFooterInfoSave = () => {};

  return (
    <PageContainer title="Landing Page" description="This is the Landing Page">
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <MuiLink
          color="inherit"
          href="/components/pages"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <HomeOutlined style={{ marginRight: "0.5rem" }} />
          Landing Page
        </MuiLink>
        <Typography color="text.primary">Landing Page</Typography>
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
                <Link href="/components/pages" passHref>
                  <IconButton aria-label="back">
                    <ArrowLeftOutlined
                      style={{ fontSize: "24px", color: "primary" }}
                    />
                  </IconButton>
                </Link>
                <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
                  Landing Page
                </Typography>
              </Stack>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4} lg={4}>
                  <BlankCard onClick={handleVideoClick}>
                    <Avatar
                      // src={picture.url}
                      variant="square"
                      sx={{ height: 250, width: "100%" }}
                    />
                    <CardContent sx={{ p: 3, pt: 2 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="h6">Video</Typography>
                        <div
                          style={{
                            position: "absolute",
                            bottom: 10,
                            right: 10,
                            display: "flex",
                            gap: "2px",
                          }}
                        ></div>
                      </Stack>
                    </CardContent>
                  </BlankCard>
                </Grid>

                <Grid item xs={12} md={4} lg={4}>
                  <BlankCard
                    onClick={() => {
                      router.push("landing/carousel1");
                    }}
                  >
                    <Avatar
                      // src={picture.url}
                      variant="square"
                      sx={{ height: 250, width: "100%" }}
                    />
                    <CardContent sx={{ p: 3, pt: 2 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="h6">Carousel 1</Typography>
                        <div
                          style={{
                            position: "absolute",
                            bottom: 10,
                            right: 10,
                            display: "flex",
                            gap: "2px",
                          }}
                        ></div>
                      </Stack>
                    </CardContent>
                  </BlankCard>
                </Grid>

                <Grid item xs={12} md={4} lg={4}>
                  <BlankCard
                    onClick={() => {
                      router.push("landing/carousel2");
                    }}
                  >
                    <Avatar
                      // src={picture.url}
                      variant="square"
                      sx={{ height: 250, width: "100%" }}
                    />
                    <CardContent sx={{ p: 3, pt: 2 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="h6">Carousel 2</Typography>
                        <div
                          style={{
                            position: "absolute",
                            bottom: 10,
                            right: 10,
                            display: "flex",
                            gap: "2px",
                          }}
                        ></div>
                      </Stack>
                    </CardContent>
                  </BlankCard>
                </Grid>

                {/* <Grid item xs={12} md={4} lg={4}>
                  <BlankCard
                    onClick={() => {
                      router.push("landing/gallery");
                    }}
                  >
                    <Avatar
                      // src={picture.url}
                      variant="square"
                      sx={{ height: 250, width: "100%" }}
                    />
                    <CardContent sx={{ p: 3, pt: 2 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="h6">Gallery</Typography>
                        <div
                          style={{
                            position: "absolute",
                            bottom: 10,
                            right: 10,
                            display: "flex",
                            gap: "2px",
                          }}
                        ></div>
                      </Stack>
                    </CardContent>
                  </BlankCard>
                </Grid> */}

                <Grid item xs={12} md={4} lg={4}>
                  <BlankCard
                    onClick={() => {
                      router.push("landing/slideshow");
                    }}
                  >
                    <Avatar
                      // src={picture.url}
                      variant="square"
                      sx={{ height: 250, width: "100%" }}
                    />
                    <CardContent sx={{ p: 3, pt: 2 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="h6">Slide Show</Typography>
                        <div
                          style={{
                            position: "absolute",
                            bottom: 10,
                            right: 10,
                            display: "flex",
                            gap: "2px",
                          }}
                        ></div>
                      </Stack>
                    </CardContent>
                  </BlankCard>
                </Grid>

                {/* <Grid item xs={12} md={4} lg={4}>
                  <BlankCard onClick={handleFooterInfoClick}>
                    <Avatar
                      // src={picture.url}
                      variant="square"
                      sx={{ height: 250, width: "100%" }}
                    />
                    <CardContent sx={{ p: 3, pt: 2 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="h6">Footer</Typography>
                        <div
                          style={{
                            position: "absolute",
                            bottom: 10,
                            right: 10,
                            display: "flex",
                            gap: "2px",
                          }}
                        ></div>
                      </Stack>
                    </CardContent>
                  </BlankCard>
                </Grid> */}
              </Grid>
            </div>
          }
        </div>
      </DashboardCard>

      <Modal
        title="Video"
        visible={isEditingVideo}
        centered
        width={600}
        bodyStyle={{ padding: "24px" }}
        onCancel={() => setIsEditingVideo(false)}
        footer={null}
      >
        <Form
          name="video"
          initialValues={{ videoURL }}
          onFinish={handleVideoSave}
          onFinishFailed={() => message.error("Failed to save video")}
        >
          {videoURL && (
            // <video
            //   width="100%"
            //   height="300"
            //   controls
            //   style={{ marginBottom: "24px" }}
            // >
            //   <source src={videoURL} type="video/mp4" />
            //   Your browser does not support the video tag.
            // </video>
            <ReactPlayer
              url={videoURL}
              width="100%"
              height="300"
              controls
              style={{ marginBottom: "24px" }}
            />
          )}

          <Form.Item label="Upload Image" name="image">
            <Upload
              listType="picture"
              fileList={videoFile}
              onChange={handleFileUpload}
              showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
              accept="video/mp4"
            >
              <Button icon={<UploadOutlined />} block>
                Upload Video
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              style={{ float: "right" }}
            >
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Page;
