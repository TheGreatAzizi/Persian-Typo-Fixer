# Persian Typo Fixer

<p align="center">
  <img src="icon128.png" width="96" height="96" alt="Persian Typo Fixer">
</p>

<p align="center">
  <a href="https://github.com/TheGreatAzizi/Persian-Typo-Fixer/releases"><img src="https://img.shields.io/github/v/release/TheGreatAzizi/Persian-Typo-Fixer?label=version&color=2563eb&style=flat-square" alt="Version"></a>
  <a href="https://github.com/TheGreatAzizi/Persian-Typo-Fixer/blob/main/manifest.json"><img src="https://img.shields.io/badge/manifest-v3-blue?style=flat-square" alt="Manifest V3"></a>
  <a href="https://developer.chrome.com/docs/extensions/"><img src="https://img.shields.io/badge/Chrome-Extension-4285F4?style=flat-square&logo=googlechrome&logoColor=white" alt="Chrome Extension"></a>
  <a href="https://github.com/TheGreatAzizi/Persian-Typo-Fixer/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="MIT License"></a>
  <a href="https://github.com/TheGreatAzizi/Persian-Typo-Fixer"><img src="https://img.shields.io/github/stars/TheGreatAzizi/Persian-Typo-Fixer?style=flat-square" alt="Stars"></a>
</p>

<p align="center">
  <b>غلط‌گیر خودکار فارسی، همه‌جا در وب — هنگام تایپ، بدون کلیک اضافه</b><br>
  <i>Automatic Persian typo fixer for Chrome — ZWNJ, Arabic characters, digits, punctuation and semantic warnings, right as you type.</i>
</p>

<p align="center">
  <a href="https://www.youtube.com/@AziziWC"><img src="https://img.shields.io/badge/YouTube-AziziWC-red?style=for-the-badge&logo=youtube" alt="AziziWC"></a>
  <a href="https://www.youtube.com/@The_azizi"><img src="https://img.shields.io/badge/YouTube-The_azizi-red?style=for-the-badge&logo=youtube" alt="The_azizi"></a>
  <a href="https://t.me/luluch_code"><img src="https://img.shields.io/badge/Telegram-luluch_code-27A5E7?style=for-the-badge&logo=telegram" alt="Telegram"></a>
  <a href="https://x.com/the_azzi"><img src="https://img.shields.io/badge/X-the_azzi-black?style=for-the-badge&logo=x" alt="X"></a>
  <a href="https://github.com/TheGreatAzizi"><img src="https://img.shields.io/badge/GitHub-TheGreatAzizi-181717?style=for-the-badge&logo=github" alt="GitHub"></a>
</p>

---

برنامه‌نویس: TheAzizi

## درباره پروژه

**Persian Typo Fixer** یک افزونه کروم (Manifest V3) است که غلط‌های رایج تایپ فارسی را **همان لحظه تایپ** و در **هر فیلد واقعی هر سایتی** اصلاح می‌کند: چت کیک و یوتیوب، کامنت اینستاگرام، توییت، تلگرام وب، گوگل، فرم‌ها و هر `input` و `textarea` دیگری. نیازی به انتخاب متن یا فشردن دکمه نیست؛ کافی است فارسی بنویسید.

> About: A Chrome Extension (Manifest V3) that fixes common Persian typos live, in every real field of every website — no selection, no button. Just type in Persian.

### چرا این افزونه؟

- کیبوردهای فارسی/عربی حروف مشابه (`ي` عربی به‌جای `ی` فارسی) تولید می‌کنند و بیشتر کاربران متوجه نمی‌شوند.
- نیم‌فاصله (`می‌شود` در برابر `می شود`) پرتکرارترین غلط نگارشی فارسی در وب است.
- ابزارهای موجود یا فقط متن انتخاب‌شده را اصلاح می‌کنند یا با ادیتورهای مدرن (React) سازگار نیستند. این افزونه هنگام تایپ، با حفظ جای کرسر و سازگار با React/Vue کار می‌کند.

## چه چیزی را درست می‌کند

