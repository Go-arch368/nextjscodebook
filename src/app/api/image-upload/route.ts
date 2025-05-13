
import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await fs.mkdir(uploadDir, { recursive: true });

        const form = formidable({
            uploadDir,
            keepExtensions: true,
            maxFileSize: 5 * 1024 * 1024, // 5MB limit
        });

        const { files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
            form.parse(req as any, (err, fields, files) => {
                if (err) reject(err);
                resolve({ fields, files });
            });
        });

        const file = files.file?.[0];
        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const newFilename = `${Date.now()}-${file.originalFilename}`;
        const newPath = path.join(uploadDir, newFilename);
        await fs.rename(file.filepath, newPath);

        const imageUrl = `/uploads/${newFilename}`;
        return NextResponse.json({ imageUrl }, { status: 200 });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to upload image" },
            { status: 500 }
        );
    }
}