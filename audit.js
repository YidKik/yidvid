const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const VIEWPORTS = [
    { width: 320, height: 568, name: 'iPhone5-SE' },
    { width: 360, height: 800, name: 'GalaxyS20' },
    { width: 375, height: 812, name: 'iPhoneX' },
    { width: 390, height: 844, name: 'iPhone12Pro' },
    { width: 430, height: 932, name: 'iPhone14ProMax' },
    { width: 844, height: 390, name: 'iPhone12Pro-Landscape' },
    { width: 768, height: 1024, name: 'iPadMini' }
];

const THEMES = ['light', 'dark'];
const ROUTES = [
    '/',
    '/videos',
    '/search?q=music',
    '/search?q=impossible_query_no_results_999999',
    '/channels'
];

const BASE_URL = 'http://localhost:8080';
const OUTPUT_DIR = '/tmp/browser/mobile-content';
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const CHROMIUM_PATH = '/nix/store/f0zwc9si9bjhs4vipbbfw0i7my9ck3in-chromium-146.0.7680.80/bin/chromium';

async function runAudit() {
    const browser = await chromium.launch({
        executablePath: CHROMIUM_PATH,
        args: ['--no-sandbox', '--disable-gpu']
    });

    const results = [];

    for (const viewport of VIEWPORTS) {
        for (const theme of THEMES) {
            const context = await browser.newContext({
                viewport: { width: viewport.width, height: viewport.height },
                userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
            });

            const page = await context.newPage();
            
            // Set theme
            await page.goto(BASE_URL);
            await page.evaluate((t) => localStorage.setItem('yidvid-theme', t), theme);
            
            for (const route of ROUTES) {
                console.log(`Auditing ${route} in ${theme} mode on ${viewport.name}`);
                const url = `${BASE_URL}${route}`;
                await page.goto(url, { waitUntil: 'networkidle' });
                await page.waitForTimeout(1000);

                const namePrefix = `${viewport.name}_${theme}_${route.replace(/\//g, '_').replace(/\?/g, '_').replace(/=/g, '_')}`;
                
                // Screenshots
                await page.screenshot({ path: path.join(OUTPUT_DIR, `${namePrefix}_top.png`) });
                await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
                await page.waitForTimeout(500);
                await page.screenshot({ path: path.join(OUTPUT_DIR, `${namePrefix}_middle.png`) });
                await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                await page.waitForTimeout(500);
                await page.screenshot({ path: path.join(OUTPUT_DIR, `${namePrefix}_bottom.png`) });

                // Audit
                const auditData = await page.evaluate(() => {
                    const defects = [];
                    if (document.documentElement.scrollWidth > window.innerWidth + 1) {
                        defects.push(`Horizontal overflow: ${document.documentElement.scrollWidth}px > ${window.innerWidth}px`);
                    }
                    const interactables = Array.from(document.querySelectorAll('button, a, [role="button"]'));
                    const small = interactables.filter(el => {
                        const r = el.getBoundingClientRect();
                        return (r.width > 0 && r.height > 0) && (r.width < 44 || r.height < 44);
                    }).map(el => ({ tag: el.tagName, text: el.innerText.substring(0, 20), w: el.getBoundingClientRect().width, h: el.getBoundingClientRect().height }));

                    return { url: window.location.href, defects, smallCount: small.length, smallSample: small.slice(0, 3) };
                });

                results.push({ viewport: viewport.name, theme, route, audit: auditData });

                if (route === '/channels') {
                    const channelLink = await page.$("a[href^='/channel/']");
                    if (channelLink) {
                        const href = await channelLink.getAttribute('href');
                        const channelPage = await context.newPage();
                        await channelPage.goto(`${BASE_URL}${href}`, { waitUntil: 'networkidle' });
                        
                        // Open description/share/tabs
                        await channelPage.click('text=/more/i').catch(() => {});
                        await channelPage.waitForTimeout(500);
                        await channelPage.screenshot({ path: path.join(OUTPUT_DIR, `${viewport.name}_${theme}_channel_detail.png`) });
                        await channelPage.close();
                    }
                }
            }
            await context.close();
        }
    }

    fs.writeFileSync(path.join(OUTPUT_DIR, 'audit_results.json'), JSON.stringify(results, null, 2));
    await browser.close();
}

runAudit().catch(err => {
    console.error(err);
    process.exit(1);
});