| غلط | درست | توضیح |
|---|---|---|
| `علي كجاست ؟` | `علی کجاست؟` | ی/ک عربی + فاصله قبل ؟ |
| `كتاب ها مي شود` | `کتاب‌ها می‌شود` | نیم‌فاصله ها + می |
| `من ميخواستم برم` | `من می‌خواستم برم` | می چسبیده (به‌جز میز/میدان/میان...) |
| `کتاب ام` | `کتابم` | ضمیر چسبیده (الف می‌افتد) |
| `خانه ام` | `خانه‌ام` | ضمیر بعد از «ه» با نیم‌فاصله |
| `کتابها` | `کتاب‌ها` | های چسبیده (به‌جز تنها/رها/شما) |
| `به تر` | `بهتر` | نه «به‌تر» |
| `همینطور درمورد` | `همین‌طور در مورد` | کلمات چسبیده اشتباه |
| `روز نامه` | `روزنامه` | ترکیب‌های رایج (۲۰+ مورد) |
| `انشاالله اين كه` | `ان‌شاءالله اینکه` | غلط‌های رایج |
| `نمازگذاران` | `نمازگزاران` | گزاردن (انجام دادن) در برابر گذاشتن |
| `بنیانگزار` | `بنیانگذار` | گذاشتن در برابر گزاردن |
| `حیات خلوت` | `حیاط خلوت` | حیاط (محوطه) در برابر حیات (زندگی) |
| `سلام ، دنيا` | `سلام، دنیا` | فاصله‌گذاری نقطه‌گذاری |
| `سلام,خوبی؟` | `سلام، خوبی؟` | علائم لاتین به فارسی |
| `١٢٣` | `۱۲۳` | ارقام عربی به فارسی |
| `ســلام` | `سلام` | حذف کشیده (تطویل) و حرکات عربی |

## هشدار معنایی (نوتیس)

کلماتی که املای مشابه اما **معنای متفاوت** دارند خودکار عوض نمی‌شوند تا منظور شما خراب نشود؛ در عوض یک نوتیس آموزشی نمایش داده می‌شود (داخل صفحه هنگام تایپ + زیر تست زنده):

- **می‌زارم / نمی‌زارم** — «می‌زارم» یعنی «زار زدن» (گریه و زاری). اگر منظورتان «گذاشتن» است بنویسید «می‌گذارم» (رسمی) یا «می‌ذارم» (محاوره‌ای).
- **بزار / بزارم** — برای «گذاشتن» درست نیست؛ شکل محاوره‌ای آن «بذار» (رسمی: بگذار) است. کلمه «ابزار» اشتباه گرفته نمی‌شود.
- **می‌گزارم** — از «گزاردن» است یعنی انجام دادن (مانند نماز گزاردن). اگر منظورتان «گذاشتن» است «می‌گذارم/می‌ذارم» بنویسید. کنار «نماز/خدمت/خواب» نوتیس داده نمی‌شود.

نوتیس داخل صفحه هر کلمه را هر ۱۰ دقیقه فقط یک‌بار نشان می‌دهد و با کلید `notices` در تنظیمات خاموش می‌شود.

## ویژگی‌های فنی

- **۱۸ حالت مستقل** — هر اصلاح (ی/ک عربی، نیم‌فاصله، ترکیب‌ها، اعداد، نقطه‌گذاری و ...) از پاپ‌آپ و تنظیمات جدا خاموش/روشن می‌شود.
- **کار در هر فیلد واقعی صفحه** — `input` (همه تایپ‌های متنی)، `textarea`، `contenteditable`، ادیتورهای `designMode` داخل آی‌فریم، فیلدهای داخل Shadow DOM باز (شامل کامپوننت‌های داینامیک)، و تور ایمنی دوره‌ای برای فیلدهایی که ایونت را قورت می‌دهند.
- **سازگار با React/Vue** — مقداردهی با setter اصلی مرورگر + ایونت‌های `input`/`change` تا state فریم‌ورک همگام بماند و تغییر برنگردد.
- **فیکس فوری سر مرز کلمه** — با زدن فاصله/نقطه‌گذاری/انتر اصلاح همان لحظه اعمال می‌شود؛ تایمر جدا برای هر فیلد؛ پاس نهایی موقع خروج از فیلد و فیکس موقع فوکس برای درافت‌های از قبل پرشده.
- **حفظ کرسر و امنیت لینک** — جای کرسر بعد از اصلاح سر جایش می‌ماند؛ URL و ایمیل دست نمی‌خورد؛ فیلد `password`/`number` هیچ‌وقت لمس نمی‌شود؛ ادیتورهای کد (Monaco/CodeMirror/Ace) اسکیپ می‌شوند.
- **غیرفعال‌سازی per-site** — از پاپ‌آپ «غیرفعال در این سایت» یا لیست تنظیمات (ساب‌دامین هم شامل می‌شود).
- **فونت رابط داخلی** — متن‌های خود افزونه با وزیرمتنِ داخل پکیج (`fonts/*.woff2` متغیر) نمایش داده می‌شود؛ بدون نیاز به اینترنت.
- **حریم خصوصی** — هیچ داده‌ای ارسال نمی‌شود؛ کل پردازش داخل مرورگر است.

## نصب

### نصب دستی (Developer Mode)

