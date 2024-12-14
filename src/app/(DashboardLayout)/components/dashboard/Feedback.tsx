"use client";
import React, { useEffect, useState, useRef } from "react";
import { Select, MenuItem } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import dynamic from "next/dynamic";
import { db } from "@/utils/firebase";
import { ref as dbRef, onValue } from "firebase/database";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const Feedback = ({
  onChartUpdate,
  getAllDataFromGraph,
}: {
  onChartUpdate?: (data: any) => null;
  getAllDataFromGraph: (data: any) => null;
}) => {
  type ChartData = {
    used: number[];
    preferred: number[];
    titles: string[];
  };

  const [category, setCategory] = useState("Used");
  const [chartData, setChartData] = useState<ChartData>({
    used: [],
    preferred: [],
    titles: [],
  });
  const hasUpdatedRef = useRef(false);

  useEffect(() => {
    if (hasUpdatedRef.current) return; // Skip if already updated
    if (chartData.used.length === 0) return;
    if (getAllDataFromGraph) getAllDataFromGraph(chartData);
  }, [chartData]);

  useEffect(() => {
    if (hasUpdatedRef.current) return; // Skip if already updated
    if (chartData.used.length === 0) return;
    if (onChartUpdate) onChartUpdate(chartData);
    hasUpdatedRef.current = true; // Mark as updated
  }, [chartData, onChartUpdate]);

  const handleCategoryChange = (event: any) => {
    setCategory(event.target.value);
  };

  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  // List of amenities (source of truth)
  const amenitiesList = [
    "ATM",
    "Bike Stations",
    "Breastfeeding",
    "Fire Extinguisher",
    "Parking Facilities",
    "PWD Ramps",
    "Restrooms",
    "Seating Areas",
    "Smoking Area",
    "Trash Bins",
    "Vending Machine",
  ];

  // Normalize amenity names for consistency
  const normalizeAmenityName = (() => {
    const map: Record<string, string> = {};
    amenitiesList.forEach((amenity) => {
      map[amenity.toLowerCase()] = amenity.toLowerCase().replace(/\s+/g, "_");
    });
    return (name: string): string => {
      const normalized = map[name.toLowerCase()];
      if (!normalized) {
        console.warn(`Unrecognized amenity: "${name}"`);
        return name.toLowerCase().replace(/\s+/g, "_"); // Fallback
      }
      return normalized;
    };
  })();

  // Fetch and process data from Firebase
  useEffect(() => {
    const fetchData = () => {
      const feedbackRef = dbRef(db, `feedback`);

      onValue(feedbackRef, (snapshot) => {
        const feedbackData = Object.values(snapshot.val() || {}) || [];
        const amenityCounts: {
          used: Record<string, number>;
          preferred: Record<string, number>;
        } = {
          used: {},
          preferred: {},
        };

        // Initialize counts for all amenities
        amenitiesList.forEach((amenity) => {
          const normalizedAmenity = normalizeAmenityName(amenity);
          amenityCounts.used[normalizedAmenity] = 0;
          amenityCounts.preferred[normalizedAmenity] = 0;
        });

        // Process feedback data
        feedbackData.forEach((entry: any) => {
          if (entry.usedAmenities) {
            entry.usedAmenities.forEach((amenity: string) => {
              const normalizedAmenity = normalizeAmenityName(amenity);
              if (normalizedAmenity in amenityCounts.used) {
                amenityCounts.used[normalizedAmenity]++;
              }
            });
          }
          if (entry.preferences) {
            entry.preferences.forEach((amenity: string) => {
              const normalizedAmenity = normalizeAmenityName(amenity);
              if (normalizedAmenity in amenityCounts.preferred) {
                amenityCounts.preferred[normalizedAmenity]++;
              }
            });
          }
        });

        // Prepare chart data
        const titles = amenitiesList.map((amenity) =>
          normalizeAmenityName(amenity).replace("_", " ").toUpperCase()
        );
        const usedCounts = amenitiesList.map(
          (amenity) => amenityCounts.used[normalizeAmenityName(amenity)]
        );
        const preferredCounts = amenitiesList.map(
          (amenity) => amenityCounts.preferred[normalizeAmenityName(amenity)]
        );

        setChartData({
          used: usedCounts,
          preferred: preferredCounts,
          titles,
        });
      });
    };

    fetchData();
  }, []);

  const optionscolumnchart: any = {
    chart: {
      type: "bar",
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: "#adb0bb",
      toolbar: { show: true },
      height: 370,
    },
    colors: [primary, secondary],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: [6],
        borderRadiusApplication: "end",
      },
    },
    stroke: { show: true, width: 5, colors: ["transparent"] },
    dataLabels: { enabled: false },
    legend: { show: true },
    grid: {
      borderColor: "rgba(0,0,0,0.1)",
      strokeDashArray: 3,
    },
    yaxis: { title: { text: category }, tickAmount: 4 },
    xaxis: { categories: chartData.titles, title: { text: "Amenities" } },
    tooltip: { theme: "dark" },
  };

  const seriescolumnchart: any = [
    {
      name: category,
      data: category === "Used" ? chartData.used : chartData.preferred,
    },
  ];

  return (
    <DashboardCard
      title="Amenities Usage & Preference"
      action={
        <Select
          labelId="category-dd"
          id="category-dd"
          value={category}
          size="small"
          onChange={handleCategoryChange}
        >
          <MenuItem value="Used">Used</MenuItem>
          <MenuItem value="Preferred">Preferred</MenuItem>
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

export default Feedback;
