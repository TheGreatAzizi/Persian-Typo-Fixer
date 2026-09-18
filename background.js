// Persian Typo Fixer | By TheAzizi | background.js | v1.8.0
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    const d = {
      enabled: true,
      fixArabicYK: true,
      fixArabicAlef: true,
      fixTashkeel: true,
      fixKashida: true,
      fixZWNJ: true,
      fixAttachedHa: true,
      fixCompounds: true,
      fixCommonTypos: true,
      fixPunctuation: true,
      fixPersianPunct: true,
      fixDoubleSpace: true,
      fixArabicDigits: true,
      fixLatinDigits: false,
      fixSeparators: false,
      fixRepeat: false,
      fixQuotes: false,
      notices: true,
      disabledSites: []
    };
    await chrome.storage.sync.set(d);
  }
});
