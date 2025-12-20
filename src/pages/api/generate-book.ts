
import { NextRequest, NextResponse } from "next/server";
import { generateBook } from "@/app/actions/generate-book-action";

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

export default async function handler(req: NextRequest) {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const { topic } = await req.json();
        if (!topic) {
            return NextResponse.json({ error: "Missing topic" }, { status: 400 });
        }
        const result = await generateBook(topic);
        return NextResponse.json({ pdfPath: result.pdfPath });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: "Failed to generate book: " + err.message }, { status: 500 });
    }
}
