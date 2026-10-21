export function LabMark({ className = '' }: { className?: string }) {
  return <svg className={className} width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path d="M6 4h20v24H6V4Z" stroke="currentColor" strokeWidth="1.3" />
    <path d="M12 10h8m-8 6h6m-6-6v12h8" stroke="currentColor" strokeWidth="1.7" />
    <path d="M1 10h5m-5 6h5m-5 6h5m20-12h5m-5 6h5m-5 6h5" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="23" cy="8" r="1.5" fill="currentColor" />
  </svg>;
}
