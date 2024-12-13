import { Icon } from "@mui/material";
import {
  IconLayoutDashboard,
  IconHome,
  IconShoppingBag,
  IconMap,
  IconDiscount,
  IconSoccerField,
  IconLayoutBottombar,
  IconActivity,
  IconNavigation,
  IconTemperature,
} from "@tabler/icons-react";

import { uniqueId } from "lodash";

const Menuitems = [
  {
    najvlabel: true,
    subheader: "Components",
  },
  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/",
  },
  {
    id: uniqueId(),
    title: "Home",
    icon: IconHome,
    href: "/components/pages",
  },
  {
    id: uniqueId(),
    title: "Shop & Dine",
    icon: IconShoppingBag,
    href: "/components/shop-and-dine",
  },
  {
    id: uniqueId(),
    title: "Promos and Events",
    icon: IconDiscount,
    href: "/components/promos-and-events",
  },
  {
    id: uniqueId(),
    title: "Activities",
    icon: IconActivity,
    href: "/components/activities",
  },
  {
    id: uniqueId(),
    title: "Aboitiz Pitch",
    icon: IconSoccerField,
    href: "/components/aboitiz-pitch",
  },
  {
    najvlabel: true,
    subheader: "Maps",
  },
  {
    id: uniqueId(),
    title: "Mall Map",
    icon: IconMap,
    href: "/components/mall-map",
  },
  {
    id: uniqueId(),
    title: "Routes",
    icon: IconNavigation,
    href: "/components/routes",
  },
  {
    id: uniqueId(),
    title: "Heat Map",
    icon: IconTemperature,
    href: "/components/heatmap",
  },
  {
    najvlabel: true,
    subheader: "Settings",
  },
  {
    id: uniqueId(),
    title: "Footer",
    icon: IconLayoutBottombar,
    href: "/components/footer",
  },
];

export default Menuitems;
