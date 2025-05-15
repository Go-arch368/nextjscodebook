// pages/index.js (or wherever your HomePage is)

import Onboarding from "./stepper/Stepper";
export default function HomePage() {
 

  return (
    <div >
      <Onboarding/>
      {/* <BusinessCard business={data.business} />
      <PhotosComponent/> */}
    </div>
  );
}