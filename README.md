# Persian Typo Fixer

<p align="center">
  <img src="icon128.png" width="96" height="96" alt="Persian Typo Fixer">
</p>

<p align="center">
  <a href="https://github.com/TheGreatAzizi/Persian-Typo-Fixer/releases"><img src="https://img.shields.io/github/v/release/TheGreatAzizi/Persian-Typo-Fixer?label=version&color=2563eb&style=flat-square" alt="Version"></a>
  <a href="https://github.com/TheGreatAzizi/Persian-Typo-Fixer/blob/main/manifest.json"><img src="https://img.shields.io/badge/manifest-v3-blue?style=flat-square" alt="Manifest V3"></a>
  <a href="https://developer.chrome.com/docs/extensions/"><img src="https://img.shields.io/badge/Chrome-88+-4285F4?style=flat-square&logo=googlechrome&logoColor=white" alt="Chrome 88+"></a>
  <a href="https://www.mozilla.org/firefox/new/"><img src="https://img.shields.io/badge/Firefox-121+-FF7139?style=flat-square&logo=firefox&logoColor=white" alt="Firefox 121+"></a>
  <a href="https://github.com/TheGreatAzizi/Persian-Typo-Fixer/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="MIT License"></a>
  <a href="https://github.com/TheGreatAzizi/Persian-Typo-Fixer"><img src="https://img.shields.io/github/stars/TheGreatAzizi/Persian-Typo-Fixer?style=flat-square" alt="Stars"></a>
  <a href="https://github.com/TheGreatAzizi/Persian-Typo-Fixer/commits/main"><img src="https://img.shields.io/github/last-commit/TheGreatAzizi/Persian-Typo-Fixer?style=flat-square" alt="Last commit"></a>
</p>

<p align="center">
  <b>غلط‌گیر خودکار فارسی، همه‌جا در وب — همان لحظه تایپ، بدون حتی یک کلیک اضافه</b>
</p>

<div dir="rtl">

**برنامه‌نویس: TheAzizi**

## فهرست

