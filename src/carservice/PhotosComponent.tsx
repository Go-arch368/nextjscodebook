"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Phone,
  MessageSquare,
  MessageCircle,
  Edit,
  Share2,
  CloudUpload,
  Check,
  ThumbsUp,
  ChartSpline,
  Star,
  ThumbsDown,
  CircleArrowRight,
  Copy,
  Clock,
  Pencil,
  Mail,
  TabletSmartphone,
  GlobeLock,
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
    Quick_Information,
    review,
    Services,
  } = data;

  const [hoverIndex, setHoverIndex] = useState(-1);
  const [isFormFixed, setIsFormFixed] = useState(false);
  const reportErrorRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const debounce = (func: (...args: any[]) => void, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };


  useEffect(() => {
    const handleScroll = () => {
      if (reportErrorRef.current && formRef.current) {
        const reportErrorRect = reportErrorRef.current.getBoundingClientRect();
        const formRect = formRef.current.getBoundingClientRect();
        
        // When the bottom of the "Report an error" section reaches the top of the viewport
        if (reportErrorRect.bottom <= 0 && !isFormFixed) {
          setIsFormFixed(true);
        } else if (reportErrorRect.bottom > 0 && isFormFixed) {
          setIsFormFixed(false);
        }
      }
    };

    const debouncedHandleScroll = debounce(handleScroll, 50);
    window.addEventListener("scroll", debouncedHandleScroll);
    return () => window.removeEventListener("scroll", debouncedHandleScroll);
  }, [isFormFixed]);

 

  return (
    <div>
     
      <div className="mt-4">
        <ul className="flex flex-wrap gap-4">
          {business.information && Array.isArray(business.information) ? (
            business.information.map((info, index) => (
              <li
                key={index}
                className={`font-medium text-lg p-2 ${
                  info === "Overview" ? "text-blue-500" : ""
                }`}
              >
                {info}
              </li>
            ))
          ) : (
            <li className="font-bold text-lg">No information available</li>
          )}
        </ul>
      </div>

      
      <div className="flex">
      
        <div className="w-3/4 p-4 border-2 mt-3 rounded-sm bg-gray-10 shadow-md">
      
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {price_list?.map((price, index) => (
                <div
                  key={index}
                  className="border p-6 rounded-xl shadow-md bg-white max-w-[500px] h-70 w-full mx-auto"
                >
                  <h3 className="text-lg font-semibold mb-1">{price.service}</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {price.description}
                  </p>
                  <p className="text-xl font-bold text-black mb-4">
                    {price.price}
                  </p>
                  {price.details_link && (
                    <button className="text-sm text-blue-500 hover:text-blue-600 mb-4 underline">
                      {price.details_link}
                    </button>
                  )}
                  <button className="w-full bg-white text-blue-600 px-4 py-1 rounded border-2 border-blue-200 hover:bg-blue-600 hover:text-white transition duration-200">
                    {price.button}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <hr className="my-6 border-gray-300" />

     
          <div className="p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-5">Quick Information</h2>
            {Quick_Information &&
              Quick_Information.map((info, index) => (
                <div key={index} className="mb-6">
                  <h4 className="text-lg text-gray-400 font-sm">{info.Qname}</h4>
                  <p className="text-base text-gray-700 mt-4 mb-4 font-semibold">
                    {info.Qdescription}
                  </p>
                  <h4 className="text-lg text-gray-400">{info.Qestablished}</h4>
                  <p className="text-base text-gray-700 font-semibold">
                    {info.Qestablished_year}
                  </p>
                </div>
              ))}
          </div>

          <hr className="border-gray-300" />

        
          <div className="mt-8 px-5">
            {Services &&
              Services.map((service, index) => (
                <div key={index} className="mb-4">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Check />
                    {service.sname}
                  </h2>
                  <ul className="list-disc list-inside text-base text-gray-700 mt-2 px-6 space-y-1">
                    <p className="underline">{service.sdata1}</p>
                    <p className="underline">{service.sdata2}</p>
                  </ul>
                </div>
              ))}
          </div>

          <hr className="border-gray-300" />

       
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-4">Our Happy Customers</h2>
            <div className="flex gap-6">
              {customer_reviews?.slice(0, 3).map((review, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg shadow-sm bg-gray-50 w-1/3"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={"/default-avatar.png"}
                      alt={review.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <h4 className="text-lg font-semibold">{review.name}</h4>
                  </div>
                  <p className="text-gray-700 mb-2">{review.feedback}</p>
                  <div className="text-sm text-gray-600">
                    <span>{review.source}</span> • <span>{review.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

         
          {key_insights && (
            <div className="mt-10">
              <h2 className="text-2xl font-bold mb-4">
                {key_insights.section_title}
              </h2>
              <div className="bg-blue-200 p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="bg-white p-4 rounded-xl shadow-md w-full md:w-1/2">
                    <h3 className="flex items-center text-lg font-semibold mb-2 text-green-600">
                      <ThumbsUp className="mr-2" />
                      {key_insights.what_users_liked.title}
                    </h3>
                    <ul className="list-disc list-inside text-gray-700">
                      {key_insights.what_users_liked.points.map(
                        (point, index) => (
                          <li key={index}>{point}</li>
                        )
                      )}
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-md w-full md:w-1/2">
                    <h3 className="flex items-center text-lg font-semibold mb-2 text-red-600">
                      <ChartSpline className="mr-2" />
                      {key_insights.what_can_be_improved.title}
                    </h3>
                    <ul className="list-disc list-inside text-gray-700">
                      {key_insights.what_can_be_improved.points.map(
                        (point, index) => (
                          <li key={index}>{point}</li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
                <p className="text-xs text-gray-600 italic mt-4 text-center mr-70">
                  {key_insights.disclaimer}
                </p>
              </div>
            </div>
          )}

          <hr className="my-6 border-gray-300" />

          {reviews_ratings && (
            <div className="p-4 border rounded-lg shadow-md mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {reviews_ratings.title}
              </h3>
              <div className="flex items-center text-yellow-600 mb-2">
                <span className="bg-green-700 text-white text-3xl font-semibold mr-2 px-3 py-4 rounded-xl">
                  {reviews_ratings.rating}
                </span>
                <span className="text-lg text-gray-600 -mt-5 font-bold">
                  {reviews_ratings.total_ratings} ratings
                </span>
                <p className="text-lg text-gray-700 mt-10 -ml-24">
                  {reviews_ratings.description}
                </p>
              </div>
              <h1 className="text-2xl px-4 py-2 mt-20 mb-2 rounded text-gray-900 font-semibold">
                {reviews_ratings.button_text}
              </h1>
              <div className="flex justify-start gap-1.5">
                {[0, 1, 2, 3, 4].map((index) => (
                  <div
                    key={index}
                    className={`border border-gray-300 rounded-md p-4 w-9 h-9 flex items-center justify-center cursor-pointer transition-all duration-200 ${
                      index <= hoverIndex
                        ? "bg-yellow-400 text-white border-yellow-400"
                        : "text-gray-400"
                    }`}
                    onMouseEnter={() => setHoverIndex(index)}
                    onMouseLeave={() => setHoverIndex(-1)}
                  >
                    {index <= hoverIndex ? "★" : "☆"}
                  </div>
                ))}
              </div>
              <div className="">
                <h3 className="text-2xl px-4 py-2 mt-20 mb-2 rounded text-gray-900 font-semibold -ml-2">
                  {review.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {review.ratings.map((rating, index) => (
                    <span
                      key={index}
                      className="flex items-center bg-white border-2 text-sm font-medium px-7 py-1 rounded-xl mr-2"
                    >
                      {rating}{" "}
                      <Star className="w-4 h-4 mr-2 fill-yellow-500 text-yellow-500" />
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-8">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
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
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Review Highlights
                </h3>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="bg-gray-100 px-4 rounded-full border border-gray-200 flex items-center">
                    <span className="mr-2">Short wait time</span>
                    <span className="">(5)</span>
                  </div>
                  <div className="bg-gray-200 px-4 py-2 rounded-full border border-gray-200 flex items-center">
                    <span className="mr-2">Quick booking</span>
                    <span>(5)</span>
                  </div>
                  <div className="bg-gray-200 px-4 py-2 rounded-full border border-gray-200 flex items-center">
                    <span className="mr-2">Quick service</span>
                    <span>(4)</span>
                  </div>
                  <div className="bg-gray-200 px-4 py-2 rounded-full border border-gray-200 flex items-center">
                    <span className="mr-2">Inefficient service</span>
                    <span>(4)</span>
                  </div>
                  <div className="bg-gray-200 px-4 py-2 rounded-full border border-gray-200 flex items-center">
                    <span className="mr-2">Hassle-free experience</span>
                    <span>(3)</span>
                  </div>
                  <div className="bg-gray-200 px-4 py-2 rounded-full border border-gray-200 flex items-center">
                    <span className="mr-2">Long wait time</span>
                    <span>(3)</span>
                  </div>
                  <div className="bg-gray-200 px-4 py-2 rounded-full border border-gray-200 flex items-center">
                    <span className="mr-2">Reasonably priced</span>
                    <span>(3)</span>
                  </div>
                </div>
              </div>
              {data.reviewPeople &&
                data.reviewPeople.map((review, index) => (
                  <div key={index} className="p-4 mb-6">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-3">
                        <img
                          src={"/default-avatar.png"}
                          alt="user"
                          width={55}
                          height={50}
                          className="border-2 rounded-sm"
                        />
                        <h4 className="text-lg font-semibold text-gray-800">
                          {review.user.name}
                        </h4>
                      </div>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                    <span className="text-yellow-500 font-bold text-sm ml-2 p-2 flex">
                      {Array(review.rating)
                        .fill(0)
                        .map((_, i) => (
                          <Star
                            key={`filled-${i}`}
                            className="text-yellow-500 w-6 h-6"
                          />
                        ))}
                      {Array(5 - review.rating)
                        .fill(0)
                        .map((_, i) => (
                          <Star
                            key={`empty-${i}`}
                            className="text-gray-300 w-6 h-6"
                          />
                        ))}
                    </span>
                    <div className="flex flex-wrap gap-2 my-2">
                      {review.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm text-gray-700"
                        >
                          <ThumbsDown className="w-4 h-4 text-red-500" />
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-700 mt-2">{review.content}</p>
                    <div className="flex gap-4 mt-2 text-sm text-blue-600">
                      {review.actions.map((action, idx) => {
                        let Icon;
                        switch (action.toLowerCase()) {
                          case "helpful":
                            Icon = ThumbsUp;
                            break;
                          case "comment":
                            Icon = MessageCircle;
                            break;
                          case "share":
                            Icon = Share2;
                            break;
                          default:
                            Icon = null;
                        }
                        return (
                          <button
                            key={idx}
                            className="flex items-center gap-1 hover:underline text-md text-black"
                          >
                            {Icon && <Icon className="w-5 h-5" />}
                            {action}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>


        <div className="w-1/4 p-4 bg-white border-gray-200 rounded-lg mt-1">
          <style>
            {`
              .fixed-form {
                position: fixed;
                top: 20px;
                width: calc(25% - 32px); /* Adjust width to match sidebar */
                transition: transform 0.2s ease;
                z-index: 10;
              }
            `}
          </style>

          <div className="mb-6 p-4 border rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold mt-2 mb-2">Contact</h3>
            <p className="text-lg text-blue-600 mb-5 flex items-center gap-2 ml-3 mt-5 font-semibold">
              <Phone
                className="w-5 h-5"
                style={{ animation: "shake 2.5s infinite" }}
              />
              {general_contact.phone}
              <style>
                {`
                  @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20%, 60% { transform: translateX(-4px); }
                    40%, 80% { transform: translateX(4px); }
                  }
                `}
              </style>
            </p>
            <hr className="bg-gray-400 border-1" />
            <h1 className="font-semibold p-2 text-2xl -ml-1">Address</h1>
            <p className="text-md text-black mt-2 ml-2">{address}</p>
            <div className="flex justify-around text-blue-600 text-lg mt-5 mb-5">
              <h1 className="flex items-center gap-1">
                <CircleArrowRight className="w-4 h-4" />
                Get Directions
              </h1>
              <h1 className="flex items-center gap-1">
                <Copy className="w-4 h-4" />
                Copy
              </h1>
            </div>
            <hr className="bg-gray-300" />
            <h1 className="flex items-center gap-2 text-lg text-green-600 mt-2 mb-3 ml-6">
              <Clock className="w-4 h-4 text-blue-600" /> Open 24 Hrs
            </h1>
            <hr className="bg-gray-300" />
            <h1 className="flex items-center gap-2 text-lg text-blue-600 mt-2 mb-3 ml-6">
              <Pencil className="w-4 h-4" /> Suggest New Timings
            </h1>
            <hr className="bg-gray-300" />
            <h1 className="flex items-center gap-2 text-lg mt-2 mb-3 ml-6">
              <Mail className="w-4 h-4 text-blue-600" /> Send Email by Enquiry
            </h1>
            <hr className="bg-gray-300" />
            <h1 className="flex items-center gap-2 text-lg mt-2 mb-3 ml-6">
              <TabletSmartphone className="w-4 h-4 text-blue-600" /> Get info via
              SMS/Email
            </h1>
            <hr className="bg-gray-300" />
            <h1 className="flex items-center gap-2 text-lg mt-2 mb-3 ml-6">
              <Share2 className="w-4 h-4 text-blue-600" /> Share
            </h1>
            <hr className="bg-gray-300" />
            <h1 className="flex items-center gap-2 text-lg mt-2 mb-3 ml-6">
              <Star className="w-4 h-4 text-blue-600" /> Tap to rate
            </h1>
            <hr className="bg-gray-300" />
            <h1 className="flex items-center gap-2 text-lg mt-2 mb-3 ml-6">
              <Pencil className="w-4 h-4 text-blue-600" /> Edit this Listing
            </h1>
            <hr className="bg-gray-300" />
            <h1 className="flex items-center gap-2 text-lg mt-2 mb-3 ml-6">
              <GlobeLock className="w-4 h-4 text-blue-600" /> Visit Our Website
            </h1>
            <hr className="bg-gray-300" />
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
                <button className="w-full bg-blue-700 hover:bg-blue-600 text-white py-1 rounded-lg">
                  Send Enquiry
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 bg-white p-4 border rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Also Listed In</h3>
            <div className="flex flex-wrap gap-2">
              {listingCategories.map((category, index) => (
                <span
                  key={index}
                  className="inline-block border border-gray-300 rounded-full px-3 py-1 text-sm text-gray-700"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

      
          <div ref={reportErrorRef} className="mt-6 bg-white p-4 border rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-7">
              Report an error
            </h3>
            <p className="text-md text-gray-600 mb-3">
              Help us to make Justdial more updated and more relevant for you.
            </p>
            <button className="text-blue-500 border text-bold border-blue-500 px-6 py-2 rounded transition hover:bg-blue-50">
              Report Now
            </button>
          </div>

         
          <div ref={formRef} className={`mt-6 bg-white p-4 border rounded-lg shadow-md ${isFormFixed ? "fixed-form" : ""}`}>
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
                <button className="w-full bg-blue-700 hover:bg-blue-600 text-white py-1 rounded-lg">
                  Send Enquiry
                </button>
              </div>
            </form>
          </div>
          
          {isFormFixed && (
            <div className="invisible p-4 border rounded-lg shadow-md mt-6">
             
            </div>
          )}
        </div>
      </div>
    </div>
  );
}