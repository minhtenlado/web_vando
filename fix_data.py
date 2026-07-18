import re

with open('src/lib/cv/data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the projects array with an empty array
content = re.sub(r'export const projects: Project\[\] = \[.*?\];', 'export const projects: Project[] = [];', content, flags=re.DOTALL)

with open('src/lib/cv/data.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed data.ts")
