import React from "react";
import {
  Phone,
  MessageSquare,
  MessageCircle,
  Edit,
  Share2,
} from "lucide-react";
import data from "@/data/business.json";

export default function PhotosComponent() {
  const {
    photos,
    business,
    actions,
    address,
    general_contact,
    price_list,
    Quick_Information,
    Services,
    customer_reviews,
    key_insights
  } = data;

  return (
    <div className="flex">
      <div className="w-full p-4">
        
        <h1 className="text-2xl font-bold mb-4">Photos</h1>
        <div className="flex gap-2 w-full">
          {photos.map((photo, index) => (
            <div key={index} className="flex-1">
              <img
                src={photo.image}
                alt={photo.description}
                className="w-full h-32 object-cover rounded-lg shadow hover:shadow-lg transition-shadow"
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-start">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            Upload Photos
          </button>
        </div>

        <hr className="my-6 border-gray-300" />

        
        <div>
          <h2 className="text-2xl font-bold mb-5">Price List</h2>
          <div className="grid grid-cols-3 gap-4">
            {price_list &&
              price_list.map((price, index) => (
                <div key={index} className="border p-4 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold">{price.service}</h3>
                  <p className="text-base text-gray-600">{price.description}</p>
                  <p className="text-xl font-bold text-black mt-2">
                    {price.price}
                  </p>
                  <div className="mt-4">
                    <button className="text-sm text-blue-500 hover:text-blue-600">
                      {price.details_link}
                    </button>
                  </div>
                  <div className="mt-4">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                      {price.button}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <hr className="my-6 border-gray-300" />

       
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
          <div className="flex gap-6">
            {customer_reviews &&
              customer_reviews.map((review, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg shadow-sm bg-gray-50 w-1/3"
                >
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{review.source}</span>
                    <span>{review.time}</span>
                  </div>
                  <h4 className="text-lg font-semibold mb-1">{review.name}</h4>
                  <p className="text-gray-700">{review.feedback}</p>
                </div>
              ))}
          </div>
        </div>

{data.key_insights && (

  <div className="mt-10">
    <h2 className="text-2xl font-bold mb-4">{data.key_insights.section_title}</h2>
<div className="bg-blue-200 p-6">
  <div className="flex flex-col md:flex-row gap-6">
    {/* What users liked */}
    <div className="bg-white p-4 rounded-xl shadow-md w-full md:w-1/2">
      <h3 className="text-lg font-semibold mb-2">{data.key_insights.what_users_liked.title}</h3>
      <ul className="list-disc list-inside text-gray-700">
        {data.key_insights.what_users_liked.points.map((point, index) => (
          <li key={index}>{point}</li>
        ))}
      </ul>
    </div>

    {/* What can be improved */}
    <div className="bg-white p-4 rounded-xl shadow-md w-full md:w-1/2">
      <h3 className="text-lg font-semibold mb-2">{data.key_insights.what_can_be_improved.title}</h3>
      <ul className="list-disc list-inside text-gray-700">
        {data.key_insights.what_can_be_improved.points.map((point, index) => (
          <li key={index}>{point}</li>
        ))}
      </ul>
    </div>
  </div>

  {/* Disclaimer at the bottom */}
  <p className="text-xs text-gray-600 italic mt-4 text-center">
    {data.key_insights.disclaimer}
  </p>
</div>

  </div>
)}

   <hr className="my-6 border-gray-300" />

      </div>

      

      <div className="w-1/3 p-4 bg-white border-l-2 border-gray-200 rounded-lg">
  
        <div className="mb-6 p-4 border rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Contact</h3>
          <p className="text-sm text-gray-600">
            Phone: {general_contact.phone}
          </p>
          <p className="text-sm text-gray-600">Address: {address}</p>
          <p className="text-sm text-gray-600">
            Hours: {business.hours_summary}
          </p>
          <p className="text-xs text-gray-500">{business.hours.note}</p>
        </div>

        <div className="p-4 border rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-2">Actions</h3>
          <div className="flex flex-col gap-2">
            {actions.map((action, index) => (
              <button
                key={index}
                className="flex items-center gap-2 p-2 text-sm text-blue-500 rounded-lg hover:bg-gray-100"
              >
                {action.icon === "directions" && <Edit size={16} />}
                {action.icon === "copy" && <Edit size={16} />}
                {action.icon === "edit" && <Edit size={16} />}
                {action.icon === "email" && <MessageSquare size={16} />}
                {action.icon === "message" && <MessageCircle size={16} />}
                {action.icon === "share-2" && <Share2 size={16} />}
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Car Repair Form */}
        <div className="p-4 border rounded-lg shadow-md bg-white">
          <h2 className="text-2xl font-bold mb-4">
            Get the List of <span className="text-blue-600">Car Repair</span>
          </h2>
          <p className="text-gray-700 mb-6">
            We'll send you contact details in seconds{" "}
            <span className="font-semibold">for free</span>
          </p>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What kind of Assistance do you need?
              </label>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="assistance"
                    value="Servicing"
                    className="mr-2"
                  />
                  Servicing
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="assistance"
                    value="Repair"
                    className="mr-2"
                  />
                  Repair
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <input
                type="text"
                name="mobile"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your mobile number"
              />
            </div>

            <div className="mt-4">
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
