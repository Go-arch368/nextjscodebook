"use client";
import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
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

interface ListingData {
  WebsiteIdentifier?: string;
  Category?: string;
  Subcategory?: string;
  business?: {
    businessId?: string;
    name?: string;
    image?: string;
    services?: string[];
    rating?: number;
    total_ratings?: number;
    badges?: string[];
    location?: string;
    hours?: { status: string } | null;
    years_in_business?: string;
    booking_info?: string;
    information?: string[];
    contact?: { phone: string };
  };
  photos?: { source: string; description: string; image: string }[];
  price_list?: { service: string; description: string; price: string; details_link: string; button: string }[];
  Quick_Information?: { Qname: string; Qdescription: string; Qestablished: string | null; Qestablished_year: string | null }[];
  Services?: { sname: string; sdata1: string; sdata2: string }[];
  general_contact?: { phone: string };
  address?: string;
  actions?: { label: string; icon: string; url?: string }[];
  customer_reviews?: { source: string; name: string; feedback: string; time: string }[];
  key_insights?: {
    section_title: string;
    what_users_liked: { title: string; points: string[] };
    what_can_be_improved: { title: string; points: string[] };
    disclaimer: string;
    metadata: { source: string; version: string; last_updated: string };
  };
  reviews_ratings?: { title: string; rating: number; total_ratings: number; description: string; button_text: string };
  review?: { title: string; ratings: number[] };
  userReviews?: {
    title: string;
    sortOrder: string[];
    reviewHighlightstitle: string;
    reviewHighlights: { highlight: string; rating: number }[];
  };
  reviewPeople?: {
    user: { name: string; review_count: number; follower_count: number };
    date: string;
    location: string;
    title: string;
    tags: string[];
    content: string;
    actions: string[];
    sentiment: string;
    rating: number;
  }[];
  listingCategories?: string[];
}

interface PhotosComponentProps {
  listingData?: ListingData;
}

const ImageWithFallback = ({ src, alt, ...props }: { src: string; alt: string } & React.ImgHTMLAttributes<HTMLImageElement>) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [errorCount, setErrorCount] = useState(0);

  const handleError = () => {
    if (errorCount === 0) {
      setImgSrc("/fallback-image.jpg");
      setErrorCount(1);
    } else {
      setImgSrc("data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20300%20200%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_18945b7b7b7%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A15pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_18945b7b7b7%22%3E%3Crect%20width%3D%22300%22%20height%3D%22200%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22110.5%22%20y%3D%22107.1%22%3EImage%20not%20available%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E");
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      loading="lazy"
      {...props}
    />
  );
};

