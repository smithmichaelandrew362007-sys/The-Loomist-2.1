import re

file_path = "src/pages/AdminDashboard.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacements = [
    (r"var\(--admin-card-bg\)", "var(--color-bg-card)"),
    (r"var\(--admin-border\)", "var(--border-subtle)"),
    (r"var\(--admin-accent-dark\)", "var(--color-gold-dark)"),
    (r"var\(--admin-accent-light\)", "var(--color-gold-light)"),
    (r"var\(--admin-text-primary\)", "var(--color-text-primary)"),
    (r"var\(--admin-text-secondary\)", "var(--color-text-secondary)"),
]

for old, new in replacements:
    content = re.sub(old, new, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed variables in AdminDashboard.jsx")
