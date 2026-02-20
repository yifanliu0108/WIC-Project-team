# Figma Import Guide

This guide will help you import your Figma designs (login page and logo) into your project.

## Method 1: Export Images from Figma (Recommended for Logo)

### For Logo:
1. **Open your Figma file**
2. **Select the logo** in Figma
3. **Right-click** → Select "Export" or use the Export panel on the right
4. **Choose format:**
   - **PNG** (with transparency) - Best for logos with transparency
   - **SVG** - Best for scalable logos (recommended)
5. **Set export settings:**
   - For PNG: Choose 2x or 3x resolution for retina displays
   - For SVG: Keep it as is (vector format)
6. **Export** and save to your project folder
7. **Create an `assets` or `images` folder** in your project:
   ```
   WIC_Project_Teams_InTune/
   ├── assets/
   │   └── logo.svg (or logo.png)
   ```

### Update your HTML to use the logo:
```html
<!-- Instead of the emoji logo, use: -->
<img src="assets/logo.svg" alt="Logo" class="logo-img" />
```

### Update CSS for logo image:
```css
.logo-img {
  width: 48px;
  height: 48px;
  object-fit: contain;
}
```

## Method 2: Figma Dev Mode (For Design Specifications)

1. **Open Figma** and your design file
2. **Click "Dev Mode"** (top right) or press `Shift + D`
3. **Select elements** to see:
   - CSS properties
   - Spacing measurements
   - Colors (hex codes)
   - Font sizes and weights
4. **Copy CSS** directly from Figma for specific elements
5. **Use the measurements** to match your design exactly

## Method 3: Figma Plugin - Export to Code

1. **Install a Figma plugin** like:
   - "Figma to Code" by BuilderX
   - "Anima" 
   - "Figma to React"
2. **Select your login page frame** in Figma
3. **Run the plugin** and export HTML/CSS
4. **Copy relevant styles** to your `styles.css` file

## Method 4: Manual Recreation (Most Control)

1. **Open Figma** side-by-side with your code editor
2. **Use Dev Mode** to inspect:
   - Colors (copy hex codes)
   - Typography (font family, size, weight)
   - Spacing (padding, margins)
   - Border radius
   - Shadows
3. **Update your CSS** to match:
   ```css
   /* Example: Copy colors from Figma */
   :root {
     --primary-color: #1DB954; /* From Figma */
     --text-color: #E6EEF3;    /* From Figma */
   }
   ```

## Quick Steps for Your Login Page:

1. **Export logo** as SVG → Save to `assets/logo.svg`
2. **Open Figma Dev Mode** → Inspect your login page design
3. **Copy color values** → Update CSS variables in `styles.css`
4. **Copy font specifications** → Update font-family and sizes
5. **Match spacing** → Adjust padding/margins to match Figma
6. **Export any icons** → Save to `assets/` folder

## File Structure After Import:

```
WIC_Project_Teams_InTune/
├── assets/
│   ├── logo.svg
│   └── icons/ (if you have icons)
├── index.html
├── styles.css
├── script.js
├── dashboard.html
├── dashboard.css
├── dashboard.js
└── FIGMA_IMPORT_GUIDE.md
```

## Tips:

- **Use SVG for logos** - They scale perfectly and stay crisp
- **Export at 2x or 3x** for PNG images if needed for retina displays
- **Use Figma Dev Mode** to get exact pixel values
- **Match the color palette** first, then spacing, then typography
- **Test responsiveness** - Figma designs might be desktop-only, adapt for mobile

## Need Help?

If you want me to help integrate specific Figma assets:
1. Export your logo and save it to the project
2. Share the color codes, font names, or specific measurements from Figma
3. I can update the CSS to match your design exactly!