export default function PhotosComponent({ listingData }: PhotosComponentProps) {
  useEffect(() => {
    console.log("listingData:", listingData);
    if (!listingData?.general_contact) {
      console.warn("general_contact is missing or undefined in listingData");
    }
  }, [listingData]);

  if (!listingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const {
    photos = [],
    business = { name: "Unknown Business", information: [], hours: null, location: "Unknown" },
    actions = [],
    address = "Address not available",
    general_contact = { phone: "Phone not available" },
    price_list = [],
    customer_reviews = [],
    key_insights,
    reviews_ratings = { title: "", rating: 0, total_ratings: 0, description: "", button_text: "" },
    userReviews = { title: "", sortOrder: [], reviewHighlightstitle: "", reviewHighlights: [] },
    listingCategories = [],
    Quick_Information = [],
    review = { title: "", ratings: [] },
    Services = [],
    reviewPeople = [],
    Subcategory = "Unknown",
  } = listingData;

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

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // e.preventDefault();
    // const formData = new FormData(e.target);
    // const name = formData.get("name");
    // const mobile = formData.get("mobile");

    // if (!name || typeof name !== "string" || name.trim() === "") {
    //   alert("Please enter a valid name.");
    //   return;
    // }
    // if (!mobile || typeof mobile !== "string" || !/^\d{10}$/.test(mobile)) {
    //   alert("Please enter a valid 10-digit mobile number.");
    //   return;
    // }

    // const sanitizedName = name.trim();
    // const sanitizedMobile = mobile.trim();
    // console.log("Form submitted:", { name: sanitizedName, mobile: sanitizedMobile });
  };

  return (
    <>
      <Head>
        <title>{business.name} - {Subcategory}</title>
        <meta
          name="description"
          content={Quick_Information[0]?.Qdescription || `${business.name} in ${business.location}`}
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: business.name,
            address: address,
            telephone: general_contact.phone,
            image: business.image || "",
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: reviews_ratings.rating,
              reviewCount: reviews_ratings.total_ratings,
            },
          })}
        </script>
      </Head>
      <div className="container mx-auto px-4">
        <div className="mt-4">
          <ul className="flex flex-wrap gap-4">
            {business?.information?.length ? (
              business.information.map((info, index) => (
                <li
                  key={index}
                  className={`font-medium text-lg p-2 ${info === "Overview" ? "text-blue-500" : "text-gray-700"}`}
                >
                  {info}
                </li>
              ))
            ) : (
              <li className="font-medium text-lg text-gray-700">No information available</li>
            )}
          </ul>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mt-4">
          <div className="w-full md:w-3/4 p-4 border-2 rounded-sm bg-gray-50 shadow-md">
            <h1 className="text-2xl font-bold mb-4">Photos</h1>
            {photos.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                  <div
                    key={index}
                    className="photo-item border-2 border-gray-300 rounded-lg shadow-md bg-white p-4 hover:shadow-lg transition-shadow duration-200"
                  >
                    <ImageWithFallback
                      src={photo.image}
                      alt={photo.description || "Business Photo"}
                      width={300}
                      height={200}
                      className="max-w-full object-cover rounded-md border-r-4 border-gray-400"
                    />
                    <p className="mt-2 text-gray-700">{photo.description}</p>
                    <small className="text-gray-500">Source: {photo.source}</small>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No photos available.</p>
            )}
            <div className="mt-4 flex justify-start">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
                <CloudUpload className="w-5 h-5" />
                Upload Photos
              </button>
            </div>

            <hr className="my-6 border-gray-300" />

            {price_list.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-5">Price List</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {price_list.map((price, index) => (
                    <div
                      key={index}
                      className="border p-6 rounded-xl shadow-md bg-white max-w-[500px] w-full mx-auto"
                    >
                      <h3 className="text-lg font-semibold mb-1">{price.service}</h3>
                      <p className="text-gray-600 text-sm mb-2">{price.description}</p>
                      <p className="text-xl font-bold text-black mb-4">{price.price}</p>
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
            )}

            <hr className="my-6 border-gray-300" />

            <div className="p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-5">Quick Information</h2>
              {Quick_Information.length ? (
                Quick_Information.map((info, index) => (
                  <div key={index} className="mb-6">
                    <h4 className="text-lg text-gray-400 font-medium">{info.Qname}</h4>
                    <p className="text-base text-gray-700 mt-2 mb-4 font-semibold">{info.Qdescription}</p>
                    {info.Qestablished && (
                      <h4 className="text-lg text-gray-400">{info.Qestablished}</h4>
                    )}
                    {info.Qestablished_year && (
                      <p className="text-base text-gray-700 font-semibold">{info.Qestablished_year}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No quick information available.</p>
              )}
            </div>

            <hr className="my-6 border-gray-300" />

            {Services.length > 0 && (
              <div className="mt-8 px-5">
                {Services.map((service, index) => (
                  <div key={index} className="mb-4">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Check />
                      {service.sname}
                    </h2>
                    <ul className="list-disc list-inside text-base text-gray-700 mt-2 px-6 space-y-1">
                      <li className="underline">{service.sdata1}</li>
                      <li className="underline">{service.sdata2}</li>
                    </ul>
                  </div>
                ))}
              </div>
            )}

            <hr className="my-6 border-gray-300" />

            <div className="mt-10">
              <h2 className="text-2xl font-semibold mb-4">Our Happy Customers</h2>
              {customer_reviews.length ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {customer_reviews.slice(0, 3).map((review, index) => (
                    <div key={index} className="p-4 border rounded-lg shadow-sm bg-gray-50">
                      <div className="flex items-center gap-3 mb-2">
                        <ImageWithFallback
                          src="/default-avatar.png"
                          alt={review.name}
                          width={40}
                          height={40}
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
              ) : (
                <p className="text-gray-600">No customer reviews available.</p>
              )}
            </div>

            {key_insights && (
              <div className="mt-10">
                <h2 className="text-2xl font-bold mb-4">{key_insights.section_title}</h2>
                <div className="bg-blue-100 p-6 rounded-lg">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="bg-white p-4 rounded-xl shadow-md w-full md:w-1/2">
                      <h3 className="flex items-center text-lg font-semibold mb-2 text-green-600">
                        <ThumbsUp className="mr-2" />
                        {key_insights.what_users_liked.title}
                      </h3>
                      <ul className="list-disc list-inside text-gray-700">
                        {key_insights.what_users_liked.points.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-md w-full md:w-1/2">
                      <h3 className="flex items-center text-lg font-semibold mb-2 text-red-600">
                        <ChartSpline className="mr-2" />
                        {key_insights.what_can_be_improved.title}
                      </h3>
                      <ul className="list-disc list-inside text-gray-700">
                        {key_insights.what_can_be_improved.points.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 italic mt-4 text-center">{key_insights.disclaimer}</p>
                </div>
              </div>
            )}

            <hr className="my-6 border-gray-300" />

            {reviews_ratings && (
              <div className="p-4 border rounded-lg shadow-md mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{reviews_ratings.title}</h3>
                <div className="flex items-center text-yellow-600 mb-2">
                  <span className="bg-green-700 text-white text-3xl font-semibold mr-2 px-3 py-4 rounded-xl">
                    {reviews_ratings.rating}
                  </span>
                  <span className="text-lg text-gray-600 -mt-5 font-bold">
                    {reviews_ratings.total_ratings} ratings
                  </span>
                  <p className="text-lg text-gray-700 mt-10 -ml-24">{reviews_ratings.description}</p>
                </div>
                <h1 className="text-2xl px-4 py-2 mt-20 mb-2 rounded text-gray-900 font-semibold">
                  {reviews_ratings.button_text}
                </h1>
                <div className="flex justify-start gap-1.5">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <div
                      key={index}
                      className={`border border-gray-300 rounded-md p-4 w-9 h-9 flex items-center justify-center cursor-pointer transition-all duration-200 ${
                        index <= hoverIndex ? "bg-yellow-400 text-white border-yellow-400" : "text-gray-400"
                      }`}
                      onMouseEnter={() => setHoverIndex(index)}
                      onMouseLeave={() => setHoverIndex(-1)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setHoverIndex(index);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                    >
                      {index <= hoverIndex ? "★" : "☆"}
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="text-2xl px-4 py-2 mt-20 mb-2 rounded text-gray-900 font-semibold -ml-2">
                    {review.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {review.ratings.map((rating, index) => (
                      <span
                        key={index}
                        className="flex items-center bg-white border-2 text-sm font-medium px-7 py-1 rounded-xl mr-2"
                      >
                        {rating}
                        <Star className="w-4 h-4 mr-2 fill-yellow-500 text-yellow-500" />
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-8">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">{userReviews.title}</h3>
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
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Review Highlights</h3>
                  <div className="flex flex-wrap gap-4 mb-6">
                    {userReviews.reviewHighlights.map((highlight, index) => (
                      <div
                        key={index}
                        className="bg-gray-200 px-4 py-2 rounded-full border border-gray-200 flex items-center"
                      >
                        <span className="mr-2">{highlight.highlight}</span>
                        <span>({highlight.rating})</span>
                      </div>
                    ))}
                  </div>
                </div>
                {reviewPeople.length ? (
                  reviewPeople.map((review, index) => (
                    <div key={index} className="p-4 mb-6 border-b">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-3">
                          <ImageWithFallback
                            src="/default-avatar.png"
                            alt={review.user.name}
                            width={55}
                            height={50}
                            className="border-2 rounded-sm"
                          />
                          <h4 className="text-lg font-semibold text-gray-800">{review.user.name}</h4>
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <span className="text-yellow-500 font-bold text-sm ml-2 p-2 flex">
                        {Array(review.rating)
                          .fill(0)
                          .map((_, i) => (
                            <Star key={`filled-${i}`} className="text-yellow-500 w-6 h-6" />
                          ))}
                        {Array(5 - review.rating)
                          .fill(0)
                          .map((_, i) => (
                            <Star key={`empty-${i}`} className="text-gray-300 w-6 h-6" />
                          ))}
                      </span>
                      <div className="flex flex-wrap gap-2 my-2">
                        {review.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm text-gray-700"
                          >
                            {review.sentiment === "positive" ? (
                              <ThumbsUp className="w-4 h-4 text-green-500" />
                            ) : (
                              <ThumbsDown className="w-4 h-4 text-red-500" />
                            )}
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
                  ))
                ) : (
                  <p className="text-gray-600">No user reviews available.</p>
                )}
              </div>
            )}
          </div>

          <div className="w-full md:w-1/4 p-4 bg-white border-gray-200 rounded-lg">
            <style>
              {`
                .fixed-form {
                  position: fixed;
                  top: 20px;
                  width: ${formRef.current?.offsetWidth || 300}px;
                  transition: transform 0.2s ease;
                  z-index: 10;
                }
                @keyframes shake {
                  0%, 100% { transform: translateX(0); }
                  20%, 60% { transform: translateX(-4px); }
                  40%, 80% { transform: translateX(4px); }
                }
              `}
            </style>

            <div className="mb-6 p-4 border rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold mt-2 mb-2">Contact</h3>
              <p className="text-lg text-blue-600 mb-5 flex items-center gap-2 ml-3 mt-5 font-semibold">
                <Phone className="w-5 h-5" style={{ animation: "shake 2.5s infinite" }} />
                {general_contact.phone}
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
                <Clock className="w-4 h-4 text-blue-600" />
                {business.hours?.status || "Hours not available"}
              </h1>
              <hr className="bg-gray-300" />
              {actions.map((action, index) => {
                let Icon;
                switch (action.icon?.toLowerCase()) {
                  case "directions":
                    Icon = CircleArrowRight;
                    break;
                  case "copy":
                    Icon = Copy;
                    break;
                  case "edit":
                    Icon = Pencil;
                    break;
                  case "email":
                    Icon = Mail;
                    break;
                  case "message":
                    Icon = TabletSmartphone;
                    break;
                  case "share":
                    Icon = Share2;
                    break;
                  case "save":
                    Icon = Star;
                    break;
                  case "calendar":
                    Icon = Pencil;
                    break;
                  case "link":
                    Icon = GlobeLock;
                    break;
                  default:
                    Icon = null;
                }
                return (
                  action.label !== "Get Directions" &&
                  action.label !== "Copy" && (
                    <div key={index}>
                      <h1 className="flex items-center gap-2 text-lg mt-2 mb-3 ml-6">
                        {Icon && <Icon className="w-4 h-4 text-blue-600" />}
                        {action.label}
                      </h1>
                      <hr className="bg-gray-300" />
                    </div>
                  )
                );
              })}
            </div>

            <div className="p-4 border rounded-lg shadow-md bg-white">
              <h2 className="text-2xl font-bold mb-4">
                Get the List of <span className="text-blue-600">{Subcategory}</span>
              </h2>
              <p className="text-gray-700 mb-6">
                We'll send you contact details in seconds <span className="font-semibold">for free</span>
              </p>
              <form className="space-y-4" onSubmit={handleFormSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    What kind of Assistance do you need?
                  </label>
                  <div className="flex items-center gap-4">
                    {Subcategory === "AutoParts" ? (
                      <>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="assistance"
                            value="Servicing"
                            className="mr-2"
                            required
                          />
                          Servicing
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="assistance"
                            value="Repair"
                            className="mr-2"
                            required
                          />
                          Repair
                        </label>
                      </>
                    ) : Subcategory === "Hospital" ? (
                      <>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="assistance"
                            value="Consultation"
                            className="mr-2"
                            required
                          />
                          Consultation
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="assistance"
                            value="Treatment"
                            className="mr-2"
                            required
                          />
                          Treatment
                        </label>
                      </>
                    ) : (
                      <p className="text-gray-600">No specific assistance options available.</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    name="mobile"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your mobile number"
                    required
                  />
                </div>
                <div className="mt-4">
                  <button
                    type="submit"
                    className="w-full bg-blue-700 hover:bg-blue-600 text-white py-1 rounded-lg"
                  >
                    Send Enquiry
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-6 bg-white p-4 border rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Also Listed In</h3>
              <div className="flex flex-wrap gap-2">
                {listingCategories.length ? (
                  listingCategories.map((category, index) => (
                    <span
                      key={index}
                      className="inline-block border border-gray-300 rounded-full px-3 py-1 text-sm text-gray-700"
                    >
                      {category}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-600">No categories listed.</p>
                )}
              </div>
            </div>

            <div ref={reportErrorRef} className="mt-6 bg-white p-4 border rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-7">Report an error</h3>
              <p className="text-md text-gray-600 mb-3">
                Help us to make Justdial more updated and more relevant for you.
              </p>
              <button className="text-blue-500 border text-bold border-blue-500 px-6 py-2 rounded transition hover:bg-blue-50">
                Report Now
              </button>
            </div>

            <div
              ref={formRef}
              className={`mt-6 bg-white p-4 border rounded-lg shadow-md ${isFormFixed ? "fixed-form" : ""}`}
            >
              <h2 className="text-2xl font-bold mb-4">
                Get the List of <span className="text-blue-600">{Subcategory}</span>
              </h2>
              <p className="text-gray-700 mb-6">
                We'll send you contact details in seconds <span className="font-semibold">for free</span>
              </p>
              <form className="space-y-4" onSubmit={handleFormSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    What kind of Assistance do you need?
                  </label>
                  <div className="flex items-center gap-4">
                    {Subcategory === "AutoParts" ? (
                      <>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="assistance"
                            value="Servicing"
                            className="mr-2"
                            required
                          />
                          Servicing
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="assistance"
                            value="Repair"
                            className="mr-2"
                            required
                          />
                          Repair
                        </label>
                      </>
                    ) : Subcategory === "Hospital" ? (
                      <>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="assistance"
                            value="Consultation"
                            className="mr-2"
                            required
                          />
                          Consultation
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="assistance"
                            value="Treatment"
                            className="mr-2"
                            required
                          />
                          Treatment
                        </label>
                      </>
                    ) : (
                      <p className="text-gray-600">No specific assistance options available.</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    name="mobile"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your mobile number"
                    required
                  />
                </div>
                <div className="mt-4">
                  <button
                    type="submit"
                    className="w-full bg-blue-700 hover:bg-blue-600 text-white py-1 rounded-lg"
                  >
                    Send Enquiry
                  </button>
                </div>
              </form>
            </div>

            {isFormFixed && <div className="invisible p-4 border rounded-lg shadow-md mt-6"></div>}
          </div>
        </div>
      </div>
    </>
  );
}