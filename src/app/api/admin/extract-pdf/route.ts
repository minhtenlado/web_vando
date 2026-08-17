import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import PDFParser from 'pdf2json';

// ===== SSRF Protection =====
const ALLOWED_PDF_HOSTS = new Set([
  // Vercel Blob Storage
  /\.public\.blob\.vercel-storage\.com$/,
  // Cloudinary
  /^res\.cloudinary\.com$/,
]);

function isAllowedUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    // Only allow HTTPS
    if (url.protocol !== 'https:') return false;
    // Block internal IPs
    const hostname = url.hostname;
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('169.254.') ||
      hostname === '[::1]' ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local')
    ) {
      return false;
    }
    // Check against allowed host patterns
    for (const pattern of ALLOWED_PDF_HOSTS) {
      if (pattern.test(hostname)) return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  // Auth check
  const guard = await requireAuth();
  if (guard instanceof Response) return guard;

  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // SSRF Protection: validate URL
    if (!isAllowedUrl(url)) {
      return NextResponse.json(
        { error: 'URL không hợp lệ. Chỉ chấp nhận HTTPS từ các nguồn tin cậy (Vercel Blob, Cloudinary).' },
        { status: 422 }
      );
    }

    // Fetch the PDF file with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    let response: Response;
    try {
      response = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/pdf' },
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch PDF from URL' }, { status: 400 });
    }

    // Validate content type
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('pdf') && !contentType.includes('octet-stream')) {
      return NextResponse.json({ error: 'URL không trỏ tới file PDF hợp lệ.' }, { status: 422 });
    }

    // Limit file size (max 20MB)
    const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
    if (contentLength > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'File PDF quá lớn (tối đa 20MB).' }, { status: 422 });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse the PDF
    return new Promise<NextResponse>((resolve) => {
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
            
            texts.sort((a: any, b: any) => {
              if (Math.abs(a.y - b.y) > 0.5) {
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
              
              let str = "";
              try {
                str = decodeURIComponent(rawStr);
              } catch {
                str = unescape(rawStr);
              }
              
              if (!str.trim()) {
                 if (str.includes(" ") && !pageText.endsWith(" ")) {
                    pageText += " ";
                 }
                 return;
              }

              if (lastY === -100) {
                pageText += str;
              } else if (Math.abs(y - lastY) < 0.8) {
                if (!pageText.endsWith(" ") && !str.startsWith(" ")) {
                  pageText += " " + str;
                } else {
                  pageText += str;
                }
              } else {
                const yDiff = Math.abs(y - lastY);
                
                if (yDiff > 1.8) {
                  pageText += "\n\n" + str;
                } else {
                  if (!pageText.endsWith(" ") && !str.startsWith(" ") && !pageText.endsWith("-")) {
                    pageText += " " + str;
                  } else if (pageText.endsWith("-")) {
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

          fullText = fullText.replace(/ {2,}/g, ' ');
          fullText = fullText.replace(/\n{3,}/g, '\n\n');

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
    return NextResponse.json({ error: 'Failed to extract PDF' }, { status: 500 });
  }
}
