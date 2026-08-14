import re
import os

with open('src/components/admin/post-editor.tsx', 'r') as f:
    code = f.read()

replacements = [
  (r'bg-\[#050807\]', 'bg-gray-50 dark:bg-[#050807]'),
  (r'text-\[#f3f7f5\]', 'text-gray-900 dark:text-[#f3f7f5]'),
  (r'border-white/5', 'border-border/20 dark:border-white/5'),
  (r'bg-\[#050807\]/80', 'bg-white/80 dark:bg-[#050807]/80'),
  (r'text-\[#84918b\]', 'text-muted-foreground dark:text-[#84918b]'),
  (r'bg-white/5', 'bg-black/5 dark:bg-white/5'),
  (r'text-\[#aab5b0\]', 'text-gray-600 dark:text-[#aab5b0]'),
  (r'bg-\[#0d1713\]/90', 'bg-white dark:bg-[#0d1713]/90'),
  (r'text-\[#e7eee9\]', 'text-gray-900 dark:text-[#e7eee9]'),
  (r'bg-\[#08100d\]', 'bg-white dark:bg-[#08100d]'),
  (r'from-\[#0a1210\] to-\[#08100d\]', 'from-gray-50 to-gray-100 dark:from-[#0a1210] dark:to-[#08100d]'),
  (r'bg-\[#0e1814\]/90', 'bg-gray-100/90 dark:bg-[#0e1814]/90'),
  (r'text-\[#d9e0dc\]', 'text-gray-800 dark:text-[#d9e0dc]'),
  (r'bg-\[#0a1410\]/80', 'bg-white dark:bg-[#0a1410]/80'),
  (r'bg-\[#07100d\]', 'bg-gray-50 dark:bg-[#07100d]'),
  (r'text-\[#76857e\]', 'text-gray-500 dark:text-[#76857e]'),
  (r'text-\[#a0aaa5\]', 'text-gray-500 dark:text-[#a0aaa5]'),
  (r'bg-\[#060a08\]/90', 'bg-white/90 dark:bg-[#060a08]/90'),
  (r'\btext-white\b', 'text-gray-900 dark:text-white'),
  (r'text-\[#aeb8b3\]', 'text-gray-700 dark:text-[#aeb8b3]'),
  (r'border-\[#4BFFBE\]/10', 'border-border/20 dark:border-[#4BFFBE]/10'),
  (r'text-\[#03110b\]', 'text-gray-900 dark:text-[#03110b]'),
  (r'bg-\[#36e2a0\]/10', 'bg-primary/10 dark:bg-[#36e2a0]/10')
]

for s, r in replacements:
    code = re.sub(s, r, code)

# Clean up any potential double applying bugs if I ran this before
code = code.replace('dark:bg-white/80 dark:bg-[#050807]/80', 'dark:bg-[#050807]/80')

with open('src/components/admin/post-editor.tsx', 'w') as f:
    f.write(code)
print("Done")
