'use client';
import { useState, useEffect } from 'react';
import { Typography, Grid, CardContent, Avatar, useTheme } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import Link from "next/link";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { uniqueId } from "lodash";
import { Spin, Space } from 'antd';

const promosAndEventsCards = [
  {
    id: uniqueId(),
    title: "GREAT DEALS & GREAT FINDS",
    photo: 'https://japanshopping.org/files/shopping_article_contents/-_2022-08-04-092504.jpg',
    href: "/content/promos-and-events/great-deals" 
  },
  {
    id: uniqueId(),
    title: "UPCOMING EVENTS",
    photo: 'https://static.vecteezy.com/system/resources/thumbnails/030/761/336/small_2x/elegant-evening-a-candlelit-dining-affair-with-wine-glasses-and-tableware-for-an-evening-dinner-party-generative-ai-photo.jpg',
    href: "/content/promos-and-events/upcoming-events"
  }
];

const PromosAndEventsPage = () => {
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Simulate a 2-second loading delay
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <PageContainer style={{ height: '100vh' }}>
      <DashboardCard style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div>
          <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: 'start' }}>
            Promos and Events
          </Typography>
          {loading ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <Space direction="vertical" size="large">
                <Spin size="large" />
              </Space>
            </div>
          ) : (
            <Grid container spacing={3}>
              {promosAndEventsCards.map((product, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <BlankCard>
                    <Link href={product.href}>
                      <div style={{ position: 'relative', width: '100%', height: '350px', overflow: 'hidden' }}>
                        <Avatar
                          src={product.photo}
                          variant="square"
                          sx={{
                            height: '100%',
                            width: '100%',
                            objectFit: 'cover',
                            transition: 'filter 0.3s ease', // Smooth transition for brightness change
                          }}
                        />
                        <CardContent
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            color: 'white',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)' // Optional: Adds a semi-transparent background to make text more readable
                          }}
                        >
                          <Typography variant="h3" className="font-bold" component="div">
                            {product.title}
                          </Typography>
                        </CardContent>
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            transition: 'filter 0.3s ease',
                            filter: 'brightness(100%)', // Default brightness
                          }}
                        />
                      </div>
                    </Link>
                  </BlankCard>
                </Grid>
              ))}
            </Grid>
          )}
        </div>
      </DashboardCard>
    </PageContainer>
  );
};

export default PromosAndEventsPage;
