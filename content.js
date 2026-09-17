// Persian Typo Fixer | content.js | By TheAzizi | v1.6.0
// استفاده از fixes.js مشترک

let settings = { ...PTF_DEFAULTS };

// ست کردن value طوری که فریم‌ورک‌ها (React/Vue) هم بفهمند
// مقداردهی مستقیم el.value توسط اینپوت‌های کنترل‌شده React برگردانده می‌شود
function ptfSetNativeValue(el, val) {
  try {
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, 'value');
    if (desc && typeof desc.set === 'function') desc.set.call(el, val);
    else el.value = val;
  } catch(e) {
    try { el.value = val; } catch(e2) {}
  }
  ptfFireInput(el);
  try { el.dispatchEvent(new Event('change', { bubbles: true })); } catch(e) {}
}

// ایونت input به شکلی که فریم‌ورک‌ها بفهمند (InputEvent اگر موجود باشد)
function ptfFireInput(el) {
  try {
    if (typeof InputEvent === 'function') {
      el.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: false }));
    } else {
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  } catch(e) {
    try { el.dispatchEvent(new Event('input', { bubbles: true })); } catch(e2) {}
  }
}

function fixInputElement(el) {
  // مسیر کامل: blur/paste/enter/change — کل متن
  if (!el || el.readOnly || el.disabled) return;
  let start = null, end = null;
  try { start = el.selectionStart; end = el.selectionEnd; } catch(e) {}
  const oldVal = el.value;
  const newVal = ptfFixText(oldVal, settings);
  if (newVal === oldVal) return;
  const beforeOld = oldVal.slice(0, start == null ? oldVal.length : start);
  const beforeNew = ptfFixText(beforeOld, settings);
  const diff = beforeNew.length - beforeOld.length;
  ptfSetNativeValue(el, newVal);
  try {
    if (start != null && end != null) el.setSelectionRange(start + diff, end + diff);
  } catch(e) {}
}

function fixInputTyping(el) {
  // مسیر حین تایپ: فقط بخش تمام‌شده قبل از کرسر + کرسر دقیق از خروجی
  if (!el || el.readOnly || el.disabled) return;
  let start = null, end = null;
  try { start = el.selectionStart; end = el.selectionEnd; } catch(e) {}
  if (start == null || end == null || start !== end) {
    // سلکشن بازه‌ای: فقط فاز حروف (1:1، امن) تا سلکشن به‌هم نریزد
    const oldVal = el.value;
    const newVal = ptfFixChars(oldVal, settings);
    if (newVal !== oldVal) {
      ptfSetNativeValue(el, newVal);
      try { el.setSelectionRange(start, end); } catch(e) {}
    }
    return;
  }
  const r = ptfFixTypingValue(el.value, start, settings);
  if (r.text === el.value) return;
  ptfSetNativeValue(el, r.text);
  try { el.setSelectionRange(r.cursor, r.cursor); } catch(e) {}
}

function fixContentEditable(el) {
  // مسیر کامل: blur/paste/enter/change — کل متن
  if (!el || el.isContentEditable === false) return;
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  if (!el.contains(range.startContainer)) return;
  const preRange = range.cloneRange();
  preRange.selectNodeContents(el);
  preRange.setEnd(range.startContainer, range.startOffset);
  const startOffset = preRange.toString().length;

  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let node;
  const nodes = [];
  while (node = walker.nextNode()) nodes.push(node);

  let curPos = 0;
  let found = null;
  let foundOffset = 0;
  // اول offset جدید را با کل متن حساب کن
  const oldFull = nodes.map(n => n.nodeValue).join('');
  const newFull = ptfFixText(oldFull, settings);
  if (newFull === oldFull) return;
  const beforeOld = oldFull.slice(0, startOffset);
  const beforeNew = ptfFixText(beforeOld, settings);
  const newOffset = startOffset + (beforeNew.length - beforeOld.length);

  for (const n of nodes) {
    const newVal = ptfFixText(n.nodeValue, settings);
    if (newVal !== n.nodeValue) n.nodeValue = newVal;
    const len = n.nodeValue.length;
    if (found === null && newOffset >= curPos && newOffset <= curPos + len) {
      found = n;
      foundOffset = newOffset - curPos;
    }
    curPos += len;
  }
  if (found) {
    try {
      const newRange = document.createRange();
      newRange.setStart(found, Math.min(foundOffset, found.nodeValue.length));
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
    } catch(e) {}
  }
  // به فریم‌ورک‌ها (Draft/Slate/Lexical) خبر بده تا state را همگام کنند
  ptfFireInput(el);
}

