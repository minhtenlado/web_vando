'use client'

export function ScientificSearchTrigger() {
  return (
    <button 
      onClick={() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))
      }}
      className="w-[36px] h-[36px] grid place-items-center border border-black/10 dark:border-white/10 rounded-[10px] text-gray-500 dark:text-[#aab0bc] bg-black/5 dark:bg-white/5 cursor-pointer transition-all hover:-translate-y-[2px] hover:text-gray-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10"
      title="Search (Ctrl+K)"
    >
      ⌕
    </button>
  )
}
