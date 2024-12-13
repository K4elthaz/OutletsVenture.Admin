export const landingPageVideoURL = "Home/Landing Page/Video URL";
export const landingPageCarousel1 = "Home/Landing Page/Carousel 1";
export const landingPageCarousel2 = "Home/Landing Page/Carousel 2";
export const landingPageSlideShow = "Home/Landing Page/Slideshow 1";
export const landingPageGallery = "Home/Landing Page/Gallery";
export const homePageCarousel1 = "Home/Home Page/Carousel 1";
export const homePageSlideShow = "Home/Home Page/Slideshow 1";
export const homePageGallery = "Home/Home Page/Gallery";
export const mallPromenadeMap = "Map/Mall/Promenade Shops";
export const mallPlazaMap = "Map/Mall/Plaza";
export const mallParkadeMap = "Map/Mall/Parkade";
export const mallLoopMap = "Map/Mall/Loop";
export const mallFlavorsMap = "Map/Mall/Flavors";
export const mallAboitizMap = "Map/Mall/AboitizPitch";
export const mallFood = "Food";
export const mallShop = "Shop";
export const mallService = "Service";
export const disasterHarazardMap = "Map/Disaster/Hazard";
export const disasterEmergencyMap = "Map/Disaster/Emergency";
export const disasterEarthquakeMap = "Map/Disaster/Earthquake";
export const AboitizPitchRef = "AboitizPitch";
export const ActivityRef = "ActivityRef";

export const landingPageCarousel1PhotoRef = (id: number, name: string) => {
  return `${landingPageCarousel1}/${id}/${name}`;
};

export const landingPageCarousel2PhotoRef = (id: number, name: string) => {
  return `${landingPageCarousel2}/${id}/${name}`;
};

export const landingPageSlideShowRef = (id: number, name: string) => {
  return `${landingPageSlideShow}/${id}/${name}`;
};

export const landingPageGalleryRef = (id: number, name: string) => {
  return `${landingPageGallery}/${id}/${name}`;
};

export const homePageCarousel1PhotoRef = (id: number, name: string) => {
  return `${homePageCarousel1}/${id}/${name}`;
};

export const homePageSlideShowPhotoRef = (id: number, name: string) => {
  return `${homePageSlideShow}/${id}/${name}`;
};

export const homePageGalleryRef = (id: number, name: string) => {
  return `${homePageGallery}/${id}/${name}`;
};