function fixContentEditableTyping(el) {
  // مسیر حین تایپ: نود کرسر scoped + بقیه نودها فقط فاز حروف (1:1)
  // جفت‌های چندنودی موقع خروج/پیست اعمال می‌شوند
  if (!el || el.isContentEditable === false) return;
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  if (!el.contains(range.startContainer)) return;
  let startOffset = 0;
  try {
    const preRange = range.cloneRange();
    preRange.selectNodeContents(el);
    preRange.setEnd(range.startContainer, range.startOffset);
    startOffset = preRange.toString().length;
  } catch(e) { return; }

  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let node;
  while (node = walker.nextNode()) nodes.push(node);
  if (nodes.length === 0) return;

  // نود کرسر را پیدا کن
  let acc = 0, ci = -1, local = 0;
  for (let i = 0; i < nodes.length; i++) {
    const len = nodes[i].nodeValue.length;
    if (ci === -1 && startOffset <= acc + len) { ci = i; local = startOffset - acc; }
    acc += len;
  }

  let newGlobalCursor;
  if (ci === -1) {
    // کرسر ته ته (یا بیرون متن): فقط فاز حروف همه‌جا
    for (const n of nodes) {
      const v = ptfFixChars(n.nodeValue, settings);
      if (v !== n.nodeValue) n.nodeValue = v;
    }
    newGlobalCursor = startOffset;
  } else {
    let gAcc = 0;
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (i === ci) {
        // نود کرسر: شبیه‌سازی تایپ + قوانین تک‌کلمه‌ای امن روی کلمه باز
        const r = ptfFixTypingValue(n.nodeValue, Math.max(0, Math.min(local, n.nodeValue.length)), settings);
        if (r.text !== n.nodeValue) n.nodeValue = r.text;
        newGlobalCursor = gAcc + r.cursor;
        gAcc += r.text.length;
      } else {
        const v = ptfFixChars(n.nodeValue, settings);
        if (v !== n.nodeValue) n.nodeValue = v;
        gAcc += n.nodeValue.length;
      }
    }
  }

  // بازگردانی کرسر
  try {
    let a2 = 0, fn = nodes[nodes.length - 1], fo = fn.nodeValue.length;
    for (const n of nodes) {
      if (newGlobalCursor <= a2 + n.nodeValue.length) { fn = n; fo = newGlobalCursor - a2; break; }
      a2 += n.nodeValue.length;
    }
    const newRange = document.createRange();
    newRange.setStart(fn, Math.max(0, Math.min(fo, fn.nodeValue.length)));
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
  } catch(e) {}
  ptfFireInput(el);
}

// سایت‌هایی که کاربر افزونه را در آن‌ها خاموش کرده (exact + ساب‌دامین)
const ptfDisabledHosts = new Set();
function ptfRefreshDisabledHosts() {
  try {
    ptfDisabledHosts.clear();
    const list = settings.disabledSites;
    if (Array.isArray(list)) {
      for (const h of list) {
        if (typeof h === 'string' && h.trim()) ptfDisabledHosts.add(h.trim().toLowerCase());
      }
    }
  } catch(e) {}
}
function ptfSiteOff() {
  try {
    const h = (typeof location !== 'undefined' && location.hostname ? location.hostname : '').toLowerCase();
    if (!h || ptfDisabledHosts.size === 0) return false;
    if (ptfDisabledHosts.has(h)) return true;
    for (const d of ptfDisabledHosts) {
      if (d && h.endsWith('.' + d)) return true;
    }
  } catch(e) {}
  return false;
}

function ptfTextLen(el) {
  try {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return (el.value || '').length;
    return (el.textContent || '').length;
  } catch(e) { return 0; }
}

