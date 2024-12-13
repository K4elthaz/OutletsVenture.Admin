"use client";
import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useTheme, Select, MenuItem } from "@mui/material";
import { Stack, Typography, Avatar } from "@mui/material";
import { IconArrowUpLeft } from "@tabler/icons-react";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { db } from "@/utils/firebase";
import { ref as dbRef, onValue } from "firebase/database";
import {
  mallPromenadeMap,
  mallPlazaMap,
  mallParkadeMap,
  mallLoopMap,
  mallFlavorsMap,
  mallAboitizMap,
  mallFood,
  mallService,
  mallShop,
} from "@/utils/References";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const MapInfo = ({
  onChartUpdate,
}: {
  onChartUpdate?: (data: any) => void;
}) => {
  const [allData, setAllData] = useState<
    { storeName: string; clicks: number; searches: number }[]
  >([]);
  const [selectedStore, setSelectedStore] = useState<number>(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [totalSearches, setTotalSearches] = useState(0);
  const [category, setCategory] = useState<string>("Promenade"); // New category state

  const hasUpdatedRef = useRef(false);

  useEffect(() => {
    if (hasUpdatedRef.current) return; // Skip if already updated
    if (allData.length === 0) return;
    if (onChartUpdate) onChartUpdate(allData);
    hasUpdatedRef.current = true; // Mark as updated
  }, [allData, onChartUpdate]);

  // Mapping of categories to their respective references
  const categoryReferences: { [key: string]: string[] } = {
    Promenade: [
      `${mallPromenadeMap}/${mallFood}`,
      `${mallPromenadeMap}/${mallShop}`,
      `${mallPromenadeMap}/${mallService}`,
    ],
    Plaza: [
      `${mallPlazaMap}/${mallFood}`,
      `${mallPlazaMap}/${mallShop}`,
      `${mallPlazaMap}/${mallService}`,
    ],
    Parkade: [
      `${mallParkadeMap}/${mallFood}`,
      `${mallParkadeMap}/${mallShop}`,
      `${mallParkadeMap}/${mallService}`,
    ],
    Loop: [
      `${mallLoopMap}/${mallFood}`,
      `${mallLoopMap}/${mallShop}`,
      `${mallLoopMap}/${mallService}`,
    ],
    Flavors: [`${mallFlavorsMap}/${mallFood}`, `${mallFlavorsMap}/${mallShop}`],
    Aboitiz: [
      `${mallAboitizMap}/${mallFood}`,
      `${mallAboitizMap}/${mallShop}`,
      `${mallAboitizMap}/${mallService}`,
    ],
  };

  // Fetch all store data based on the selected category
  useEffect(() => {
    const references = categoryReferences[category];
    let collectedData: {
      storeName: string;
      clicks: number;
      searches: number;
    }[] = [];
    let totalClicks = 0;
    let totalSearches = 0;

    references.forEach((ref) => {
      const shopMapsRef = dbRef(db, ref);

      onValue(shopMapsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          for (const id in data) {
            if (data.hasOwnProperty(id)) {
              const storeData = data[id];
              collectedData.push({
                storeName: storeData.storeName || "Unnamed Store",
                clicks: storeData.clicks || 0,
                searches: storeData.searches || 0,
              });

              totalClicks += storeData.clicks || 0;
              totalSearches += storeData.searches || 0;
            }
          }
        }
      });
    });

    setAllData(collectedData);
    setSelectedStore(0); // Default to the first store
    setTotalClicks(totalClicks);
    setTotalSearches(totalSearches);
  }, [category]); // Fetch data whenever category changes

  const handleStoreChange = (event: any) => {
    setSelectedStore(event.target.value);
  };

  const handleCategoryChange = (event: any) => {
    setCategory(event.target.value); // Update category state
  };

  // Chart configuration
  const theme = useTheme();
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
    colors: [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      "#F9F9FD",
    ],
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
    <DashboardCard title="Maps Clicks & Searches" style={{ height: "100%" }}>
      <Stack spacing={3} sx={{ height: "100%" }}>
        {/* Dropdown for category selection */}
        <Select
          value={category}
          onChange={handleCategoryChange}
          fullWidth
          displayEmpty
        >
          <MenuItem value="Promenade">Promenade</MenuItem>
          <MenuItem value="Plaza">Plaza</MenuItem>
          <MenuItem value="Parkade">Parkade</MenuItem>
          <MenuItem value="Loop">Loop</MenuItem>
          <MenuItem value="Flavors">Flavors</MenuItem>
          <MenuItem value="Aboitiz">Aboitiz</MenuItem>
        </Select>

        {/* Dropdown for store selection */}
        <Select
          value={selectedStore}
          onChange={handleStoreChange}
          fullWidth
          displayEmpty
        >
          {allData
            ?.filter((data) => data?.storeName !== "Unnamed Store")
            ?.map((store, index) => (
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
          <Avatar
            sx={{ bgcolor: theme.palette.success.light, width: 27, height: 27 }}
          >
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

export default MapInfo;
