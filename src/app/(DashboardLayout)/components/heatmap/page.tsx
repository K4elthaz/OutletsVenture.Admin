"use client";
import { useEffect, useState, useRef } from "react";
import { ref, onValue, get, DataSnapshot, remove } from "firebase/database";
import { db } from "@/utils/firebase";
import { Table, Tag } from "antd";

type HeatmapData = {
  routeId: string;
  count: number;
  destinationCoords: [number, number];
  destinationName: string;
};

interface Destination {
  id: string;
  title: string;
  [key: string]: any;
}

type DestinationType = "shop" | "dine" | "service";

async function getDestinationName(
  db: any,
  destination: string
): Promise<string | null> {
  // Extract type and validate destination format
  const match = destination.match(/^(shop|dine|service)-(.+)$/);
  if (!match) {
    return null;
  }

  const [, type, id] = match;

  // Map types to their Firebase paths
  const typeToPath: Record<DestinationType, string> = {
    shop: "Shops",
    dine: "Dines",
    service: "Services",
  };

  const path = typeToPath[type as DestinationType];
  if (!path) {
    return null;
  }

  try {
    const snapshot = await get(ref(db, path));
    const items = Object.values(snapshot.val() || {}) as Destination[];

    const item = items.find((item) => `${type}-${item.id}` === destination);
    return item?.title || null;
  } catch (error) {
    console.error(`Error fetching ${type} details:`, error);
    return null;
  }
}

