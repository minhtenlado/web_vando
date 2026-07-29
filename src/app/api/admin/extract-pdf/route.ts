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
      // 0 means we want the structured JSON data, not just raw text (which is 1)
      const pdfParser = new PDFParser(null, 0 as any);
      
      pdfParser.on("pdfParser_dataError", (errData: any) => {
        console.error("PDF Parser Error:", errData.parserError);
        resolve(NextResponse.json({ error: 'Lỗi khi đọc file PDF' }, { status: 500 }));
      });
      
      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        try {
          const pages = pdfData?.formImage?.Pages || pdfData?.Pages || [];
          let fullText = "";

          pages.forEach((page: any) => {
            const texts = page.Texts || [];
            
            // Sort texts by Y (top to bottom), then by X (left to right)
            texts.sort((a: any, b: any) => {
              if (Math.abs(a.y - b.y) > 0.5) { // 0.5 threshold for "same line"
                return a.y - b.y;
              }
              return a.x - b.x;
            });

            let pageText = "";
            let lastY = -100;

            texts.forEach((textItem: any) => {
              const y = textItem.y;
              const rawStr = textItem.R?.[0]?.T || "";
              if (!rawStr) return;
              
              // Decode URI component (pdf2json encodes text)
              let str = "";
              try {
                str = decodeURIComponent(rawStr);
              } catch (e) {
                str = unescape(rawStr);
              }
              
              if (!str.trim()) {
                 // Keep space if it's just a space
                 if (str.includes(" ") && !pageText.endsWith(" ")) {
                    pageText += " ";
                 }
                 return;
              }

              // Filter out obvious header/footer page numbers if needed (very short strings at the very top/bottom)
              // But for now, just join them properly.

              if (lastY === -100) {
                pageText += str;
              } else if (Math.abs(y - lastY) < 0.8) {
                // Same line. 
                if (!pageText.endsWith(" ") && !str.startsWith(" ")) {
                  pageText += " " + str;
                } else {
                  pageText += str;
                }
              } else {
                // Different line
                const yDiff = Math.abs(y - lastY);
                
                if (yDiff > 1.8) {
                  // Large gap -> New paragraph
                  pageText += "\n\n" + str;
                } else {
                  // Small gap -> Wrap in the same paragraph (join with space)
                  if (!pageText.endsWith(" ") && !str.startsWith(" ") && !pageText.endsWith("-")) {
                    pageText += " " + str;
                  } else if (pageText.endsWith("-")) {
                    // Hyphenated word break at the end of a line
                    pageText = pageText.slice(0, -1) + str;
                  } else {
                    pageText += str;
                  }
                }
              }
              
              lastY = y;
            });

            fullText += pageText + "\n\n";
          });

          // Final cleanup
          fullText = fullText.replace(/ {2,}/g, ' '); // Remove double spaces
          fullText = fullText.replace(/\n{3,}/g, '\n\n'); // Max 2 newlines

          resolve(NextResponse.json({ text: fullText.trim() }));
        } catch (e: any) {
           console.error("Error processing PDF data:", e);
           resolve(NextResponse.json({ error: 'Lỗi xử lý dữ liệu PDF' }, { status: 500 }));
        }
      });
      
      pdfParser.parseBuffer(buffer);
    });

  } catch (error: any) {
    console.error('PDF Extraction Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to extract PDF' }, { status: 500 });
  }
}
