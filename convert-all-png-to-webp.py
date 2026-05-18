#!/usr/bin/env python3
"""
Convert ALL PNG images to WebP format.
Skips images in .git and .claude directories.
"""
import os
from pathlib import Path
from PIL import Image

def convert_to_webp(png_path, quality=80):
    """Convert a PNG file to WebP format."""
    try:
        webp_path = png_path.with_suffix('.webp')

        # Skip if WebP already exists
        if webp_path.exists():
            return False

        # Open and convert
        img = Image.open(png_path)
        img.save(webp_path, 'WEBP', quality=quality)

        png_size = png_path.stat().st_size / 1024
        webp_size = webp_path.stat().st_size / 1024
        savings = ((png_size - webp_size) / png_size) * 100

        print(f"✅ {png_path.name}")
        print(f"   {png_size:.0f} KB → {webp_size:.0f} KB ({savings:.0f}% smaller)")
        return True
    except Exception as e:
        print(f"❌ {png_path.name}: {e}")
        return False

def main():
    repo_root = Path("/Users/brendacisnero/Downloads/Juana Perfecta")

    # Find all PNG files, exclude .git and .claude
    all_pngs = []
    for png_file in repo_root.rglob("*.png"):
        if ".git" not in png_file.parts and ".claude" not in png_file.parts:
            all_pngs.append(png_file)

    print(f"Found {len(all_pngs)} PNG files to convert")
    print("=" * 60)

    converted = 0
    for png_file in sorted(all_pngs):
        if convert_to_webp(png_file):
            converted += 1

    print("=" * 60)
    print(f"✅ Converted: {converted}/{len(all_pngs)} files")
    print(f"Total PNG → WebP: {converted + 36} WebP files now")

if __name__ == "__main__":
    main()