// تایمر جدا برای هر فیلد تا فیلدها مزاحم هم نشوند
const ptfTimers = new WeakMap();
function scheduleFix(el, delay, mode) {
  if (!el || !settings.enabled || ptfSiteOff()) return;
  if (delay == null) delay = 150;
  if (mode == null) mode = 'typing';
  // متن‌های غول‌پیکر را حین تایپ سنگین نکن — روی خروج از فیلد فیکس می‌شوند
  if (delay < 1000 && ptfTextLen(el) > 60000) delay = 1200;
  try {
    const old = ptfTimers.get(el);
    if (old) clearTimeout(old);
  } catch(e) {}
  try {
    ptfTimers.set(el, setTimeout(() => {
      try { ptfTimers.delete(el); } catch(e) {}
      runFixOnElement(el, mode);
    }, delay));
  } catch(e) {
    runFixOnElement(el, mode);
  }
}

function runFixOnElement(el, mode) {
  if (!el || !settings.enabled || ptfSiteOff()) return;
  // typing = فقط بخش تمام‌شده (امن وسط تایپ)؛ full = کل متن (خروج/پیست/انتر)
  const typing = mode !== 'full';
  try {
    if (!el.isConnected && el !== document.body && el !== document.documentElement) {
      // المنت از DOM حذف شده — رها کن
    }
  } catch(e) {}
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
    if (typing) fixInputTyping(el); else fixInputElement(el);
    checkNoticesForText(el.value);
  } else if (el.isContentEditable) {
    if (typing) fixContentEditableTyping(el); else fixContentEditable(el);
    checkNoticesForText(el.innerText || el.textContent || '');
  }
}

// --- هشدار معنایی درون‌صفحه‌ای (زار/گذار) ---
const PTF_NOTICE_COOLDOWN_MS = 10 * 60 * 1000;
const ptfNoticeSeenAt = new Map();
let ptfNoticeQueue = [];
let ptfNoticeShowing = false;

function ptfEnsureNoticeRoot() {
  let root = document.getElementById('ptf-notice-root');
  if (root) return root;
  root = document.createElement('div');
  root.id = 'ptf-notice-root';
  root.setAttribute('dir', 'rtl');
  root.style.cssText = 'position:fixed;bottom:18px;left:18px;z-index:2147483647;display:flex;flex-direction:column;gap:8px;max-width:min(340px,90vw);font-family:Tahoma,sans-serif;';
  (document.body || document.documentElement).appendChild(root);
  return root;
}

function ptfShowNextNotice() {
  if (ptfNoticeShowing) return;
  const item = ptfNoticeQueue.shift();
  if (!item) return;
  ptfNoticeShowing = true;
  const root = ptfEnsureNoticeRoot();
  const box = document.createElement('div');
  box.style.cssText = 'background:#141414;color:#f1f1f1;border:1px solid #b45309;border-right:4px solid #f59e0b;border-radius:10px;padding:10px 12px;font-size:12px;line-height:1.8;box-shadow:0 8px 28px rgba(0,0,0,.5);';
  const title = document.createElement('div');
  title.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px;';
  const t1 = document.createElement('b');
  t1.textContent = 'Persian Typo Fixer — هشدار معنایی';
  t1.style.cssText = 'font-size:11px;color:#fbbf24;';
  const close = document.createElement('button');
  close.textContent = '×';
  close.setAttribute('aria-label', 'بستن');
  close.style.cssText = 'background:transparent;border:none;color:#999;font-size:16px;cursor:pointer;line-height:1;padding:0 2px;';
  close.addEventListener('click', () => { box.remove(); ptfNoticeShowing = false; ptfShowNextNotice(); });
  title.appendChild(t1);
  title.appendChild(close);
  const body = document.createElement('div');
  body.textContent = item.message;
  box.appendChild(title);
  box.appendChild(body);
  root.appendChild(box);
  setTimeout(() => {
    if (box.isConnected) box.remove();
    ptfNoticeShowing = false;
    ptfShowNextNotice();
  }, 9000);
}

function checkNoticesForText(text) {
  if (!settings.enabled || !settings.notices) return;
  if (!text || typeof text !== 'string' || text.length > 2000) return;
  let list = [];
  try { list = ptfFindNotices(text) || []; } catch(e) { return; }
  const now = Date.now();
  for (const n of list) {
    const key = n.id + ':' + n.word;
    const last = ptfNoticeSeenAt.get(key) || 0;
    if (now - last < PTF_NOTICE_COOLDOWN_MS) continue;
    ptfNoticeSeenAt.set(key, now);
    ptfNoticeQueue.push(n);
  }
  ptfShowNextNotice();
}

