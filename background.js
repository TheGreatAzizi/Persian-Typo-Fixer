// Persian Typo Fixer | By TheAzizi | background.js | v1.10.0
try { importScripts('fixes.js'); } catch (e) {}

const PTF_BG_DEFAULTS = (typeof PTF_DEFAULTS !== 'undefined') ? PTF_DEFAULTS : {
  enabled: true, fixArabicYK: true, fixArabicAlef: true, fixTashkeel: true,
  fixKashida: true, fixZWNJ: true, fixAttachedHa: true, fixCompounds: true,
  fixCommonTypos: true, fixPunctuation: true, fixPersianPunct: true,
  fixDoubleSpace: true, fixArabicDigits: true, fixLatinDigits: false,
  fixSeparators: false, fixRepeat: false, fixQuotes: false,
  notices: true, disabledSites: [], customWords: []
};

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await chrome.storage.sync.set({ ...PTF_BG_DEFAULTS, customWords: [], disabledSites: [] });
  }
  try {
    await chrome.contextMenus.removeAll();
    chrome.contextMenus.create({
      id: 'ptf-fix-selection',
      title: 'اصلاح فارسی و کپی',
      contexts: ['selection']
    });
  } catch (e) {}
});

function ptfBadge(text, ok) {
  try {
    chrome.action.setBadgeText({ text });
    chrome.action.setBadgeBackgroundColor({ color: ok ? '#16a34a' : '#dc2626' });
    setTimeout(() => { try { chrome.action.setBadgeText({ text: '' }); } catch (e) {} }, 2000);
  } catch (e) {}
}

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== 'ptf-fix-selection') return;
  const raw = String(info.selectionText || '');
  if (!raw.trim()) return;
  try {
    const stored = await chrome.storage.sync.get(PTF_BG_DEFAULTS);
    const settings = { ...PTF_BG_DEFAULTS, ...stored };
    if (typeof ptfFixText !== 'function') { ptfBadge('!', false); return; }
    const fixed = ptfFixText(raw.slice(0, 5000), settings);
    await navigator.clipboard.writeText(fixed);
    ptfBadge(fixed === raw ? '=' : 'ok', true);
  } catch (e) {
    ptfBadge('!', false);
  }
});
