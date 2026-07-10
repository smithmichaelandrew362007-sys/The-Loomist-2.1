import re

file_path = "src/pages/MainSite.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add import
if "import { useTheme" not in content:
    content = content.replace("import '../styles/style.css';", "import '../styles/style.css';\nimport { useTheme, ThemePickerModal, ThemeToggleButton } from '../components/ThemeManager';")

# 2. Replace state and logic
state_pattern = re.compile(r"// Theme state.*?const toggleTheme = \(\) => \{\n\s*setShowThemePicker\(true\);\n\s*};\n", re.DOTALL)
replacement_state = """// Theme hook
  const { showThemePicker, applyTheme, toggleTheme } = useTheme();

  // Form states"""
content = re.sub(r"// Theme state.*?// Form states", replacement_state, content, flags=re.DOTALL)

# 3. Replace Theme Picker Modal JSX
modal_pattern = re.compile(r"\{\/\* Theme Picker Modal — shown on first visit \*\/\}.*?\{\/\* Navigation \*\/\}", re.DOTALL)
replacement_modal = """{/* Theme Picker Modal */}
      {showThemePicker && <ThemePickerModal applyTheme={applyTheme} />}

      {/* Navigation */}"""
content = re.sub(modal_pattern, replacement_modal, content)

# 4. Replace Theme Toggle Button JSX
btn_pattern = re.compile(r"\{\/\* Theme Toggle Button \*\/\}.*?<\/button>", re.DOTALL)
replacement_btn = """{/* Theme Toggle Button */}
        <ThemeToggleButton toggleTheme={toggleTheme} />"""
content = re.sub(btn_pattern, replacement_btn, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated MainSite.jsx successfully!")
