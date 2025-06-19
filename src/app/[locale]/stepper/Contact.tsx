"use client"
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";

interface ContactFormData {
    contact: {
        phone: string;
        email: string;
        website: string;
    };
}

interface ContactFormProps {
    isReadOnly?: boolean;
}

const ContactForm: React.FC<ContactFormProps & { updateData?: (data: ContactFormData) => void }> = ({ updateData }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<ContactFormData>();
    const [isReadOnly, setIsReadOnly] = React.useState(false);

    const onSubmit: SubmitHandler<ContactFormData> = (data) => {
        setIsReadOnly(true);
        if (updateData) {
            updateData(data);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-5">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 relative">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Contact & Timings</h2>
                    {isReadOnly && (
                        <button
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            aria-label="Edit Contact and Timings"
                        >
                            <Pencil className="w-5 h-5" />
                        </button>
                    )}
                </div>
                {isReadOnly ? (
                    <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-md">
                        Viewing saved contact and timings information.
                    </div>
                ) : (
                    <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-md">
                        {isReadOnly ? "Editing contact and timings." : "Please enter your contact and timings information."}
                    </div>
                )}
                <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Contact Information</h3>
                    <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex-1 min-w-[250px]">
                            <label htmlFor="phone" className="block mb-2 font-medium text-gray-700 dark:text-gray-200">Phone Number</label>
                            <input
                                id="phone"
                                {...register("contact.phone")}
                                type="tel"
                                readOnly={isReadOnly}
                                className={`w-full  flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 ${isReadOnly ? "bg-gray-100 dark:bg-gray-700" : ""
                                    } focus:ring-2 focus:ring-gray-500`}
                                placeholder="Enter phone number"
                            />
                            {errors.contact?.phone && <p className="text-red-500 text-sm">{errors.contact.phone.message}</p>}
                        </div>

                        <div className="flex-1 min-w-[250px]">
                            <label htmlFor="contact-email" className="block mb-2 font-medium text-gray-700 dark:text-gray-200">Email</label>
                            <input
                                id="contact-email"
                                {...register("contact.email")}
                                type="email"
                                readOnly={isReadOnly}
                                className={`w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 ${isReadOnly ? "bg-gray-100 dark:bg-gray-700" : ""
                                    } focus:ring-2 focus:ring-gray-500`}
                                placeholder="Enter email"
                            />
                            {errors.contact?.email && <p className="text-red-500 text-sm">{errors.contact.email.message}</p>}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <label htmlFor="contact-website" className="block mb-2 font-medium text-gray-700 dark:text-gray-200">Website</label>
                        <input
                            id="contact-website"
                            {...register("contact.website")}
                            type="url"
                            readOnly={isReadOnly}
                            className={`w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 ${isReadOnly ? "bg-gray-100 dark:bg-gray-700" : ""
                                } focus:ring-2 focus:ring-gray-500`}
                            placeholder="Enter website URL"
                        />
                        {errors.contact?.website && <p className="text-red-500 text-sm">{errors.contact.website.message}</p>}
                    </div>
                </div>
                <Button
                    type="submit"
                    disabled={isReadOnly}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    Save
                </Button>
            </form>
        </div>
    );
};

export default ContactForm;
