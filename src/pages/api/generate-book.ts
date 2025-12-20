
import { NextRequest, NextResponse } from "next/server";
import { generateBook } from "@/app/actions/generate-book-action";

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

export default async function handler(req: NextRequest) {
    if (req.method !== 'POST') {
        return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
    }

    try {
        const { topic } = await req.json();
        if (!topic) {
            return NextResponse.json({ error: "Topic is required" }, { status: 400 });
        }
        
        const result = await generateBook(topic);
        
        return NextResponse.json({ pdfPath: result.pdfPath });

    } catch (err: any) {
        console.error("API Route Error:", err);
        return NextResponse.json({ error: err.message || "Failed to generate book due to an internal error." }, { status: 500 });
    }
}
