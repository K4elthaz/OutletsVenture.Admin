"use client";
import React, { useEffect, useState, useRef } from "react";
import { Select, MenuItem } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import dynamic from "next/dynamic";
import { db } from "@/utils/firebase"; // Adjust the path as per your project structure
import { ref as dbRef, onValue } from "firebase/database";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const SalesOverview = ({
  onChartUpdate,
  getAllDataFromGraph,
}: {
  onChartUpdate?: (data: any) => void;
  getAllDataFromGraph: (data: any) => void;
}) => {
  // Define the chart data structure
  type ChartData = {
    clicks: number[];
    searchs: number[];
    titles: string[]; // To store shop/dine/service titles
  };

  // Filter for Shop, Dine, and Service
  const [type, setType] = useState("Shop");
  const [chartData, setChartData] = useState<ChartData>({
    clicks: [],
    searchs: [],
    titles: [], // Initialize empty array for titles
  });

  const hasUpdatedRef = useRef(false);

  useEffect(() => {
    if (hasUpdatedRef.current) return; // Skip if already updated
    if (chartData.clicks.length === 0) return;
    if (getAllDataFromGraph) getAllDataFromGraph(chartData);
  }, [chartData]);

  useEffect(() => {
    if (hasUpdatedRef.current) return; // Skip if already updated
    if (chartData.clicks.length === 0) return;
    if (onChartUpdate) onChartUpdate(chartData);
    hasUpdatedRef.current = true; // Mark as updated
  }, [chartData, onChartUpdate]);

  const handleChange = (event: any) => {
    setType(event.target.value);
  };

  // chart color
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  // Fetch data from Firebase whenever the type changes
  useEffect(() => {
    const fetchData = () => {
      let dataRef;
      if (type === "Shop") {
        dataRef = dbRef(db, `Shops`);
      } else if (type === "Dine") {
        dataRef = dbRef(db, `Dines`);
      } else {
        dataRef = dbRef(db, `Services`);
      }

      onValue(dataRef, (snapshot) => {
        const data = snapshot.val();
        const dataArray = [];

        // Structure each shop, dine, or service data with their title, clicks, and searches
        for (const id in data) {
          if (data.hasOwnProperty(id)) {
            dataArray.push({
              title: data[id].title || `Unnamed ${type}`, // Get the title
              clicks: data[id].clicks || 0, // Get clicks, default to 0 if unavailable
              searchs: data[id].searchs || 0, // Get searches, default to 0 if unavailable
            });
          }
        }

        // Sort data by searches in descending order and slice to get top 5
        const top5Data = dataArray
          .sort((a, b) => b.searchs - a.searchs)
          .slice(0, 5);

        // Separate titles, clicks, and searches for chart data
        const titles = top5Data.map((item) => item.title);
        const clicks = top5Data.map((item) => item.clicks);
        const searchs = top5Data.map((item) => item.searchs);

        setChartData({ clicks, searchs, titles });
      });
    };

    fetchData();
  }, [type]); // Re-fetch data when the type changes

  // Chart configuration
  const optionscolumnchart: any = {
    chart: {
      type: "bar",
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: "#adb0bb",
      toolbar: {
        show: true,
      },
      height: 370,
    },
    colors: [primary, secondary],
    plotOptions: {
      bar: {
        horizontal: false,
        barHeight: "60%",
        columnWidth: "42%",
        borderRadius: [6],
        borderRadiusApplication: "end",
        borderRadiusWhenStacked: "all",
      },
    },
    stroke: {
      show: true,
      width: 5,
      lineCap: "butt",
      colors: ["transparent"],
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    grid: {
      borderColor: "rgba(0,0,0,0.1)",
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    yaxis: {
      tickAmount: 4,
    },
    xaxis: {
      categories: chartData.titles, // Use dynamic categories from Firebase titles
      axisBorder: {
        show: false,
      },
    },
    tooltip: {
      theme: "dark",
      fillSeriesColor: false,
    },
  };

  // Chart data based on Firebase fetch
  const seriescolumnchart: any = [
    {
      name: "Clicks",
      data: chartData.clicks,
    },
    {
      name: "Searches",
      data: chartData.searchs,
    },
  ];

  return (
    <DashboardCard
      title="Clicks & Searches Top 5"
      action={
        <Select
          labelId="type-dd"
          id="type-dd"
          value={type}
          size="small"
          onChange={handleChange}
        >
          <MenuItem value="Shop">Shop</MenuItem>
          <MenuItem value="Dine">Dine</MenuItem>
          <MenuItem value="Service">Service</MenuItem>
        </Select>
      }
    >
      <Chart
        options={optionscolumnchart}
        series={seriescolumnchart}
        type="bar"
        height={370}
        width={"100%"}
      />
    </DashboardCard>
  );
};

export default SalesOverview;
