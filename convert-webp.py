#!/usr/bin/env python3
"""
Convert PNG images to WebP format for faster loading.
Keeps originals, creates .webp versions in the same directory.
"""
import os
import sys
from pathlib import Path
from PIL import Image

def convert_to_webp(png_path, quality=80):
    """Convert a PNG file to WebP format."""
    try:
        webp_path = png_path.with_suffix('.webp')

        # Skip if WebP already exists
        if webp_path.exists():
            print(f"⏭️  {webp_path.name} already exists")
            return False

        # Open and convert
        img = Image.open(png_path)
        img.save(webp_path, 'WEBP', quality=quality)

        # Get file sizes
        png_size = png_path.stat().st_size / 1024
        webp_size = webp_path.stat().st_size / 1024
        savings = ((png_size - webp_size) / png_size) * 100

        print(f"✅ {png_path.name}")
        print(f"   PNG: {png_size:.0f} KB → WebP: {webp_size:.0f} KB ({savings:.0f}% smaller)")
        return True
    except Exception as e:
        print(f"❌ {png_path.name}: {e}")
        return False

def main():
    repo_root = Path("/Users/brendacisnero/Downloads/Juana Perfecta")

    # Find all PNG files in matrices folders
    png_files = list(repo_root.glob("**/Matrix*.png"))
    print(f"Found {len(png_files)} Matrix PNG files")
    print("=" * 60)

    converted = 0
    for png_file in sorted(png_files):
        if convert_to_webp(png_file):
            converted += 1

    print("=" * 60)
    print(f"✅ Converted: {converted}/{len(png_files)} files")

if __name__ == "__main__":
    main()
