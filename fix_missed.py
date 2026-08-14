import re

with open('src/components/admin/post-editor.tsx', 'r') as f:
    code = f.read()

replacements = [
  (r'from-\[#0d1713\]/90 to-\[#080e0b\]/90', 'from-white to-gray-50 dark:from-[#0d1713]/90 dark:to-[#080e0b]/90'),
  (r'text-\[#76f7c5\]', 'text-gray-900 dark:text-[#76f7c5]'),
  (r'bg-gradient-to-br from-\[#55efb6\] to-\[#18be86\] text-gray-900 dark:text-\[#03110b\]', 'bg-gradient-to-br from-[#55efb6] to-[#18be86] text-[#03110b]'), # Revert text-[#03110b] in the save button, as the button itself is green in both modes
]

for s, r in replacements:
    code = re.sub(s, r, code)

with open('src/components/admin/post-editor.tsx', 'w') as f:
    f.write(code)
print("Done")
