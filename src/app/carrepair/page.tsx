import React from 'react'
import BusinessCard from '@/carservice/businessdetails'
import PhotosComponent from "@/carservice/PhotosComponent";
import data from "@/data/business.json";
const page = () => {

  // Check if data.business exists
  if (!data || !data.business) {
    return <div>Error: Business data is missing or invalid</div>;
  }

  return (
    <div className='p-2'>
       <BusinessCard business={data.business} />
      <PhotosComponent/>
    </div>
  )
}

export default page
