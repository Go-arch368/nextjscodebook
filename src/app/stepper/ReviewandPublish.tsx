"use client";
import { Button } from "@/components/ui/button";
//import StarRating from "@/components/StarRating"; // Update the path to the correct location
import { Globe, Heart, MapPin, Phone, Share2 } from "lucide-react";
import Image from "next/image";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react";
// import Link from "next/link";

interface OnboardData {
    welcome: {
        businessName: string;
        categoryId: string;
        category: string;
        subcategoryId: string;
        subcategory: string;
        pincode: string;
        city: string;
        state: string;
        district?: string;
        taluk?: string;
    };
    location: {
        addressLine1: string;
        addressLine2: string;
    };
    contact: {
        contact: {
            phone: string;
            email: string;
            website: string;
        };
    };
    services: {
        imageUrl: string;
    };
}

export default function ReviewandPublish({ onboardData }: { onboardData: OnboardData }) {
    console.log(onboardData, 'review and publish');
    const tags = ['tag1', 'tag2']
    const [isSuccess, setIsSuccess] = useState(false);

    const submitBusniess = async () => {
        const payload = {
            "websiteId": Math.floor(10000 + Math.random() * 90000),
            "isFeatured": true,
            "status": "active",
            "tags": 'tag1, tag2',
            "websiteName": onboardData?.welcome?.businessName,
            "categoryId": onboardData?.welcome.categoryId,
            "categoryName": onboardData?.welcome.category,
            "categorySlug": onboardData?.welcome.category,
            "subcategoryId": onboardData?.welcome.subcategoryId,
            "subcategoryName": onboardData?.welcome.subcategory,
            "subcategorySlug": onboardData?.welcome.subcategory,
            "pincode": onboardData?.welcome.pincode,
            "city": onboardData?.welcome.city,
            "state": onboardData?.welcome.state,
            "district": onboardData?.welcome?.district,
            "taluk": onboardData?.welcome?.taluk,
            "addressLine1": onboardData?.location?.addressLine1,
            "addressLine2": onboardData?.location?.addressLine2,
            "phone": onboardData?.contact?.contact?.phone,
            "email": onboardData?.contact?.contact?.email,
            "websiteUrl": onboardData?.contact?.contact?.website,
            "logoUrl": onboardData?.services.imageUrl,
            "imagesUrl": onboardData?.services.imageUrl,
            "services": 'service1, service2',

        }
        try {
            const res = await fetch("https://dbapiservice.onrender.com/dbapis/v1/websites", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            console.log(data);
            setIsSuccess(true);
        } catch (error) {
            console.error("Error submitting business:", error);
        }
    };
    return (
        <div className="flex flex-col gap-10">
            <div
                key={onboardData?.welcome?.categoryId}
                className="relative flex flex-col sm:flex-row bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
                {/* Top-right floating buttons */}
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <button
                        aria-label="Share"
                        className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>
                    <button
                        aria-label="Like"
                        className="text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors"
                    >
                        <Heart className="w-5 h-5" />
                    </button>
                </div>

                {/* Left: Image */}
                <div className="sm:w-1/3 w-full h-56 sm:h-auto relative">
                    {onboardData?.services.imageUrl ? <Image
                        src={onboardData?.services.imageUrl}
                        alt={onboardData?.welcome?.businessName}
                        className="object-cover w-full h-full"
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                    /> : null}
                </div>

                {/* Right: Details */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {onboardData?.welcome?.businessName}
                        </h2>
                        <div className="flex items-center gap-2">
                            {/* <StarRating rating={4.5} /> */}
                            <span className="text-gray-800 dark:text-gray-300 text-sm">
                                ({5})
                            </span>
                        </div>
                        <p className="mt-3 text-gray-700 dark:text-gray-300">
                            {onboardData?.welcome?.businessName}
                        </p>

                        {/* Highlights */}
                        <div className="flex flex-wrap gap-2 mt-4">
                            {tags.map((highlight, index) => (
                                <span
                                    key={index}
                                    className="bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 text-sm px-2 py-1 rounded-full"
                                >
                                    {highlight}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-end mt-6 flex-wrap gap-4">
                        {/* CTA + Icons with Lucide */}
                        <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
                            <a
                                href={`tel:${onboardData?.contact?.contact?.phone}`}
                                aria-label="Call"
                                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                            >
                                <Phone className="w-4 h-4" />
                                {onboardData?.contact?.contact?.phone}
                            </a>

                            <a
                                href={onboardData?.contact?.contact?.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Website"
                                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                            >
                                <Globe className="w-4 h-4" />
                                {onboardData?.contact?.contact?.website}
                            </a>

                            <a
                                href='#'
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Directions"
                                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                            >
                                <MapPin className="w-4 h-4" />
                                Directions
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="self-end">
                <Button
                    variant='default'
                    onClick={submitBusniess}
                    className="w-full sm:w-auto focus:ring-2 focus:ring-blue-500 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                    Review and Publish
                </Button>
            </div>
            <AlertDialog open={isSuccess} onOpenChange={setIsSuccess}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Submission Successful</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your business has been successfully submitted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction className='bg-blue-700 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600' onClick={() => setIsSuccess(false)}>Close</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>

    )
}