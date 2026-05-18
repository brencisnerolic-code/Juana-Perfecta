#!/usr/bin/env python3
"""
Update HTML to use WebP with PNG fallback + lazy loading.
Converts img tags to picture elements with srcset.
"""
import re
from pathlib import Path

def update_html_for_webp():
    html_path = Path("/Users/brendacisnero/Downloads/Juana Perfecta/index.html")
    html_content = html_path.read_text(encoding='utf-8')
    original_content = html_content

    # Pattern: <img src="img/...Matrix...png" alt="...">
    # Handles URLs with query params like ?v=20260513e
    pattern = r'<img\s+src="(img/[^"]*Matrix[^"]*\.png[^"]*)"\s+alt="([^"]*)"\s+class="([^"]*)"\s*>'

    def replace_img_with_picture(match):
        src = match.group(1)
        alt = match.group(2)
        css_class = match.group(3)

        # Convert PNG path to WebP path (keep query params)
        webp_src = src.replace('.png', '.webp')

        return f'''<picture>
        <source srcset="{webp_src}" type="image/webp">
        <img src="{src}" alt="{alt}" class="{css_class}" loading="lazy">
      </picture>'''

    updated_html = re.sub(pattern, replace_img_with_picture, html_content)

    # Count replacements
    count = len(re.findall(pattern, original_content))

    if updated_html != original_content:
        html_path.write_text(updated_html, encoding='utf-8')
        print(f"✅ Updated {count} image tags to use WebP + lazy loading")
        return True
    else:
        print("❌ No matches found or already updated")
        return False

if __name__ == "__main__":
    update_html_for_webp()
