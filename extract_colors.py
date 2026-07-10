import re
import json

md_file = r"C:\Users\ELCOT\.gemini\antigravity-ide\brain\360eb147-2742-4ad0-be06-00b36ee3f81d\.system_generated\steps\8\content.md"
output_file = r"c:\Users\ELCOT\.gemini\antigravity-ide\scratch\the-loomist\src\data\wadaSanzo.json"

with open(md_file, 'r', encoding='utf-8') as f:
    content = f.read()

# The pattern to find a combination block
# It looks like: <a class="CombinationsList_combinationElement... href="/combination/classic/1"> ... </a>
# Inside we have multiple <div class="CombinationsList_colorElementInCombination__QYUy8" style="background-color:#xxxxxx"></div>

pattern = re.compile(r'<a class="CombinationsList_combinationElement__A2qHD" href="/combination/classic/(\d+)">.*?<div class="CombinationsList_combiInfo', re.DOTALL)
color_pattern = re.compile(r'style="background-color:(#[a-fA-F0-9]{6})"')

combinations = []

for match in pattern.finditer(content):
    combo_id = match.group(1)
    combo_html = match.group(0)
    
    colors = color_pattern.findall(combo_html)
    
    if colors:
        combinations.append({
            "id": int(combo_id),
            "colors": colors
        })

print(f"Found {len(combinations)} combinations.")

import os

os.makedirs(os.path.dirname(output_file), exist_ok=True)
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(combinations, f, indent=2)

print(f"Saved to {output_file}")
