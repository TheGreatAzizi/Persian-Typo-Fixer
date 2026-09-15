// Persian Typo Fixer | fixes.js | By TheAzizi | v1.4.3
// موتور جامع اصلاح فارسی - shared بین content/popup/options

const PTF_DEFAULTS = {
  enabled: true,
  fixArabicYK: true,      // ي/ى -> ی ، ك -> ک
  fixArabicAlef: true,    // أ/إ -> ا ، ؤ -> و ، ة -> ه
  fixTashkeel: true,      // حذف حرکات عربی
  fixKashida: true,       // حذف کشیده ـ
  fixZWNJ: true,          // می/نمی/بی + ها/تر + خانه‌ام
  fixAttachedHa: true,    // کتابها -> کتاب‌ها (با استثنا)
  fixCompounds: true,     // کتابخانه، دانش‌آموز، به‌طور ...
  fixCommonTypos: true,   // ان‌شاءالله، اینکه، آنکه ...
  fixPunctuation: true,   // فاصله‌گذاری نقطه‌گذاری
  fixPersianPunct: true,  // ,;?% -> ،؛؟٪ در متن فارسی
  fixDoubleSpace: true,   // فاصله دوبل
  fixArabicDigits: true,  // ٠-٩ -> ۰-۹
  fixLatinDigits: false,  // 0-9 -> ۰-۹ در متن فارسی (پیش‌فرض خاموش)
  fixSeparators: false,   // ,/. بین ارقام فارسی -> ٬/٫ (پیش‌فرض خاموش)
  fixRepeat: false,       // سلااام -> سلام (پیش‌فرض خاموش)
  fixQuotes: false,       // "..." فارسی -> «...» (پیش‌فرض خاموش)
  notices: true,          // نمایش هشدار معنایی (زار/گذار) داخل صفحه
  disabledSites: []       // هاست‌هایی که افزونه در آن‌ها کار نکند (آرایه رشته)
};

// استثناها برای «ها» چسبیده - این‌ها کلمه مستقل‌اند نه جمع
const ATTACHED_HA_EXCEPTIONS = new Set([
  'تنها', 'تنهای', 'تنهایی', 'رها', 'رهای', 'رهایی',
  'چها', 'کها'
]);

// استثناها برای «می» چسبیده - کلماتی که با می شروع می‌شوند ولی پیشوند فعل نیستند
const MI_ATTACHED_EXCEPTIONS = new Set([
  'میز', 'میزان', 'میرزا', 'میدان', 'مینا', 'مینو', 'میوه',
  'میان', 'میانگین', 'میانی', 'میهن', 'میکده', 'میخانه',
  'میل', 'میلیون', 'میلیارد', 'مین', 'میخ', 'میخک',
  'میگو', 'میمون', 'میکروب', 'میکروفون', 'میکروسکوپ',
  'مینیمم', 'میثم', 'میثاق', 'میعاد', 'میقات',
  'میر', 'میراث', 'میزبان', 'میزگرد', 'میش', 'میک',
  'مینوش', 'میناگری'
]);

// استثناها برای «نمی» چسبیده
const NEMI_ATTACHED_EXCEPTIONS = new Set([
  'نمین'
]);

