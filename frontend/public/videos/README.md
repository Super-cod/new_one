# Video Files Directory

This directory is where you should place your background videos:

## Required Files:
- `dna-background-2.mp4` - High-resolution background video for all pages (2160x3840 portrait)
- `dna-background.mp4` - Legacy background video (if needed)
- `dna-loading.mp4` - Optional loading animation video

## Video Recommendations:
- **Format**: MP4 (H.264 codec for best browser compatibility)
- **Resolution**: Portrait videos work best (2160x3840) for responsive design
- **Duration**: 10-30 seconds (will loop automatically)
- **Size**: Keep under 15MB for good loading performance
- **Content**: DNA animations, molecular structures, laboratory scenes, or abstract scientific visuals

## Current Implementation:
✅ `dna-background-2.mp4` - Primary video used for all backgrounds (optimized for portrait resolution)
⚠️ `dna-background.mp4` - Legacy video (can be removed)
⚠️ `dna-loading.mp4` - No longer used (replaced with dna-background-2.mp4)

## Alternative Options:
If videos are not found, the components will show beautiful animated backgrounds with:
- Gradient overlays
- Floating molecular patterns
- DNA helix animations
- Translucent overlays

## Usage Flow:
1. **Input Page**: Shows `dna-background-2.mp4` as background
2. **Click Synthesize**: Immediately switches to loading page with `dna-background-2.mp4`
3. **Processing**: Stays on loading screen until API responds (minimum 1 second)
4. **Results Page**: Shows `dna-background-2.mp4` as background with results

## Troubleshooting:
- Make sure video files are exactly named as shown above
- Videos should be in MP4 format with H.264 codec
- If videos don't load, check browser console for errors
- Fallback animations will show if videos fail to load