- [این افزونه چه کار می‌کند؟](#about)
- [پاسداشت زبان پارسی](#tribute)
- [چند نمونه](#examples)
- [هشدارهای باهوش](#notices)
- [امکانات](#features)
- [نصب روی کروم](#install-chrome)
- [نصب روی فایرفاکس](#install-firefox)
- [چرا هنوز در استور نیست؟](#stores)
- [طرز استفاده](#usage)
- [فهرست کلمات](#words)
- [حریم خصوصی](#privacy)
- [ساختار پروژه](#structure)
- [مشارکت و عیب‌یابی](#dev)
- [حمایت](#support)
- [لینک‌های سازنده](#links)
- [لایسنس](#license)
- [English summary](#english)

<a id="about"></a>
## این افزونه چه کار می‌کند؟

شما فارسی تایپ می‌کنید، **Persian Typo Fixer** همان لحظه غلط‌های رایج را درست می‌کند — در چت، کامنت، ایمیل، فرم و هر جای دیگری که در مرورگر تایپ می‌کنید. بدون انتخاب متن، بدون فشردن دکمه، بدون به‌هم ریختن جای کرسر.

سه مشکل بزرگی که حل می‌کند:

- **حروف قاطی‌شده کیبورد:** خیلی وقت‌ها به‌جای `ی` و `ک` فارسی، نسخه عربی‌شان (`ي` و `ك`) تایپ می‌شود و چشم هم نمی‌فهمد. افزونه خودکار درستش می‌کند.
- **نیم‌فاصله:** `می شود` می‌شود `می‌شود`، `کتاب ها` می‌شود `کتاب‌ها` — پرتکرارترین غلط نگارشی فارسی در وب.
- **کلمات گیج‌کننده:** مثل `نمازگذار` که درستش `نمازگزار` است، یا `حیات خلوت` که درستش `حیاط خلوت` است. فهرست کامل در [WORDS.md](./WORDS.md).

<a id="tribute"></a>
## پاسداشت زبان پارسی

> این افزونه کوششی است برای پاسداری از زبان پارسی، پیشکشی ناچیز به روان فردوسی بزرگ؛ آن رادمردی که این زبان را از تاراج فراموشی رهانید و شاهنامه را چون چراغی فراروی آیندگان نهاد. باشد که با درست نوشتن هر واژه‌ی پارسی، در زنده نگه داشتن این گنج کهن، ما را نیز دستی باشد.

<a id="examples"></a>
## چند نمونه

| غلط | درست | توضیح ساده |
|---|---|---|
| `علي كجاست ؟` | `علی کجاست؟` | حروف عربی + فاصله اضافه |
| `كتاب ها مي شود` | `کتاب‌ها می‌شود` | نیم‌فاصله |
| `من ميخواستم برم` | `من می‌خواستم برم` | میِ چسبیده |
| `کتاب ام` | `کتابم` | ضمیر چسبیده |
| `به تر` | `بهتر` | نه «به‌تر»! |
| `همینطور درمورد` | `همین‌طور در مورد` | کلمات چسبیده اشتباه |
| `روز نامه` | `روزنامه` | ترکیب‌های رایج (۲۰۰+ مورد) |
| `انشاالله` | `ان‌شاءالله` | غلط‌های رایج |
| `سلام,خوبی؟` | `سلام، خوبی؟` | علائم فارسی |
| `١٢٣` | `۱۲۳` | ارقام عربی |

<a id="notices"></a>
## هشدارهای باهوش

بعضی کلمات املای شبیه هم اما **معنی متفاوت** دارند. افزونه این‌ها را خودسر عوض نمی‌کند (تا منظورتان خراب نشود) بلکه یک راهنمایی کوتاه نشان می‌دهد:

- **می‌زارم** یعنی «زار زدن» (گریه و زاری)! برای «گذاشتن» بنویسید **می‌گذارم** یا **می‌ذارم**.
- **بزار** درست نیست؛ محاوره‌ای‌اش **بذار** است (رسمی: بگذار).
- **می‌گزارم** یعنی «انجام دادن» (مثل نماز گزاردن)؛ برای «گذاشتن» بنویسید **می‌گذارم**.
- **می‌خاست** با **می‌خواست** فرق دارد (خاستن = برخاستن، خواستن = میل و اراده).
- **حیات** یعنی زندگی؛ اگر منظورتان محوطه خانه است، **حیاط** بنویسید.

<a id="features"></a>
## امکانات

- **۱۸ حالت جدا** — هر نوع اصلاح را می‌شود جدا خاموش/روشن کرد.
- **دیکشنری شخصی** — غلط و درست‌های خودتان را اضافه کنید؛ حرف شما بر همه مقدم است.
- **راست‌کلیک اصلاح** — روی هر متن انتخاب‌شده در هر صفحه کلیک راست کنید تا نسخه درستش کپی شود (حتی متن‌های غیرقابل ویرایش).
- **کار در همه‌جا** — یوتیوب، کیک، اینستاگرام، توییتر، تلگرام وب، گوگل و بقیه سایت‌ها.
- **خراب نکردن متن** — موقع تایپ فقط کلمه تمام‌شده اصلاح می‌شود و جای کرسر دقیق سر جایش می‌ماند.
- **غیرفعال‌سازی برای بعضی سایت‌ها** — از خود پاپ‌آپ یا تنظیمات.
- **بدون اینترنت کار می‌کند** — حتی فونت خودش داخل افزونه است.
- **حریم خصوصی کامل** — هیچ اطلاعاتی هیچ‌جا ارسال نمی‌شود؛ همه‌چیز داخل مرورگر خودتان انجام می‌شود.

<a id="install-chrome"></a>
## نصب روی کروم

1. فایل ZIP آخرین نسخه را از صفحه [Releases](https://github.com/TheGreatAzizi/Persian-Typo-Fixer/releases) دانلود و از حالت فشرده خارج کنید (یا پروژه را کلون بگیرید).
2. در کروم به آدرس `chrome://extensions` بروید.
3. حالت `Developer mode` را از بالا روشن کنید.
4. دکمه `Load unpacked` را بزنید و پوشه افزونه را انتخاب کنید.
5. تمام شد! از این به بعد هرجا فارسی تایپ کنید خودکار درست می‌شود.

<a id="install-firefox"></a>
## نصب روی فایرفاکس (نسخه ۱۲۱ به بالا)

1. فایل ZIP مخصوص فایرفاکس (`Persian-Typo-Fixer-firefox-v*.zip`) را از صفحه [Releases](https://github.com/TheGreatAzizi/Persian-Typo-Fixer/releases) دانلود و از حالت فشرده خارج کنید (یا با دستور `node build.mjs` بسازیدش).
2. در فایرفاکس به آدرس `about:debugging#/runtime/this-firefox` بروید.
3. `Load Temporary Add-on` را بزنید و فایل `manifest.json` داخل پوشه را انتخاب کنید.
4. توجه: نصب موقت با بستن فایرفاکس پاک می‌شود؛ برای نصب دائمی باید نسخه امضاشده از استور فایرفاکس بیاید (بخش بعدی را ببینید).

<a id="stores"></a>
## چرا هنوز در استور نیست؟

انتشار در **Chrome Web Store** نیاز به حساب توسعه‌دهنده پولی گوگل دارد و انتشار دائمی در **استور فایرفاکس** هم مراحل و هزینه خودش را دارد. فعلاً امکان مالی‌اش نیست، برای همین نصب فعلاً دستی (بالا) انجام می‌شود. اگر دوست دارید زودتر به استور بیاید، بهترین کمک **ستاره دادن به ریپو** و معرفی آن به دیگران است.

<a id="usage"></a>
## طرز استفاده

1. روی آیکون افزونه کلیک کنید و مطمئن شوید «فعال‌سازی» روشن است.
2. حالت‌هایی که نمی‌خواهید را خاموش کنید.
3. در کادر «تست زنده» بنویسید تا نتیجه را همان‌جا ببینید.
4. کلمات خودتان را در «تنظیمات کامل» > «دیکشنری شخصی» اضافه کنید.

<a id="words"></a>
## فهرست کلمات

فهرست کامل کلمات گیج‌کننده با توضیح فرق معنی در فایل **[WORDS.md](./WORDS.md)** است. کلمه‌ای جا افتاده؟ در Issues بگویید.

<a id="structure"></a>
## ساختار پروژه (برای توسعه‌دهنده‌ها)

</div>

<div dir="ltr">

```
Persian-Typo-Fixer/
├── manifest.json         # کروم (Manifest V3)
├── manifest.firefox.json # فایرفاکس (Manifest V3 + gecko id)
├── build.mjs             # ساخت dist/chrome و dist/firefox + فایل ZIP هر استور
├── fixes.js              # موتور اصلاح + دیکشنری‌ها (مشترک بین دو مرورگر)
├── content.js            # اجرا داخل صفحه‌های وب
├── popup.html/js         # پنجره کوچک افزونه
├── options.html/js       # صفحه تنظیمات کامل
├── background.js         # کارهای پس‌زمینه + منوی راست‌کلیک
├── fonts/                # فونت وزیرمتن داخلی
├── WORDS.md              # فهرست کلمات دوحالته
├── icon*.png
└── README.md
```

```bash
git clone https://github.com/TheGreatAzizi/Persian-Typo-Fixer.git
cd Persian-Typo-Fixer
node build.mjs   # خروجی: dist/chrome و dist/firefox + فایل‌های ZIP
```

</div>

<div dir="rtl">

<a id="dev"></a>
## مشارکت و عیب‌یابی

- باگ یا پیشنهاد را در [Issues](https://github.com/TheGreatAzizi/Persian-Typo-Fixer/issues) ثبت کنید. پول‌ریکوئست هم پذیرفته می‌شود.
- بعد از هر تغییر کد: در `chrome://extensions` دکمه **Reload** افزونه را بزنید و تب را رفرش کنید.
- در نوار آدرس و صفحات `chrome://` افزونه‌ها اجازه اجرا ندارند؛ در یک سایت عادی تست کنید.
- ویرایشگرهای نقاشی‌محور (مثل گوگل‌داکس) محدودیت مرورگرند و پشتیبانی نمی‌شوند.

<a id="support"></a>
## حمایت

اگر این افزونه به کارتان آمد، با یک ستاره به آن انرژی بدهید. پیشنهاد کلمه جدید برای دیکشنری هم بهترین کمک است.

<a id="links"></a>
## لینک‌های سازنده

- YouTube AziziWC: https://www.youtube.com/@AziziWC
- YouTube The_azizi: https://www.youtube.com/@The_azizi
- Telegram: https://t.me/luluch_code
- X: https://x.com/the_azzi
- GitHub: https://github.com/TheGreatAzizi

<a id="english"></a>
## English summary

**Persian Typo Fixer** is a Manifest V3 extension for Chrome and Firefox that fixes common Persian typos live, in every real field of every website — Arabic/Persian Yeh & Kaf, ZWNJ (half-space), 200+ compound words, digits and punctuation — plus educational semantic warnings (e.g. می‌زارم vs می‌گذارم), a personal dictionary, per-site disable and right-click fix-and-copy. No data ever leaves your browser (MIT licensed). Install manually for now (see install sections above); store releases will follow when possible. Issues and PRs are welcome.

## لایسنس

MIT License — فایل [LICENSE](LICENSE) را ببینید.

</div>

<p align="center">ساخته شده توسط TheAzizi</p>
