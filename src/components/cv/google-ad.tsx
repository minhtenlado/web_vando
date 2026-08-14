'use client'

import { useEffect, useRef } from "react"

type GoogleAdProps = {
  adClient: string
  adSlot: string
  format?: string
  responsive?: boolean
  layoutKey?: string
  className?: string
}

export function GoogleAd({ adClient, adSlot, format = "auto", responsive = true, layoutKey, className = "" }: GoogleAdProps) {
  const adRef = useRef<HTMLModElement>(null)

  useEffect(() => {
    // Only push if the ad hasn't been pushed yet to prevent double-pushing errors
    try {
      if (adRef.current && !adRef.current.dataset.adStatus) {
        adRef.current.dataset.adStatus = 'done';
        // @ts-ignore
        ;(window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error("AdSense error:", err)
    }
  }, [])

  return (
    <div className={`w-full text-center overflow-hidden flex items-center justify-center ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", width: "100%" }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
        {...(layoutKey ? { "data-ad-layout-key": layoutKey } : {})}
      />
    </div>
  )
}
