import React, { useState, useRef } from 'react';
import wadaSanzoData from '../data/wadaSanzo.json';
import '../styles/color-matcher.css';

// Helpers
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const rgbToHex = (r, g, b) => {
  return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase();
};

const colorDistance = (rgb1, rgb2) => {
  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );
};

export default function ColorMatcher() {
  const [imageSrc, setImageSrc] = useState(null);
  const [extractedColor, setExtractedColor] = useState(null);
  const [matchingCombination, setMatchingCombination] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const processImage = (file) => {
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target.result);
      
      const img = new Image();
      img.onload = () => {
        // Extract color via canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        // Scale down for faster processing and to get a more averaged dominant color
        canvas.width = 100;
        canvas.height = 100 * (img.height / img.width);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let r = 0, g = 0, b = 0, count = 0;
        
        for (let i = 0; i < imageData.length; i += 4) {
          // Ignore transparent or near-white/near-black background pixels for better accuracy
          const alpha = imageData[i+3];
          const brightness = (imageData[i] + imageData[i+1] + imageData[i+2]) / 3;
          if (alpha > 128 && brightness > 20 && brightness < 235) {
            r += imageData[i];
            g += imageData[i+1];
            b += imageData[i+2];
            count++;
          }
        }
        
        // Fallback if the image was mostly white/black
        if (count === 0) {
            for (let i = 0; i < imageData.length; i += 4) {
                if (imageData[i+3] > 128) {
                    r += imageData[i];
                    g += imageData[i+1];
                    b += imageData[i+2];
                    count++;
                }
            }
        }

        if (count > 0) {
          const avgRgb = {
            r: Math.floor(r / count),
            g: Math.floor(g / count),
            b: Math.floor(b / count)
          };
          
          setExtractedColor(avgRgb);
          findBestMatch(avgRgb);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const findBestMatch = (rgb) => {
    let bestMatch = null;
    let minDistance = Infinity;
    
    // Find the combination containing the color closest to our extracted color
    wadaSanzoData.forEach(combo => {
      combo.colors.forEach(hexColor => {
        const targetRgb = hexToRgb(hexColor);
        if (targetRgb) {
          const distance = colorDistance(rgb, targetRgb);
          if (distance < minDistance) {
            minDistance = distance;
            bestMatch = {
              comboId: combo.id,
              matchedHex: hexColor,
              allColors: combo.colors
            };
          }
        }
      });
    });
    
    setMatchingCombination(bestMatch);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImage(e.dataTransfer.files[0]);
    }
  };

  const reset = () => {
    setImageSrc(null);
    setExtractedColor(null);
    setMatchingCombination(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div className="color-matcher-container">
      <div className="color-matcher-header">
        <h3 className="cm-title">Find Your Match</h3>
        <p className="cm-subtitle">Upload a photo of a clothing item, and we'll suggest matching colors based on classic Wada Sanzo palettes.</p>
      </div>

      {!imageSrc ? (
        <div 
          className={`cm-upload-area ${isDragging ? 'dragging' : ''}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="cm-upload-icon">📷</div>
          <p>Click or drag a photo of your clothing here</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => processImage(e.target.files[0])} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
        </div>
      ) : (
        <div className="cm-results-area">
          <div className="cm-preview-section">
            <div className="cm-image-preview">
              <img src={imageSrc} alt="Uploaded clothing" />
              <button className="cm-reset-btn" onClick={reset}>Try Another</button>
            </div>
            
            {extractedColor && (
              <div className="cm-extracted-color">
                <p>Extracted Color:</p>
                <div 
                  className="cm-color-swatch large"
                  style={{ backgroundColor: rgbToHex(extractedColor.r, extractedColor.g, extractedColor.b) }}
                >
                    <span className="cm-color-hex">{rgbToHex(extractedColor.r, extractedColor.g, extractedColor.b)}</span>
                </div>
              </div>
            )}
          </div>

          {matchingCombination && (
            <div className="cm-match-section cm-fade-in">
              <h4 className="cm-match-title">Suggested Matches</h4>
              <p className="cm-match-desc">Based on Wada Sanzo Combination #{matchingCombination.comboId}</p>
              
              <div className="cm-palette">
                {matchingCombination.allColors.map((hex, index) => {
                  const isMatchedColor = hex === matchingCombination.matchedHex;
                  return (
                    <div 
                        key={index} 
                        className={`cm-palette-item ${isMatchedColor ? 'matched' : 'suggestion'}`}
                    >
                      <div 
                        className="cm-color-swatch"
                        style={{ backgroundColor: hex }}
                      ></div>
                      <span className="cm-color-label">
                        {isMatchedColor ? '(Your Item)' : 'Match'}
                      </span>
                      <span className="cm-color-hex">{hex}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