// تایپ‌هایی که هیچ‌وقت نباید دست بخورند (پسورد، عدد، انتخاب‌گر و ...)
const PTF_SKIP_INPUT_TYPES = new Set([
  'password', 'number', 'hidden', 'file', 'checkbox', 'radio', 'range',
  'color', 'date', 'time', 'datetime-local', 'month', 'week',
  'button', 'submit', 'reset', 'image'
]);

function shouldHandle(el) {
  if (!el || el.nodeType !== 1) return false;
  try {
    // ادیتورهای کدنویسی را خراب نکن (مدل داخلی‌شان با DOM همگام نیست)
    if (typeof el.closest === 'function' && el.closest('.monaco-editor,.cm-content,.cm-editor,.ace_text-input')) return false;
  } catch(e) {}
  if (el.tagName === 'INPUT') {
    const type = (el.type || '').toLowerCase();
    if (PTF_SKIP_INPUT_TYPES.has(type)) return false;
    return true; // text/search/tel/url/email و بقیه: همه هندل می‌شوند
  }
  if (el.tagName === 'TEXTAREA') return true;
  if (el.isContentEditable) return true;
  return false;
}

// هدف واقعی تایپ — شامل حالت designMode (ادیتورهای داخل iframe)
function resolveEditableTarget(e) {
  const t = e && e.target;
  if (t && t.nodeType === 1 && shouldHandle(t)) return t;
  try {
    if (t && (t.nodeType === 9 || t.tagName === 'HTML' || t.tagName === 'BODY') && document.designMode === 'on') {
      const a = document.activeElement;
      if (a && a.nodeType === 1 && shouldHandle(a)) return a;
      if (document.body) return document.body;
    }
  } catch(e) {}
  return null;
}

function ptfIsWordBoundaryInput(e) {
  try {
    const it = e.inputType;
    if (it === 'insertParagraph' || it === 'insertLineBreak' || it === 'insertFromPaste' || it === 'insertFromDrop') return true;
    const d = e.data;
    if (typeof d === 'string' && d.length > 0 && /[\s.,،:؛!؟)\]]/.test(d.slice(-1))) return true;
  } catch(e) {}
  return false;
}

let ptfLastInputAt = 0;
function ptfOnInput(e) {
  try { ptfLastInputAt = Date.now(); } catch(err) {}
  const t = resolveEditableTarget(e);
  if (!t) return;
  // سر مرز کلمه فوری، بقیه با debounce — فقط بخش تمام‌شده (typing)
  scheduleFix(t, ptfIsWordBoundaryInput(e) ? 25 : 150, 'typing');
}

function ptfOnKeyDown(e) {
  if (e.key !== ' ' && e.key !== 'Enter') return;
  const t = resolveEditableTarget(e);
  if (!t) return;
  // انتر یعنی متن تمام شده (ارسال) — کامل و همگام قبل از submit؛ فاصله یعنی ادامه — typing
  if (e.key === 'Enter') { try { runFixOnElement(t, 'full'); } catch(err) {} }
  else setTimeout(() => scheduleFix(t, 30, 'typing'), 25);
}

function ptfOnPaste(e) {
  const t = resolveEditableTarget(e);
  if (!t) return;
  // متن پیست‌شده کامل است — حالت کامل
  setTimeout(() => scheduleFix(t, 40, 'full'), 40);
}

function ptfOnFocusIn(e) {
  // فیلدهای از قبل پرشده موقع فوکس — typing چون ممکن است وسط کلمه باشد
  const t = resolveEditableTarget(e);
  if (!t) return;
  scheduleFix(t, 60, 'typing');
}

function ptfOnChange(e) {
  const t = resolveEditableTarget(e);
  if (!t) return;
  runFixOnElement(t, 'full');
}

function ptfOnFocusOut(e) {
  const t = e.target;
  if (!t || !shouldHandle(t) || !settings.enabled || ptfSiteOff()) return;
  try {
    const old = ptfTimers.get(t);
    if (old) { clearTimeout(old); ptfTimers.delete(t); }
  } catch(e) {}
  // خروج از فیلد یعنی تایپ تمام شده — حالت کامل
  runFixOnElement(t, 'full');
}

