import { NextResponse } from "next/server";
import BusinessListing from "../../../../../../models/BusinessListing";
import dbConnect from "@/lib/dbConnect";
// Category ID to name mapping
const categoryIdToName = {
  1: "Best Clinics",
  2: "Best Hospitals",
  3: "Best Dentists",
  4: "Chemists",
  5: "Best Veterinarians",
  6: "Car Repair & Services",
  7: "Car Showrooms",
  8: "Tyre Dealers",
  9: "Autospares Hub"
};

export async function GET(request, { params }) {
  try {
    // Connect to MongoDB
    await dbConnect();
    console.log("[Businesses API] Connected to MongoDB");

    // Extract pincode and categoryid
    const { pincode } = await params; // Await params
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryid");

    // Validate inputs
    if (!pincode) {
      console.log("[Businesses API] Pincode is missing");
      return NextResponse.json({ error: "Pincode is required" }, { status: 400 });
    }
    if (!categoryId || !categoryIdToName[categoryId]) {
      console.log("[Businesses API] Invalid categoryId:", categoryId);
      return NextResponse.json({ error: "Invalid or missing categoryid" }, { status: 400 });
    }

    // Map categoryId to category name
    const categoryName = categoryIdToName[categoryId];
    console.log("[Businesses API] Querying for category:", categoryName);

    // Query businesses by category only, include all fields
    const businesses = await BusinessListing.find({
      category: categoryName // Match category name
    });

    console.log("[Businesses API] Found businesses:", businesses.length);

    return NextResponse.json({
      pincode,
      categoryId,
      businesses
    });
  } catch (error) {
    console.error("[Businesses API] Error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}