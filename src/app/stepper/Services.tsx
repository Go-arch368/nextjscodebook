"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface ServicesData {
    subcategories: {
        businesses: {
            services: { name: string; price: string }[];
            imageUrl: string;
        }[];
    }[];
}

interface ServicesProps {
    updateData: (data: ServicesData) => void;
    prevStep: () => void;
}

const servicesSchema = z.object({
    services: z
        .array(
            z.object({
                name: z.string().min(1, "Service name is required"),
                price: z.string().min(1, "Price is required"),
            })
        )
        .min(1, "At least one service is required"),
    imageUrl: z.string().url("Invalid image URL").optional(),
});

type ServicesFormData = z.infer<typeof servicesSchema>;

const Services = ({ updateData, prevStep }: ServicesProps) => {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(true);
    const [hasExistingData, setHasExistingData] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string>("");
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadError, setUploadError] = useState<string>("");

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<ServicesFormData>({
        resolver: zodResolver(servicesSchema),
        defaultValues: {
            services: [{ name: "", price: "" }],
            imageUrl: "",
        },
    });

    const services = watch("services");

    const setServices = (newServices: { name: string; price: string }[]) => {
        setValue("services", newServices, { shouldValidate: true });
    };

    useEffect(() => {
        const servicesFormData = localStorage.getItem("servicesFormData");
        const apiResponse = localStorage.getItem("apiResponse");

        let existingData: { services?: { name: string; price: string }[]; imageUrl?: string } | null = null;

        if (servicesFormData && servicesFormData !== "null") {
            try {
                const parsedFormData = JSON.parse(servicesFormData);
                const draftServices = parsedFormData.subcategories?.[0]?.businesses?.[0]?.services || [];
                const draftImageUrl = parsedFormData.subcategories?.[0]?.businesses?.[0]?.imageUrl || "";
                if (draftServices.length > 0 || draftImageUrl) {
                    existingData = {
                        services: draftServices,
                        imageUrl: draftImageUrl,
                    };
                }
            } catch (e) {
                console.error("Error parsing draft data", e);
            }
        }

        if (!existingData && apiResponse) {
            try {
                const parsedApiResponse = JSON.parse(apiResponse);
                const publishedServices = parsedApiResponse?.services || [];
                const publishedImageUrl = parsedApiResponse?.imageUrl || "";
                if (publishedServices.length > 0 || publishedImageUrl) {
                    existingData = {
                        services: publishedServices,
                        imageUrl: publishedImageUrl,
                    };
                }
            } catch (e) {
                console.error("Error parsing api response", e);
            }
        }

        if (existingData) {
            setServices(existingData.services || [{ name: "", price: "" }]);
            setValue("imageUrl", existingData.imageUrl || "", { shouldValidate: true });
            setImageUrl(existingData.imageUrl || "");
            reset({
                services: existingData.services || [{ name: "", price: "" }],
                imageUrl: existingData.imageUrl || "",
            });
            setHasExistingData(true);
            setIsEditing(false);
        }
    }, [reset, setValue]);

    const handleServiceChange = (index: number, field: "name" | "price", value: string) => {
        const updatedServices = [...services];
        updatedServices[index][field] = value;
        setServices(updatedServices);
        localStorage.setItem("hasChanges", "true");
    };

    const addService = () => {
        setServices([...services, { name: "", price: "" }]);
        localStorage.setItem("hasChanges", "true");
    };

    const removeService = (index: number) => {
        if (services.length <= 1) return;
        const updatedServices = services.filter((_, i) => i !== index);
        setServices(updatedServices);
        localStorage.setItem("hasChanges", "true");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            setUploadError("No file selected.");
            setFile(null);
            return;
        }

        const selectedFile = e.target.files[0];
        if (!["image/jpeg", "image/png", "image/gif"].includes(selectedFile.type)) {
            setUploadError("Only JPEG, PNG, or GIF files are supported.");
            setFile(null);
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            setUploadError("File size exceeds 5MB limit.");
            setFile(null);
            return;
        }

        setFile(selectedFile);
        setUploadError("");
    };

    const uploadImage = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!file) {
            setUploadError("Please select a file to upload.");

            return;
        }

        setIsUploading(true);
        setUploadError("");
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/image-upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Upload failed with status ${response.status}`);
            }

            const data = await response.json();
            if (!data.imageUrl) {
                throw new Error("No image URL returned from server.");
            }

            setImageUrl(data.imageUrl);
            setValue("imageUrl", data.imageUrl, { shouldValidate: true });
            setFile(null);
        } catch (error) {
            console.error("Upload error:", error);
            setUploadError(
                error instanceof Error ? error.message : "Failed to upload image. Please try again."
            );
        } finally {
            setIsUploading(false);
        }
    };

    const onSubmit = (data: ServicesFormData) => {
        console.log("Form submitted:", data);
        const servicesData: ServicesData = {
            subcategories: [
                {
                    businesses: [
                        {
                            services: data.services,
                            imageUrl: data.imageUrl || imageUrl,
                        },
                    ],
                },
            ],
        };
        localStorage.setItem("servicesFormData", JSON.stringify(servicesData));
        localStorage.setItem("hasChanges", "true");
        updateData(servicesData);
        setIsEditing(false);
        setHasExistingData(true);

        return;
    };

    const handleNext = () => {
        const dataToSave: ServicesData = {
            subcategories: [
                {
                    businesses: [
                        {
                            services,
                            imageUrl,
                        },
                    ],
                },
            ],
        };
        localStorage.setItem("servicesFormData", JSON.stringify(dataToSave));
        localStorage.setItem("hasChanges", "true");
        router.push("/review&publish");

        return;
    };

    const handlePrevious = () => {
        const dataToSave: ServicesData = {
            subcategories: [
                {
                    businesses: [
                        {
                            services,
                            imageUrl,
                        },
                    ],
                },
            ],
        };
        localStorage.setItem("servicesFormData", JSON.stringify(dataToSave));
        localStorage.setItem("hasChanges", "true");
        prevStep();

        return;
    };

    const toggleEdit = () => {
        if (isEditing) {
            const savedData = localStorage.getItem("servicesFormData");
            if (savedData) {
                try {
                    const parsedData = JSON.parse(savedData);
                    const savedServices = parsedData.subcategories?.[0]?.businesses?.[0]?.services || [
                        { name: "", price: "" },
                    ];
                    const savedImageUrl = parsedData.subcategories?.[0]?.businesses?.[0]?.imageUrl || "";
                    reset({
                        services: savedServices,
                        imageUrl: savedImageUrl,
                    });
                    setImageUrl(savedImageUrl);
                } catch (error) {
                    console.error("Error parsing saved data:", error);
                }
            }
        } else {
            localStorage.setItem("isEditModeActive", "true");
            localStorage.setItem("hasChanges", "true");
        }
        setIsEditing(!isEditing);
    };

    const isReadOnly = hasExistingData && !isEditing;

    return (
        <main className="relative max-w-4xl mx-auto p-5 z-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Services & Gallery</h2>
                    {isReadOnly && (
                        <button
                            onClick={toggleEdit}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            aria-label="Edit Services and Gallery"
                        >
                            <Pencil className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {isReadOnly ? (
                    <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-md">
                        Viewing saved services and gallery.
                    </div>
                ) : (
                    <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-md">
                        {hasExistingData ? "Editing services and gallery." : "Please enter your services and upload images."}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-600">
                    <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-600">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Service Details</h3>
                        {services.map((service, index) => (
                            <div key={index} className="flex flex-wrap gap-4 mb-4 items-center">
                                <div className="flex-1 min-w-[200px]">
                                    <label
                                        htmlFor={`service-name-${index}`}
                                        className="block mb-2 font-medium text-gray-700 dark:text-gray-200"
                                    >
                                        Service Name:
                                    </label>
                                    <input
                                        id={`service-name-${index}`}
                                        type="text"
                                        {...register(`services.${index}.name`)}
                                        readOnly={isReadOnly}
                                        className={`w-full p-2 rounded-md focus:ring-2 focus:ring-blue-500 ${
                                            isReadOnly
                                                ? "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                                : errors.services?.[index]?.name
                                                ? "border border-red-500"
                                                : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                        }`}
                                        placeholder="Enter service name"
                                    />
                                    {errors.services?.[index]?.name && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.services[index].name.message}
                                        </p>
                                    )}
                                </div>

                                <div className="flex-1 min-w-[150px]">
                                    <label
                                        htmlFor={`service-price-${index}`}
                                        className="block mb-2 font-medium text-gray-700 dark:text-gray-200"
                                    >
                                        Price:
                                    </label>
                                    <input
                                        id={`service-price-${index}`}
                                        type="text"
                                        {...register(`services.${index}.price`)}
                                        readOnly={isReadOnly}
                                        className={`w-full p-2 rounded-md focus:ring-2 focus:ring-blue-500 ${
                                            isReadOnly
                                                ? "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                                : errors.services?.[index]?.price
                                                ? "border border-red-500"
                                                : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                        }`}
                                        placeholder="Enter price"
                                    />
                                    {errors.services?.[index]?.price && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.services[index].price.message}
                                        </p>
                                    )}
                                </div>
                                {!isReadOnly && services.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeService(index)}
                                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 mt-6"
                                        aria-label={`Remove service ${index + 1}`}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                        {errors.services && !errors.services[0] && (
                            <p className="mt-1 text-sm text-red-500">{errors.services.message}</p>
                        )}
                        {!isReadOnly && (
                            <Button
                                type="button"
                                className="mt-4 bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 focus:ring-2 focus:ring-green-500"
                                onClick={addService}
                            >
                                Add Service
                            </Button>
                        )}
                    </div>

                    <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-600">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Gallery</h3>
                        <div className="flex flex-col items-start gap-2">
                            <label htmlFor="file-upload" className="text-gray-700 dark:text-gray-300">
                                Choose an image to upload:
                            </label>
                            <input
                                id="file-upload"
                                type="file"
                                accept="image/jpeg,image/png,image/gif"
                                onChange={handleFileChange}
                                className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                                disabled={isUploading || isReadOnly}
                                aria-describedby="file-upload-help"
                            />
                            <p id="file-upload-help" className="text-sm text-gray-500 dark:text-gray-400">
                                Select a JPEG, PNG, or GIF image (max 5MB)
                            </p>
                            {uploadError && <p className="mt-1 text-sm text-red-500">{uploadError}</p>}
                        </div>
                        <button
                            type="button"
                            onClick={uploadImage}
                            disabled={!file || isUploading || isReadOnly}
                            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500"
                        >
                            {isUploading ? "Uploading..." : "Upload Image"}
                        </button>
                        {imageUrl && (
                            <div className="mt-4">
                                <p className="text-gray-700 dark:text-gray-300">Uploaded Image:</p>
                                <img
                                    src={imageUrl}
                                    alt="Uploaded image"
                                    className="mt-2 w-full max-w-xs h-auto object-cover rounded-md border border-gray-200 dark:border-gray-600"
                                />
                                {!isReadOnly && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImageUrl("");
                                            setValue("imageUrl", "", { shouldValidate: true });
                                            localStorage.setItem("hasChanges", "true");
                                        }}
                                        className="mt-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                        aria-label="Remove uploaded image"
                                    >
                                        <Trash2 className="w-5 h-5 inline" /> Remove Image
                                    </button>
                                )}
                            </div>
                        )}
                        {errors.imageUrl && (
                            <p className="mt-1 text-sm text-red-500">{errors.imageUrl.message}</p>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between gap-3 mt-4">
                        <Button
                            className="w-full sm:w-auto focus:ring-2 focus:ring-gray-500 bg-gray-600 text-white hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600"
                            onClick={handlePrevious}
                            disabled={isUploading}
                        >
                            Previous
                        </Button>
                        <Button
                            className="w-full sm:w-auto focus:ring-2 focus:ring-blue-500 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                            color="primary"
                            type="submit"
                            disabled={isReadOnly || isUploading}
                        >
                            Save
                        </Button>
                        <Button
                            className="w-full sm:w-auto focus:ring-2 focus:ring-gray-500 bg-gray-600 text-white hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600"
                            onClick={handleNext}
                            disabled={isUploading}
                        >
                            Next
                        </Button>
                    </div>
                </form>
            </div>
        </main>
    );
};

export default Services;