const AdminHeatmap = () => {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const SELECTION_WINDOW = 10 * 60 * 1000; // 10 minutes in milliseconds

  // Fetch heatmap data from Firebase in real-time using onValue
  useEffect(() => {
    const heatmapRef = ref(db, "Heatmap");
    const routesRef = ref(db, "Routes");

    const handleHeatmapData = async (snapshot: any) => {
      try {
        const routesSnapshot = await get(routesRef);

        if (snapshot.exists() && routesSnapshot.exists()) {
          const now = Date.now();
          const destinationCounts: Record<string, number> = {}; // Group by destination

          // Process heatmap events
          snapshot.forEach((childSnapshot: DataSnapshot) => {
            const eventData = childSnapshot.val();
            if (eventData.event === "route_selection" && eventData.timestamp) {
              const routeId = eventData.routeId;
              const eventTime = eventData.timestamp;

              // Count events within the selection window
              if (now - eventTime <= SELECTION_WINDOW) {
                // Find the corresponding route to get the destination
                routesSnapshot.forEach((routeSnapshot) => {
                  routeSnapshot.forEach((routeData) => {
                    if (routeData.key === routeId) {
                      const route = routeData.val();
                      const destination = route?.destination;
                      if (destination) {
                        destinationCounts[destination] =
                          (destinationCounts[destination] || 0) + 1;
                      }
                    }
                  });
                });
              }
            }
          });

          // Process routes data and map to heatmap
          const heatmapArray = await Promise.all(
            Object.entries(destinationCounts).map(
              async ([destination, count]) => {
                let destinationCoords = [0, 0];
                let destinationName = "";

                // Find the destination in the Routes snapshot to get coordinates
                routesSnapshot.forEach((routeSnapshot) => {
                  routeSnapshot.forEach((routeData) => {
                    const route = routeData.val();
                    if (route?.destination === destination) {
                      const points = route?.points;
                      // Get the last point in the route's points array
                      destinationCoords =
                        points && points.length > 0
                          ? points[points.length - 1]
                          : [0, 0];
                    }
                  });
                });

                // Fetch destination name (Shop details)
                // const shopsSnapshot = await get(ref(db, `Shops`));
                // const shop: any = Object.values(shopsSnapshot.val() || {}).find(
                //   (shop: any) => `shop-${shop.id}` === destination
                // );

                count = count / 2;

                return {
                  routeId: destination, // Use destination as routeId
                  count,
                  destinationCoords,
                  destinationName:
                    (await getDestinationName(db, destination)) ||
                    "Unknown Destination 2",
                };
              }
            )
          );

          const validHeatmapData: HeatmapData[] = heatmapArray
            .filter((item) => item != null)
            .map((item) => ({
              ...item,
              // If destinationCoords has more or fewer than two elements, adjust or return default values
              destinationCoords:
                item.destinationCoords.length === 2
                  ? (item.destinationCoords as [number, number])
                  : [0, 0],
            }));

          // Set the heatmap data state
          setHeatmapData(validHeatmapData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    // Listen for changes in the Heatmap data in real-time
    onValue(heatmapRef, handleHeatmapData);

    // Cleanup function: Firebase automatically removes the listener when the component unmounts
    return () => {
      // No need to manually call `off()`, Firebase handles it automatically
    };
  }, []);

  // Table columns for Ant Design Table
  const columns = [
    {
      title: "Destination",
      dataIndex: "destinationName",
      key: "destination",
    },
    {
      title: "Selection Count",
      dataIndex: "count",
      key: "count",
      render: (count: number) => (
        <Tag color={count >= 10 ? "red" : count >= 5 ? "orange" : "green"}>
          {count}
        </Tag>
      ),
    },
  ];

  // Draw the heatmap on the canvas
  const drawHeatmap = () => {
    if (!canvasRef.current || !imgRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const canvas = canvasRef.current;
    const img = imgRef.current;

    // Set canvas width and height to match image's natural dimensions
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const width = canvas.width;
    const height = canvas.height;

    // Clear the canvas
    ctx.clearRect(0, 0, width, height);

    // Set the map image as background
    ctx.drawImage(img, 0, 0, width, height); // Draw the map image on canvas

    // Draw the heatmap based on `heatmapData`
    heatmapData.forEach((data) => {
      // Calculate position and intensity (size and opacity) based on `count`
      const x = data.destinationCoords[0];
      const y = data.destinationCoords[1];
      const intensity = Math.min(data.count / 10, 1);

      // console.log(data.destinationName); // Log the destination name for debugging

      // Draw heatmap points (circle) on the canvas
      ctx.beginPath();
      ctx.arc(x, y, 25 * intensity, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 0, 0, ${intensity})`; // Red with varying opacity
      ctx.fill();

      // Draw the destination name label with a black background
      if (data.destinationName) {
        ctx.font = "14px Arial"; // Font style for the label
        ctx.fillStyle = "white"; // Label text color
        ctx.textAlign = "center"; // Align text to the center of the point
        ctx.textBaseline = "middle"; // Align text vertically in the middle

        // Offset the label a bit so it's not directly on top of the point
        const labelX = x;
        const labelY = y - 30; // 30px above the point

        // Draw a black rectangle as the background for the label text
        const textWidth = ctx.measureText(data.destinationName).width;
        const textHeight = 16; // Approximate height of the text

        // Draw the black background behind the text
        ctx.fillStyle = "black";
        ctx.fillRect(
          labelX - textWidth / 2 - 5,
          labelY - textHeight / 2 - 5,
          textWidth + 10,
          textHeight + 10
        );

        // Draw the label text over the black background
        ctx.fillStyle = "white"; // Ensure text color is white on black background
        ctx.fillText(data.destinationName, labelX, labelY);
      }
    });
  };

  // Re-render heatmap on data change
  useEffect(() => {
    drawHeatmap();
  }, [heatmapData]);

  return (
    <div>
      <h1>Admin Heatmap</h1>
      <p>Visualizing route selection events in real-time.</p>

      {/* Heatmap canvas container */}
      <div style={{ position: "relative", marginBottom: "20px" }}>
        <img
          ref={imgRef}
          src="/images/map.png" // Your map image path
          alt="map"
          style={{ display: "none" }} // Hide the image (canvas will be drawn over it)
          onLoad={drawHeatmap} // Trigger the draw function once the image is loaded
        />
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "auto", cursor: "crosshair" }}
        />
      </div>

      {/* Table View */}
      <Table
        dataSource={heatmapData}
        columns={columns}
        rowKey="routeId"
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default AdminHeatmap;
