"use client";
import { Grid, Box, Button } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import ShopClicks from "@/app/(DashboardLayout)/components/dashboard/ShopClicks";
import ShopInfo from "@/app/(DashboardLayout)/components/dashboard/ShopInfo";
import VisitsChart, {
  fetchAllVisitsData,
} from "./components/dashboard/VisitsChart";
import MapsCharts from "./components/dashboard/MapsCharts";
import MapInfo from "./components/dashboard/MapInfo";
import Feedback from "./components/dashboard/Feedback";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx"; // Import SheetJS
import withDelay from "./components/dashboard/withDelay";

const DelayedFeedback = withDelay(Feedback);
const DelayedVisitsChart = withDelay(VisitsChart, 500);
const DelayedMapsCharts = withDelay(MapsCharts, 1000);
const DelayedShopClicks = withDelay(ShopClicks, 1500);

const Dashboard = () => {
  const [dataSet, setDataSet] = useState<any[]>([]);
  const [dataFromGraph, setDataFromGraph] = useState<any>([]);

  const getAllDataFromGraph = (data: any) => {
    if (!data || data.length === 0) return null;
    setDataFromGraph((prevDataSet: any) => {
      const newData = [...prevDataSet, data];
      return newData;
    });
    return null;
  };

  function removeDuplicateArrays(arrays: any[]) {
    const seen = new Set();

    return arrays.filter((arr: any[]) => {
      if (arr.find((item: any) => item?.Date)) {
        return [...arr].reverse();
      }

      // Sort and stringify the array for consistent comparison
      const key = JSON.stringify(arr, (k, v) =>
        Array.isArray(v)
          ? v.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
          : v
      );

      if (!seen.has(key)) {
        seen.add(key);
        return true;
      }

      return false;
    });
  }

  const onChartUpdate = (data: any) => {
    if (!data || data.length === 0) return null;
    setDataSet((prevDataSet) => {
      const newData = [...prevDataSet, data];
      return newData;
    });
    return null;
  };

  const exportToExcel = async () => {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Modify the visits overview
    dataFromGraph[1] = await fetchAllVisitsData();
    // Format the data for export
    const newDataSet = dataFromGraph.map((data: any, index: number) => {
      if (Array.isArray(data)) {
        data = data?.filter((item: any) => item?.storeName !== "Unnamed Store");

        const formattedData = data?.map((shop: any) => {
          if (shop?.storeName) {
            return {
              title: shop.storeName,
              clicks: shop.clicks,
              searchs: shop.searches,
            };
          } else {
            return shop;
          }
        });

        return formattedData;
      } else {
        if (data?.titles) {
          const formattedData = data.titles.map((title: string, i: number) => {
            if (data?.used && data?.preferred) {
              return {
                title,
                used: data.used[i],
                preferred: data.preferred[i],
              };
            } else if (data?.clicks && data?.searchs) {
              return {
                title,
                clicks: data.clicks[i],
                searchs: data.searchs[i],
              };
            }
          });

          return formattedData;
        } else {
          const csvData = Object.entries(data).map(([date, details]) => ({
            Date: date,
            Count: (details as { count: number; lastVisit?: string }).count,
            LastVisit:
              new Date(
                (details as { count: number; lastVisit: number }).lastVisit
              ).toLocaleString("en-US", {
                timeZone: "Asia/Manila",
              }) || "",
          }));

          return [...csvData].reverse();
        }
      }
    });

    // Remove duplicate arrays
    const filteredData = removeDuplicateArrays(newDataSet);
    await downloadExcel(filteredData);

    // console.log("filtered data", filteredData);
    // // Create a worksheet for each data set
    // filteredData.forEach((data: any, index: number) => {
    //   let worksheet;
    //   let sheetName;
    //   const headerNames = Object.keys(data[0]);

    //   worksheet = XLSX.utils.json_to_sheet(data, {
    //     header: headerNames,
    //   });

    //   if (index === 0) {
    //     sheetName = "Amenities Usage & Preference";
    //   } else if (index === 1) {
    //     sheetName = "Visits Overview";
    //   } else if (index === 2) {
    //     sheetName = "Maps Clicks & Searches";
    //   } else if (index === 3) {
    //     sheetName = "Shop Clicks & Searches";
    //   } else {
    //     sheetName = `Sheet${index + 1}`;
    //   }

    //   XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    // });

    // XLSX.writeFile(workbook, "Dashboard_Data.xlsx");
  };
  const downloadExcel = async (data: any) => {
    try {
      const response = await fetch('http://195.26.255.19:3005/generate-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'analytics_charts.xlsx');
      document.body.appendChild(link);
      link.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  // const exportToExcel = () => {
  //   // Create a new workbook
  //   const workbook = XLSX.utils.book_new();

  //   const newDataSet = dataSet.map((data, index) => {
  //     if (Array.isArray(data)) {
  //       data = data?.filter((item: any) => item?.storeName !== "Unnamed Store");

  //       const formattedData = data?.map((shop: any) => {
  //         if (shop?.storeName) {
  //           return {
  //             title: shop.storeName,
  //             clicks: shop.clicks,
  //             searchs: shop.searches,
  //           };
  //         } else {
  //           return shop;
  //         }
  //       });

  //       return formattedData;
  //     } else {
  //       const formattedData = data.titles.map((title: string, i: number) => {
  //         if (data?.used && data?.preferred) {
  //           return {
  //             title,
  //             used: data.used[i],
  //             preferred: data.preferred[i],
  //           };
  //         } else if (data?.clicks && data?.searchs) {
  //           return {
  //             title,
  //             clicks: data.clicks[i],
  //             searchs: data.searchs[i],
  //           };
  //         }
  //       });

  //       return formattedData;
  //     }
  //   });

  //   const filteredData = removeDuplicateArrays(newDataSet);

  //   // console.log("data set", dataSet);
  //   console.log("filtered data", filteredData);

  //   filteredData.forEach((data: any, index: number) => {
  //     let worksheet;
  //     const headerNames = Object.keys(data[0]);

  //     worksheet = XLSX.utils.json_to_sheet(data, {
  //       header: headerNames,
  //     });

  //     XLSX.utils.book_append_sheet(workbook, worksheet, `Sheet${index + 1}`);
  //   });

  //   XLSX.writeFile(workbook, "Dashboard_Data.xlsx");

  //   return;

  //   //* OLD CODE /////////////

  //   filteredData.forEach((data: any, index: number) => {
  //     let worksheet;

  //     if (Array.isArray(data)) {
  //       data = data?.filter((item: any) => item?.storeName !== "Unnamed Store");

  //       // Handle the first format (Array of Objects)
  //       // Ensure the correct header row is created with each object in the array
  //       worksheet = XLSX.utils.json_to_sheet(data, {
  //         header: ["storeName", "clicks", "searches"],
  //       });
  //     } else if (data.used && data.preferred && data.titles) {
  //       // Handle the second format (Object with arrays)
  //       // Prepare the data for the worksheet
  //       const formattedData = data.titles.map((title: string, i: number) => ({
  //         title,
  //         used: data.used[i],
  //         preferred: data.preferred[i],
  //       }));

  //       // Convert the formatted data into a worksheet
  //       worksheet = XLSX.utils.json_to_sheet(formattedData);
  //     } else if (data?.clicks && data?.searchs && data?.titles) {
  //       // Handle the third format (Object with arrays)
  //       // Prepare the data for the worksheet
  //       const formattedData = data.titles.map((title: string, i: number) => ({
  //         title,
  //         clicks: data.clicks[i],
  //         searchs: data.searchs[i],
  //       }));

  //       // Convert the formatted data into a worksheet
  //       worksheet = XLSX.utils.json_to_sheet(formattedData);
  //     } else {
  //       // If the data format is unrecognized, skip it
  //       return;
  //     }

  //     // Append the worksheet to the workbook with a unique sheet name
  //     XLSX.utils.book_append_sheet(workbook, worksheet, `Sheet${index + 1}`);
  //   });

  //   // Write the workbook to a file and trigger download
  //   XLSX.writeFile(workbook, "Dashboard_Data.xlsx");
  // };

  // useEffect(() => {
  //   console.log(dataSet);
  // }, [dataSet]);

  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={24} lg={24}>
            <Button variant="contained" color="primary" onClick={exportToExcel}>
              Export All Data To Excel
            </Button>
          </Grid>
          <Grid item xs={24} lg={24}>
            <DelayedFeedback
              onChartUpdate={onChartUpdate}
              getAllDataFromGraph={getAllDataFromGraph}
            />
          </Grid>
          <Grid item xs={12} lg={12}>
            <DelayedVisitsChart
              onChartUpdate={onChartUpdate}
              getAllDataFromGraph={getAllDataFromGraph}
            />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <MapInfo onChartUpdate={onChartUpdate} />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} lg={8}>
            <DelayedMapsCharts
              onChartUpdate={onChartUpdate}
              getAllDataFromGraph={getAllDataFromGraph}
            />
          </Grid>
          <Grid item xs={12} lg={8}>
            <DelayedShopClicks
              onChartUpdate={onChartUpdate}
              getAllDataFromGraph={getAllDataFromGraph}
            />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ShopInfo onChartUpdate={onChartUpdate} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Dashboard;
