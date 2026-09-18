// Persian Typo Fixer | popup.js | By TheAzizi | v1.9.0
const ALL_KEYS = Object.keys(PTF_DEFAULTS);
const testInput = document.getElementById('testInput');
const testResult = document.getElementById('testResult');
const statusEl = document.getElementById('status');

function showStatus(msg){
  statusEl.textContent = msg;
  statusEl.classList.add('show');
  setTimeout(()=>statusEl.classList.remove('show'),1800);
}

function readUI(){
  const o = {};
  ALL_KEYS.forEach(k => {
    const el = document.getElementById(k);
    if (el) o[k] = el.checked;
  });
  return o;
}

function renderNotices(fixed){
  const box = document.getElementById('noticeList');
  if(!box) return;
  box.innerHTML = '';
  let list = [];
  try { list = ptfFindNotices(fixed) || []; } catch(e) {}
  for(const n of list){
    const d = document.createElement('div');
    d.className = 'notice-item';
    const b = document.createElement('b');
    b.textContent = 'هشدار معنایی: ';
    const s = document.createElement('span');
    s.textContent = n.message;
    d.appendChild(b);
    d.appendChild(s);
    box.appendChild(d);
  }
}

function updateTest(){
  const opts = { ...PTF_DEFAULTS, ...readUI() };
  const val = testInput.value;
  if(!val.trim()){
    testResult.textContent = 'نتیجه اینجا نمایش داده می‌شود';
    testResult.classList.add('empty');
    renderNotices('');
    return;
  }
  testResult.classList.remove('empty');
  if(!/[\u0600-\u06FF]/.test(val)){ testResult.textContent = val; renderNotices(''); return; }
  // شبیه‌سازی دقیق تایپ واقعی: فقط بخش تمام‌شده (کرسر ته فرض می‌شود)
  const r = ptfFixTypingValue(val, val.length, opts);
  testResult.textContent = r.text;
  renderNotices(r.text);
}

async function loadSettings(){
  const data = await chrome.storage.sync.get(PTF_DEFAULTS);
  const s = { ...PTF_DEFAULTS, ...data };
  ALL_KEYS.forEach(k => {
    const el = document.getElementById(k);
    if (el) el.checked = !!s[k];
  });
  updateTest();
}

async function saveSettings(){
  const o = readUI();
  await chrome.storage.sync.set(o);
  showStatus('ذخیره شد');
  updateTest();
}

ALL_KEYS.forEach(k => {
  const el = document.getElementById(k);
  if (el) el.addEventListener('change', saveSettings);
});
testInput.addEventListener('input', updateTest);

document.getElementById('openOptions').addEventListener('click', ()=>{
  if(chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage();
  else window.open(chrome.runtime.getURL('options.html'));
});
document.getElementById('resetBtn').addEventListener('click', async()=>{
  if(!confirm('بازنشانی به پیش‌فرض؟')) return;
  const keep = await chrome.storage.sync.get({ customWords: [], disabledSites: [] });
  await chrome.storage.sync.set({ ...PTF_DEFAULTS, customWords: keep.customWords || [], disabledSites: keep.disabledSites || [] });
  await loadSettings();
  showStatus('بازنشانی شد');
});
document.querySelectorAll('.footer a').forEach(a=>{
  a.addEventListener('click', e=>{ e.preventDefault(); chrome.tabs.create({url:a.href}); });
});

// غیرفعال‌سازی برای سایت فعلی (per-site)
let ptfCurrentHost = '';
async function loadSiteRow(){
  const row = document.getElementById('siteRow');
  const hostEl = document.getElementById('siteHost');
  const btn = document.getElementById('siteToggle');
  if (!row || !hostEl || !btn) return;
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tabs && tabs[0] && tabs[0].url ? tabs[0].url : '';
    const m = url.match(/^https?:\/\/([^/:?#]+)/i);
    if (!m) return; // تب خاص (chrome:// و ...) — ردیف مخفی می‌ماند
    ptfCurrentHost = m[1].toLowerCase();
    const data = await chrome.storage.sync.get({ disabledSites: [] });
    const list = Array.isArray(data.disabledSites) ? data.disabledSites : [];
    const off = list.map(h => String(h).toLowerCase()).some(h => h && (ptfCurrentHost === h || ptfCurrentHost.endsWith('.' + h)));
    hostEl.textContent = ptfCurrentHost;
    btn.textContent = off ? 'فعال‌سازی در این سایت' : 'غیرفعال در این سایت';
    btn.dataset.off = off ? '1' : '';
    row.style.display = 'flex';
  } catch(e) {}
}

document.getElementById('siteToggle').addEventListener('click', async () => {
  if (!ptfCurrentHost) return;
  const btn = document.getElementById('siteToggle');
  try {
    const data = await chrome.storage.sync.get({ disabledSites: [] });
    let list = Array.isArray(data.disabledSites) ? data.disabledSites.map(h => String(h).toLowerCase()) : [];
    const turningOff = !btn.dataset.off;
    if (turningOff) {
      if (!list.includes(ptfCurrentHost)) list.push(ptfCurrentHost);
    } else {
      list = list.filter(h => h !== ptfCurrentHost);
    }
    await chrome.storage.sync.set({ disabledSites: list });
    btn.textContent = turningOff ? 'فعال‌سازی در این سایت' : 'غیرفعال در این سایت';
    btn.dataset.off = turningOff ? '1' : '';
    showStatus(turningOff ? 'در این سایت غیرفعال شد (تب را رفرش کنید)' : 'در این سایت فعال شد (تب را رفرش کنید)');
  } catch(e) {}
});

loadSettings();
loadSiteRow();
