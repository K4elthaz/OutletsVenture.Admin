import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { get, ref as dbRef } from "firebase/database";
import { db } from "@/utils/firebase";
import { ApexOptions } from "apexcharts";
import { Box, Button, IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Papa from "papaparse";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export const fetchAllVisitsData = async () => {
  const visitsRef = dbRef(db, "Visits");
  const snapshot = await get(visitsRef);
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return {};
};

const getLast4DaysVisits = () => {
  const visitsRef = dbRef(db, "Visits");
  return get(visitsRef).then((snapshot) => {
    if (snapshot.exists()) {
      const visitData = snapshot.val();
      const today = new Date();
      const dailyVisits = new Array(4).fill(0);

      for (let i = 0; i < 4; i++) {
        const startOfDay = new Date(today);
        startOfDay.setDate(today.getDate() - (i + 1)); // Start of each day
        const endOfDay = new Date(today);
        endOfDay.setDate(today.getDate() - i); // End of each day

        for (const dateKey in visitData) {
          const visitDate = new Date(dateKey);
          if (visitDate >= startOfDay && visitDate < endOfDay) {
            dailyVisits[i] += visitData[dateKey].count;
          }
        }
      }

      return dailyVisits.reverse(); // Return data in chronological order
    }

    return [0, 0, 0, 0]; // Default if no data
  });
};

// Function to calculate visits for the last 4 weeks
const getLast4WeeksVisits = () => {
  const visitsRef = dbRef(db, "Visits");
  return get(visitsRef).then((snapshot) => {
    if (snapshot.exists()) {
      const visitData = snapshot.val();
      const today = new Date();
      const weeklyVisits = new Array(4).fill(0);

      for (let i = 0; i < 4; i++) {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - (i * 7 + 7)); // Start of each week
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() - i * 7); // End of each week

        for (const dateKey in visitData) {
          const visitDate = new Date(dateKey);
          if (visitDate >= startOfWeek && visitDate < endOfWeek) {
            weeklyVisits[i] += visitData[dateKey].count;
          }
        }
      }

      return weeklyVisits.reverse(); // Return data in chronological order
    }

    return [0, 0, 0, 0];
  });
};

// Function to calculate visits for the last 4 months
const getLast4MonthsVisits = () => {
  const visitsRef = dbRef(db, "Visits");
  return get(visitsRef).then((snapshot) => {
    if (snapshot.exists()) {
      const visitData = snapshot.val();
      const today = new Date();
      const monthlyVisits = new Array(4).fill(0);

      for (let i = 0; i < 4; i++) {
        const startOfMonth = new Date(
          today.getFullYear(),
          today.getMonth() - i,
          1
        );
        const endOfMonth = new Date(
          today.getFullYear(),
          today.getMonth() - i + 1,
          0
        );

        for (const dateKey in visitData) {
          const visitDate = new Date(dateKey);
          if (visitDate >= startOfMonth && visitDate <= endOfMonth) {
            monthlyVisits[i] += visitData[dateKey].count;
          }
        }
      }

      return monthlyVisits.reverse(); // Return data in chronological order
    }

    return [0, 0, 0, 0];
  });
};

const exportToCSV = async () => {
  const data = await fetchAllVisitsData();

  if (Object.keys(data).length === 0) {
    alert("No data available for download.");
    return;
  }

  const csvData = Object.entries(data).map(([date, details]) => ({
    Date: date,
    Count: (details as { count: number; additionalInfo?: string }).count,
    AdditionalInfo:
      (details as { count: number; additionalInfo?: string }).additionalInfo ||
      "", // Example if you have extra fields
  }));

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "visits_data.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const VisitsChart = ({
  onChartUpdate,
  getAllDataFromGraph,
}: {
  onChartUpdate?: (data: any) => void;
  getAllDataFromGraph: (data: any) => void;
}) => {
  const [chartOptions, setChartOptions] = useState<ApexOptions>();
  const [chartSeries, setChartSeries] = useState<
    { name: string; data: number[] }[]
  >([]);
  const [timePeriod, setTimePeriod] = useState<"daily" | "weekly" | "monthly">(
    "weekly"
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const hasUpdatedRef = useRef(false);

  useEffect(() => {
    if (hasUpdatedRef.current) return; // Skip if already updated
    if (chartSeries.length === 0) return;
    if (getAllDataFromGraph) getAllDataFromGraph(chartSeries);
  }, [chartSeries]);

  useEffect(() => {
    if (hasUpdatedRef.current) return; // Skip if already updated
    if (chartSeries.length === 0) return;
    if (onChartUpdate) onChartUpdate(chartSeries);
    hasUpdatedRef.current = true; // Mark as updated
  }, [chartSeries, onChartUpdate]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    // Existing fetch visits logic
    const fetchVisitsData = () => {
      let visits;
      let categories;

      if (timePeriod === "daily") {
        getLast4DaysVisits().then((visitsData) => {
          visits = visitsData;
          categories = ["Day 1", "Day 2", "Day 3", "Day 4"];
          processVisits(visits, categories);
        });
      } else if (timePeriod === "weekly") {
        getLast4WeeksVisits().then((visitsData) => {
          visits = visitsData;
          categories = ["Week 1", "Week 2", "Week 3", "Week 4"];
          processVisits(visits, categories);
        });
      } else {
        getLast4MonthsVisits().then((visitsData) => {
          visits = visitsData;
          categories = ["Month 1", "Month 2", "Month 3", "Month 4"];
          processVisits(visits, categories);
        });
      }
    };

    const processVisits = (visits: number[], categories: string[]) => {
      const options: ApexOptions = {
        chart: {
          type: "line",
          zoom: { enabled: false },
        },
        xaxis: {
          categories: categories,
        },
        yaxis: {
          title: { text: "Number of Visits" },
        },
        title: {
          text: `Visits Overview (${timePeriod})`,
          align: "left",
        },
        colors: ["#8B0000"], // Dark red color for the line
      };
      setChartOptions(options);
      setChartSeries([
        {
          name: "Visits",
          data: visits,
        },
      ]);
    };

    fetchVisitsData();
  }, [timePeriod]);

  if (chartOptions === undefined || chartSeries === undefined) return null;

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: 3,
        padding: 3,
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setTimePeriod("daily")}
            sx={{ marginRight: 1 }}
          >
            Last 4 Days
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setTimePeriod("weekly")}
            sx={{ marginRight: 1 }}
          >
            Last 4 Weeks
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setTimePeriod("monthly")}
          >
            Last 4 Months
          </Button>
        </Box>
        <IconButton onClick={handleMenuOpen}>
          <MoreVertIcon />
        </IconButton>
        <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose}>
          <MenuItem onClick={exportToCSV}>Download CSV</MenuItem>
        </Menu>
      </Box>
      <Chart
        options={chartOptions}
        series={chartSeries}
        type="line"
        height={350}
        width={"100%"}
      />
    </Box>
  );
};

export default VisitsChart;
