#!/usr/bin/env python3
"""
Update HTML picture elements to add WebP source + lazy loading.
Handles existing <picture> elements with responsive images.
"""
import re
from pathlib import Path

def update_html_for_webp_v2():
    html_path = Path("/Users/brendacisnero/Downloads/Juana Perfecta/index.html")
    html_content = html_path.read_text(encoding='utf-8')
    original_content = html_content

    # Pattern 1: <picture> with mobile source + img
    # <picture>
    #   <source media="..." srcset="...mobile...">
    #   <img src="...desktop..." ...>
    # </picture>

    pattern = r'(<picture>\s*<source\s+media="[^"]*"\s+srcset="([^"]*\.png[^"]*)"\s*>\s*<img\s+src="([^"]*\.png[^"]*)"\s+alt="([^"]*)"\s+class="([^"]*)"\s*>\s*</picture>)'

    def replace_picture(match):
        full_tag = match.group(1)
        mobile_src = match.group(2)
        desktop_src = match.group(3)
        alt = match.group(4)
        css_class = match.group(5)

        # Create WebP versions
        mobile_webp = mobile_src.replace('.png', '.webp')
        desktop_webp = desktop_src.replace('.png', '.webp')

        # Reconstruct with WebP sources first + lazy loading
        return f'''<picture>
        <source media="(max-width: 768px)" srcset="{mobile_webp}" type="image/webp">
        <source media="(max-width: 768px)" srcset="{mobile_src}">
        <source srcset="{desktop_webp}" type="image/webp">
        <img src="{desktop_src}" alt="{alt}" class="{css_class}" loading="lazy">
      </picture>'''

    updated_html = re.sub(pattern, replace_picture, html_content)

    # Count replacements
    count = len(re.findall(pattern, original_content))

    if updated_html != original_content:
        html_path.write_text(updated_html, encoding='utf-8')
        print(f"✅ Updated {count} picture elements with WebP sources + lazy loading")
        print("\nWebP format added:")
        print("  - Mobile WebP (media query)")
        print("  - Desktop WebP (default)")
        print("  - Added loading='lazy' attribute")
        return True
    else:
        print("❌ No picture elements found")
        return False

if __name__ == "__main__":
    update_html_for_webp_v2()
