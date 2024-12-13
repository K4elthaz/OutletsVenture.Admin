"use client";
import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useTheme, Select, MenuItem } from "@mui/material";
import { Stack, Typography, Avatar, Grid } from "@mui/material";
import { IconArrowUpLeft } from "@tabler/icons-react";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { db } from "@/utils/firebase";
import { ref as dbRef, onValue, DatabaseReference } from "firebase/database";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
type CategoryType = "Shops" | "Dines" | "Services";

// Define the structure for the data that will be retrieved
interface StoreData {
  storeName: string;
  clicks: number;
  searches: number;
}

const ShopInfo = ({
  onChartUpdate,
}: {
  onChartUpdate?: (data: any) => void;
}) => {
  const [category, setCategory] = useState("Shops");
  const [allData, setAllData] = useState<StoreData[]>([]);
  const [selectedStore, setSelectedStore] = useState<number>(0);
  const hasUpdatedRef = useRef(false);

  useEffect(() => {
    if (hasUpdatedRef.current) return; // Skip if already updated
    if (allData.length === 0) return;
    if (onChartUpdate) onChartUpdate(allData);
    hasUpdatedRef.current = true; // Mark as updated
  }, [allData, onChartUpdate]);

  const categories: Record<CategoryType, DatabaseReference> = {
    Shops: dbRef(db, "Shops"),
    Dines: dbRef(db, "Dines"),
    Services: dbRef(db, "Services"),
  };

  // Fetch data based on the selected category (Shops, Dines, Services)
  useEffect(() => {
    const fetchData = () => {
      const categoryRef = categories[category as CategoryType];
      let collectedData: StoreData[] = [];

      onValue(categoryRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          for (const id in data) {
            if (data.hasOwnProperty(id)) {
              collectedData.push({
                storeName: data[id].title || "Unnamed Store",
                clicks: data[id].clicks || 0,
                searches: data[id].searchs || 0,
              });
            }
          }

          setAllData(collectedData);
          setSelectedStore(0); // Default to the first store
        }
      });
    };

    fetchData();
  }, [category]);

  const handleStoreChange = (event: any) => {
    setSelectedStore(event.target.value);
  };

  const handleCategoryChange = (event: any) => {
    setCategory(event.target.value);
  };

  // chart color
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const primarylight = "#ecf2ff";
  const successlight = theme.palette.success.light;

  // chart configuration
  const optionscolumnchart: any = {
    chart: {
      type: "donut",
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: "#adb0bb",
      toolbar: {
        show: false,
      },
      height: 155,
    },
    colors: [primary, primarylight, "#F9F9FD"],
    plotOptions: {
      pie: {
        startAngle: 0,
        endAngle: 360,
        donut: {
          size: "75%",
          background: "transparent",
        },
      },
    },
    tooltip: {
      theme: theme.palette.mode === "dark" ? "dark" : "light",
      fillSeriesColor: false,
    },
    stroke: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    responsive: [
      {
        breakpoint: 991,
        options: {
          chart: {
            width: 120,
          },
        },
      },
    ],
  };

  return (
    <DashboardCard title="Clicks & Searches Overview">
      <Stack spacing={3}>
        {" "}
        {/* Stack for vertical arrangement */}
        {/* Dropdown for category selection */}
        <Select
          value={category}
          onChange={handleCategoryChange}
          fullWidth
          displayEmpty
          label="Select Category"
        >
          <MenuItem value="Shops">Shops</MenuItem>
          <MenuItem value="Dines">Dines</MenuItem>
          <MenuItem value="Services">Services</MenuItem>
        </Select>
        {/* Dropdown for store selection within the chosen category */}
        <Select
          value={selectedStore}
          onChange={handleStoreChange}
          fullWidth
          displayEmpty
        >
          {allData.map((store, index) => (
            <MenuItem key={index} value={index}>
              {store.storeName}
            </MenuItem>
          ))}
        </Select>
        {/* Display clicks and searches for the selected store */}
        <Typography variant="h3" fontWeight="700" mt={3}>
          {allData[selectedStore]?.clicks} Clicks
        </Typography>
        <Stack direction="row" spacing={1} mt={1} alignItems="center">
          <Avatar sx={{ bgcolor: successlight, width: 27, height: 27 }}>
            <IconArrowUpLeft width={20} color="#39B69A" />
          </Avatar>
          <Typography variant="subtitle2" fontWeight="600">
            {(
              (allData[selectedStore]?.searches /
                allData[selectedStore]?.clicks) *
              100
            ).toFixed(2)}
            % of Clicks are from Searches
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            Total searches: {allData[selectedStore]?.searches}
          </Typography>
        </Stack>
        {/* Display the chart at the bottom of the stack */}
        <Chart
          options={optionscolumnchart}
          series={[allData[selectedStore]?.clicks || 0]}
          type="donut"
          height={150}
          width={"100%"}
        />
      </Stack>
    </DashboardCard>
  );
};

export default ShopInfo;
