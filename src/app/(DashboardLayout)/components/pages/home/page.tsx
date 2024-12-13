"use client";
import React from "react";
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
import { HomeOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import Link from "next/link";

const Page = () => {
  const router = useRouter();
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
          Home
        </MuiLink>
        <Typography color="text.primary">Home</Typography>
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
                  Home Page
                </Typography>
              </Stack>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4} lg={4}>
                  <BlankCard
                    onClick={() => {
                      router.push("home/carousel1");
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

                {/* <Grid item xs={12} md={4} lg={4}>
                  <BlankCard
                    onClick={() => {
                      router.push("home/gallery");
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
                        <Typography variant="h6">Photo Gallery</Typography>
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
                      router.push("home/slideshow");
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
              </Grid>
            </div>
          }
        </div>
      </DashboardCard>
    </PageContainer>
  );
};

export default Page;
