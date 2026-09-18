// Persian Typo Fixer | options.js | By TheAzizi | v1.9.0
const ALL_KEYS = Object.keys(PTF_DEFAULTS);
const testInput = document.getElementById('testInput');
const testResult = document.getElementById('testResult');
const toast = document.getElementById('toast');

function showToast(m){
  toast.textContent = m;
  toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'),2000);
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
  const v = testInput.value;
  if(!v.trim()){ testResult.textContent='نتیجه اینجا'; testResult.classList.add('empty'); renderNotices(''); return; }
  testResult.classList.remove('empty');
  if(!/[\u0600-\u06FF]/.test(v)){ testResult.textContent=v; renderNotices(''); return; }
  // شبیه‌سازی دقیق تایپ واقعی: فقط بخش تمام‌شده (کرسر ته فرض می‌شود)
  const r = ptfFixTypingValue(v, v.length, opts);
  testResult.textContent = r.text;
  renderNotices(r.text);
}
async function loadSettings(){
  const d = await chrome.storage.sync.get(PTF_DEFAULTS);
  const s = { ...PTF_DEFAULTS, ...d };
  ALL_KEYS.forEach(k => {
    const el = document.getElementById(k);
    if (el) el.checked = !!s[k];
  });
  updateTest();
}
async function save(){
  await chrome.storage.sync.set(readUI());
  showToast('ذخیره شد');
  updateTest();
}
ALL_KEYS.forEach(k => {
  const el = document.getElementById(k);
  if (el) el.addEventListener('change', save);
});
testInput.addEventListener('input', updateTest);
document.getElementById('copyBtn').addEventListener('click',()=>{
  const t = testResult.textContent;
  if(!t || testResult.classList.contains('empty')) return;
  navigator.clipboard.writeText(t).then(()=>showToast('کپی شد'));
});
document.getElementById('resetBtn').addEventListener('click', async()=>{
  if(!confirm('بازنشانی؟')) return;
  const keep = await chrome.storage.sync.get({ customWords: [], disabledSites: [] });
  await chrome.storage.sync.set({ ...PTF_DEFAULTS, customWords: keep.customWords || [], disabledSites: keep.disabledSites || [] });
  await loadSettings();
  showToast('بازنشانی شد');
});
document.querySelectorAll('.links a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();chrome.tabs.create({url:a.href});}));

// سایت‌های غیرفعال
async function getDisabledSites(){
  const d = await chrome.storage.sync.get({ disabledSites: [] });
  return Array.isArray(d.disabledSites) ? d.disabledSites : [];
}
function renderDisabledSites(list){
  const box = document.getElementById('disabledList');
  if(!box) return;
  box.innerHTML = '';
  if(list.length === 0){
    const p = document.createElement('div');
    p.style.cssText = 'font-size:11px;color:#666;text-align:center;padding:6px';
    p.textContent = 'لیست خالی است — افزونه همه‌جا فعال است';
    box.appendChild(p);
    return;
  }
  list.forEach(h => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;background:#0f0f0f;border:1px solid #222;border-radius:10px;padding:8px 12px;font-size:12px';
    const s = document.createElement('span');
    s.style.cssText = 'direction:ltr';
    s.textContent = h;
    const b = document.createElement('button');
    b.className = 'btn btn-ghost';
    b.style.cssText = 'padding:5px 10px;font-size:11px';
    b.textContent = 'حذف';
    b.addEventListener('click', async () => {
      const cur = await getDisabledSites();
      await chrome.storage.sync.set({ disabledSites: cur.filter(x => x !== h) });
      renderDisabledSites(await getDisabledSites());
      showToast('حذف شد');
    });
    row.appendChild(s);
    row.appendChild(b);
    box.appendChild(row);
  });
}
document.getElementById('disabledAdd').addEventListener('click', async () => {
  const inp = document.getElementById('disabledInput');
  let h = (inp.value || '').trim().toLowerCase().replace(/^https?:\/\//, '').split(/[/:?#]/)[0];
  if(!h || h.indexOf('.') === -1){ showToast('هاست معتبر وارد کنید'); return; }
  const cur = await getDisabledSites();
  if(!cur.includes(h)) cur.push(h);
  await chrome.storage.sync.set({ disabledSites: cur });
  inp.value = '';
  renderDisabledSites(cur);
  showToast('اضافه شد');
});
loadSettings();
getDisabledSites().then(renderDisabledSites);

// دیکشنری شخصی
async function getCustomWords(){
  const d = await chrome.storage.sync.get({ customWords: [] });
  const list = Array.isArray(d.customWords) ? d.customWords : [];
  return list.filter(x => x && typeof x === 'object');
}
function renderCustomWords(list){
  const box = document.getElementById('customList');
  if(!box) return;
  box.innerHTML = '';
  if(list.length === 0){
    const p = document.createElement('div');
    p.style.cssText = 'font-size:11px;color:#666;text-align:center;padding:6px';
    p.textContent = 'خالی است — مثلاً غلط «دستخط» و درست «دست‌خط» را اضافه کن';
    box.appendChild(p);
    return;
  }
  list.forEach((w, idx) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;background:#0f0f0f;border:1px solid #222;border-radius:10px;padding:8px 12px;font-size:12px;opacity:' + (w.on === false ? '0.5' : '1');
    const t = document.createElement('span');
    t.style.cssText = 'flex:1;word-break:break-word';
    t.textContent = w.from + ' ← ' + w.to;
    const tg = document.createElement('button');
    tg.className = 'btn btn-ghost';
    tg.style.cssText = 'padding:5px 10px;font-size:11px';
    tg.textContent = w.on === false ? 'فعال' : 'غیرفعال';
    tg.addEventListener('click', async () => {
      const cur = await getCustomWords();
      if (cur[idx]) cur[idx].on = cur[idx].on === false ? true : false;
      await chrome.storage.sync.set({ customWords: cur });
      renderCustomWords(cur);
      updateTest();
    });
    const del = document.createElement('button');
    del.className = 'btn btn-ghost';
    del.style.cssText = 'padding:5px 10px;font-size:11px';
    del.textContent = 'حذف';
    del.addEventListener('click', async () => {
      const cur = await getCustomWords();
      cur.splice(idx, 1);
      await chrome.storage.sync.set({ customWords: cur });
      renderCustomWords(cur);
      updateTest();
      showToast('حذف شد');
    });
    row.appendChild(t);
    row.appendChild(tg);
    row.appendChild(del);
    box.appendChild(row);
  });
}
document.getElementById('customAdd').addEventListener('click', async () => {
  const fEl = document.getElementById('customFrom');
  const tEl = document.getElementById('customTo');
  const from = (fEl.value || '').trim();
  const to = (tEl.value || '').trim();
  if (!from || !to) { showToast('هر دو را بنویس'); return; }
  if (from.length > 60 || to.length > 60) { showToast('حداکثر ۶۰ حرف'); return; }
  const cur = await getCustomWords();
  if (cur.length >= 200) { showToast('حداکثر ۲۰۰ کلمه'); return; }
  if (cur.some(w => w.from === from)) { showToast('تکراری است'); return; }
  cur.push({ from, to, on: true });
  await chrome.storage.sync.set({ customWords: cur });
  fEl.value = '';
  tEl.value = '';
  renderCustomWords(cur);
  updateTest();
  showToast('اضافه شد');
});
getCustomWords().then(renderCustomWords);