1. پروژه را دانلود کنید:
   ```bash
   git clone https://github.com/TheGreatAzizi/Persian-Typo-Fixer.git
   ```
   یا از صفحه [Releases](https://github.com/TheGreatAzizi/Persian-Typo-Fixer/releases) فایل ZIP را بگیرید.
2. در کروم به `chrome://extensions` بروید.
3. `Developer mode` را از بالا فعال کنید.
4. `Load unpacked` را بزنید و پوشه پروژه را انتخاب کنید.
5. تمام شد — هرجا فارسی تایپ کنید خودکار درست می‌شود.

### Chrome Web Store

به‌زودی منتشر می‌شود.

## استفاده

1. روی آیکون افزونه کلیک کنید؛ مطمئن شوید «فعال‌سازی» روشن است.
2. هر کدام از ۱۸ حالت را که نمی‌خواهید خاموش کنید.
3. در کادر «تست زنده» بنویسید (مثلا `كتاب ها مي شود ،سلام`) و نتیجه + هشدارها را ببینید.
4. برای مدیریت سایت‌های غیرفعال، صفحه «تنظیمات کامل» را باز کنید.

## ساختار پروژه

```
Persian-Typo-Fixer/
├── manifest.json   # Manifest V3 — content_scripts: fixes.js + content.js
├── fixes.js        # موتور ptfFixText + ptfFindNotices + دیکشنری‌ها (مشترک)
├── content.js      # لیسنرها، حفظ کرسر، setter سازگار با React، نوتیس صفحه
├── popup.html/js   # پاپ‌آپ 380px + تست زنده + غیرفعال‌سازی سایت فعلی
├── options.html/js # تنظیمات کامل + نمونه‌ها + لیست سایت‌های غیرفعال
├── background.js   # مقادیر پیش‌فرض نصب
├── fonts/          # وزیرمتن variable محلی (عربی + لاتین)
├── icon*.png
└── README.md
```

## نحوه کار (فنی)

1. `fixes.js` متن را لایه‌به‌لایه اصلاح می‌کند: کشیده/حرکات ← ی/ک عربی ← همزه/ة ← ارقام ← نرمال‌سازی نیم‌فاصله ← پیشوند/پسوند ← ترکیب‌ها ← ریشه‌ها ← نقطه‌گذاری ← فاصله دوبل. URL/ایمیل با placeholder محافظت و آخر برمی‌گردد.
2. مرز کلمه فارسی با lookahead منفی `(?![\u0600-\u06FF\u200C])` پیاده شده چون `\b` اسکی برای فارسی کار نمی‌کند.
3. `content.js` روی `input`/`keydown`/`paste`/`change`/`focusin`/`focusout` در document و همه shadowRootها گوش می‌دهد؛ مقدار با native setter ست و کرسر با اختلاف طولِ «متن قبل از کرسر» بازسازی می‌شود.
4. تنظیمات در `chrome.storage.sync` است و بین پاپ‌آپ/تنظیمات/تب‌ها زنده همگام می‌شود.

## توسعه

```bash
git clone https://github.com/TheGreatAzizi/Persian-Typo-Fixer.git
cd Persian-Typo-Fixer
# بعد از هر تغییر: chrome://extensions -> Reload افزونه -> رفرش تب
```

تست‌ها (Node):
```bash
node ptf-final.mjs    # رگرسیون موتور
node ptf-dom.mjs      # رفتار DOM و setter
node ptf-mi.mjs       # می چسبیده
node ptf-notice.mjs   # هشدارها
```

باگ یا پیشنهاد را در [Issues](https://github.com/TheGreatAzizi/Persian-Typo-Fixer/issues) ثبت کنید. پول‌ریکوئست هم پذیرفته می‌شود.

## عیب‌یابی

1. بعد از هر آپدیت در `chrome://extensions` دکمه **Reload** افزونه را بزنید و تب را رفرش کنید.
2. تoggles پاپ‌آپ (مخصوصا «فعال‌سازی») روشن باشد.
3. در نوار آدرس و صفحات `chrome://` اسکریپت اجرا نمی‌شود؛ در یک سایت عادی تست کنید.
4. ویرایشگرهای canvas (مثل گوگل‌داکس) و شدوی بسته محدودیت مرورگرند و پشتیبانی نمی‌شوند.

## تغییرات

- **v1.4.1:** فونت رابط (پاپ‌آپ/تنظیمات) وزیرمتن داخلی شد — بدون نیاز به اینترنت.
- **v1.4.0:** هر فیلد در هر سایت — فیکس موقع فوکس، تور ایمنی، غیرفعال‌سازی per-site، سقف طول.
- **v1.3.0:** پوشش Shadow DOM و designMode، همه تایپ‌های متنی، فیکس فوری سر مرز کلمه، InputEvent.
- **v1.2.x:** هشدار معنایی میزارم/بزار، React setter، بهتر/همین‌طور/درمورد، ریشه‌های نمازگزار/بنیانگذار.

## لینک‌های سازنده

- YouTube AziziWC: https://www.youtube.com/@AziziWC
- YouTube The_azizi: https://www.youtube.com/@The_azizi
- Telegram: https://t.me/luluch_code
- X: https://x.com/the_azzi
- GitHub: https://github.com/TheGreatAzizi

## لایسنس

MIT License — فایل [LICENSE](LICENSE) را ببینید.

---

ساخته شده توسط TheAzizi
