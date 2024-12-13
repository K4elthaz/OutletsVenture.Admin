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

  // Track selected category (used or preferred)
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

  // Chart color
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  // Fetch feedback data from Firebase and aggregate it
  useEffect(() => {
    const fetchData = () => {
      const feedbackRef = dbRef(db, `feedback`);

      onValue(feedbackRef, (snapshot) => {
        let feedbackData = Object.values(snapshot.val() || {}) || [];

        const amenityCounts: any = {
          used: {},
          preferred: {},
        };

        // Initialize all amenities with zero counts
        const amenities = [
          "atm",
          "bike_station",
          "breastfeeding",
          "fire_extinguisher",
          "parking",
          "pwd_ramp",
          "restroom",
          "seating",
          "smoking",
          "trash",
          "vending",
        ];

        // Normalize and map names for comparison
        const normalizeAmenityName = (name: string): string => {
          const map: Record<string, string> = {
            atm: "atm",
            "bike stations": "bike_station",
            breastfeeding: "breastfeeding",
            "fire extinguisher": "fire_extinguisher",
            "parking facilities": "parking",
            "pwd ramp": "pwd_ramp",
            restrooms: "restroom",
            seating: "seating",
            "smoking area": "smoking",
            trash: "trash",
            vending: "vending",
          };
          return map[name.toLowerCase()] || name.toLowerCase();
        };

        // Initialize counts for all amenities
        amenities.forEach((amenity) => {
          amenityCounts.used[amenity] = 0;
          amenityCounts.preferred[amenity] = 0;
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

        // Loop through all feedback entries
        snapshot.forEach((childSnapshot) => {
          const feedback = childSnapshot.val();

          // Count used amenities
          amenities.forEach((amenity) => {
            if (feedback[`used_${amenity}`]) {
              amenityCounts.used[amenity] += 1;
            }
            if (feedback[`pref_${amenity}`]) {
              amenityCounts.preferred[amenity] += 1;
            }
          });
        });

        // Set the chart data based on aggregated results
        const titles = amenities.map((amenity) =>
          amenity.replace("_", " ").toUpperCase()
        );
        const usedCounts = amenities.map(
          (amenity) => amenityCounts.used[amenity]
        );
        const preferredCounts = amenities.map(
          (amenity) => amenityCounts.preferred[amenity]
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
      show: true,
    },
    grid: {
      borderColor: "rgba(0,0,0,0.1)",
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: true,
        },
      },
    },
    yaxis: {
      title: {
        text: category,
      },
      tickAmount: 4,
    },
    xaxis: {
      categories: chartData.titles,
      title: {
        text: "Amenities",
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
