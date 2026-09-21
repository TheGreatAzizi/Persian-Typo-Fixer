// build.mjs — packages Chrome + Firefox builds from the shared source.
// Usage: node build.mjs
// Output: dist/chrome/, dist/firefox/, and versioned ZIPs for both stores.
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, 'dist');

const SHARED = [
  'fixes.js',
  'content.js',
  'popup.html',
  'popup.js',
  'options.html',
  'options.js',
  'background.js',
  'fonts/vazirmatn-arabic.woff2',
  'fonts/vazirmatn-latin.woff2',
  'icon16.png',
  'icon48.png',
  'icon128.png',
  'LICENSE',
  'README.md',
  'WORDS.md',
];

function readJson(f) {
  let text = fs.readFileSync(path.join(ROOT, f), 'utf8');
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // strip BOM
  return JSON.parse(text);
}

const chromeManifest = readJson('manifest.json');
const firefoxManifest = readJson('manifest.firefox.json');

if (chromeManifest.version !== firefoxManifest.version) {
  console.error(`Version drift! manifest.json=${chromeManifest.version} manifest.firefox.json=${firefoxManifest.version}`);
  process.exit(1);
}
if (!firefoxManifest.browser_specific_settings?.gecko?.id) {
  console.error('Firefox manifest is missing browser_specific_settings.gecko.id');
  process.exit(1);
}
const VERSION = chromeManifest.version;

for (const f of [...SHARED, 'manifest.json', 'manifest.firefox.json']) {
  if (f.startsWith('fonts/') || f.endsWith('.png') || f.endsWith('.md') || f === 'LICENSE') continue;
  if (f === 'manifest.json' || f === 'manifest.firefox.json') continue;
  // syntax check every shippable JS file
  if (f.endsWith('.js')) {
    try {
      execSync(`node --check "${path.join(ROOT, f)}"`, { stdio: 'pipe' });
    } catch {
      console.error(`Syntax error in ${f}`);
      process.exit(1);
    }
  }
}

function cleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function copyInto(destDir, manifestObj) {
  for (const f of SHARED) {
    const src = path.join(ROOT, f);
    if (!fs.existsSync(src)) {
      console.error(`Missing file: ${f}`);
      process.exit(1);
    }
    const dest = path.join(destDir, f);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
  fs.writeFileSync(path.join(destDir, 'manifest.json'), JSON.stringify(manifestObj, null, 2) + '\n');
}

cleanDir(path.join(DIST, 'chrome'));
cleanDir(path.join(DIST, 'firefox'));
copyInto(path.join(DIST, 'chrome'), chromeManifest);
copyInto(path.join(DIST, 'firefox'), firefoxManifest);
console.log(`Staged dist/chrome and dist/firefox (v${VERSION})`);

const chromeZip = path.join(DIST, `Persian-Typo-Fixer-chrome-v${VERSION}.zip`);
const firefoxZip = path.join(DIST, `Persian-Typo-Fixer-firefox-v${VERSION}.zip`);

if (process.platform === 'win32') {
  for (const [dir, zip] of [[path.join(DIST, 'chrome'), chromeZip], [path.join(DIST, 'firefox'), firefoxZip]]) {
    if (fs.existsSync(zip)) fs.rmSync(zip);
    execSync(`Compress-Archive -Path "${dir}\\*" -DestinationPath "${zip}" -Force`, { shell: 'powershell.exe', stdio: 'pipe' });
    console.log(`Created ${path.basename(zip)} (${fs.statSync(zip).size} bytes)`);
  }
} else {
  console.log('Non-Windows host: zip dist/chrome and dist/firefox manually:');
  console.log(`  cd dist/chrome && zip -r ../Persian-Typo-Fixer-chrome-v${VERSION}.zip .`);
  console.log(`  cd dist/firefox && zip -r ../Persian-Typo-Fixer-firefox-v${VERSION}.zip .`);
}
console.log('Build OK');