// لیسنرها را به یک روت (document یا shadowRoot) وصل کن
function ptfAttachRoot(root) {
  if (!root || root.__ptfAttached) return;
  try {
    root.__ptfAttached = true;
    root.addEventListener('input', ptfOnInput, true);
    root.addEventListener('keydown', ptfOnKeyDown, true);
    root.addEventListener('paste', ptfOnPaste, true);
    root.addEventListener('change', ptfOnChange, true);
    root.addEventListener('focusin', ptfOnFocusIn, true);
    root.addEventListener('focusout', ptfOnFocusOut, true);
  } catch(e) {
    try { root.__ptfAttached = false; } catch(e2) {}
  }
}

// همه shadowRootهای باز موجود را پیدا و لیسنر بگذار
function ptfScanShadowRoots(scope) {
  try {
    if (!scope || typeof scope.querySelectorAll !== 'function') return;
    const all = scope.querySelectorAll('*');
    for (let i = 0; i < all.length; i++) {
      const el = all[i];
      if (el.shadowRoot) {
        ptfAttachRoot(el.shadowRoot);
        ptfScanShadowRoots(el.shadowRoot);
      }
    }
  } catch(e) {}
}

function ptfScanAddedNode(node) {
  if (!node || node.nodeType !== 1) return;
  try {
    if (node.shadowRoot) {
      ptfAttachRoot(node.shadowRoot);
      ptfScanShadowRoots(node.shadowRoot);
    }
    if (typeof node.querySelectorAll !== 'function') return;
    const all = node.querySelectorAll('*');
    for (let i = 0; i < all.length; i++) {
      const el = all[i];
      if (el.shadowRoot && !el.shadowRoot.__ptfAttached) {
        ptfAttachRoot(el.shadowRoot);
        ptfScanShadowRoots(el.shadowRoot);
      }
    }
  } catch(e) {}
}

ptfAttachRoot(document);
ptfScanShadowRoots(document);

// هاست‌های شدو جدید (کامپوننت‌هایی که بعدا به صفحه اضافه می‌شوند)
try {
  const ptfHostObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      const added = m.addedNodes;
      if (!added) continue;
      for (let i = 0; i < added.length; i++) ptfScanAddedNode(added[i]);
    }
  });
  ptfHostObserver.observe(document.documentElement || document, { childList: true, subtree: true });
} catch(e) {}

async function loadSettings() {
  try {
    const stored = await chrome.storage.sync.get(PTF_DEFAULTS);
    settings = { ...PTF_DEFAULTS, ...stored };
  } catch(e) {
    try {
      const s2 = await chrome.storage.local.get(PTF_DEFAULTS);
      settings = { ...PTF_DEFAULTS, ...s2 };
    } catch(e2) {}
  }
  ptfRefreshDisabledHosts();
}
loadSettings();
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync' && area !== 'local') return;
  for (const k of Object.keys(PTF_DEFAULTS)) {
    if (changes[k]) settings[k] = changes[k].newValue;
  }
  if (changes.disabledSites) ptfRefreshDisabledHosts();
});

// تور ایمنی: اگر سایتی ایونت input را قورت داد، فیلد فعالِ بدون تغییرِ اخیر بررسی شود
const ptfSeenValues = new WeakMap();
try {
  setInterval(() => {
    try {
      if (!settings.enabled || ptfSiteOff()) return;
      if (typeof document.hasFocus === 'function' && !document.hasFocus()) return;
      if (Date.now() - ptfLastInputAt < 2000) return;
      const a = document.activeElement;
      if (!a || !shouldHandle(a)) return;
      const cur = (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA') ? a.value : (a.innerText || a.textContent || '');
      if (typeof cur !== 'string' || cur.length === 0 || cur.length > 100000) return;
      if (ptfSeenValues.get(a) === cur) return;
      ptfSeenValues.set(a, cur);
      if (!/[\u0600-\u06FF]/.test(cur)) return;
      runFixOnElement(a);
      const after = (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA') ? a.value : (a.innerText || a.textContent || '');
      ptfSeenValues.set(a, after);
    } catch(e) {}
  }, 2500);
} catch(e) {}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'PTF_TEST') {
    sendResponse({ fixed: ptfFixText(msg.text || '', settings) });
    return true;
  }
});
