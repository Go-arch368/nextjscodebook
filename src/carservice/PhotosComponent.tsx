import React from "react";
import { Phone, MessageSquare, MessageCircle, Edit, Share2 } from "lucide-react";
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
  } = data;

  return (
    <div className="flex">
      <div className="w-full p-4">
        {/* Photos Section */}
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

        {/* Divider */}
        <hr className="my-6 border-gray-300" />

        {/* Price List */}
        <div>
          <h2 className="text-2xl font-bold mb-5">Price List</h2>
          <div className="grid grid-cols-3 gap-4">
            {price_list &&
              price_list.map((price, index) => (
                <div key={index} className="border p-4 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold">{price.service}</h3>
                  <p className="text-base text-gray-600">{price.description}</p>
                  <p className="text-xl font-bold text-black mt-2">{price.price}</p>
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

        {/* Quick Information */}
        <div className="mt-10 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-5">Quick Information</h2>
          {Quick_Information &&
            Quick_Information.map((info, index) => (
              <div key={index} className="mb-6">
                <h4 className="text-lg font-semibold">{info.Qname}</h4>
                <p className="text-base text-gray-700 mb-3">{info.Qdescription}</p>
                <h4 className="text-lg font-semibold">{info.Qestablished}</h4>
                <p className="text-base text-gray-700">{info.Qestablished_year}</p>
              </div>
            ))}


  <hr className="my-6 border-gray-300" />
          {/* Services Section */}
          <div className="mt-8">
          
            {Services &&
              Services.map((service, index) => (
                <div key={index} className="mb-4">
                  <h2 className="text-2xl font-bold mb-4">{service.sname}</h2>
                  <ul className="list-disc list-inside text-base text-gray-700 mt-2 space-y-1">
                    <li>{service.sdata1}</li>
                    <li>{service.sdata2}</li>
                  </ul>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Right Section: Contact & Actions */}
      <div className="w-1/3 p-4 bg-white border-l-2 border-gray-200 rounded-lg">
        {/* Contact Section */}
        <div className="mb-6 p-4 border rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Contact</h3>
          <p className="text-sm text-gray-600">Phone: {general_contact.phone}</p>
          <p className="text-sm text-gray-600">Address: {address}</p>
          <p className="text-sm text-gray-600">Hours: {business.hours_summary}</p>
          <p className="text-xs text-gray-500">{business.hours.note}</p>
        </div>

        {/* Actions Section */}
        <div className="p-4 border rounded-lg shadow-md">
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





      </div>
    </div>
  );
}
