"""Render the link-preview image (og:image / twitter:image) for the portfolio.

Usage: python scripts/build_social.py

Screenshots scripts/social-card.html at 1200x630 and writes
vibhek-soni-backend-ai-infra-security-go-social.png. The card carries no numbers,
so it does not go stale when the stats change.
"""

from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE = ROOT / "scripts" / "social-card.html"
OUT = ROOT / "vibhek-soni-backend-ai-infra-security-go-social.png"


def main() -> None:
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1200, "height": 630})
        page.goto(TEMPLATE.as_uri(), wait_until="networkidle")
        page.evaluate("document.fonts.ready")
        page.locator("#card").screenshot(path=str(OUT))
        browser.close()
    print(OUT.name, OUT.stat().st_size, "bytes")


if __name__ == "__main__":
    main()
