// pages/index.js (or wherever your HomePage is)

import Onboarding from "./stepper/Stepper";
import CategoryPage from "./category/page";
export default function HomePage() {
 

  return (
    <div >
      <CategoryPage/>
      {/* <Onboarding/> */}
      {/* <BusinessCard business={data.business} />
      <PhotosComponent/> */}
    </div>
  );
}