"use client";

import { useState } from "react";
import { Home, MapPin, Phone, Settings, CheckCircle, Check , CircleCheck } from "lucide-react";
import Welcome from "./Welcome";
import Location from "./Location";
import Contact from "./Contact";
import Services from "./Services";
import ReviewandPublish from "./ReviewandPublish";

export interface PinCodeDetails {
    pincode: string;
    taluk?: string;
    city: string;
    stateName: string;
    districtName: string;
}

export interface LocationData {
    addressLine1: string;
    addressLine2: string;
    latitude: number;
    longitude: number;
}

export interface BusinessDetails {
    category: string;
    subcategory: string;
    businessName: string;
    description: string;
}

export interface BusinessDetailsWithPinCode extends PinCodeDetails {
    businessName: string;
    categoryId: string;
    category: string;
    subcategoryId: string;
    subcategory: string;
    businesses: BusinessDetails[];
}

export interface ContactDetails {
    phone: string;
    email: string;
    website: string;
}

export interface ContactandTimings {
    contact: ContactDetails;
}

interface OnboardingData {
    welcome: BusinessDetailsWithPinCode;
    location: LocationData;
    contact: ContactandTimings;
    services: Record<string, unknown>;
}

const steps = [
    {
        id: 1,
        title: "Welcome",
        icon: Home,
    },
    {
        id: 2,
        title: "Location",
        icon: MapPin,
    },
    {
        id: 3,
        title: "Contact & Timing",
        icon: Phone,
    },
    {
        id: 4,
        title: "Services",
        icon: Settings,
    },
    {
        id: 5,
        title: "Review & Publish",
        icon: CheckCircle,
    },
];

export default function Onboarding() {
    const [currentStep, setCurrentStep] = useState(1);
    const [onboardingData, setOnboardingData] = useState<OnboardingData>({
        welcome: {
            businessName: "",
            categoryId: "",
            category: "",
            subcategoryId: "",
            subcategory: "",
            pincode: "",
            city: "",
            stateName: "",
            districtName: "",
            taluk: "",
        },
        location: {
            addressLine1: "",
            addressLine2: "",
            latitude: 0,
            longitude: 0,
        },
        contact: {
            contact: {
                phone: "",
                email: "",
                website: "",
            },
        },
        services: {},
    });

    const updateOnboardingData = (step: keyof OnboardingData, data: Partial<OnboardingData[keyof OnboardingData]>) => {
        setOnboardingData((prevData) => ({
            ...prevData,
            [step]: { ...prevData[step], ...data },
        }));
    };

    const nextStep = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const goToStep = (step: number) => {
        if (step >= 1 && step <= steps.length) {
            setCurrentStep(step);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return <Welcome updateData={(data) => updateOnboardingData("welcome", data)} />;
            case 2:
                return <Location updateData={(data) => updateOnboardingData("location", data)} />;
            case 3:
                return <Contact updateData={(data) => updateOnboardingData("contact", data)} />;
            case 4:
                return <Services updateData={(data) => updateOnboardingData("services", data)} prevStep={prevStep} />;
            case 5:
                return <ReviewandPublish onboardData={onboardingData} />;
            default:
                return <Welcome updateData={(data) => updateOnboardingData("welcome", data)} />;
        }
    };

    return (
        <>
            {/* Stepper Header */}
            <div className="w-full py-4 px-4 sm:px-8 md:px-16 lg:px-24 fixed bg-gray-50 shadow-md z-20">
                <div className="max-w-4xl mx-auto flex flex-row gap-4 sm:gap-8">
                    {/* Stepper Navigation */}
                    <div className="relative mb-4 grow">
                        {/* Connecting Lines */}
                        <div className="absolute top-4 left-0 right-0 h-0.5 z-0 px-4 sm:px-8">
                            <div className="relative w-full h-full">
                                {steps.map((step, index) => {
                                    if (index === steps.length - 1) return null;

                                    const lineClasses = `absolute h-0.5 inset-0 ${
                                        index < currentStep - 1 ? "bg-green-500" : "bg-gray-200"
                                    }`;

                                    const leftPercentage = `${(index / (steps.length - 1)) * 100}%`;
                                    const rightPercentage = `${((index + 1) / (steps.length - 1)) * 100}%`;

                                    const style = {
                                        left: leftPercentage,
                                        right: `calc(100% - ${rightPercentage})`,
                                    };

                                    return (
                                        <div key={`line-${index}`} className={lineClasses} style={style}></div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Step Circles and Titles */}
                        <div className="flex justify-between items-center relative z-10">
                            {steps.map((step) => {
                                const StepIcon = step.icon;
                                const isCompleted = step.id < currentStep;
                                const isCurrent = step.id === currentStep;
                                const isPending = step.id > currentStep;

                                return (
                                    <div key={step.id} className="flex flex-col items-center relative z-10">
                                   
                                        <div className="relative">
                                
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                                                    isCompleted
                                                        ? "bg-green-500 text-white"
                                                        : isCurrent
                                                        ? "bg-white border-2 border-orange-500 ring-2 ring-orange-200"
                                                        : "bg-gray-200 text-gray-400"
                                                }`}
                                                onClick={() => step.id <= currentStep && goToStep(step.id)}
                                            >
                                                <StepIcon
                                                    className={`h-4 w-4 ${
                                                        isCompleted || isCurrent ? "" : "opacity-60"
                                                    }`}
                                                />
                                            </div>
                                            
                                            {isCompleted && (
                                                <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-200">
                                                    <CircleCheck className="h-3 w-3 text-green-500" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Step Title with Checkmark */}
                                        <div className="flex items-center mt-3">
                                            <p
                                                className={`text-xs text-center ${
                                                    isCurrent
                                                        ? "text-gray-800 font-medium"
                                                        : isCompleted
                                                        ? "text-green-600"
                                                        : "text-gray-400"
                                                }`}
                                            >
                                                {step.title}
                                            </p>
                                            {/* Checkmark Next to Title for Completed Steps */}
                                            {isCompleted && (
                                                <CircleCheck className="h-3 w-3 text-green-500 ml-1" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Step Counter */}
                    <div className="text-center px-4 py-3 rounded-full flex-none self-center text-white font-medium bg-blue-600">
                        <p className="text-sm">
                            Step {currentStep} / {steps.length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="w-full max-w-4xl mx-auto pb-8 px-4 sm:px-6 lg:px-8">
                <div className="pt-40 max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg p-6 shadow-md mb-6 min-h-64">
                        {renderStepContent()}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-6 pb-8">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className={`px-4 py-2 rounded-md ${
                                currentStep === 1
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : "bg-gray-500 hover:bg-gray-600 text-white"
                            }`}
                        >
                            Previous
                        </button>
                        <button
                            onClick={nextStep}
                            disabled={currentStep === steps.length}
                            className={`px-4 py-2 rounded-md ${
                                currentStep === steps.length
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700 text-white"
                            }`}
                        >
                            {currentStep === steps.length ? "Finish" : "Next"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}