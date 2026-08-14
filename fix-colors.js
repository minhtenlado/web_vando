const fs = require('fs');
let code = fs.readFileSync('src/components/admin/post-editor.tsx', 'utf8');

const replacements = [
  { s: /bg-\[#050807\]/g, r: 'bg-gray-50 dark:bg-[#050807]' },
  { s: /text-\[#f3f7f5\]/g, r: 'text-gray-900 dark:text-[#f3f7f5]' },
  { s: /border-white\/5/g, r: 'border-border/20 dark:border-white/5' },
  { s: /bg-\[#050807\]\/80/g, r: 'bg-white/80 dark:bg-[#050807]/80' },
  { s: /text-\[#84918b\]/g, r: 'text-muted-foreground dark:text-[#84918b]' },
  { s: /bg-white\/5/g, r: 'bg-black/5 dark:bg-white/5' },
  { s: /text-\[#aab5b0\]/g, r: 'text-gray-600 dark:text-[#aab5b0]' },
  { s: /bg-\[#0d1713\]\/90/g, r: 'bg-white dark:bg-[#0d1713]/90' },
  { s: /text-\[#e7eee9\]/g, r: 'text-gray-900 dark:text-[#e7eee9]' },
  { s: /bg-\[#08100d\]/g, r: 'bg-white dark:bg-[#08100d]' },
  { s: /from-\[#0a1210\] to-\[#08100d\]/g, r: 'from-gray-50 to-gray-100 dark:from-[#0a1210] dark:to-[#08100d]' },
  { s: /bg-\[#0e1814\]\/90/g, r: 'bg-gray-100/90 dark:bg-[#0e1814]/90' },
  { s: /text-\[#d9e0dc\]/g, r: 'text-gray-800 dark:text-[#d9e0dc]' },
  { s: /bg-\[#0a1410\]\/80/g, r: 'bg-white dark:bg-[#0a1410]/80' },
  { s: /bg-\[#07100d\]/g, r: 'bg-gray-50 dark:bg-[#07100d]' },
  { s: /text-\[#76857e\]/g, r: 'text-gray-500 dark:text-[#76857e]' },
  { s: /text-\[#a0aaa5\]/g, r: 'text-gray-500 dark:text-[#a0aaa5]' },
  { s: /bg-\[#060a08\]\/90/g, r: 'bg-white/90 dark:bg-[#060a08]/90' },
  { s: /\btext-white\b/g, r: 'text-gray-900 dark:text-white' },
  { s: /text-\[#aeb8b3\]/g, r: 'text-gray-700 dark:text-[#aeb8b3]' },
  { s: /border-\[#4BFFBE\]\/10/g, r: 'border-border/20 dark:border-[#4BFFBE]/10' },
  { s: /text-\[#03110b\]/g, r: 'text-gray-900 dark:text-[#03110b]' },
  { s: /bg-\[#36e2a0\]\/10/g, r: 'bg-primary/10 dark:bg-[#36e2a0]/10' },
];

replacements.forEach(rep => {
  code = code.replace(rep.s, rep.r);
});

fs.writeFileSync('src/components/admin/post-editor.tsx', code);
console.log("Done");