// دیکشنری ترکیب‌ها: [غلط با فاصله] -> [درست]
const PTF_COMPOUNDS = [
  // چسبیده (بدون فاصله و نیم‌فاصله)
  ['کتاب خانه', 'کتابخانه'],
  ['روز نامه', 'روزنامه'],
  ['دانش گاه', 'دانشگاه'],
  ['فرود گاه', 'فرودگاه'],
  ['کار خانه', 'کارخانه'],
  ['خوش حال', 'خوشحال'],
  ['خوش بخت', 'خوشبخت'],
  ['بد بخت', 'بدبخت'],
  ['خوش مزه', 'خوشمزه'],
  ['دانش جو', 'دانشجو'],
  ['هم کار', 'همکار'],
  ['هم فکر', 'همفکر'],
  ['غیر ممکن', 'غیرممکن'],
  ['غیر واقعی', 'غیرواقعی'],
  ['هم چنین', 'همچنین'],
  ['هم چون', 'همچون'],
  ['چنان چه', 'چنانچه'],
  ['آن چنان', 'آنچنان'],
  // با نیم‌فاصله
  ['دانش آموز', 'دانش‌آموز'],
  ['پیش بینی', 'پیش‌بینی'],
  ['پیش فروش', 'پیش‌فروش'],
  ['پیش پرداخت', 'پیش‌پرداخت'],
  ['خوش آمد', 'خوش‌آمد'],
  ['نامه رسان', 'نامه‌رسان'],
  ['ساعت ساز', 'ساعت‌ساز'],
  ['کتاب ساز', 'کتاب‌ساز'],
  ['کمک رسان', 'کمک‌رسان'],
  ['خوش اخلاق', 'خوش‌اخلاق'],
  ['خوش رفتار', 'خوش‌رفتار'],
  ['بد اخلاق', 'بداخلاق'],
  ['هم زمان', 'هم‌زمان'],
  ['هم کلاسی', 'هم‌کلاسی'],
  ['هم اتاقی', 'هم‌اتاقی'],
  ['هم مدرسه', 'هم‌مدرسه‌ای'],
  ['به طور', 'به‌طور'],
  ['بنی آدم', 'بنی‌آدم'],
  ['بسم الله', 'بسم‌الله'],
  ['به هر حال', 'به‌هرحال']
];

// غلط‌های رایج مذهبی/ربطی
const PTF_COMMON_TYPOS = [
  ['انشاالله', 'ان‌شاءالله'],
  ['انشااله', 'ان‌شاءالله'],
  ['انشالله', 'ان‌شاءالله'],
  ['انشاءالله', 'ان‌شاءالله'],
  ['ان شاالله', 'ان‌شاءالله'],
  ['انشا الله', 'ان‌شاءالله'],
  ['ان شاء الله', 'ان‌شاءالله'],
  ['ماشاالله', 'ماشاءالله'],
  ['ماشااله', 'ماشاءالله'],
  ['ماشالله', 'ماشاءالله'],
  ['ماشاء الله', 'ماشاءالله'],
  ['هوله', 'حوله'],
  ['سانیه', 'ثانیه'],
  ['راجب', 'راجع'],
  ['آزوقه', 'آذوقه'],
  ['املاء', 'املا'],
  ['حیات خلوت', 'حیاط خلوت'],
  ['این که', 'اینکه'],
  ['آن که', 'آنکه']
];

// ریشه‌های اشتباهِ بدون ابهام (جایگزینی زیررشته‌ای، جمع‌ها را هم پوشش می‌دهد)
// نمازگذار -> نمازگزار (گزاردن = انجام دادن)، بنیان/قانون + گزار -> گذار (گذاشتن)
const PTF_STEM_FIXES = [
  ['نمازگذار', 'نمازگزار'],
  ['بنیانگزار', 'بنیانگذار'],
  ['قانونگزار', 'قانونگذار']
];

// کلمات چسبیده اشتباه (مرز کلمه فارسی)
const PTF_ATTACHED_FIXES = [
  ['همینطور', 'همین‌طور'],
  ['همونطور', 'همون‌طور'],
  ['درمورد', 'در مورد']
];

// هشدارهای معنایی (ابهام معنایی — خودکار اصلاح نمی‌شود، فقط نوتیس)
// id یکتا برای throttle در content.js
const PTF_NOTICE_GOTO_SUPPRESS = ['نماز', 'خدمت', 'خواب', 'شکر', 'سپاس'];

