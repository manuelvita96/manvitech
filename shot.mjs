import puppeteer from 'puppeteer-core';

const CHROME = '/home/claude/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 480, height: 900 });
page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));

await page.goto('http://127.0.0.1:4321/consiglio', { waitUntil: 'domcontentloaded' });
await new Promise(r => setTimeout(r, 900));
await page.evaluate(() => {
  document.querySelectorAll('button').forEach(b => { if (b.textContent.includes('Accetta tutti')) b.click(); });
});
await new Promise(r => setTimeout(r, 300));

// Fill name and start
await page.waitForSelector('#nameInput', { timeout: 6000 });
await page.type('#nameInput', 'Marco');
await page.click('#nameBtn');
await new Promise(r => setTimeout(r, 1600));
await page.screenshot({ path: '/home/claude/shot_1_start.png' });

// Click through several fork answers (choose right each time) to progress
for (let i = 0; i < 6; i++) {
  try {
    await page.waitForSelector('#btnRight', { timeout: 4000 });
    await page.click('#btnRight');
    await new Promise(r => setTimeout(r, 1800));
    await page.screenshot({ path: `/home/claude/shot_${2+i}_step.png` });
  } catch (e) {
    console.log('stop at step', i, e.message);
    break;
  }
}



// Reload mid-game to test resume flow
await page.reload({ waitUntil: 'domcontentloaded' });
await new Promise(r => setTimeout(r, 1200));
await page.screenshot({ path: '/home/claude/shot_resume_prompt.png' });
await page.waitForSelector('#btnResumeYes', { timeout: 6000 });
await page.click('#btnResumeYes');
await new Promise(r => setTimeout(r, 1500));
await page.screenshot({ path: '/home/claude/shot_resumed.png' });


await browser.close();
console.log('DONE');
