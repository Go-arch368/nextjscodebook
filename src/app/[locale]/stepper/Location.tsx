"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

// Define the schema for the form
const locationSchema = z.object({
    addressLine1: z.string().min(1, "Address is required").max(200, "Address must be 200 characters or less"),
    addressLine2: z.string().min(1, "Address is required").max(200, "Address must be 200 characters or less"),
    latitude: z.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90"),
    longitude: z.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180"),
});

type LocationFormData = z.infer<typeof locationSchema>;

// Define the props interface
interface LocationProps {
    updateData: (data: LocationFormData) => void;
    prevStep: () => void; // Added for navigation
}

export default function Location({ updateData, prevStep }: LocationProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [hasExistingData, setHasExistingData] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [initialData, setInitialData] = useState<LocationFormData>({
        addressLine1: "",
        addressLine2: "",
        latitude: 0,
        longitude: 0,
    });

    // Initialize react-hook-form with Zod resolver
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<LocationFormData>({
        resolver: zodResolver(locationSchema),
        defaultValues: {
            addressLine1: "",
            addressLine2: "",
            latitude: 0,
            longitude: 0,
        },
    });

    const onSubmit = (data: LocationFormData) => {
        setIsReadOnly(true);
        setHasExistingData(true);
        setInitialData(data);
        updateData(data);
        localStorage.setItem("locationFormData", JSON.stringify(data));
        localStorage.setItem("hasChanges", "true");
    };

    const toggleEdit = () => {
        if (isEditing) {
            setValue("addressLine1", initialData.addressLine1, { shouldValidate: true });
            setValue("addressLine2", initialData.addressLine2, { shouldValidate: true });
            setValue("latitude", initialData.latitude, { shouldValidate: true });
            setValue("longitude", initialData.longitude, { shouldValidate: true });
        } else {
            localStorage.setItem("isEditModeActive", "true");
            localStorage.setItem("hasChanges", "true");
            console.log("Edit mode enabled via Location pencil");
        }
        setIsEditing(!isEditing);
        setIsReadOnly(false);
    };

    return (
        <main className="max-w-4xl mx-auto p-5">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Business Location</h2>
                    {isReadOnly && (
                        <button
                            onClick={toggleEdit}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            aria-label="Edit Location"
                        >
                            <Pencil className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {isReadOnly ? (
                    <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-md">
                        Viewing saved location information.
                    </div>
                ) : (
                    <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-md">
                        {hasExistingData ? "Editing location information." : "Please enter your location information."}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-600">
                    <div className="mb-4">
                        <label htmlFor="addressLine1" className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                            Address Line 1:
                        </label>
                        <input
                            id="addressLine1"
                            {...register("addressLine1")}
                            readOnly={isReadOnly}
                            className={`w-full p-2 rounded-md focus:ring-2 focus:ring-blue-500 ${
                                isReadOnly
                                    ? "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                    : errors.addressLine1
                                    ? "border border-red-500"
                                    : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                            }`}
                            placeholder="Enter Shop no, Street Name, Area"
                        />
                        {errors.addressLine1 && <p className="mt-1 text-sm text-red-500">{errors.addressLine1.message}</p>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="addressLine2" className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                            Address Line 2:
                        </label>
                        <input
                            id="addressLine2"
                            {...register("addressLine2")}
                            readOnly={isReadOnly}
                            className={`w-full p-2 rounded-md focus:ring-2 focus:ring-blue-500 ${
                                isReadOnly
                                    ? "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                    : errors.addressLine2
                                    ? "border border-red-500"
                                    : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                            }`}
                            placeholder="Enter your city"
                        />
                        {errors.addressLine2 && <p className="mt-1 text-sm text-red-500">{errors.addressLine2.message}</p>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="latitude" className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                            Latitude:
                        </label>
                        <input
                            id="latitude"
                            type="number"
                            step="any"
                            {...register("latitude", { valueAsNumber: true })}
                            readOnly={isReadOnly}
                            className={`w-full p-2 rounded-md focus:ring-2 focus:ring-blue-500 ${
                                isReadOnly
                                    ? "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                    : errors.latitude
                                    ? "border border-red-500"
                                    : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                            }`}
                            placeholder="Enter your latitude"
                        />
                        {errors.latitude && <p className="mt-1 text-sm text-red-500">{errors.latitude.message}</p>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="longitude" className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                            Longitude:
                        </label>
                        <input
                            id="longitude"
                            type="number"
                            step="any"
                            {...register("longitude", { valueAsNumber: true })}
                            readOnly={isReadOnly}
                            className={`w-full p-2 rounded-md focus:ring-2 focus:ring-blue-500 ${
                                isReadOnly
                                    ? "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                    : errors.longitude
                                    ? "border border-red-500"
                                    : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                            }`}
                            placeholder="Enter your longitude"
                        />
                        {errors.longitude && <p className="mt-1 text-sm text-red-500">{errors.longitude.message}</p>}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between gap-3 mt-4">
                        <Button
                            className="w-full sm:w-auto focus:ring-2 focus:ring-gray-500 bg-gray-600 text-white hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600"
                            onClick={prevStep}
                            disabled={isReadOnly}
                        >
                            Previous
                        </Button>
                        <Button
                            className="w-full sm:w-auto focus:ring-2 focus:ring-blue-500 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                            type="submit"
                            disabled={isReadOnly}
                        >
                            Save
                        </Button>
                    </div>
                </form>
            </div>
        </main>
    );
}