import re

file_path = "src/styles/admin.css"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Define the replacements
# Hex colors
replacements = [
    (r"#1a1a1c", "var(--color-bg-primary)"),
    (r"#202022", "var(--color-bg-secondary)"),
    (r"#61100a", "var(--color-gold-dark)"),
    (r"#8b2018", "var(--color-gold)"),
    (r"#a0312a", "var(--color-gold-light)"),
    (r"#f2f0ed", "var(--color-text-primary)"),
]

for old, new in replacements:
    content = re.sub(old, new, content, flags=re.IGNORECASE)

# RGBA colors mapped to variables
rgba_mappings = {
    (26, 26, 28): "--color-bg-primary",
    (28, 28, 31): "--color-bg-primary",
    (32, 32, 34): "--color-bg-secondary",
    (40, 40, 43): "--color-bg-glass",
    (97, 16, 10): "--color-gold-dark",
    (139, 32, 24): "--color-gold",
    (160, 49, 42): "--color-gold-light",
    (242, 240, 237): "--color-text-primary",
}

def rgba_replacer(match):
    r, g, b, a_str = match.groups()
    r, g, b = int(r), int(g), int(b)
    a = float(a_str)
    
    key = (r, g, b)
    if key in rgba_mappings:
        var_name = rgba_mappings[key]
        percentage = int(a * 100)
        return f"color-mix(in srgb, var({var_name}) {percentage}%, transparent)"
    else:
        # Check if it's black for shadows
        if r == 0 and g == 0 and b == 0:
            return match.group(0) # Keep unchanged
        return match.group(0)

content = re.sub(r"rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)", rgba_replacer, content)

# Remove the `.admin-body` hardcoded variable overrides at the top
content = re.sub(r"/\* Admin Theme Variables \(scoped to admin\) \*/.*?\.admin-body\s*\{[^}]+\}", 
                 "/* Admin Theme Variables now inherit from global style.css */\n.admin-body {\n  background: var(--color-bg-primary);\n  min-height: 100vh;\n  color: var(--color-text-primary);\n}", 
                 content, flags=re.DOTALL)

# Let's fix up some admin variables that might still be referenced
admin_var_replacements = [
    (r"var\(--admin-text-primary\)", "var(--color-text-primary)"),
    (r"var\(--admin-text-secondary\)", "var(--color-text-secondary)"),
    (r"var\(--admin-text-muted\)", "var(--color-text-muted)"),
    (r"var\(--admin-accent\)", "var(--color-gold-dark)"),
    (r"var\(--admin-accent-light\)", "var(--color-gold)"),
    (r"var\(--admin-accent-glow\)", "var(--color-gold-light)"),
    (r"var\(--admin-bg-primary\)", "var(--color-bg-primary)"),
    (r"var\(--admin-bg-secondary\)", "var(--color-bg-secondary)"),
    (r"var\(--admin-bg-card\)", "var(--color-bg-card)"),
    (r"var\(--admin-shadow-glow\)", "var(--shadow-glow)"),
    (r"var\(--admin-shadow-sm\)", "var(--shadow-sm)"),
    (r"var\(--admin-shadow-md\)", "var(--shadow-md)"),
    (r"var\(--admin-shadow-lg\)", "var(--shadow-lg)"),
    (r"var\(--admin-transition-fast\)", "var(--transition-fast)"),
    (r"var\(--admin-transition-base\)", "var(--transition-base)"),
    (r"var\(--admin-radius-sm\)", "var(--radius-sm)"),
    (r"var\(--admin-radius-md\)", "var(--radius-md)"),
    (r"var\(--admin-radius-xl\)", "var(--radius-xl)"),
    (r"var\(--admin-border\)", "var(--border-subtle)"),
]

for old, new in admin_var_replacements:
    content = re.sub(old, new, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated admin.css successfully!")
