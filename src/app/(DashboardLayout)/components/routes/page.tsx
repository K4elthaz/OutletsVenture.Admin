"use client";
import { message } from "antd/lib";
import { useState, useEffect } from "react";
import {
  ref,
  onValue,
  child,
  get,
  set,
  update,
  remove,
} from "firebase/database";
import { db } from "@/utils/firebase";
import MapCanvas from "@/app/(DashboardLayout)/content/routes/MapCanvas"; // Adjust this path as needed
import { Button, Input, Select, Space, Typography } from "antd";

type Point = [number, number];
type Shop = { id: string; title: string };

const Page = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [routes, setRoutes] = useState<string[]>([]);
  const [selectedShop, setSelectedShop] = useState<string>("");
  const [selectedRoute, setSelectedRoute] =
    useState<string>("Create new route");
  const [selectedDestination, setSelectedDestination] = useState<string>("");
  const [savedPoints, setSavedPoints] = useState<Point[]>([]);
  const [initialPoints, setInitialPoints] = useState<Point[]>([]);
  const [isEditingRouteName, setIsEditingRouteName] = useState(false);
  const [editValue, setEditValue] = useState(selectedRoute);

  // Fetch shops with onValue for real-time updates
  useEffect(() => {
    const shopsRef = ref(db, "Shops");
    const servicesRef = ref(db, "Services");
    const dinesRef = ref(db, "Dines");
    const emergencyAmenitiesRef = ref(db, "EmergencyAmenities");

    const unsubscribeShops = onValue(shopsRef, (snapshot) => {
      if (snapshot.exists()) {
        const shopList: Shop[] = [];
        console.log("Shop data", snapshot.val());
        snapshot.forEach((childSnapshot) => {
          const shopId = `shop-${childSnapshot.key}`;
          const shopData = childSnapshot.val();
          if (shopId && shopData?.title) {
            shopList.push({ id: shopId, title: shopData.title });
          }
        });
        setShops((prevShops) => [...prevShops, ...shopList]);
      }
    });

    const unsubscribeServices = onValue(servicesRef, (snapshot) => {
      if (snapshot.exists()) {
        const serviceList: Shop[] = [];
        console.log("Services daata", snapshot.val());
        snapshot.forEach((childSnapshot) => {
          const serviceId = `service-${childSnapshot.key}`;
          const serviceData = childSnapshot.val();
          if (serviceId && serviceData?.title) {
            serviceList.push({ id: serviceId, title: serviceData.title });
          }
        });
        setShops((prevShops) => [...prevShops, ...serviceList]);
      }
    });

    const unsubscribeDines = onValue(dinesRef, (snapshot) => {
      if (snapshot.exists()) {
        const dineList: Shop[] = [];
        console.log("Dines data", snapshot.val());
        snapshot.forEach((childSnapshot) => {
          const dineId = `dine-${childSnapshot.key}`;
          const dineData = childSnapshot.val();
          if (dineId && dineData?.title) {
            dineList.push({ id: dineId, title: dineData.title });
          }
        });
        setShops((prevShops) => [...prevShops, ...dineList]);
      }
    });

    const unsubscribeEmergencyAmenities = onValue(
      emergencyAmenitiesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const dineList: Shop[] = [];
          console.log("Emergency amenities data", snapshot.val());
          snapshot.forEach((childSnapshot) => {
            const dineId = `emergency-amenities-${childSnapshot.key}`;
            const dineData = childSnapshot.val();
            if (dineId && dineData?.title) {
              dineList.push({ id: dineId, title: dineData.title });
            }
          });
          setShops((prevShops) => [...prevShops, ...dineList]);
        }
      }
    );

    return () => {
      unsubscribeShops();
      unsubscribeServices();
      unsubscribeDines();
      unsubscribeEmergencyAmenities();
    };
  }, []);

  // Fetch routes with onValue for real-time updates
  useEffect(() => {
    if (!selectedShop || !selectedDestination) return;

    const shopRoutesRef = ref(db, `Routes/${selectedShop}`);
    const destinationRoutesRef = ref(db, `Routes/${selectedDestination}`);

    const unsubscribeShop = onValue(shopRoutesRef, (snapshot) => {
      const shopRoutes = snapshot.exists()
        ? Object.keys(snapshot.val()).filter((route) => {
            const routeData = snapshot.val()[route];
            return (
              (routeData?.origin === selectedShop &&
                routeData?.destination === selectedDestination) ||
              (routeData?.origin === selectedDestination &&
                routeData?.destination === selectedShop)
            );
          })
        : [];

      const unsubscribeDestination = onValue(
        destinationRoutesRef,
        (destinationSnapshot) => {
          const destinationRoutes = destinationSnapshot.exists()
            ? Object.keys(destinationSnapshot.val()).filter((route) => {
                const routeData = destinationSnapshot.val()[route];
                return (
                  (routeData?.origin === selectedShop &&
                    routeData?.destination === selectedDestination) ||
                  (routeData?.origin === selectedDestination &&
                    routeData?.destination === selectedShop)
                );
              })
            : [];

          const combinedRoutes = Array.from(
            new Set(["Create new route", ...shopRoutes, ...destinationRoutes])
          );
          setRoutes(combinedRoutes);
        }
      );

      return () => {
        unsubscribeShop();
        unsubscribeDestination();
      };
    });
  }, [selectedShop, selectedDestination]);

  // Fetch route points with onValue for real-time updates
  useEffect(() => {
    if (
      selectedRoute === "Create new route" ||
      (!selectedShop && !selectedDestination)
    ) {
      setInitialPoints([]);
      return;
    }

    const shopRouteRef = ref(db, `Routes/${selectedShop}/${selectedRoute}`);
    const destinationRouteRef = ref(
      db,
      `Routes/${selectedDestination}/${selectedRoute}`
    );

    const unsubscribeShop = onValue(shopRouteRef, (snapshot) => {
      if (snapshot.exists()) {
        setInitialPoints(snapshot.val().points || []);
      } else {
        const unsubscribeDestination = onValue(
          destinationRouteRef,
          (destinationSnapshot) => {
            if (destinationSnapshot.exists()) {
              setInitialPoints(destinationSnapshot.val().points || []);
            }
          }
        );

        return unsubscribeDestination;
      }
    });

    return () => unsubscribeShop();
  }, [selectedRoute, selectedShop, selectedDestination]);

  const onValueChange = (value: string, id: string) => {
    if (id === "shop") {
      setSelectedShop(value);
      setSelectedRoute("Create new route"); // Reset route selection
      setSelectedDestination(""); // Reset destination to ensure a fresh selection
      setRoutes([]); // Clear route options temporarily until destination is re-selected
    } else if (id === "destination") {
      setSelectedDestination(value);
      setSelectedRoute("Create new route"); // Reset route selection to "Create new route"
    } else if (id === "route") {
      setSelectedRoute(value);
      setEditValue(value);
    }
  };

  const handleSavePoints = (points: Point[]) => {
    setSavedPoints(points);
  };

  const handleSaveRoute = async () => {
    if (
      !selectedShop ||
      !selectedDestination ||
      selectedDestination === selectedShop
    ) {
      message.error("Please select two distinct locations.");
      return;
    }

    let newRouteKey = "";
    let routeRef;

    if (selectedRoute === "Create new route") {
      // Reference the routes under the selected shop
      const shopRoutesRef = ref(db, `Routes/${selectedShop}`);
      const destinationRoutesRef = ref(db, `Routes/${selectedDestination}`);

      // Fetch all existing routes for both origin and destination
      const [shopRoutesSnapshot, destinationRoutesSnapshot] = await Promise.all(
        [get(shopRoutesRef), get(destinationRoutesRef)]
      );

      const existingRoutes = new Set<string>();

      // Add route names from the shop reference
      if (shopRoutesSnapshot.exists()) {
        Object.keys(shopRoutesSnapshot.val()).forEach((route) =>
          existingRoutes.add(route)
        );
      }

      // Count existing routes between the specific origin and destination
      const routeCount = Array.from(existingRoutes).filter((route) =>
        route.startsWith("Route")
      ).length;

      // Generate the new route key
      // newRouteKey = `Route ${routeCount + 1}`;
      newRouteKey = `Route-${Date.now()}`;
      routeRef = child(shopRoutesRef, newRouteKey);
    } else {
      // Use the existing route reference
      routeRef = child(ref(db), `Routes/${selectedShop}/${selectedRoute}`);
      newRouteKey = selectedRoute; // Keep the selected route as the key
    }

    // Save data in a format that supports interchangeable origin/destination
    const routeData = {
      points: savedPoints,
      origin: selectedShop,
      destination: selectedDestination,
      clicks: {},
    };

    await set(routeRef, routeData);

    // Also save the reverse route for consistency
    const reversedRouteData = {
      points: [...routeData.points]?.reverse(),
      origin: selectedDestination,
      destination: selectedShop,
      clicks: {},
    };

    const reverseRouteRef = child(
      ref(db),
      `Routes/${selectedDestination}/${newRouteKey}`
    );
    await set(reverseRouteRef, reversedRouteData);

    // Update the selectedRoute state to the newly generated key
    if (selectedRoute === "Create new route" && newRouteKey) {
      setSelectedRoute(newRouteKey);
    }

    message.success("Route saved successfully!");
  };

  const handleSave = async () => {
    if (!selectedRoute) return;

    try {
      const updateRoute = async (shopPath: string, destinationPath: string) => {
        const oldRef = ref(db, shopPath);
        const snapshot = await get(oldRef);

        if (snapshot.exists()) {
          const newRef = ref(db, destinationPath);
          await set(newRef, snapshot.val());
          await remove(oldRef);
        }
      };

      // Update both routes concurrently
      await Promise.all([
        updateRoute(
          `Routes/${selectedShop}/${selectedRoute}`,
          `Routes/${selectedShop}/${editValue}`
        ),
        updateRoute(
          `Routes/${selectedDestination}/${selectedRoute}`,
          `Routes/${selectedDestination}/${editValue}`
        ),
      ]);

      setIsEditingRouteName(false);
      setSelectedRoute(editValue);
      message.success("Route name updated successfully!");
    } catch (error) {
      console.error("Error updating routes:", error);
      message.error("Failed to update route name");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Route Maker</h1>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {/* Shop Selection */}
        <div>
          <label htmlFor="shop">Origin: </label>
          <Select
            id="shop"
            value={selectedShop}
            onChange={(value) => onValueChange(value, "shop")}
            placeholder="Select Origin"
            style={{ width: "100%" }}
          >
            {shops
              ?.filter((shop) => !shop?.id?.includes("emergency-amenities"))
              ?.map((shop) => (
                <Select.Option key={shop.id} value={shop.id}>
                  {shop.title}
                </Select.Option>
              ))}
          </Select>
        </div>

        {/* Destination Selection */}
        <div>
          <label htmlFor="destination">Destination: </label>
          <Select
            id="destination"
            value={selectedDestination}
            onChange={(value) => onValueChange(value, "destination")}
            placeholder="Select Destination"
            disabled={!selectedShop}
            style={{ width: "100%" }}
          >
            {shops
              .filter((shop) => shop.id !== selectedShop)
              .map((shop) => (
                <Select.Option key={shop.id} value={shop.id}>
                  {shop.title}
                </Select.Option>
              ))}
          </Select>
        </div>

        {/* Route Selection */}
        <div>
          <label htmlFor="route">Route: </label>
          <div>
            <Select
              id="route"
              value={selectedRoute}
              onChange={(value) => onValueChange(value, "route")}
              placeholder="Select Route"
              disabled={
                !selectedShop || !selectedDestination || isEditingRouteName
              }
              style={{ width: "100%" }}
            >
              {routes.map((route) => (
                <Select.Option key={route} value={route}>
                  {route}
                </Select.Option>
              ))}
            </Select>

            {selectedRoute !== "Create new route" && !isEditingRouteName && (
              <Button onClick={() => setIsEditingRouteName(true)}>Edit</Button>
            )}
            {isEditingRouteName && (
              <div className="flex space-x-2">
                <p style={{ margin: "10px 0" }}>Edit route name:</p>
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-grow"
                />
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    onClick={() => {
                      setIsEditingRouteName(false);
                      setEditValue(selectedRoute);
                    }}
                  >
                    Cancel
                  </Button>

                  <Button onClick={handleSave}>Save</Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Route Button */}
        <Button
          type="primary"
          onClick={handleSaveRoute}
          disabled={
            !selectedShop || !selectedDestination || savedPoints.length === 0
          }
        >
          Save Route To Database
        </Button>
      </Space>

      {/* MapCanvas Component */}
      <div style={{ marginTop: "20px" }}>
        <MapCanvas
          imageSrc="/images/map.png"
          onSave={setSavedPoints}
          initialPoints={initialPoints}
        />
      </div>
    </div>
  );
};
export default Page;
