// pages/index.js (or wherever your HomePage is)
import BusinessCard from "@/carservice/businessdetails";
import data from "@/data/business.json"; // Adjust the path based on your structure
import PhotosComponent from "@/carservice/PhotosComponent";
import Onboarding from "./stepper/Stepper";
export default function HomePage() {
  // Log the data to debug
  console.log("Data loaded:", data);

  // Check if data.business exists
  if (!data || !data.business) {
    return <div>Error: Business data is missing or invalid</div>;
  }

  return (
    <div >
      <Onboarding/>
      {/* <BusinessCard business={data.business} />
      <PhotosComponent/> */}
    </div>
  );
}