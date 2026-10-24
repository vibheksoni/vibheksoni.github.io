"""Render the FreeTheAI request-path diagram for the portfolio with live numbers.

Usage: python scripts/build_diagram.py

Reads token and request totals from freetheai.org/stats (rounded down), fills
scripts/freetheai-diagram.html, and writes freetheai-request-path.png at 2x in the
site's colors. Re-run whenever the numbers on the page are refreshed.
"""

import json
import re
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE = ROOT / "scripts" / "freetheai-diagram.html"
OUT = ROOT / "freetheai-request-path.png"


def round_down(value: float, unit: str) -> str:
    if value >= 100:
        return f"{int(value // 10 * 10)}{unit}+"
    return f"{int(value * 10) / 10:g}{unit}+"


def stats(page) -> dict:
    page.goto("https://freetheai.org/stats", wait_until="networkidle")
    page.wait_for_selector("text=Tokens served", timeout=30_000)
    text = page.inner_text("body")
    tokens = re.search(r"Tokens served\s+([\d.]+)\s*([KMB])", text)
    requests = re.search(r"Requests served\s+([\d.]+)\s*([KMB])", text)
    if not (tokens and requests):
        raise RuntimeError("Could not read the FreeTheAI stats page")
    return {"tokens": round_down(float(tokens.group(1)), tokens.group(2)),
            "requests": round_down(float(requests.group(1)), requests.group(2))}


def main() -> None:
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        values = stats(browser.new_page())
        html = TEMPLATE.read_text(encoding="utf-8")
        for key, value in values.items():
            html = html.replace("{{" + key + "}}", value)
        page = browser.new_page(device_scale_factor=2, viewport={"width": 900, "height": 600})
        page.set_content(html.replace("<body>", '<body data-theme="dark" style="background:#121314">'), wait_until="networkidle")
        page.evaluate("document.fonts.ready")
        page.locator("#card").screenshot(path=str(OUT))
        browser.close()
    print(json.dumps(values))


if __name__ == "__main__":
    main()
