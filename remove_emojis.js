const fs = require('fs');
const path = require('path');

// A regex that broadly matches emoji characters
const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2B50}\u{1F004}\u{1F0CF}\u{231A}\u{231B}\u{23F0}\u{23F3}\u{2328}\u{23CF}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{25AA}\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{FE0F}]/gu;

function stripEmojisFromFile(filePath) {
  const absolutePath = path.resolve(__dirname, filePath);
  if (fs.existsSync(absolutePath)) {
    const originalContent = fs.readFileSync(absolutePath, 'utf8');
    // Replace emojis and multiple spaces
    let newContent = originalContent.replace(emojiRegex, '');
    
    // Quick cleanup for cases where an emoji left a double space behind, but don't mess up code indentation
    // We'll just replace '  ' with ' ' on the exact lines if we need to, but regex might ruin JSX indentation.
    // It's safer to just remove the emoji and let the user format later if needed, or replace " 🎬" with "" etc.
    
    if (originalContent !== newContent) {
      fs.writeFileSync(absolutePath, newContent, 'utf8');
      console.log(`Stripped emojis from ${filePath}`);
    } else {
      console.log(`No emojis found in ${filePath}`);
    }
  } else {
    console.log(`File not found: ${filePath}`);
  }
}

const filesToClean = [
  'src/pages/MainSite.jsx',
  'src/pages/AdminDashboard.jsx',
  'data/videos.json',
  'data/posts.json'
];

filesToClean.forEach(stripEmojisFromFile);
