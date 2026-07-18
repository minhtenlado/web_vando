import { del } from '@vercel/blob';

/**
 * Xóa một hoặc nhiều file từ Vercel Blob Storage dựa vào URL.
 * Chỉ xóa nếu URL hợp lệ (thuộc về Vercel Blob).
 */
export async function deleteVercelBlob(urls: string | string[] | null | undefined) {
  if (!urls) return;
  
  const urlArray = Array.isArray(urls) ? urls : [urls];
  const validUrls = urlArray.filter((url) => url && url.includes('vercel-storage.com'));
  
  if (validUrls.length === 0) return;

  try {
    await del(validUrls);
    console.log(`[Blob] Deleted ${validUrls.length} files successfully.`);
  } catch (error) {
    console.error(`[Blob] Failed to delete blobs:`, error);
  }
}
