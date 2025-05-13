"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PinCodeDetails, BusinessDetailsWithPinCode } from "./Stepper";
import React from "react";

interface CategoryData {
    id: number;
    categoryName: string;
    subcategories: { id: number; subcategoryName: string; categoryId: number }[];
}

interface PincodeData {
    id: number;
    pincode: string;
    taluk: string;
    city: string;
    stateName: string;
    districtName: string;
}

const stepper1Schema = z.object({
    category: z.string().min(1, "Please select a category"),
    subcategory: z.string().min(1, "Please select a subcategory"),
    businessName: z
        .string()
        .min(1, "Business name is required")
        .max(100, "Business name must be 100 characters or less"),
    description: z
        .string()
        .min(1, "Description is required")
        .max(500, "Description must be 500 characters or less"),
    pincode: z.string().min(1, "Please select a pincode"),
});

type Stepper1FormData = z.infer<typeof stepper1Schema>;

interface WelcomeProps {
    updateData: (data: BusinessDetailsWithPinCode) => void;
    isEditMode?: boolean;
}

export default function Welcome({ updateData, isEditMode = false }: WelcomeProps) {
    const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
    const [pincodeData, setPincodeData] = useState<PincodeData[]>([]);
    const [loading, setLoading] = useState({
        categories: true,
        pincodes: true,
    });
    const [error, setError] = useState({
        categories: "",
        pincodes: "",
    });
    const [isReadOnly, setIsReadOnly] = useState(isEditMode);
    const [isEditing, setIsEditing] = useState(false);
    const [hasExistingData, setHasExistingData] = useState(isEditMode);
    const [selectedPincode, setSelectedPincode] = useState<PincodeData | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<Stepper1FormData>({
        resolver: zodResolver(stepper1Schema),
        mode: "onChange",
        defaultValues: {
            category: "",
            subcategory: "",
            businessName: "",
            description: "",
            pincode: "",
        },
    });

    const selectedCategory = watch("category");
    const selectedPincodeValue = watch("pincode");

    // Log current pincode value for debugging
    console.log("Current form pincode:", watch("pincode"));

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("https://dbapiservice.onrender.com/dbapis/v1/categories?extended=true");
                if (!response.ok) {
                    throw new Error("Failed to fetch categories");
                }
                const data = await response.json();
                setCategoryData(data);
                setLoading((prev) => ({ ...prev, categories: false }));
            } catch (err) {
                console.error("Error fetching categories:", err);
                setError((prev) => ({ ...prev, categories: "Failed to load categories" }));
                setLoading((prev) => ({ ...prev, categories: false }));
            }
        };

        fetchCategories();
    }, []);

    // Fetch pincodes
    useEffect(() => {
        const fetchPincodes = async () => {
            try {
                const response = await fetch("https://dbapiservice.onrender.com/dbapis/v1/pincodes");
                if (!response.ok) {
                    throw new Error("Failed to fetch pincodes");
                }
                const data = await response.json();
                // Ensure pincode is a string
                const normalizedData = data.map((p: PincodeData) => ({
                    ...p,
                    pincode: String(p.pincode).trim(),
                }));
                setPincodeData(normalizedData);
                setLoading((prev) => ({ ...prev, pincodes: false }));

                if (isEditMode) {
                    const savedData = localStorage.getItem("welcomeFormData");
                    if (savedData) {
                        const parsedData = JSON.parse(savedData);
                        if (parsedData.pincode) {
                            const matchedPincode = normalizedData.find(
                                (p: PincodeData) => p.pincode === String(parsedData.pincode).trim()
                            );
                            if (matchedPincode) {
                                setSelectedPincode(matchedPincode);
                                setValue("pincode", matchedPincode.pincode, { shouldValidate: true });
                            } else {
                                console.warn("Saved pincode not found in pincodeData:", parsedData.pincode);
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("Error fetching pincodes:", err);
                setError((prev) => ({ ...prev, pincodes: "Failed to load pincodes" }));
                setLoading((prev) => ({ ...prev, pincodes: false }));
            }
        };

        fetchPincodes();
    }, [setValue, isEditMode]);

   
    useEffect(() => {
        if (isEditMode) {
            const savedData = localStorage.getItem("welcomeFormData");
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                reset({
                    ...parsedData,
                    pincode: String(parsedData.pincode).trim(), 
                });
                setHasExistingData(true);
            }
        } else {
            localStorage.removeItem("welcomeFormData");
            localStorage.removeItem("isEditModeActive");
            localStorage.removeItem("hasChanges");
            reset();
        }
    }, [reset, isEditMode]);

    const handlePincodeSelect = (pincode: string) => {
        console.log("Selected pincode:", pincode);
        const normalizedPincode = String(pincode).trim();
        const selected = pincodeData.find((p) => p.pincode === normalizedPincode);
        if (selected) {
            setSelectedPincode(selected);
            setValue("pincode", selected.pincode, { shouldValidate: true });
            localStorage.setItem("hasChanges", "true");
        } else {
            console.error("Pincode not found in pincodeData:", normalizedPincode);
            setValue("pincode", "", { shouldValidate: true });
        }
    };

    const handleEdit = () => {
        setIsReadOnly(false);
        setIsEditing(true);
        localStorage.setItem("isEditModeActive", "true");
        localStorage.setItem("hasChanges", "true");
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCategory = e.target.value;
        setValue("category", newCategory, { shouldValidate: true });
        setValue("subcategory", "", { shouldValidate: true });
        localStorage.setItem("hasChanges", "true");
    };

    const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSubcategory = e.target.value;
        setValue("subcategory", newSubcategory, { shouldValidate: true });
        localStorage.setItem("hasChanges", "true");
    };

    const getSubcategories = () => {
        if (!selectedCategory) return [];
        const categoryObj = categoryData.find((cat) => cat.categoryName === selectedCategory);
        return categoryObj?.subcategories || [];
    };

    const saveFormData = (data: Stepper1FormData) => {
        console.log("Saving form data:", data);
        console.log("categoryData:", categoryData);
        console.log("pincodeData:", pincodeData);

        try {
            const normalizedPincode = String(data.pincode).trim();

            // Validate all fields
            const isValidCategory = categoryData.some((cat) => cat.categoryName === data.category);
            if (!isValidCategory) {
                throw new Error("Selected category is invalid or not found.");
            }

            const categoryObj = categoryData.find((cat) => cat.categoryName === data.category);
            const isValidSubcategory = categoryObj?.subcategories.some(
                (subcat) => subcat.subcategoryName === data.subcategory
            );
            if (!isValidSubcategory) {
                throw new Error("Selected subcategory is invalid or does not belong to the selected category.");
            }

            const isValidPincode = pincodeData.some((p) => p.pincode === normalizedPincode);
            if (!isValidPincode) {
                throw new Error(
                    `Selected pincode "${normalizedPincode}" is invalid or not found in available pincodes.`
                );
            }

            const savedData = {
                category: data.category,
                subcategory: data.subcategory,
                pincode: normalizedPincode,
                businessName: data.businessName,
                description: data.description,
            };

            localStorage.setItem("welcomeFormData", JSON.stringify(savedData));
            localStorage.setItem("hasChanges", "true");

            console.log("Saved to localStorage:", savedData);
            return true;
        } catch (e) {
            console.error("Error saving form data:", e);
            alert(e instanceof Error ? e.message : "Failed to save information. Please try again.");
            return false;
        }
    };

    const onSubmit = (data: Stepper1FormData) => {
        if (loading.categories || loading.pincodes || !pincodeData.length) {
            alert("Please wait until all data is loaded and pincodes are available before submitting.");
            return;
        }

        const getCategoryId = (categoryName: string, subcategoryName: string) => {
            const category = categoryData.find((cat) => cat.categoryName === categoryName);
            const subcategory = category?.subcategories.find((subcat) => subcat.subcategoryName === subcategoryName);
            return {
                categoryId: category?.id,
                subcategoryId: subcategory?.id,
            };
        };

        const { categoryId, subcategoryId } = getCategoryId(data.category, data.subcategory);
        const normalizedPincode = String(data.pincode).trim();
        const pincodeDetails = pincodeData.find((p) => p.pincode === normalizedPincode);

        const welcomeData = {
            ...data,
            pincode: normalizedPincode,
            categoryId: categoryId || 0,
            subcategoryId: subcategoryId || 0,
            taluk: pincodeDetails?.taluk || "",
            city: pincodeDetails?.city || "",
            state: pincodeDetails?.stateName || "",
            district: pincodeDetails?.districtName || "",
        };

        updateData(welcomeData);

        if (saveFormData(data)) {
            setIsReadOnly(true);
            setIsEditing(false);
            setHasExistingData(true);
            localStorage.removeItem("isEditModeActive");
        }
    };

    if (loading.categories || loading.pincodes) {
        return <div className="max-w-4xl mx-auto p-5">Loading data...</div>;
    }

    if (error.categories || error.pincodes) {
        return (
            <div className="max-w-4xl mx-auto p-5 text-red-500">{error.categories || error.pincodes}</div>
        );
    }

    if (!pincodeData.length) {
        return (
            <div className="max-w-4xl mx-auto p-5 text-red-500">
                No pincodes available. Please try again later.
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-5">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Business Setup</h2>
                    {isReadOnly && (
                        <button
                            onClick={handleEdit}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            aria-label="Edit Information"
                        >
                            <Pencil className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {isReadOnly ? (
                    <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md">
                        Viewing saved business information.
                    </div>
                ) : (
                    <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-md">
                        {hasExistingData ? "Editing business information." : "Please enter your business information."}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-600"
                >
                    <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Business Details</h3>

                 
                    <div className="mb-6">
                        <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                            Pincode:
                            <select
                                {...register("pincode")}
                                disabled={isReadOnly || loading.pincodes || !pincodeData.length}
                                onChange={(e) => handlePincodeSelect(e.target.value)}
                                className={`w-80 block p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 mt-1 ${
                                    isReadOnly || loading.pincodes || !pincodeData.length
                                        ? "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                        : errors.pincode
                                        ? "border-red-500"
                                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                }`}
                            >
                                <option value="">Select a pincode</option>
                                {pincodeData.map((pincode) => (
                                    <option key={pincode.id} value={pincode.pincode}>
                                        {pincode.pincode} - {pincode.city}, {pincode.districtName}
                                    </option>
                                ))}
                            </select>
                        </label>
                        {errors.pincode && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.pincode.message}</p>
                        )}
                        {/* {selectedPincode && (
                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                <p>Area: {selectedPincode.taluk}</p>
                                <p>City: {selectedPincode.city}</p>
                                <p>District: {selectedPincode.districtName}</p>
                                <p>State: {selectedPincode.stateName}</p>
                            </div>
                        )} */}
                    </div>

                 
                    <div className="flex-1 min-w-[250px] mb-8">
                        <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                            Category:
                            <select
                                id="category-select"
                                {...register("category", {
                                    onChange: handleCategoryChange,
                                })}
                                disabled={isReadOnly || loading.categories}
                                className={`w-80 block p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 mt-1 ${
                                    isReadOnly || loading.categories
                                        ? "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                        : errors.category
                                        ? "border-red-500"
                                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                }`}
                            >
                                <option value="">Select a category</option>
                                {categoryData.map((category) => (
                                    <option key={category.id} value={category.categoryName}>
                                        {category.categoryName}
                                    </option>
                                ))}
                            </select>
                        </label>
                        {errors.category && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category.message}</p>
                        )}
                    </div>

                    <div className="flex-1 min-w-[250px] mb-8">
                        <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
                            Subcategory:
                            <select
                                id="subcategory-select"
                                {...register("subcategory", {
                                    onChange: handleSubcategoryChange,
                                })}
                                disabled={isReadOnly || !selectedCategory || loading.categories}
                                className={`w-80 block p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 mt-1 ${
                                    isReadOnly || !selectedCategory || loading.categories
                                        ? "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                        : errors.subcategory
                                        ? "border-red-500"
                                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                }`}
                            >
                                <option value="">Select a subcategory</option>
                                {getSubcategories().map((subcat) => (
                                    <option key={subcat.id} value={subcat.subcategoryName}>
                                        {subcat.subcategoryName}
                                    </option>
                                ))}
                            </select>
                        </label>
                        {errors.subcategory && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.subcategory.message}</p>
                        )}
                    </div>

                
                    <div className="mb-4">
                        <label
                            htmlFor="businessName"
                            className="block mb-2 font-medium text-gray-700 dark:text-gray-200"
                        >
                            Business Name:
                        </label>
                        <input
                            id="businessName"
                            {...register("businessName")}
                            readOnly={isReadOnly}
                            className={`w-full p-2 rounded-md focus:ring-2 focus:ring-blue-500 ${
                                isReadOnly
                                    ? "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                    : errors.businessName
                                    ? "border border-red-500"
                                    : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                            }`}
                            placeholder="Enter your business name"
                        />
                        {errors.businessName && (
                            <p className="mt-1 text-sm text-red-500">{errors.businessName.message}</p>
                        )}
                    </div>

                  
                    <div>
                        <label
                            htmlFor="description"
                            className="block mb-2 font-medium text-gray-700 dark:text-gray-200"
                        >
                            Description:
                        </label>
                        <textarea
                            id="description"
                            {...register("description")}
                            readOnly={isReadOnly}
                            className={`w-full p-2 rounded-md h-24 focus:ring-2 focus:ring-blue-500 ${
                                isReadOnly
                                    ? "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                    : errors.description
                                    ? "border border-red-500"
                                    : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                            }`}
                            placeholder="Describe your business"
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                        )}
                    </div>

                    <div className="mt-6">
                        <Button
                            className="w-full sm:w-auto focus:ring-2 focus:ring-blue-500 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                            color="primary"
                            type="submit"
                            disabled={isReadOnly || loading.categories || loading.pincodes || !pincodeData.length}
                        >
                            Save
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}