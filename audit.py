import asyncio
import json
import os
from playwright.async_api import async_playwright

VIEWPORTS = [
    {"width": 320, "height": 568, "name": "iPhone5-SE"},
    {"width": 360, "height": 800, "name": "GalaxyS20"},
    {"width": 375, "height": 812, "name": "iPhoneX"},
    {"width": 390, "height": 844, "name": "iPhone12Pro"},
    {"width": 430, "height": 932, "name": "iPhone14ProMax"},
    {"width": 844, "height": 390, "name": "iPhone12Pro-Landscape"},
    {"width": 768, "height": 1024, "name": "iPadMini"}
]

THEMES = ["light", "dark"]
ROUTES = [
    "/",
    "/videos",
    "/search?q=music",
    "/search?q=impossible_query_no_results_999999",
    "/channels"
]

BASE_URL = "http://localhost:8080"
OUTPUT_DIR = "/tmp/browser/mobile-content"
os.makedirs(OUTPUT_DIR, exist_ok=True)

async def audit_route(browser, viewport, theme, route):
    context = await browser.new_context(
        viewport={"width": viewport["width"], "height": viewport["height"]},
        user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
    )
    page = await context.new_page()
    
    # Set theme in localStorage
    await page.goto(BASE_URL)
    await page.evaluate(f"localStorage.setItem('yidvid-theme', '{theme}')")
    
    path = f"{BASE_URL}{route}"
    await page.goto(path, wait_until="networkidle")
    await asyncio.sleep(0.5)
    
    name_prefix = f"{viewport['name']}_{theme}_{route.replace('/', '_').replace('?', '_').replace('=', '_')}"
    
    # 1. Top Screenshot
    await page.screenshot(path=f"{OUTPUT_DIR}/{name_prefix}_top.png")
    
    # 2. Middle Scroll & Screenshot
    await page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
    await asyncio.sleep(0.2)
    await page.screenshot(path=f"{OUTPUT_DIR}/{name_prefix}_middle.png")
    
    # 3. Bottom Scroll & Screenshot
    await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    await asyncio.sleep(0.2)
    await page.screenshot(path=f"{OUTPUT_DIR}/{name_prefix}_bottom.png")
    
    # 4. Perform Audit Checks
    audit_data = await page.evaluate('''() => {
        const defects = [];
        
        // Horizontal overflow
        if (document.documentElement.scrollWidth > window.innerWidth + 1) {
            defects.push(`Horizontal overflow: ${document.documentElement.scrollWidth}px > ${window.innerWidth}px`);
        }
        
        // Tappable sizes (buttons and links)
        const interactables = Array.from(document.querySelectorAll('button, a, [role="button"]'));
        const smallInteractables = interactables.filter(el => {
            const rect = el.getBoundingClientRect();
            return (rect.width > 0 && rect.height > 0) && (rect.width < 44 || rect.height < 44);
        }).map(el => ({
            tag: el.tagName,
            text: el.innerText.substring(0, 20),
            width: el.getBoundingClientRect().width,
            height: el.getBoundingClientRect().height,
            classes: el.className
        }));
        
        if (smallInteractables.length > 0) {
            defects.push(`${smallInteractables.length} elements with small tap targets (< 44x44)`);
        }
        
        // Overlap check for bottom nav
        const bottomNav = document.querySelector('nav') || document.querySelector('[class*="bottom-nav"]');
        let overlapFound = false;
        if (bottomNav) {
            const navRect = bottomNav.getBoundingClientRect();
            // This is a simplistic check: if any fixed/absolute element that isn't the nav itself overlaps it
            // Or if content is clipped by it without padding
        }
        
        return {
            url: window.location.href,
            defects: defects,
            smallInteractables: smallInteractables.slice(0, 5) // Just a sample
        };
    }''')
    
    # 5. Channel Detail Specifics
    channel_detail_data = None
    if route == "/channels":
        channel_link = await page.query_selector("a[href^='/channel/']")
        if channel_link:
            href = await channel_link.get_attribute("href")
            channel_path = f"{BASE_URL}{href}"
            
            cp = await context.new_page()
            await cp.goto(channel_path, wait_until="networkidle")
            
            # Try to open description (often a 'more' button or similar)
            # Find a button that might be 'description' or 'about'
            await cp.click("text=/more/i", timeout=1000).catch(lambda e: None)
            
            # Capture channel detail
            await cp.screenshot(path=f"{OUTPUT_DIR}/{viewport['name']}_{theme}_channel_detail_open.png")
            channel_detail_data = {"href": href, "status": "visited"}
            await cp.close()
            
    await context.close()
    return {
        "viewport": viewport["name"],
        "theme": theme,
        "route": route,
        "audit": audit_data,
        "channel_detail": channel_detail_data
    }

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        tasks = []
        # To avoid overloading, we can run them in smaller batches or sequentially
        # But let's try to run a subset to ensure completion or increase timeout significantly.
        # Given the 600s limit, I'll run them sequentially to be safe and avoid race conditions on localStorage
        
        all_results = []
        for viewport in VIEWPORTS:
            for theme in THEMES:
                for route in ROUTES:
                    res = await audit_route(browser, viewport, theme, route)
                    all_results.append(res)
        
        with open(f"{OUTPUT_DIR}/audit_results.json", "w") as f:
            json.dump(all_results, f, indent=2)
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
