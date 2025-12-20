
import { NextRequest, NextResponse } from "next/server";
import { generateBook } from "@/app/actions/generate-book-action";

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

export default async function handler(req: NextRequest) {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const { bookTitle, chapterTitles } = await req.json();
        if (!bookTitle || !chapterTitles || !Array.isArray(chapterTitles)) {
            return NextResponse.json({ error: "Missing bookTitle or chapterTitles" }, { status: 400 });
        }
        const result = await generateBook(bookTitle, chapterTitles);
        return NextResponse.json({ pdfPath: result.pdfPath });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: "Failed to generate book: " + err.message }, { status: 500 });
    }
}
