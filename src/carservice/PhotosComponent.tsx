"use client";

import React from "react";
import {
  Phone,
  MessageSquare,
  MessageCircle,
  Edit,
  Share2,
  CloudUpload
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
    customer_reviews,
    key_insights,
    reviews_ratings,
    userReviews,
    listingCategories,
    
  } = data;

  const [hoverIndex, setHoverIndex] = React.useState(-1);

  
  const reviewPeople = {
    user: {
      name: "Akshay Doshi",
      review_count: 15,
      follower_count: 785
    },
    date: "06 Apr",
    location: "Kasavanahalli Sarjapur Bangalore",
    title: "Inefficient service",
    tags: [
      "Inefficient service",
      "Unsupportive assistance"
    ],
    content: "This is at the Kasavanahalli Sarjapur Bangalore location. The car after delivery has started giving jerking sound when we press the accelerator. I connected with the customer service and the shop manager. There has been complete radio silence from them. Also the shop manager shared a 50k estimate of probable replacement and service charges which I refused completely...pls avoid them",
    actions: [
      "Helpful",
      "Comment",
      "Share"
    ],
    sentiment: "negative",
    rating: 1
  };

  return (
    <div>
          <div className="mt-4">
  <ul className="flex flex-wrap gap-4">
    {business.information && Array.isArray(business.information) ? (
      business.information.map((info, index) => (
        <li key={index} className={`font-medium text-lg p-2 ${info === "Overview" ? 'text-blue-500' : ''}`}>
          {info}
        </li>
      ))
    ) : (
      <li className="font-bold text-lg">No information available</li>
    )}
  </ul>
     </div>
    <div className="flex">
    <div className="w-full p-4 border-2 mt-3 rounded-sm bg-gray-10 shadow-md">


        <h1 className="text-2xl font-bold mb-4">Photos</h1>
        <div className="flex gap-2 w-full">
          {photos?.map((photo, index) => (
            <div key={index} className="flex-1">
              <img
                src={photo.image}
                alt={photo.description}
                className="w-66 h-34 object-cover rounded-lg shadow hover:shadow-lg transition-shadow"
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-start">
         <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
  <CloudUpload className="w-5 h-5" />
  Upload Photos
</button>

        </div>

        <hr className="my-6 border-gray-300" />

        <div>
          <h2 className="text-2xl font-bold mb-5">Price List</h2>
          <div className="grid grid-cols-3 gap-4">
            {price_list?.map((price, index) => (
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
            {customer_reviews?.map((review, index) => (
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

        {key_insights && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4">{key_insights.section_title}</h2>
            <div className="bg-blue-200 p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="bg-white p-4 rounded-xl shadow-md w-full md:w-1/2">
                  <h3 className="text-lg font-semibold mb-2">{key_insights.what_users_liked.title}</h3>
                  <ul className="list-disc list-inside text-gray-700">
                    {key_insights.what_users_liked.points.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-md w-full md:w-1/2">
                  <h3 className="text-lg font-semibold mb-2">{key_insights.what_can_be_improved.title}</h3>
                  <ul className="list-disc list-inside text-gray-700">
                    {key_insights.what_can_be_improved.points.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="text-xs text-gray-600 italic mt-4 text-center">
                {key_insights.disclaimer}
              </p>
            </div>
          </div>
        )}

        <hr className="my-6 border-gray-300" />

        {reviews_ratings && (
          <div className="p-4 border rounded-lg shadow-md bg-yellow-50 mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {reviews_ratings.title}
            </h3>
            <div className="flex items-center text-yellow-600 mb-2">
              <span className="text-2xl font-semibold mr-2">{reviews_ratings.rating}</span>
              <span className="text-lg text-gray-600">
                ({reviews_ratings.total_ratings} ratings)
              </span>
            </div>
            <p className="text-lg text-gray-700 mb-6">{reviews_ratings.description}</p>

            <div className="flex justify-start mt-12 gap-1.5">
              {[0, 1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className={`border border-gray-300 rounded-md p-4 w-9 h-9 flex items-center justify-center cursor-pointer transition-all duration-200 ${
                    index <= hoverIndex ? "bg-yellow-400 text-white border-yellow-400" : "text-gray-400"
                  }`}
                  onMouseEnter={() => setHoverIndex(index)}
                  onMouseLeave={() => setHoverIndex(-1)}
                >
                  {index <= hoverIndex ? "★" : "☆"}
                </div>
              ))}
            </div>

            <h1 className="text-xl px-4 py-2 rounded text-gray-900">
              {reviews_ratings.button_text}
            </h1>

            <div className="mt-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {userReviews.title}
              </h3>

              <div className="flex gap-4 mb-6">
                {userReviews.sortOrder.map((option, index) => (
                  <button
                    key={index}
                    className="text-gray-600 px-4 py-2 rounded bg-yellow-100 hover:bg-yellow-200"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Review Highlights
              </h3>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="bg-white px-4 py-2 rounded-full border border-gray-200 flex items-center">
                  <span className="mr-2">Short wait time</span>
                  <span className="text-yellow-500">(5)</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-full border border-gray-200 flex items-center">
                  <span className="mr-2">Quick booking</span>
                  <span className="text-yellow-500">(5)</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-full border border-gray-200 flex items-center">
                  <span className="mr-2">Quick service</span>
                  <span className="text-yellow-500">(4)</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-full border border-gray-200 flex items-center">
                  <span className="mr-2">Inefficient service</span>
                  <span className="text-yellow-500">(4)</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-full border border-gray-200 flex items-center">
                  <span className="mr-2">Hassle-free experience</span>
                  <span className="text-yellow-500">(3)</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-full border border-gray-200 flex items-center">
                  <span className="mr-2">Long wait time</span>
                  <span className="text-yellow-500">(3)</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-full border border-gray-200 flex items-center">
                  <span className="mr-2">Reasonably priced</span>
                  <span className="text-yellow-500">(3)</span>
                </div>
              </div>
            </div>

         
            {data.reviewPeople && data.reviewPeople.map((review, index) => (
              <div key={index} className="p-4 mb-6 border rounded shadow bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold text-gray-800">{review.user.name}</h4>
                  <span className="text-sm text-gray-500">{review.date}</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{review.location}</p>
                <h5 className="text-md font-bold text-red-600">{review.title}</h5>
                <div className="flex flex-wrap gap-2 my-2">
                  {review.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 mb-3">{review.content}</p>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className={`font-semibold ${review.sentiment === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {review.sentiment.charAt(0).toUpperCase() + review.sentiment.slice(1)}
                  </span>
                  <span className="text-yellow-500 font-bold">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                </div>
                <div className="flex gap-4 mt-2 text-sm text-blue-600">
                  {review.actions.map((action, idx) => (
                    <button key={idx} className="hover:underline">{action}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-2/5 p-4 bg-white  border-gray-200 rounded-lg mt-1">
        <div className="mb-6 p-4 border rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Contact</h3>
          <p className="text-sm text-gray-600">
            Phone: {general_contact.phone}
          </p>
          <p className="text-sm text-gray-600">Address: {address}</p>
          <p className="text-sm text-gray-600">
            Hours: {business.hours_summary}
          </p>
          <p className="text-xs text-gray-500 mb-4">{business.hours.note}</p>
       
          <h3 className="text-lg font-semibold mb-6">Actions</h3>
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

        <div className="mt-6 bg-white p-4 border rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Also Listed In</h3>
          <div className="flex flex-col gap-2">
            {listingCategories.map((category, index) => (
              <div
                key={index}
                className="inline-block border border-gray-300 rounded-full px-2 py-1"
              >
                <p className="text-sm text-gray-700">{category}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}