import { NextResponse } from 'next/server';
import PDFParser from 'pdf2json';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Fetch the PDF file
    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch PDF from URL' }, { status: 400 });
    }

    // Convert the response to an ArrayBuffer, then to a Buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse the PDF
    return new Promise<NextResponse>((resolve) => {
      const pdfParser = new PDFParser(null, 1 as any);
      
      pdfParser.on("pdfParser_dataError", (errData: any) => {
        console.error("PDF Parser Error:", errData.parserError);
        resolve(NextResponse.json({ error: 'Lỗi khi đọc file PDF' }, { status: 500 }));
      });
      
      pdfParser.on("pdfParser_dataReady", () => {
        const rawText = pdfParser.getRawTextContent();
        const cleanText = rawText.replace(/\r\n/g, '\n').replace(/\n\s*\n/g, '\n\n').trim();
        resolve(NextResponse.json({ text: cleanText }));
      });
      
      pdfParser.parseBuffer(buffer);
    });

  } catch (error: any) {
    console.error('PDF Extraction Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to extract PDF' }, { status: 500 });
  }
}
