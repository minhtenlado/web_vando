'use client' // Error components must be Client Components
 
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])
 
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6 p-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Đã xảy ra sự cố!</h2>
        <p className="text-muted-foreground max-w-[500px]">
          Chúng tôi rất xin lỗi vì sự bất tiện này. Đã có lỗi không mong muốn xảy ra trong quá trình tải trang.
        </p>
      </div>
      <Button onClick={() => reset()} size="lg">
        Thử lại
      </Button>
    </div>
  )
}
