"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, ChevronDown } from "lucide-react";
import { FiSearch, FiMapPin } from "react-icons/fi";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter } from "next/navigation";

const GEOCODING_API_URL = "https://maps.googleapis.com/maps/api/geocode/json?address=";
const API_KEY = "AIzaSyCQNqAUkIYa-5HS5iPypurBC6QCT-YjKS8"

interface LocationModalProps {
    onPincodeChange: (pincode: string, city?: string) => void;
}

interface BackendApiResponse {
    success: boolean;
    data?: {
        pincode?: string;
        city?: string;
        address?: string;
    };
    error?: string;
}

export default function LocationModal({ onPincodeChange }: LocationModalProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [city, setCity] = useState("");
    const [pincode, setPincode] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const getCurrentLocation = () => {
        setIsLoading(true);
        setError("");

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            setIsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetch(`${GEOCODING_API_URL}${latitude},${longitude}&key=${API_KEY}`)
                    .then((response) => response.json())
                    .then((data) => {
                        if (data.results && data.results.length > 0) {
                            const pincodeComponent = data.results[0].address_components.find(
                                (component: { types: string[] }) =>
                                    component.types.includes("postal_code")
                            );
                            const cityComponent = data.results[0].address_components.find(
                                (component: { types: string[] }) =>
                                    component.types.includes("locality")
                            );
                            setCity(cityComponent?.long_name || "");
                            setPincode(pincodeComponent?.long_name || "");
                        } else {
                            setError("No address found for your location");
                        }
                    })
                    .catch((error) => {
                        console.error("Error fetching location:", error);
                        setError("Failed to fetch location details");
                    })
                    .finally(() => setIsLoading(false));
            },
            (error) => {
                console.error("Geolocation error:", error);
                setError("Unable to retrieve your location");
                setIsLoading(false);
            }
        );
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            getCurrentLocation();
        }
    }, []);


    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setError("");
    };

    const handleSelectLocation = (location: string, city: string, pincode: string | undefined, isPincodeQuery: boolean) => {
        if (!pincode && isPincodeQuery) {
            setError("No valid pincode returned from the server. Please try another pincode.");
            return;
        }
        setCity(city);
        setPincode(pincode || "");
        if (pincode) {
            onPincodeChange(pincode, city);
            setIsOpen(false);
        } else {
            setError(
                isPincodeQuery
                    ? "The entered pincode could not be validated. Please try another pincode."
                    : "No pincode found for this location. Please enter a valid pincode."
            );
        }
    };

    const handleSearchLocation = () => {
        if (!searchQuery.trim()) {
            setError("Please enter a search query or pincode");
            return;
        }

        setIsLoading(true);
        const isPincode = /^\d{6}$/.test(searchQuery.trim());

        if (isPincode) {
            fetch(`/api/search?pincode=${encodeURIComponent(searchQuery)}`, {
                cache: "no-store",
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    return response.json() as Promise<BackendApiResponse>;
                })
                .then((result) => {
                    console.log("Backend API Response for pincode:", result);
                    if (result.success && result.data) {
                        const { pincode: apiPincode, city, address } = result.data;
                        const validPincode = apiPincode || (isPincode ? searchQuery : undefined);
                        if (!validPincode) {
                            setError("No valid pincode returned from the server. Please try another pincode.");
                            return;
                        }
                        const placeName = address || city || `Pincode ${validPincode}`;
                        handleSelectLocation(placeName, city || "", validPincode, true);
                    } else {
                        setError(result.error || "Pincode not found in the database. Please try another pincode.");
                    }
                })
                .catch((error) => {
                    console.error("Error searching pincode:", error);
                    setError("Failed to validate pincode. Please check your network or try again.");
                })
                .finally(() => setIsLoading(false));
        } else {
            fetch(`${GEOCODING_API_URL}?address=${encodeURIComponent(searchQuery)}&components=country:IN&key=${API_KEY}`)
                .then((response) => response.json())
                .then((data) => {
                    console.log("Google Maps API Response for address:", data);
                    if (data.results && data.results.length > 0) {
                        const location = data.results[0].formatted_address;
                        const pincodeComponent = data.results[0].address_components.find(
                            (component: { types: string[] }) => component.types.includes("postal_code")
                        );
                        const cityComponent = data.results[0].address_components.find(
                            (component: { types: string[] }) => component.types.includes("locality")
                        );

                        const newPincode = pincodeComponent?.long_name || "";
                        const newCity = cityComponent?.long_name || "";
                        handleSelectLocation(location, newCity, newPincode, false);
                    } else {
                        setError("No results found for your search. Please try a different query.");
                    }
                })
                .catch((error) => {
                    console.error("Error searching location:", error);
                    setError("Failed to search location. Please check your API key or network.");
                })
                .finally(() => setIsLoading(false));
        }
    };

    return (
        <div className="dark:text-white text-black sm:py-[4px] rounded-sm">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        className="text-sm font-medium flex items-start gap-2 bg-white text-black dark:text-white dark:bg-transparent px-2 py-1"
                    >
                        {/* Left: Icon */}
                        <MapPin className="h-4 w-4 mt-1" />

                        {/* Right: Location Text */}
                        <div className="flex flex-col items-start leading-tight">
                            <div className="flex items-center gap-1">
                                <span>{city || "Select Location"}</span>
                                <ChevronDown className="h-4 w-4" />
                            </div>
                            {pincode && (
                                <span className="text-xs text-muted-foreground">{pincode}</span>
                            )}
                        </div>
                    </Button>

                </DialogTrigger>
                <DialogContent

                    className="max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
                    <DialogHeader className="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center w-full">
                            <DialogTitle className="text-lg font-semibold">Your Location</DialogTitle>
                        </div>
                        <div className="relative w-full">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <Input
                                type="text"
                                placeholder="Search a new address"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onKeyDown={(e) => e.key === "Enter" && handleSearchLocation()}
                                className="pl-10 pr-20 py-2 w-full border rounded-md text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Button
                                onClick={handleSearchLocation}
                                variant="default"
                                disabled={isLoading}
                                className="absolute right-0 top-1/2 transform -translate-y-1/2 h-full px-3 rounded-l-none"
                            >
                                {isLoading ? "Searching..." : "Search"}
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="py-4">
                        <div
                            className={`flex items-center gap-2 mb-4 ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} text-red-500`}
                            onClick={!isLoading ? getCurrentLocation : undefined}
                        >
                            <FiMapPin className="h-5 w-5" />
                            <span className="font-medium">
                                {isLoading ? "Detecting location..." : "Current Location"}
                            </span>
                        </div>
                        <div className="space-y-3 text-base text-gray-800 dark:text-gray-200 pl-7">
                            {city && (
                                <p className="flex items-center gap-2">
                                    <span className="font-semibold min-w-[60px]">City:</span>
                                    <span>{city}</span>
                                </p>
                            )}
                            {pincode && (
                                <p className="flex items-center gap-2">
                                    <span className="font-semibold min-w-[60px]">Pincode:</span>
                                    <span>{pincode}</span>
                                </p>
                            )}
                            {!city && !pincode && (
                                <p className="text-sm text-gray-500">No location selected. Please search or use current location.</p>
                            )}
                        </div>
                        {error && (
                            <div className="text-sm text-red-500 p-2 bg-red-50 dark:bg-red-900/20 rounded-md mt-4">
                                {error}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}