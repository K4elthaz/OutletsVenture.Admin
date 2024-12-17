"use client";
import React, { useState, useEffect } from "react";
import {
  Typography,
  Grid,
  CardContent,
  Stack,
  Breadcrumbs,
  IconButton,
  Link as MuiLink,
  Avatar,
} from "@mui/material";
import { Modal, Input, Form, Button, Upload, Collapse, message } from "antd";
import Image from "next/image";
import {
  HomeOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  CaretRightOutlined,
} from "@ant-design/icons";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import Link from "next/link";
import { ref as dbRef, onValue, set, update, remove } from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db } from "@/utils/firebase";
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
import { UploadFile } from "antd/es/upload/interface";

const { Panel } = Collapse;

const MallMapPage = () => {
  const [mallMapPageCards, setMallMapPageCards] = useState([
    {
      id: 1,
      title: "Promenade",
      nestedCards: [
        { id: 1, title: "Shop", type: "shop", cards: [] },
        {
          id: 2,
          title: "Dine",
          type: "dine",
          cards: [],
        },
        {
          id: 3,
          title: "Services",
          type: "services",
          cards: [],
        },
      ],
      backgroundImage: "url(/images/map-labels/map_label_1.png)",
    },
    {
      id: 2,
      title: "Plaza",
      nestedCards: [
        {
          id: 1,
          title: "Shop",
          type: "shop",
          cards: [],
        },
        {
          id: 2,
          title: "Dine",
          type: "dine",
          cards: [],
        },
        {
          id: 3,
          title: "Services",
          type: "services",
          cards: [],
        },
      ],
      backgroundImage: "url(/images/map-labels/map_label_2.png)",
    },
    {
      id: 3,
      title: "Parkade",
      nestedCards: [
        {
          id: 1,
          title: "Shop",
          type: "shop",
          cards: [],
        },
        {
          id: 2,
          title: "Dine",
          type: "dine",
          cards: [],
        },
        {
          id: 3,
          title: "Services",
          type: "services",
          cards: [],
        },
      ],
      backgroundImage: "url(/images/map-labels/map_label_3.png)",
    },
    {
      id: 4,
      title: "Loop",
      nestedCards: [
        {
          id: 1,
          title: "Shop",
          type: "shop",
          cards: [],
        },
        {
          id: 2,
          title: "Dine",
          type: "dine",
          cards: [],
        },
        {
          id: 3,
          title: "Services",
          type: "services",
          cards: [],
        },
      ],
      backgroundImage: "url(/images/map-labels/map_label_3.png)",
    },
    {
      id: 5,
      title: "Flavors",
      nestedCards: [
        {
          id: 1,
          title: "Shop",
          type: "shop",
          cards: [],
        },
        {
          id: 2,
          title: "Dine",
          type: "dine",
          cards: [],
        },
        {
          id: 3,
          title: "Services",
          type: "services",
          cards: [],
        },
      ],
      backgroundImage: "url(/images/map-labels/map_label_3.png)",
    },
    {
      id: 3,
      title: "Aboitiz Pitch",
      nestedCards: [
        {
          id: 1,
          title: "Shop",
          type: "shop",
          cards: [],
        },
        {
          id: 2,
          title: "Dine",
          type: "dine",
          cards: [],
        },
        {
          id: 3,
          title: "Services",
          type: "services",
          cards: [],
        },
      ],
      backgroundImage: "url(/images/map-labels/map_label_3.png)",
    },
  ]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // Track if we're editing a card
  const [editingCard, setEditingCard] = useState<any>(null); // Hold the card being edited
  const [selectedParentCard, setSelectedParentCard] = useState<any>(null);
  const [selectedNestedCard, setSelectedNestedCard] = useState<any>(null);
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    const promenadeRef1 = dbRef(db, `${mallPromenadeMap}/${mallFood}`);
    const promenadeRef2 = dbRef(db, `${mallPromenadeMap}/${mallShop}`);
    const promenadeRef3 = dbRef(db, `${mallPromenadeMap}/${mallService}`);

    const plazaRef1 = dbRef(db, `${mallPlazaMap}/${mallFood}`);
    const plazaRef2 = dbRef(db, `${mallPlazaMap}/${mallShop}`);
    const plazaRef3 = dbRef(db, `${mallPlazaMap}/${mallService}`);

    const parkadeRef1 = dbRef(db, `${mallParkadeMap}/${mallFood}`);
    const parkadeRef2 = dbRef(db, `${mallParkadeMap}/${mallShop}`);
    const parkadeRef3 = dbRef(db, `${mallParkadeMap}/${mallService}`);

    const loopRef1 = dbRef(db, `${mallLoopMap}/${mallFood}`);
    const loopRef2 = dbRef(db, `${mallLoopMap}/${mallShop}`);
    const loopRef3 = dbRef(db, `${mallLoopMap}/${mallService}`);

    const flavorsRef1 = dbRef(db, `${mallFlavorsMap}/${mallFood}`);
    const flavorsRef2 = dbRef(db, `${mallFlavorsMap}/${mallShop}`);
    const flavorsRef3 = dbRef(db, `${mallFlavorsMap}/${mallService}`);

    const aboitizRef1 = dbRef(db, `${mallAboitizMap}/${mallFood}`);
    const aboitizRef2 = dbRef(db, `${mallAboitizMap}/${mallShop}`);
    const aboitizRef3 = dbRef(db, `${mallAboitizMap}/${mallService}`);

    const promenadeValueChange = onValue(promenadeRef1, (snapshot) => {
      const data = snapshot.val();
      setMallMapPageCards((prev) =>
        prev.map((card) =>
          card.title === "Promenade"
            ? {
                ...card,
                nestedCards: card.nestedCards.map((nestedCard) =>
                  nestedCard.title === "Dine"
                    ? { ...nestedCard, cards: data ? data : [] }
                    : nestedCard
                ),
              }
            : card
        )
      );
    });

    const promenadeValueChange2 = onValue(promenadeRef2, (snapshot) => {
      const data = snapshot.val();
      setMallMapPageCards((prev) =>
        prev.map((card) =>
          card.title === "Promenade"
            ? {
                ...card,
                nestedCards: card.nestedCards.map((nestedCard) =>
                  nestedCard.title === "Shop"
                    ? { ...nestedCard, cards: data ? data : [] }
                    : nestedCard
                ),
              }
            : card
        )
      );
    });

    const promenadeValueChange3 = onValue(promenadeRef3, (snapshot) => {
      const data = snapshot.val();
      setMallMapPageCards((prev) =>
        prev.map((card) =>
          card.title === "Promenade"
            ? {
                ...card,
                nestedCards: card.nestedCards.map((nestedCard) =>
                  nestedCard.title === "Services"
                    ? { ...nestedCard, cards: data ? data : [] }
                    : nestedCard
                ),
              }
            : card
        )
      );
    });

    const plazaValueChange = onValue(plazaRef1, (snapshot) => {
      const data = snapshot.val();
      setMallMapPageCards((prev) =>
        prev.map((card) =>
          card.title === "Plaza"
            ? {
                ...card,
                nestedCards: card.nestedCards.map((nestedCard) =>
                  nestedCard.title === "Dine"
                    ? { ...nestedCard, cards: data ? data : [] }
                    : nestedCard
                ),
              }
            : card
        )
      );
    });

    const plazaValueChange2 = onValue(plazaRef2, (snapshot) => {
      const data = snapshot.val();
      setMallMapPageCards((prev) =>
        prev.map((card) =>
          card.title === "Plaza"
            ? {
                ...card,
                nestedCards: card.nestedCards.map((nestedCard) =>
                  nestedCard.title === "Shop"
                    ? { ...nestedCard, cards: data ? data : [] }
                    : nestedCard
                ),
              }
            : card
        )
      );
    });

    const plazaValueChange3 = onValue(plazaRef3, (snapshot) => {
      const data = snapshot.val();
      setMallMapPageCards((prev) =>
        prev.map((card) =>
          card.title === "Plaza"
            ? {
                ...card,
                nestedCards: card.nestedCards.map((nestedCard) =>
                  nestedCard.title === "Services"
                    ? { ...nestedCard, cards: data ? data : [] }
                    : nestedCard
                ),
              }
            : card
        )
      );
    });

    const parkadeValueChange = onValue(parkadeRef1, (snapshot) => {
      const data = snapshot.val();
      setMallMapPageCards((prev) =>
        prev.map((card) =>
          card.title === "Parkade"
            ? {
                ...card,
                nestedCards: card.nestedCards.map((nestedCard) =>
                  nestedCard.title === "Dine"
                    ? { ...nestedCard, cards: data ? data : [] }
                    : nestedCard
                ),
              }
            : card
        )
      );
    });

    const parkadeValueChange2 = onValue(parkadeRef2, (snapshot) => {
      const data = snapshot.val();
      setMallMapPageCards((prev) =>
        prev.map((card) =>
          card.title === "Parkade"
            ? {
                ...card,
                nestedCards: card.nestedCards.map((nestedCard) =>
                  nestedCard.title === "Shop"
                    ? { ...nestedCard, cards: data ? data : [] }
                    : nestedCard
                ),
              }
            : card
        )
      );
    });

    const parkadeValueChange3 = onValue(parkadeRef3, (snapshot) => {
      const data = snapshot.val();
      setMallMapPageCards((prev) =>
        prev.map((card) =>
          card.title === "Parkade"
            ? {
                ...card,
                nestedCards: card.nestedCards.map((nestedCard) =>
                  nestedCard.title === "Services"
                    ? { ...nestedCard, cards: data ? data : [] }
                    : nestedCard
                ),
              }
            : card
        )
      );
    });

    const loopValueChange = onValue(loopRef1, (snapshot) => {
      const data = snapshot.val();
      setMallMapPageCards((prev) =>
        prev.map((card) =>
          card.title === "Loop"
            ? {
                ...card,
                nestedCards: card.nestedCards.map((nestedCard) =>
                  nestedCard.title === "Dine"
                    ? { ...nestedCard, cards: data ? data : [] }
                    : nestedCard
                ),
              }
            : card
        )
      );
    });

    const loopValueChange2 = onValue(loopRef2, (snapshot) => {
      const data = snapshot.val();
      setMallMapPageCards((prev) =>
        prev.map((card) =>
          card.title === "Loop"
            ? {
                ...card,
                nestedCards: card.nestedCards.map((nestedCard) =>
                  nestedCard.title === "Shop"
                    ? { ...nestedCard, cards: data ? data : [] }
                    : nestedCard
                ),
              }
            : card
        )
      );
    });

    const loopValueChange3 = onValue(loopRef3, (snapshot) => {
      const data = snapshot.val();
      setMallMapPageCards((prev) =>
        prev.map((card) =>
          card.title === "Loop"
            ? {
                ...card,
                nestedCards: card.nestedCards.map((nestedCard) =>
                  nestedCard.title === "Services"
                    ? { ...nestedCard, cards: data ? data : [] }
                    : nestedCard
                ),
              }
            : card
        )
      );
    });

    const flavorsValueChange = onValue(flavorsRef1, (snapshot) => {
      const data = snapshot.val();
      setMallMapPageCards((prev) =>
        prev.map((card) =>
          card.title === "Flavors"
            ? {
                ...card,
                nestedCards: card.nestedCards.map((nestedCard) =>
                  nestedCard.title === "Dine"
                    ? { ...nestedCard, cards: data ? data : [] }
                    : nestedCard
                ),
              }
            : card
        )
      );
    });

    const flavorsValueChange2 = onValue(flavorsRef2, (snapshot) => {
      const data = snapshot.val();
      setMallMapPageCards((prev) =>
        prev.map((card) =>
          card.title === "Flavors"
            ? {
                ...card,
                nestedCards: card.nestedCards.map((nestedCard) =>
                  nestedCard.title === "Shop"
                    ? { ...nestedCard, cards: data ? data : [] }
                    : nestedCard
                ),
              }
            : card
        )
      );
    });

    const flavorsValueChange3 = onValue(flavorsRef3, (snapshot) => {
      const data = snapshot.val();
      setMallMapPageCards((prev) =>
        prev.map((card) =>
          card.title === "Flavors"
            ? {
                ...card,
                nestedCards: card.nestedCards.map((nestedCard) =>
                  nestedCard.title === "Services"
                    ? { ...nestedCard, cards: data ? data : [] }
                    : nestedCard
                ),
              }
            : card
        )
      );
    });

    const aboitizValueChange = onValue(aboitizRef1, (snapshot) => {
      const data = snapshot.val();
      setMallMapPageCards((prev) =>
        prev.map((card) =>
          card.title === "Aboitiz Pitch"
            ? {
                ...card,
                nestedCards: card.nestedCards.map((nestedCard) =>
                  nestedCard.title === "Dine"
                    ? { ...nestedCard, cards: data ? data : [] }
                    : nestedCard
                ),
              }
            : card
        )
      );
    });

    const aboitizValueChange2 = onValue(aboitizRef2, (snapshot) => {
      const data = snapshot.val();
      setMallMapPageCards((prev) =>
        prev.map((card) =>
          card.title === "Aboitiz Pitch"
            ? {
                ...card,
                nestedCards: card.nestedCards.map((nestedCard) =>
                  nestedCard.title === "Shop"
                    ? { ...nestedCard, cards: data ? data : [] }
                    : nestedCard
                ),
              }
            : card
        )
      );
    });

    const aboitizValueChange3 = onValue(aboitizRef3, (snapshot) => {
      const data = snapshot.val();
      setMallMapPageCards((prev) =>
        prev.map((card) =>
          card.title === "Aboitiz Pitch"
            ? {
                ...card,
                nestedCards: card.nestedCards.map((nestedCard) =>
                  nestedCard.title === "Services"
                    ? { ...nestedCard, cards: data ? data : [] }
                    : nestedCard
                ),
              }
            : card
        )
      );
    });

    return () => {
      promenadeValueChange();
      promenadeValueChange2();
      promenadeValueChange3();
      plazaValueChange();
      plazaValueChange2();
      plazaValueChange3();
      parkadeValueChange();
      parkadeValueChange2();
      parkadeValueChange3();
      loopValueChange();
      loopValueChange2();
      loopValueChange3();
      flavorsValueChange();
      flavorsValueChange2();
      flavorsValueChange3();
      aboitizValueChange();
      aboitizValueChange2();
      aboitizValueChange3();
    };
  }, []);

  useEffect(() => {
    if (!selectedNestedCard) return;
    selectedParentCard.nestedCards.map((cards: { id: any }) => {
      if (cards.id === selectedNestedCard.id) setSelectedNestedCard(cards);
    });
  }, [mallMapPageCards, selectedParentCard, selectedNestedCard]);

  const showModal = () => {
    form.resetFields();
    setIsModalVisible(true);
    setIsEditMode(false);
  };

  const handleSaveDynamicCard = async (values: any) => {
    setIsLoading(true);
    // const newID = editingCard
    //   ? editingCard.id
    //   : selectedNestedCard.cards.length === 0
    //   ? 1
    //   : selectedNestedCard.cards[selectedNestedCard.cards.length - 1].id + 1;
    const newID = Math.floor(Math.random() * 1000000);

    let map2DUrl = editingCard?.map2D || "";

    let parentMapReference = "";
    switch (selectedParentCard.title) {
      case "Promenade":
        parentMapReference = mallPromenadeMap;
        break;
      case "Plaza":
        parentMapReference = mallPlazaMap;
        break;
      case "Parkade":
        parentMapReference = mallParkadeMap;
        break;
      case "Loop":
        parentMapReference = mallLoopMap;
        break;
      case "Flavors":
        parentMapReference = mallFlavorsMap;
        break;
      case "Aboitiz Pitch":
        parentMapReference = mallAboitizMap;
        break;
      default:
        console.error("Invalid parent card title");
        return;
    }

    if (values.map2D?.file) {
      const file = values.map2D.file;
      const storageReference = storageRef(
        getStorage(),
        `${parentMapReference}/${selectedNestedCard.title}/${newID}/map2D/${file.name}`
      );

      try {
        const snapshot = await uploadBytes(storageReference, file);
        map2DUrl = await getDownloadURL(snapshot.ref);
      } catch (error) {
        console.error("Failed to upload map2D file:", error);
        return;
      } finally {
        setIsLoading(false);
      }
    }

    // Build the new card object
    const newCard = {
      id: newID,
      storeName: values.storeName,
      map2D: map2DUrl,
      cloudPanoSceneID: values.cloudPanoSceneID,
      tags: values.tags.split(",").map((tag: string) => tag.trim()),
      logo: "",
    };

    if (fileList.length > 0) {
      const file = fileList[0].originFileObj!;
      if (file !== undefined) {
        const storageReference = storageRef(
          getStorage(),
          `${parentMapReference}/${selectedNestedCard.title}/${newID}/map2D/${file.name}`
        );

        try {
          const snapshot = await uploadBytes(storageReference, file);
          const downloadURL = await getDownloadURL(snapshot.ref);
          newCard.logo = downloadURL;
        } catch (error) {
          message.error("File upload failed.");
        }
      }
    }

    let sectionReference = "";

    // Determine the Firebase Realtime Database reference for Shop, Dine, or Services
    if (selectedNestedCard.title === "Shop") {
      sectionReference = `${parentMapReference}/${mallShop}`;
    } else if (selectedNestedCard.title === "Dine") {
      sectionReference = `${parentMapReference}/${mallFood}`;
    } else if (selectedNestedCard.title === "Services") {
      sectionReference = `${parentMapReference}/${mallService}`;
    }

    // Update or set the new card in Firebase Realtime Database
    const cardRef = dbRef(db, `${sectionReference}/${newCard.id}`);

    if (editingCard) {
      await update(cardRef, newCard); // Update if editing
    } else {
      await set(cardRef, newCard); // Set if adding new
    }

    // Reset modal and editing state
    setIsModalVisible(false);
    setEditingCard(null);
    message.success("Successfully saved!");
  };

  const handleEditCard = (card: any) => {
    setIsEditMode(true);
    setEditingCard(card);
    form.setFieldsValue({
      storeName: card.storeName,
      tags: Array.isArray(card.tags) ? card.tags.join(", ") : "",
    });
    setIsModalVisible(true);
  };

  const handleDeleteCard = async (cardId: number) => {
    let parentMapReference = "";

    switch (selectedParentCard.title) {
      case "Promenade":
        parentMapReference = mallPromenadeMap;
        break;
      case "Plaza":
        parentMapReference = mallPlazaMap;
        break;
      case "Parkade":
        parentMapReference = mallParkadeMap;
        break;
      case "Loop":
        parentMapReference = mallLoopMap;
        break;
      case "Flavors":
        parentMapReference = mallFlavorsMap;
        break;
      case "Aboitiz Pitch":
        parentMapReference = mallAboitizMap;
        break;
      default:
        console.error("Invalid parent card title");
        return;
    }

    let sectionReference = "";
    if (selectedNestedCard.title === "Shop") {
      sectionReference = `${parentMapReference}/${mallShop}`;
    } else if (selectedNestedCard.title === "Dine") {
      sectionReference = `${parentMapReference}/${mallFood}`;
    } else if (selectedNestedCard.title === "Services") {
      sectionReference = `${parentMapReference}/${mallService}`;
    }

    const cardRef = dbRef(db, `${sectionReference}/${cardId}`);
    const map2DRef = storageRef(
      getStorage(),
      `${parentMapReference}/${selectedNestedCard.title}/${cardId}/map2D`
    );

    try {
      // Remove the card from Firebase Realtime Database
      await remove(cardRef);

      // Delete the associated files (map2D, map360) from Firebase Storage
      try {
        await deleteObject(map2DRef);
      } catch (error) {
        console.warn("Failed to delete map2D from Firebase Storage:", error);
      }

      console.log(`Card with ID ${cardId} successfully deleted from Firebase`);
      message.success("Card successfully deleted!");
    } catch (error) {
      console.error("Failed to delete card from Firebase:", error);
    }
  };

  const handleCardClick = (card: any) => {
    if (card.nestedCards && card.nestedCards.length > 0) {
      setSelectedParentCard(card);
    } else {
      setSelectedNestedCard(card);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleBack = () => {
    if (selectedNestedCard) {
      setSelectedNestedCard(null);
    } else {
      setSelectedParentCard(null);
    }
  };

  const handleChangeLogo = (info: {
    file: UploadFile;
    fileList: UploadFile[];
  }) => {
    if (info.file.status === "done") {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
    setFileList(info.fileList);
  };

  return (
    <PageContainer title="Mall Map">
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <MuiLink
          color="inherit"
          href="/components/mall-map"
          onClick={() => setSelectedParentCard(null)}
          sx={{ display: "flex", alignItems: "center" }}
        >
          <HomeOutlined style={{ marginRight: "0.5rem" }} />
          Mall Map
        </MuiLink>
        {selectedParentCard && (
          <Typography color="text.primary">
            {selectedParentCard.title}
          </Typography>
        )}
      </Breadcrumbs>
      <DashboardCard
        style={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <div>
          {selectedParentCard && !selectedNestedCard ? (
            <div>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 3 }}
              >
                <IconButton onClick={handleBack} aria-label="back">
                  <ArrowLeftOutlined
                    style={{ fontSize: "24px", color: "primary" }}
                  />
                </IconButton>
                <Typography variant="h4" component="h1">
                  {selectedParentCard.title}
                </Typography>
              </Stack>
              <Grid container spacing={3}>
                {selectedParentCard?.nestedCards?.length > 0 ? (
                  selectedParentCard.nestedCards.map(
                    (nestedCard: any, index: number) => (
                      <Grid
                        item
                        xs={12}
                        md={4}
                        lg={4}
                        key={nestedCard.id + index}
                      >
                        <BlankCard
                          onClick={() => setSelectedNestedCard(nestedCard)}
                        >
                          <CardContent sx={{ p: 3, pt: 2 }}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography variant="h6">
                                {nestedCard.title}
                              </Typography>
                            </Stack>
                          </CardContent>
                        </BlankCard>
                      </Grid>
                    )
                  )
                ) : (
                  <Typography>No nested cards available</Typography>
                )}
              </Grid>
            </div>
          ) : selectedNestedCard ? (
            <div>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 3 }}
              >
                <IconButton onClick={handleBack} aria-label="back">
                  <ArrowLeftOutlined
                    style={{ fontSize: "24px", color: "primary" }}
                  />
                </IconButton>
                <Typography variant="h4" component="h1">
                  {selectedNestedCard.title}
                </Typography>
                <IconButton
                  onClick={showModal}
                  aria-label="add"
                  style={{ marginLeft: "auto" }}
                >
                  <PlusOutlined
                    style={{ fontSize: "24px", color: "primary" }}
                  />
                </IconButton>
              </Stack>
              <Grid container spacing={3}>
                {/* Dynamically render the cards for each section */}
                {selectedNestedCard.title === "Shop" &&
                  selectedNestedCard?.cards &&
                  Object.values(selectedNestedCard?.cards)
                    ?.filter((card: any) => card?.id && card?.storeName)
                    .map((card: any) => (
                      <Grid item xs={12} md={4} lg={4} key={card.id}>
                        <BlankCard>
                        <div style={{ position: "relative" }}>
                            <Avatar
                              src={card.logo}
                              variant="square"
                              sx={{ height: 170, width: "100%" }}
                            />
                          </div>
                          <CardContent sx={{ p: 3, pt: 2 }}>
                            <Typography variant="h6">
                              {card.storeName}
                            </Typography>
                            <p>
                              <strong>Tags:</strong>{" "}
                              {Array.isArray(card.tags)
                                ? card.tags.join(", ")
                                : "No tags available"}
                            </p>
                            <div
                              style={{
                                display: "flex",
                                gap: "10px",
                                justifyContent: "flex-end",
                              }}
                            >
                              <IconButton
                                aria-label="edit"
                                onClick={() => handleEditCard(card)}
                                style={{ color: "green" }}
                              >
                                <EditOutlined />
                              </IconButton>
                              <IconButton
                                aria-label="delete"
                                onClick={() => handleDeleteCard(card.id)}
                                style={{ color: "red" }}
                              >
                                <DeleteOutlined />
                              </IconButton>
                            </div>
                          </CardContent>
                        </BlankCard>
                      </Grid>
                    ))}

                {selectedNestedCard.title === "Dine" &&
                  selectedNestedCard?.cards &&
                  Object.values(selectedNestedCard?.cards)
                    ?.filter((card: any) => card?.id && card?.storeName)
                    .map((card: any, index: any) => (
                      <Grid item xs={12} md={4} lg={4} key={card.id + index}>
                        <BlankCard>
                        <div style={{ position: "relative" }}>
                            <Avatar
                              src={card.logo}
                              variant="square"
                              sx={{ height: 170, width: "100%" }}
                            />
                          </div>
                          <CardContent sx={{ p: 3, pt: 2 }}>
                            <Typography variant="h6">
                              {card.storeName}
                            </Typography>
                            <p>
                              <strong>Tags:</strong>{" "}
                              {Array.isArray(card.tags)
                                ? card.tags.join(", ")
                                : "No tags available"}
                            </p>
                            <div
                              style={{
                                display: "flex",
                                gap: "10px",
                                justifyContent: "flex-end",
                              }}
                            >
                              <IconButton
                                aria-label="edit"
                                onClick={() => handleEditCard(card)}
                                style={{ color: "green" }}
                              >
                                <EditOutlined />
                              </IconButton>
                              <IconButton
                                aria-label="delete"
                                onClick={() => handleDeleteCard(card.id)}
                                style={{ color: "red" }}
                              >
                                <DeleteOutlined />
                              </IconButton>
                            </div>
                          </CardContent>
                        </BlankCard>
                      </Grid>
                    ))}
                {selectedNestedCard.title === "Services" &&
                  selectedNestedCard?.cards &&
                  Object.values(selectedNestedCard?.cards)
                    ?.filter((card: any) => card?.id && card?.storeName)
                    .map((card: any, index: number) => (
                      <Grid item xs={12} md={4} lg={4} key={card.id + index}>
                        <BlankCard>
                        <div style={{ position: "relative" }}>
                            <Avatar
                              src={card.logo}
                              variant="square"
                              sx={{ height: 170, width: "100%" }}
                            />
                          </div>
                          <CardContent sx={{ p: 3, pt: 2 }}>
                            <Typography variant="h6">
                              {card.storeName}
                            </Typography>
                            <p>
                              <strong>Tags:</strong>{" "}
                              {Array.isArray(card.tags)
                                ? card.tags.join(", ")
                                : "No tags available"}
                            </p>
                            <div
                              style={{
                                display: "flex",
                                gap: "10px",
                                justifyContent: "flex-end",
                              }}
                            >
                              <IconButton
                                aria-label="edit"
                                onClick={() => handleEditCard(card)}
                                style={{ color: "green" }}
                              >
                                <EditOutlined />
                              </IconButton>
                              <IconButton
                                aria-label="delete"
                                onClick={() => handleDeleteCard(card.id)}
                                style={{ color: "red" }}
                              >
                                <DeleteOutlined />
                              </IconButton>
                            </div>
                          </CardContent>
                        </BlankCard>
                      </Grid>
                    ))}
              </Grid>
            </div>
          ) : (
            <div>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 3 }}
              >
                <Link href="/components/mall-map" passHref>
                  <IconButton aria-label="back">
                    <ArrowLeftOutlined
                      style={{ fontSize: "24px", color: "primary" }}
                    />
                  </IconButton>
                </Link>
                <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
                  Mall Map
                </Typography>
              </Stack>

              <Grid container spacing={3}>
                {mallMapPageCards.map((card, index) => (
                  <Grid item xs={12} md={4} lg={4} key={card.id + index}>
                    <BlankCard
                      onClick={() => handleCardClick(card)}
                      style={{
                        backgroundImage: `url(${card.backgroundImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        height: "200px",
                      }}
                    >
                      <CardContent sx={{ p: 3, pt: 2 }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="h6">{card.title}</Typography>
                        </Stack>
                      </CardContent>
                    </BlankCard>
                  </Grid>
                ))}
              </Grid>
            </div>
          )}
        </div>
      </DashboardCard>

      {/* Modal for adding/editing cards */}
      <Modal
        title={isEditMode ? "Edit Store" : "Add New Store"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} onFinish={handleSaveDynamicCard}>
          <Form.Item
            label="Store Name"
            name="storeName"
            rules={[{ required: true, message: "Please input store name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Cloud Pano Scene ID"
            name="cloudPanoSceneID"
            rules={[
              { required: true, message: "Please input cloud pano scene ID!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Attach 2D Map (Image iFile only)"
            name="map2D"
            valuePropName="file"
            rules={[
              { required: !isEditMode, message: "Please attach 2D map!" }, // Not required when editing if not changing
              {
                validator(_, value) {
                  if (
                    value &&
                    ![
                      "image/png",
                      "image/jpeg",
                      "image/jpg",
                      "image/gif",
                      "image/webp",
                    ].includes(value.file.type)
                  ) {
                    return Promise.reject(
                      new Error("Only PNG files are allowed for 2D map!")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Click to Upload 2D Map</Button>
            </Upload>
          </Form.Item>

          {editingCard && editingCard.map2D && (
            <Collapse
              bordered={false}
              defaultActiveKey={[]}
              expandIcon={({ isActive }) => (
                <CaretRightOutlined rotate={isActive ? 90 : 0} />
              )}
            >
              <Panel header="2D Map Preview" key="1">
                <Image
                  src={editingCard.map2D}
                  alt={`2D Map file Preview`}
                  width={300}
                  height={300}
                />
              </Panel>
            </Collapse>
          )}

          <Form.Item
            label="Tags"
            name="tags"
            rules={[{ required: true, message: "Please add tags!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Upload Logo" name="logo">
            <Upload
              listType="picture"
              fileList={fileList}
              onChange={handleChangeLogo}
              showUploadList={{
                showPreviewIcon: true,
                showRemoveIcon: true,
              }}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />} block>
                Upload Logo
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" disabled={isLoading}>
              {isEditMode ? "Save Changes" : "Save"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default MallMapPage;