function ptfFindNotices(text) {
  const out = [];
  if (!text || typeof text !== 'string') return out;
  if (!/[\u0600-\u06FF]/.test(text)) return out;
  const seen = new Set();
  const push = (id, word, message) => {
    const key = id + ':' + word;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ id, word, message });
  };
  let m;
  // ۱) می‌زارم/نمی‌زارم: یعنی زار زدن، نه گذاشتن
  const zarRe = /(^|[\s\u200C\(\["'«])((ن)?می\u200C?زار(م|ی|ه|یم|ید|ن)?)(?![\u0600-\u06FF\u200C])/g;
  while ((m = zarRe.exec(text)) !== null) {
    const word = m[2];
    push('zar', word, '«' + word + '» یعنی «زار زدن» (گریه و زاری). اگر منظورتان «گذاشتن» است، درست آن «می‌گذارم» (رسمی) یا «می‌ذارم» (محاوره‌ای) است.');
  }
  // ۲) بزار...: امر گذاشتن «بذار/بگذار» است نه «بزار»
  const bzarRe = /(^|[\s\u200C\(\["'«])(بزار(م|ی|ه|یم|ید|ن)?)(?![\u0600-\u06FF\u200C])/g;
  while ((m = bzarRe.exec(text)) !== null) {
    const word = m[2];
    const suggest = word.replace('بزار', 'بذار');
    push('bzar', word, '«' + word + '» برای «گذاشتن» درست نیست؛ شکل محاوره‌ای آن «' + suggest + '» (رسمی: بگذار) است.');
  }
  // ۳) می‌گزارم: گزاردن یعنی انجام دادن (مگر کنار نماز/خدمت/خواب...)
  const gozarRe = /(^|[\s\u200C\(\["'«])((ن)?می\u200C?گزار(م|ی|ه|یم|ید|ن)?)(?![\u0600-\u06FF\u200C])/g;
  while ((m = gozarRe.exec(text)) !== null) {
    const word = m[2];
    const before = text.slice(Math.max(0, m.index - 16), m.index);
    if (PTF_NOTICE_GOTO_SUPPRESS.some(w => before.includes(w))) continue;
    push('gozar', word, '«' + word + '» از «گزاردن» است یعنی انجام دادن (مانند نماز گزاردن). اگر منظورتان «گذاشتن» است، بنویسید «می‌گذارم» یا «می‌ذارم».');
  }
  return out;
}

function ptfFixArabicYK(t) {
  return t.replace(/\u064A/g, '\u06CC').replace(/\u0649/g, '\u06CC').replace(/\u0643/g, '\u06A9');
}

function ptfFixArabicAlef(t) {
  return t
    .replace(/\u0623/g, '\u0627') // أ -> ا
    .replace(/\u0625/g, '\u0627') // إ -> ا
    .replace(/\u0624/g, '\u0648') // ؤ -> و
    .replace(/\u0629/g, '\u0647'); // ة -> ه
}

function ptfFixTashkeel(t) {
  return t.replace(/[\u064B-\u065F\u0670]/g, '');
}

function ptfFixKashida(t) {
  return t.replace(/\u0640+/g, '');
}

function ptfFixArabicDigits(t) {
  const map = {'\u0660':'\u06F0','\u0661':'\u06F1','\u0662':'\u06F2','\u0663':'\u06F3','\u0664':'\u06F4','\u0665':'\u06F5','\u0666':'\u06F6','\u0667':'\u06F7','\u0668':'\u06F8','\u0669':'\u06F9'};
  return t.replace(/[\u0660-\u0669]/g, ch => map[ch] || ch);
}

function ptfNormalizeZWNJSpaces(t) {
  let out = t.replace(/\s*\u200C\s*/g, '\u200C');
  out = out.replace(/\u200C{2,}/g, '\u200C');
  return out;
}

function ptfFixZWNJ(t, live) {
  let out = t;
  // مرز فارسی: بعدش حرف فارسی/نیم‌فاصله نباشد (جایگزین مرز ASCII که برای فارسی کار نمی‌کند)
  const FA_END = '(?![\\u0600-\\u06FF\\u200C])';
  // حالت live (وسط تایپ): تهِ متن مرز حساب نمی‌شود تا «بخوابیم ام»ِ در حال تایپِ «اما»
  // با قانون ضمیر قاطی نشود — این‌ها موقع خروج از فیلد/پیست اعمال می‌شوند
  const END = live ? '(?=[\\s.,،:؛!؟\\)\\]\\["\'»])' : FA_END;
  // پیشوند می/نمی/بی با فاصله -> نیم‌فاصله (حین تایپ هم امن است)
  out = out.replace(/(^|[\s\u200C\(\["'«])(می)\s+/g, '$1می\u200C');
  out = out.replace(/(^|[\s\u200C\(\["'«])(نمی)\s+/g, '$1نمی\u200C');
  out = out.replace(/(^|[\s\u200C\(\["'«])(بی)\s+/g, '$1بی\u200C');
  // پایه «ه» + ضمیر/ای -> نیم‌فاصله: خانه ام -> خانه‌ام
  out = out.replace(new RegExp('([\\u0600-\\u06FF]+ه)\\s+(ام|ات|اش|مان|تان|شان|ای|ایم|اید|اند|یی|یم|یت|یش)' + END, 'g'), '$1\u200C$2');
  // خانه ی -> خانه‌ی (در live ته متن حساب نیست تا «خانه یادبود» خراب نشود)
  out = live
    ? out.replace(/([\u0600-\u06FF]+ه)\s+ی([\s.,،:؛!؟\)\]])/g, '$1\u200Cی$2')
    : out.replace(/([\u0600-\u06FF]+ه)\s+ی(\s|$|[.,،:؛!؟\)\]\s])/g, '$1\u200Cی$2');
  // پایه غیر «ه» + ضمیر -> چسبیده: کتاب ام -> کتابم (الف می‌افتد)، کتاب مان -> کتابمان
  out = out.replace(new RegExp('([\\u0627\\u0628\\u067E\\u062A\\u062B\\u062C\\u0686\\u062D\\u062E\\u062F\\u0630\\u0631\\u0632\\u0698\\u0633\\u0634\\u0635\\u0636\\u0637\\u0638\\u0639\\u063A\\u0641\\u0642\\u06A9\\u06AF\\u0644\\u0645\\u0646\\u0648\\u06CC])\\s+(ام|ات|اش|مان|تان|شان)' + END, 'g'), (m, base, suf) => {
    if (suf === 'ام') return base + 'م';
    if (suf === 'ات') return base + 'ت';
    if (suf === 'اش') return base + 'ش';
    return base + suf;
  });
  // به/کم/بیش + تر با فاصله -> چسبیده: به تر -> بهتر (نه به‌تر)
  out = out.replace(new RegExp('(^|[\\s\\u200C\\(\["\'«])(به|کم|بیش)\\s+(ترین|تری|تر)' + END, 'g'), '$1$2$3');
  // پسوند ها/تر با فاصله -> نیم‌فاصله
  out = out.replace(new RegExp('([\\u0600-\\u06FF])\\s+(هایمان|هایتان|هایشان|هایم|هایت|هایش|هایی|های|ها|ترین|تری|تر)' + END, 'g'), '$1\u200C$2');
  // می/نمی چسبیده بدون فاصله: میخواستم -> می‌خواستم (با استثنا: میز، میدان...)
  out = out.replace(/(^|[\s\u200C\(\["'«])می([\u0600-\u06FF]{2,})(?![\u0600-\u06FF\u200C])/g, (m, pre, rest) => {
    const full = 'می' + rest;
    if (MI_ATTACHED_EXCEPTIONS.has(full)) return m;
    return pre + 'می\u200C' + rest;
  });
  out = out.replace(/(^|[\s\u200C\(\["'«])نمی([\u0600-\u06FF]{2,})(?![\u0600-\u06FF\u200C])/g, (m, pre, rest) => {
    const full = 'نمی' + rest;
    if (NEMI_ATTACHED_EXCEPTIONS.has(full)) return m;
    return pre + 'نمی\u200C' + rest;
  });
  return out;
}

function ptfFixAttachedHa(t) {
  // کتابها -> کتاب‌ها (با استثنا تنها/رها/شما/همه)
  const AFTER = '([\\s.,،:؛!؟\\)\\]\\["\'»\\u200C]|$)';
  const re1 = new RegExp('([\\u0600-\\u06FF]{1,30}?)ها' + AFTER, 'g');
  const re2 = new RegExp('([\\u0600-\\u06FF]{2,30}?)های' + AFTER, 'g');
  const re3 = new RegExp('([\\u0600-\\u06FF]{2,30}?)هایی' + AFTER, 'g');
  return t
    .replace(re1, (m, base, after) => {
      const full = base + 'ها';
      if (ATTACHED_HA_EXCEPTIONS.has(full)) return m;
      if (full === 'شما' || full === 'همه' || full === 'بها') return m;
      // تک‌حرف + ها (مثل «به‌ها»؟) را دست نزن مگر آن/این
      if (base.length < 2 && full !== 'آنها' && full !== 'اینها') return m;
      return base + '\u200Cها' + after;
    })
    .replace(re2, (m, base, after) => {
      const full = base + 'های';
      if (ATTACHED_HA_EXCEPTIONS.has(full) || full === 'تنهای' || full === 'رهای' || full === 'شهای') return m;
      return base + '\u200Cهای' + after;
    })
    .replace(re3, (m, base, after) => {
      const full = base + 'هایی';
      if (full === 'تنهایی' || full === 'رهایی') return m;
      return base + '\u200Cهایی' + after;
    });
}

function ptfEscapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const FA_AFTER = '(?=[\\s\\u200C.,،:؛!؟\\)\\]\\["\'»]|$)';

function ptfFixCompounds(t) {
  let out = t;
  for (const [wrong, correct] of PTF_COMPOUNDS) {
    // جایگزینی با مرز کلمه فارسی (فاصله/شروع/نقطه‌گذاری/نیم‌فاصله)
    const re = new RegExp('(^|[\\s\\u200C\\(\["\'«])' + ptfEscapeRegExp(wrong) + FA_AFTER, 'g');
    out = out.replace(re, '$1' + correct);
  }
  return out;
}

function ptfFixCommonTypos(t) {
  let out = t;
  for (const [wrong, correct] of PTF_COMMON_TYPOS) {
    const re = new RegExp('(^|[\\s\\u200C\\(\["\'«])' + ptfEscapeRegExp(wrong) + FA_AFTER, 'g');
    out = out.replace(re, '$1' + correct);
  }
  return out;
}

function ptfFixStems(t) {
  let out = t;
  for (const [wrong, correct] of PTF_STEM_FIXES) {
    out = out.split(wrong).join(correct);
  }
  return out;
}

function ptfFixAttachedWords(t) {
  let out = t;
  for (const [wrong, correct] of PTF_ATTACHED_FIXES) {
    const re = new RegExp('(^|[\\s\\u200C\\(\["\'«])' + ptfEscapeRegExp(wrong) + FA_AFTER, 'g');
    out = out.replace(re, '$1' + correct);
  }
  return out;
}

const FA_DIGITS = '\\u06F0-\\u06F9\\u0660-\\u0669';
const ALL_DIGITS = '0-9' + FA_DIGITS;

function ptfFixPunctuationSpacing(t) {
  let out = t;
  out = out.replace(/\s+([.,،:؛!؟\)\]])/g, '$1');
  out = out.replace(/([\(\[])\s+/g, '$1');
  // فاصله بعد از نقطه‌گذاری، به‌جز بین ارقام (لاتین/فارسی/عربی) و علائم پشت سر هم
  out = out.replace(new RegExp('([.,،:؛!؟])([^\\s' + ALL_DIGITS + '.,،:؛!؟])', 'g'), '$1 $2');
  return out;
}

function ptfFixPersianPunct(t) {
  let out = t;
  out = out.replace(/\.{3,}/g, '…');
  // ویرگول/نقطه‌ویرگول بین دو رقم را دست نزن (کار جداکننده اعداد است)
  const DIG = '[0-9\\u06F0-\\u06F9\\u0660-\\u0669]';
  out = out.replace(new RegExp('(?<=[\\u0600-\\u06FF\\u200C]),(?![\\s]*' + DIG + ')|(?!' + DIG + ')(?<=[\\u0600-\\u06FF\\u200C]),|,(?=[\\u0600-\\u06FF\\u200C])', 'g'), (m, off, str) => {
    // اگر هر دو طرف رقم است، دست نزن
    const before = str[off - 1] || '';
    const after = str[off + 1] || '';
    const isDig = (ch) => /[0-9\u06F0-\u06F9\u0660-\u0669]/.test(ch);
    if (isDig(before) && isDig(after)) return m;
    return '،';
  });
  out = out.replace(/(?<=[\u0600-\u06FF\u200C]);|;(?=[\u0600-\u06FF\u200C])/g, '؛');
  out = out.replace(/(?<=[\u0600-\u06FF\u200C])\?|\?(?=[\u0600-\u06FF\u200C])/g, '؟');
  out = out.replace(/(?<=[\u0600-\u06FF\u200C0-9۰-۹])%|%(?=[\u0600-\u06FF\u200C])/g, '٪');
  return out;
}

function ptfFixDoubleSpace(t) {
  let out = t.replace(/[ \t]{2,}/g, ' ');
  out = out.replace(/\n{3,}/g, '\n\n');
  return out;
}

function ptfFixLatinDigits(t) {
  const fa = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  return t.replace(/\d/g, d => fa[+d]);
}

function ptfFixSeparators(t) {
  let out = t.replace(/([۰-۹]),([۰-۹])/g, '$1٬$2');
  out = out.replace(/([۰-۹])[.\/]([۰-۹])/g, '$1٫$2');
  return out;
}

function ptfFixRepeat(t) {
  return t.replace(/([\u0600-\u06FF])\1{2,}/g, '$1');
}

function ptfFixQuotes(t) {
  // "...فارسی..." -> «...»
  return t.replace(/"([^"\n]*[\u0600-\u06FF][^"\n]*)"/g, '«$1»');
}

function ptfIdxToLetters(i) {
  let s = '';
  i++;
  while (i > 0) {
    const m = (i - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    i = Math.floor((i - 1) / 26);
  }
  return s;
}

function ptfFixText(text, opts) {
  if (!text || typeof text !== 'string') return text;
  if (!/[\u0600-\u06FF]/.test(text)) return text;
  opts = opts || PTF_DEFAULTS;

  // محافظت از URL/ایمیل
  const placeholders = [];
  let out = text.replace(/https?:\/\/[^\s<>"']+|www\.[^\s<>"']+|[\w.+-]+@[\w-]+\.[\w.]+/g, (m) => {
    placeholders.push(m);
    return '\uE000' + ptfIdxToLetters(placeholders.length - 1) + '\uE001';
  });

  if (opts.fixKashida) out = ptfFixKashida(out);
  if (opts.fixTashkeel) out = ptfFixTashkeel(out);
  if (opts.fixArabicYK) out = ptfFixArabicYK(out);
  if (opts.fixArabicAlef) out = ptfFixArabicAlef(out);
  // حالت live (وسط تایپ): تهِ متنِ ناتمام مرز پسوند حساب نمی‌شود تا
  // «بخوابیم ام»ِ در حال تایپِ «اما» با قانون ضمیر قاطی نشود
  const live = !!(opts && opts.live);
  if (opts.fixArabicDigits) out = ptfFixArabicDigits(out);
  if (opts.fixLatinDigits) out = ptfFixLatinDigits(out);
  out = ptfNormalizeZWNJSpaces(out);
  if (opts.fixZWNJ) out = ptfFixZWNJ(out, live);
  if (opts.fixCompounds) out = ptfFixCompounds(out);
  if (opts.fixZWNJ) out = ptfFixZWNJ(out, live); // دومین پاس برای ترکیبات جدید
  if (opts.fixAttachedHa) out = ptfFixAttachedHa(out);
  if (opts.fixCommonTypos) out = ptfFixCommonTypos(out);
  if (opts.fixCompounds) out = ptfFixStems(out);
  if (opts.fixCompounds) out = ptfFixAttachedWords(out);
  if (opts.fixZWNJ) out = ptfFixZWNJ(out, live); // سومین پاس برای کلمات جدید
  if (opts.fixSeparators) out = ptfFixSeparators(out);
  if (opts.fixPunctuation) out = ptfFixPunctuationSpacing(out);
  if (opts.fixPersianPunct) out = ptfFixPersianPunct(out);
  if (opts.fixDoubleSpace) out = ptfFixDoubleSpace(out);
  if (opts.fixPunctuation && opts.fixDoubleSpace) out = out.replace(/ {2,}/g, ' ');
  if (opts.fixRepeat) out = ptfFixRepeat(out);
  if (opts.fixQuotes) out = ptfFixQuotes(out);

  // بازگردانی URLها
  out = out.replace(/\uE000([A-Z]+)\uE001/g, (m, letters) => {
    let idx = 0;
    for (const ch of letters) idx = idx * 26 + (ch.charCodeAt(0) - 64);
    idx = idx - 1;
    return placeholders[idx] !== undefined ? placeholders[idx] : m;
  });

  return out;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PTF_DEFAULTS, ptfFixText, ptfFindNotices };
}
