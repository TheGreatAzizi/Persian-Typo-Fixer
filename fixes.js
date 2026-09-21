// Persian Typo Fixer | fixes.js | By TheAzizi | v1.11.0
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
  disabledSites: [],      // هاست‌هایی که افزونه در آن‌ها کار نکند (آرایه رشته)
  customWords: []         // دیکشنری شخصی: [{from, to, on}] — بالاترین اولویت
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

// آیا کلمه ممکن است به استثنا تبدیل شود؟ (خودش استثناست یا پیشوندِ یکی است)
// مثلا «مید» ممکن است «میدان» شود پس نباید به «می‌د» تبدیل شود —
// ولی «میخواستم» با اینکه با «میخ» شروع می‌شود باید جدا شود (می+خواستم محتمل‌تر است)
function ptfHitsSet(word, set) {
  for (const e of set) {
    if (word === e || e.startsWith(word)) return true;
  }
  return false;
}

// حروف واقعی فارسی/عربی — بدون علائم نگارشی بازه عربی (، ؛ ؟ ٬ ٫ ٪ ٭ و ...)
// چون U+0600 تا U+06FF شامل نقطه‌گذاری هم هست و مرز کلمه را خراب می‌کند
// نکته: آ (0622) هم حرف است (آن، آیا، آمد) — بازه از 0621 شروع می‌شود
const FA_L = '\\u0621-\\u064A\\u067E\\u0686\\u0698\\u06A9\\u06AF\\u06CC\\u06BE\\u06C0';
const FA_END_STRICT = '(?![' + FA_L + '\\u200C])';
// مرز شروع فارسی: شروع/فاصله/نیم‌فاصله/پرانتز/نقل‌قول/نقطه‌گذاری (، بعد از ویرگول هم کلمه می‌آید)
const FA_PRE = '(^|[\\s\\u200C\\(\\["\'«.,،:؛!؟…?;\\)\\]»])';

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
  ['به هر حال', 'به‌هرحال'],
  ['به عنوان', 'به‌عنوان'],
  ['بعنوان', 'به‌عنوان'],
  ['به نفع', 'به‌نفع'],
  ['به ضرر', 'به‌ضرر'],
  ['به همراه', 'به‌همراه'],
  ['به علاوه', 'به‌علاوه'],
  ['به وسیله', 'به‌وسیله'],
  ['بوسیله', 'به‌وسیله'],
  ['به خاطر', 'به‌خاطر'],
  ['به نظر', 'به‌نظر'],
  ['از جمله', 'ازجمله'],
  ['از قبیل', 'ازقبیل'],
  ['با وجود', 'باوجود'],
  ['در نتیجه', 'درنتیجه'],
  ['در واقع', 'درواقع'],
  ['در عین حال', 'درعین‌حال'],
  ['پدر بزرگ', 'پدربزرگ'],
  ['مادر بزرگ', 'مادربزرگ'],
  ['خدا حافظ', 'خداحافظ'],
  ['بنابر این', 'بنابراین'],
  ['خوش آمدی', 'خوش‌آمدی'],
  ['خوش آمدید', 'خوش‌آمدید'],
  ['خوش آمدگویی', 'خوش‌آمدگویی'],
  ['فوق العاده', 'فوق‌العاده'],
  ['خارق العاده', 'خارق‌العاده'],
  ['حیرت انگیز', 'حیرت‌انگیز'],
  ['شگفت انگیز', 'شگفت‌انگیز'],
  ['دل نشین', 'دلنشین'],
  ['ماه عسل', 'ماه‌عسل'],
  ['هفته نامه', 'هفته‌نامه'],
  ['ماه نامه', 'ماهنامه'],
  ['سه شنبه', 'سه‌شنبه'],
  ['چهار شنبه', 'چهارشنبه'],
  ['پنج شنبه', 'پنجشنبه'],
  ['یک شنبه', 'یکشنبه'],
  ['دو شنبه', 'دوشنبه'],
  ['آخر هفته', 'آخرهفته'],
  ['پس فردا', 'پس‌فردا'],
  ['نیمه شب', 'نیمه‌شب'],
  ['نصف شب', 'نصف‌شب'],
  ['عید دیدنی', 'عیددیدنی'],
  ['سیزده بدر', 'سیزده‌بدر'],
  ['چهارشنبه سوری', 'چهارشنبه‌سوری'],
  ['صبح بخیر', 'صبح‌بخیر'],
  ['شب بخیر', 'شب‌بخیر'],
  ['خدا قوت', 'خداقوت'],
  ['دست مریزاد', 'دست‌مریزاد'],
  ['زنده باد', 'زنده‌باد'],
  ['مرده باد', 'مرده‌باد'],
  ['پاینده باد', 'پاینده‌باد'],
  ['نوش جان', 'نوش‌جان'],
  ['به به', 'به‌به'],
  ['ای ول', 'ایول'],
  ['بارک الله', 'بارک‌الله'],
  ['الحمد لله', 'الحمدلله'],
  ['استغفر الله', 'استغفرالله'],
  ['روزه دار', 'روزه‌دار'],
  ['روزه خواری', 'روزه‌خواری'],
  ['شراب خواری', 'شراب‌خواری'],
  ['خواب آلود', 'خواب‌آلود'],
  ['خواب آلودگی', 'خواب‌آلودگی'],
  ['فارغ التحصیل', 'فارغ‌التحصیل'],
  ['سر فراز', 'سرفراز'],
  ['سر نوشت', 'سرنوشت'],
  ['سر مایه', 'سرمایه'],
  ['سر گرم', 'سرگرم'],
  ['سر در گم', 'سردرگم'],
  ['دل خوش', 'دلخوش'],
  ['دل تنگ', 'دلتنگ'],
  ['دل شکسته', 'دلشکسته'],
  ['دل گرم', 'دلگرم'],
  ['دل سرد', 'دلسرد'],
  ['دل مرده', 'دلمرده'],
  ['خون گرم', 'خونگرم'],
  ['خون سرد', 'خونسرد'],
  ['سنگ دل', 'سنگدل'],
  ['یک دل', 'یکدل'],
  ['یک دست', 'یکدست'],
  ['یک صدا', 'یکصدا'],
  ['یک رنگ', 'یکرنگ'],
  ['هم صدا', 'همصدا'],
  ['هم رزم', 'همرزم'],
  ['هم سنگر', 'همسنگر'],
  ['هم پیمان', 'هم‌پیمان'],
  ['هم عقیده', 'هم‌عقیده'],
  ['غیر رسمی', 'غیررسمی'],
  ['غیر قانونی', 'غیرقانونی'],
  ['غیر انسانی', 'غیرانسانی'],
  ['غیر منتظره', 'غیرمنتظره'],
  ['پیش غذا', 'پیش‌غذا'],
  ['پیش درآمد', 'پیش‌درآمد'],
  ['پس لرزه', 'پس‌لرزه'],
  ['پس مانده', 'پس‌مانده'],
  ['میان وعده', 'میان‌وعده'],
  ['میان سال', 'میانسال'],
  ['بین المللی', 'بین‌المللی'],
  ['بین الملل', 'بین‌الملل'],
  ['چاره ساز', 'چاره‌ساز'],
  ['مشکل گشا', 'مشکل‌گشا'],
  ['گره گشا', 'گره‌گشا'],
  ['دل سوز', 'دلسوز'],
  ['دل سوخته', 'دلسوخته'],
  ['کار بلد', 'کاربلد'],
  ['کار کشته', 'کارکشته'],
  ['کار آزموده', 'کارآزموده'],
  ['راه بلد', 'راهبلد'],
  ['یاد آوری', 'یادآوری'],
  ['یاد داشت', 'یادداشت'],
  ['یاد بود', 'یادبود'],
  ['گوش زد', 'گوشزد'],
  ['کم حوصله', 'کم‌حوصله'],
  ['کم حرف', 'کم‌حرف'],
  ['کم خواب', 'کم‌خواب'],
  ['کم سواد', 'کم‌سواد'],
  ['کم سن', 'کم‌سن'],
  ['کم کار', 'کم‌کار'],
  ['کم بها', 'کم‌بها'],
  ['کم ارزش', 'کم‌ارزش'],
  ['کم یاب', 'کمیاب'],
  ['کم نظیر', 'کم‌نظیر'],
  ['پر حرف', 'پرحرف'],
  ['پر رو', 'پررو'],
  ['پر بیننده', 'پربیننده'],
  ['پر فروش', 'پرفروش'],
  ['پر طرفدار', 'پرطرفدار'],
  ['پر هزینه', 'پرهزینه'],
  ['پر خطر', 'پرخطر'],
  ['پر سر و صدا', 'پرسروصدا'],
  ['خوش بین', 'خوش‌بین'],
  ['خوش قول', 'خوش‌قول'],
  ['خوش سلیقه', 'خوش‌سلیقه'],
  ['خوش تیپ', 'خوش‌تیپ'],
  ['خوش شانس', 'خوش‌شانس'],
  ['خوش طعم', 'خوش‌طعم'],
  ['خوش بو', 'خوشبو'],
  ['بد بین', 'بدبین'],
  ['بد قول', 'بدقول'],
  ['بد سلیقه', 'بدسلیقه'],
  ['بد تیپ', 'بدتیپ'],
  ['بد شانس', 'بدشانس'],
  ['بد حال', 'بدحال'],
  ['بد دهن', 'بددهن'],
  ['بد زبان', 'بدزبان'],
  ['بد قدم', 'بدقدم'],
  ['نا خوشایند', 'ناخوشایند'],
  ['نا آشنا', 'ناآشنا'],
  ['نا امید', 'ناامید'],
  ['نا امن', 'ناامن'],
  ['نا برابر', 'نابرابر'],
  ['نا دیده', 'نادیده'],
  ['نا گفته', 'ناگفته'],
  ['نا کرده', 'ناکرده'],
  ['نا تمام', 'ناتمام'],
  ['نا شناس', 'ناشناس'],
  ['نا خوانا', 'ناخوانا'],
  ['نا هماهنگ', 'ناهماهنگ'],
  ['نا عادلانه', 'ناعادلانه'],
  ['نا ممکن', 'ناممکن'],
  ['نا محدود', 'نامحدود'],
  ['نا مرئی', 'نامرئی'],
  ['نا مفهوم', 'نامفهوم'],
  ['نا متعارف', 'نامتعارف'],
  ['با ادب', 'باادب'],
  ['با انصاف', 'باانصاف'],
  ['با وجدان', 'باوجدان'],
  ['با سلیقه', 'باسلیقه'],
  ['با کلاس', 'باکلاس'],
  ['بی کار', 'بیکار'],
  ['بی چاره', 'بیچاره'],
  ['بی نوا', 'بینوا'],
  ['بی کلاس', 'بی‌کلاس'],
  ['به روز', 'به‌روز'],
  ['به هنگام', 'بهنگام'],
  ['به موقع', 'بموقع'],
  ['به تدریج', 'بتدریج'],
  ['به مرور', 'بمرور'],
  ['به زودی', 'به‌زودی'],
  ['به زحمت', 'به‌زحمت'],
  ['به سختی', 'به‌سختی'],
  ['به آسانی', 'به‌آسانی'],
  ['به راحتی', 'به‌راحتی'],
  ['به آرامی', 'به‌آرامی'],
  ['به سرعت', 'به‌سرعت'],
  ['به کندی', 'به‌کندی'],
  ['نا گهان', 'ناگهان'],
  ['هر کس', 'هرکس'],
  ['هر چیز', 'هرچیز'],
  ['هر جا', 'هرجا'],
  ['هر کدام', 'هرکدام'],
  ['هر وقت', 'هروقت'],
  ['هر روز', 'هرروز'],
  ['هر شب', 'هرشب'],
  ['هر سال', 'هرسال'],
  ['هر ماه', 'هرماه'],
  ['هر هفته', 'هرهفته'],
  ['هیچ کس', 'هیچ‌کس'],
  ['هیچ چیز', 'هیچ‌چیز'],
  ['هیچ جا', 'هیچ‌جا'],
  ['هیچ کدام', 'هیچ‌کدام'],
  ['هیچ وقت', 'هیچ‌وقت'],
  ['همین جا', 'همین‌جا'],
  ['همین طور', 'همین‌طور'],
  ['همین وقت', 'همین‌وقت'],
  ['همین الان', 'همین‌الان'],
  ['همین امروز', 'همین‌امروز'],
  ['همان جا', 'همان‌جا'],
  ['همان طور', 'همان‌طور'],
  ['همان وقت', 'همان‌وقت'],
  ['آن جا', 'آنجا'],
  ['این جا', 'اینجا'],
  ['آن وقت', 'آنوقت'],
  ['آن روز', 'آنروز'],
  ['این روزها', 'این‌روزها'],
  ['آن روزها', 'آن‌روزها'],
  ['زیر نویس', 'زیرنویس'],
  ['زیر زمین', 'زیرزمین'],
  ['زیر مجموعه', 'زیرمجموعه'],
  ['رو نویس', 'رونویس'],
  ['گل فروش', 'گل‌فروش'],
  ['گل خانه', 'گلخانه'],
  ['ماهی تابه', 'ماهیتابه'],
  ['آشپز خانه', 'آشپزخانه'],
  ['اتاق خواب', 'اتاق‌خواب'],
  ['دست شویی', 'دستشویی'],
  ['رخت خواب', 'رختخواب'],
  ['کتاب فروشی', 'کتاب‌فروشی'],
  ['کتاب خوانی', 'کتاب‌خوانی'],
  ['سوء استفاده', 'سوءاستفاده'],
  ['سوء تفاهم', 'سوءتفاهم'],
  ['سوء نیت', 'سوءنیت'],
  ['سوء سابقه', 'سوءسابقه'],
  ['سوء ظن', 'سوءظن'],
  ['حسن نیت', 'حسن‌نیت'],
  ['عکس العمل', 'عکس‌العمل'],
  ['باز خورد', 'بازخورد'],
  ['باز بینی', 'بازبینی'],
  ['باز خوانی', 'بازخوانی'],
  ['پیش کسوت', 'پیشکسوت'],
  ['سنگ تمام', 'سنگ‌تمام'],
  ['جان فشانی', 'جان‌فشانی'],
  ['خون بها', 'خون‌بها'],
  ['شیر بها', 'شیربها'],
  ['چشم روشنی', 'چشم‌روشنی'],
  ['چشم زخم', 'چشم‌زخم'],
  ['روزنامه نگار', 'روزنامه‌نگار']
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
  ['حیات خانه', 'حیاط خانه'],
  ['اطاق', 'اتاق'],
  ['بلیط', 'بلیت'],
  ['ایشالا', 'ان‌شاءالله'],
  ['ایشالله', 'ان‌شاءالله'],
  ['غورباقه', 'قورباغه'],
  ['قورباقه', 'قورباغه'],
  ['عملت', 'املت'],
  ['غیمه', 'قیمه'],
  ['قرمه', 'قورمه'],
  ['ازر', 'عذر'],
  ['معزرت', 'معذرت'],
  ['زهن', 'ذهن'],
  ['لزت', 'لذت'],
  ['لذیز', 'لذیذ'],
  ['لطفا', 'لطفاً'],
  ['مثلا', 'مثلاً'],
  ['تقریبا', 'تقریباً'],
  ['معمولا', 'معمولاً'],
  ['حتما', 'حتماً'],
  ['اصلا', 'اصلاً'],
  ['فعلا', 'فعلاً'],
  ['اتفاقا', 'اتفاقاً'],
  ['مخصوصا', 'مخصوصاً'],
  ['خصوصا', 'خصوصاً'],
  ['قاعدتا', 'قاعدتاً'],
  ['نسبتا', 'نسبتاً'],
  ['کاملا', 'کاملاً'],
  ['دقیقا', 'دقیقاً'],
  ['سریعا', 'سریعاً'],
  ['فورا', 'فوراً'],
  ['اخیرا', 'اخیراً'],
  ['قویا', 'قویاً'],
  ['مکررا', 'مکرراً'],
  ['صریحا', 'صریحاً'],
  ['شخصا', 'شخصاً'],
  ['ضمنا', 'ضمناً'],
  ['واقعا', 'واقعاً'],
  ['راس', 'رأس'],
  ['راسا', 'رأساً'],
  ['مبدا', 'مبدأ'],
  ['منشا', 'منشأ'],
  ['انشاء', 'انشا'],
  ['امضاء', 'امضا'],
  ['اعضاء', 'اعضا'],
  ['اشیاء', 'اشیا'],
  ['اولیاء', 'اولیا'],
  ['انبیاء', 'انبیا'],
  ['اشالا', 'ان‌شاءالله'],
  ['حول شدم', 'هول شدم'],
  ['حول شد', 'هول شد'],
  ['حول شده', 'هول شده'],
  ['هول محور', 'حول محور'],
  ['حل دادن', 'هل دادن'],
  ['حل داد', 'هل داد'],
  ['غریب الوقوع', 'قریب‌الوقوع'],
  ['سفر هفت سین', 'سفره هفت‌سین'],
  ['سفره هفت سین', 'سفره هفت‌سین'],
  ['این که', 'اینکه'],
  ['آن که', 'آنکه']
];

// ریشه‌های اشتباهِ بدون ابهام (جایگزینی زیررشته‌ای، جمع‌ها را هم پوشش می‌دهد)
// نمازگذار -> نمازگزار (گزاردن = انجام دادن)، بنیان/قانون + گزار -> گذار (گذاشتن)
const PTF_STEM_FIXES = [
  ['نمازگذار', 'نمازگزار'],
  ['بنیانگزار', 'بنیانگذار'],
  ['قانونگزار', 'قانونگذار'],
  ['خدمتگذار', 'خدمتگزار'],
  ['خوابگذار', 'خوابگزار'],
  ['سپاسگذار', 'سپاسگزار'],
  ['شکرگذار', 'شکرگزار']
];

// ریشه‌های همزه‌ای بدون ابهام (زیررشته‌ای — صرف‌ها را هم می‌گیرد: تاثیرات، متاسفم...)
const PTF_SUB_FIXES = [
  ['تاثیر', 'تأثیر'],
  ['تاسیس', 'تأسیس'],
  ['تاخیر', 'تأخیر'],
  ['مایوس', 'مأیوس'],
  ['متاسف', 'متأسف'],
  ['تاسف', 'تأسف'],
  ['قرمه', 'قورمه'],
  ['رویا', 'رؤیا'],
  ['رویت', 'رؤیت'],
  ['سوال', 'سؤال']
];

// کلمات چسبیده اشتباه (مرز کلمه فارسی)
const PTF_ATTACHED_FIXES = [
  ['همینطور', 'همین‌طور'],
  ['همونطور', 'همون‌طور'],
  ['درمورد', 'در مورد'],
  ['بخاطر', 'به‌خاطر']
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
  const zarRe = new RegExp(FA_PRE + '((ن)?می\\u200C?زار(م|ی|ه|یم|ید|ن)?)' + FA_END_STRICT, 'g');
  while ((m = zarRe.exec(text)) !== null) {
    const word = m[2];
    push('zar', word, '«' + word + '» یعنی «زار زدن» (گریه و زاری). اگر منظورتان «گذاشتن» است، درست آن «می‌گذارم» (رسمی) یا «می‌ذارم» (محاوره‌ای) است.');
  }
  // ۲) بزار...: امر گذاشتن «بذار/بگذار» است نه «بزار»
  const bzarRe = new RegExp(FA_PRE + '(بزار(م|ی|ه|یم|ید|ن)?)' + FA_END_STRICT, 'g');
  while ((m = bzarRe.exec(text)) !== null) {
    const word = m[2];
    const suggest = word.replace('بزار', 'بذار');
    push('bzar', word, '«' + word + '» برای «گذاشتن» درست نیست؛ شکل محاوره‌ای آن «' + suggest + '» (رسمی: بگذار) است.');
  }
  // ۳) می‌گزارم: گزاردن یعنی انجام دادن (مگر کنار نماز/خدمت/خواب...)
  const gozarRe = new RegExp(FA_PRE + '((ن)?می\\u200C?گزار(م|ی|ه|یم|ید|ن)?)' + FA_END_STRICT, 'g');
  while ((m = gozarRe.exec(text)) !== null) {
    const word = m[2];
    const before = text.slice(Math.max(0, m.index - 16), m.index);
    if (PTF_NOTICE_GOTO_SUPPRESS.some(w => before.includes(w))) continue;
    push('gozar', word, '«' + word + '» از «گزاردن» است یعنی انجام دادن (مانند نماز گزاردن). اگر منظورتان «گذاشتن» است، بنویسید «می‌گذارم» یا «می‌ذارم».');
  }
  // ۴) می‌خاست/خاست: خاستن (برخاستن) با خواستن (میل) فرق دارد — «برخاست» قاطی نمی‌شود چون مرز می‌خواهد
  const khastRe = new RegExp(FA_PRE + '((ن)?می\\u200C?خاست(م|ی|ه|یم|ید|ن)?|خاست(ه|ی|یم|ید|ن|گاری?)?)' + FA_END_STRICT, 'g');
  while ((m = khastRe.exec(text)) !== null) {
    const word = m[2];
    push('khast', word, '«' + word + '»؟ «خاستن» (بدون واو) یعنی برخاستن؛ اگر منظورتان «خواستن» (میل و اراده) است با «واو» بنویسید: «می‌خواست».');
  }
  // ۵) حیات تنها: یعنی زندگی — اگر محوطه خانه است، حیاط است. مثل بزار/بذار همیشه سؤال کن
  const hayatRe = new RegExp(FA_PRE + '(حیات)' + FA_END_STRICT, 'g');
  while ((m = hayatRe.exec(text)) !== null) {
    const word = m[2];
    push('hayat', word, '«حیات» یعنی زندگی؛ اگر منظورتان محوطه خانه است درست آن «حیاط» است — مطمئنی منظورت همینه؟');
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
  // تنوین روی الف (اً مثل لطفاً/مثلاً) درست است — حفظش کن
  return t.replace(/اً/g, '\uE011').replace(/[\u064B-\u065F\u0670]/g, '').replace(/\uE011/g, 'اً');
}

function ptfFixKashida(t) {
  return t.replace(/\u0640+/g, '');
}

function ptfFixArabicDigits(t) {
  const map = {'\u0660':'\u06F0','\u0661':'\u06F1','\u0662':'\u06F2','\u0663':'\u06F3','\u0664':'\u06F4','\u0665':'\u06F5','\u0666':'\u06F6','\u0667':'\u06F7','\u0668':'\u06F8','\u0669':'\u06F9'};
  return t.replace(/[\u0660-\u0669]/g, ch => map[ch] || ch);
}

function ptfNormalizeZWNJSpaces(t) {
  // فقط فاصله/تب (نه خط جدید — نیم‌فاصله نباید دو خط را بچسباند)
  let out = t.replace(/[ \t\r]*\u200C[ \t\r]*/g, '\u200C');
  out = out.replace(/\u200C{2,}/g, '\u200C');
  return out;
}

function ptfFixZWNJ(t) {
  let out = t;
  // مرز فارسی: بعدش حرف فارسی/نیم‌فاصله نباشد (FA_END_STRICT سراسری — بدون علائم ، ؛ ؟)
  const END = FA_END_STRICT;
  // پیشوند می/نمی/بی با فاصله -> نیم‌فاصله (حین تایپ هم امن است)
  out = out.replace(new RegExp(FA_PRE + '(می)\\s+', 'g'), '$1می\u200C');
  out = out.replace(new RegExp(FA_PRE + '(نمی)\\s+', 'g'), '$1نمی\u200C');
  out = out.replace(new RegExp(FA_PRE + '(بی)\\s+', 'g'), '$1بی\u200C');
  // پایه «ه/ۀ» + ضمیر/ای -> نیم‌فاصله: خانه ام -> خانه‌ام
  out = out.replace(new RegExp('([' + FA_L + ']+[هۀ])\\s+(ام|ات|اش|مان|تان|شان|ای|ایم|اید|اند|یی|یم|یت|یش)' + END, 'g'), '$1\u200C$2');
  out = out.replace(new RegExp('([' + FA_L + ']+[هۀ])\\s+ی(\\s|$|[.,،:؛!؟?;…\\)\\]\\s])', 'g'), '$1\u200Cی$2');
  // پایه غیر «ه» + ضمیر -> چسبیده: کتاب ام -> کتابم (الف می‌افتد)، کتاب مان -> کتابمان
  // (شامل معادل‌های عربی برای متن نرمال‌نشده: ك ي ة أإؤ)
  out = out.replace(new RegExp('([\\u0621-\\u0627\\u0628\\u067E\\u062A\\u062B\\u062C\\u0686\\u062D\\u062E\\u062F\\u0630\\u0631\\u0632\\u0698\\u0633\\u0634\\u0635\\u0636\\u0637\\u0638\\u0639\\u063A\\u0641\\u0642\\u0643\\u06A9\\u0644\\u0645\\u0646\\u0648\\u0649\\u064A\\u06CC\\u0624\\u0629])\\s+(ام|ات|اش|مان|تان|شان)' + END, 'g'), (m, base, suf) => {
    if (suf === 'ام') return base + 'م';
    if (suf === 'ات') return base + 'ت';
    if (suf === 'اش') return base + 'ش';
    return base + suf;
  });
  // به/کم/بیش + تر با فاصله -> چسبیده: به تر -> بهتر (نه به‌تر)
  out = out.replace(new RegExp(FA_PRE + '(به|کم|بیش)\\s+(ترین|تری|تر)' + END, 'g'), '$1$2$3');
  // پسوند ها/تر با فاصله -> نیم‌فاصله
  out = out.replace(new RegExp('([' + FA_L + '])\\s+(هایمان|هایتان|هایشان|هایم|هایت|هایش|هایی|های|ها|ترین|تری|تر)' + END, 'g'), '$1\u200C$2');
  // می/نمی چسبیده بدون فاصله: میخواستم -> می‌خواستم
  out = ptfFixAttachedMi(out);
  return out;
}

// فقط قاعده می/نمی چسبیده (برای کلمه باز — بدون قوانین فاصله‌دار)
function ptfFixAttachedMi(t) {
  let out = t;
  out = out.replace(new RegExp(FA_PRE + 'می([' + FA_L + ']{2,})' + FA_END_STRICT, 'g'), (m, pre, rest) => {
    const full = 'می' + rest;
    if (MI_ATTACHED_EXCEPTIONS.has(full)) return m;
    return pre + 'می\u200C' + rest;
  });
  out = out.replace(new RegExp(FA_PRE + 'نمی([' + FA_L + ']{2,})' + FA_END_STRICT, 'g'), (m, pre, rest) => {
    const full = 'نمی' + rest;
    if (NEMI_ATTACHED_EXCEPTIONS.has(full)) return m;
    return pre + 'نمی\u200C' + rest;
  });
  return out;
}

function ptfFixAttachedHa(t) {
  // کتابها -> کتاب‌ها (با استثنا تنها/رها/شما/همه)
  const AFTER = '([\\s.,،:؛!؟?;…\\)\\]\\["\'»\\u200C]|$)';
  const re1 = new RegExp('([' + FA_L + ']{1,30}?)ها' + AFTER, 'g');
  const re2 = new RegExp('([' + FA_L + ']{2,30}?)های' + AFTER, 'g');
  const re3 = new RegExp('([' + FA_L + ']{2,30}?)هایی' + AFTER, 'g');
  return t
    .replace(re1, (m, base, after) => {
      const full = base + 'ها';
      if (ATTACHED_HA_EXCEPTIONS.has(full)) return m;
      if (full === 'شما' || full === 'همه' || full === 'بها') return m;
      // «هاها» (خنده) و امثال آن پسوند جمع نیست
      if (base.endsWith('ها')) return m;
      // تک‌حرف + ها (مثل «به‌ها»؟) را دست نزن مگر آن/این
      if (base.length < 2 && full !== 'آنها' && full !== 'اینها') return m;
      return base + '\u200Cها' + after;
    })
    .replace(re2, (m, base, after) => {
      const full = base + 'های';
      if (ATTACHED_HA_EXCEPTIONS.has(full) || full === 'تنهای' || full === 'رهای' || full === 'شهای') return m;
      if (base.endsWith('های')) return m;
      return base + '\u200Cهای' + after;
    })
    .replace(re3, (m, base, after) => {
      const full = base + 'هایی';
      if (full === 'تنهایی' || full === 'رهایی') return m;
      if (base.endsWith('هایی')) return m;
      return base + '\u200Cهایی' + after;
    });
}

function ptfEscapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const FA_AFTER = '(?=[\\s\\u200C.,،:؛!؟?;…\\)\\]\\["\'»]|$)';

function ptfFixCompounds(t) {
  let out = t;
  for (const [wrong, correct] of PTF_COMPOUNDS) {
    // جایگزینی با مرز کلمه فارسی (فاصله/شروع/نقطه‌گذاری/نیم‌فاصله)
    const re = new RegExp(FA_PRE + '' + ptfEscapeRegExp(wrong) + FA_AFTER, 'g');
    out = out.replace(re, '$1' + correct);
  }
  return out;
}

function ptfFixCommonTypos(t) {
  let out = t;
  for (const [wrong, correct] of PTF_COMMON_TYPOS) {
    const re = new RegExp(FA_PRE + '' + ptfEscapeRegExp(wrong) + FA_AFTER, 'g');
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

function ptfFixSubs(t) {
  let out = t;
  for (const [wrong, correct] of PTF_SUB_FIXES) {
    out = out.split(wrong).join(correct);
  }
  return out;
}

// دیکشنری شخصی کاربر — بالاترین اولویت، هر جفت فقط یک‌بار به ترتیب لیست
function ptfNormCustomFrom(s) {
  return ptfFixArabicAlef(ptfFixArabicYK(String(s || '')));
}
function ptfFixCustomWords(t, customs) {
  if (!Array.isArray(customs) || customs.length === 0) return t;
  let out = t;
  const list = customs.slice(0, 200);
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    if (item.on === false) continue;
    let from = String(item.from || '').trim();
    let to = String(item.to || '').trim();
    if (!from || !to || from.length > 60 || to.length > 60) continue;
    from = ptfNormCustomFrom(from);
    if (!from || from === to) continue;
    try {
      const re = new RegExp(FA_PRE + '' + ptfEscapeRegExp(from) + FA_AFTER, 'g');
      out = out.replace(re, '$1' + to.replace(/\$/g, '$$$$'));
    } catch(e) {}
  }
  return out;
}

function ptfFixAttachedWords(t) {
  let out = t;
  for (const [wrong, correct] of PTF_ATTACHED_FIXES) {
    const re = new RegExp(FA_PRE + '' + ptfEscapeRegExp(wrong) + FA_AFTER, 'g');
    out = out.replace(re, '$1' + correct);
  }
  return out;
}

const FA_DIGITS = '\\u06F0-\\u06F9\\u0660-\\u0669';
const ALL_DIGITS = '0-9' + FA_DIGITS;

function ptfFixPunctuationSpacing(t) {
  let out = t;
  out = out.replace(/\s+([.,،:؛!؟?;…\)\]])/g, '$1');
  out = out.replace(/([\(\[])\s+/g, '$1');
  // فاصله بعد از نقطه‌گذاری، به‌جز بین ارقام، علائم پشت سر هم،
  // و داخل توکن لاتین (دامنه، ورژن، فایل: example.com) — انگلیسی دست نمی‌خورد
  out = out.replace(new RegExp('([.,،:؛!؟?;…])([^\\s' + ALL_DIGITS + '.,،:؛!؟?;…])', 'g'), (m, p1, p2, off, str) => {
    const prev = str[off - 1] || '';
    if (/[A-Za-z0-9]/.test(prev) && /[A-Za-z0-9]/.test(p2)) return m;
    return p1 + ' ' + p2;
  });
  return out;
}

function ptfFixPersianPunct(t) {
  let out = t;
  out = out.replace(/\.{3,}/g, '…');
  const L = '[' + FA_L + '\\u200C]';
  // فاصله قبل از ,؛? را اول بچسبان تا تبدیل همان پاس انجام شود («د ،» -> «د،»)
  out = out.replace(new RegExp('(' + L + ')\\s+([,;?])', 'g'), '$1$2');
  // ویرگول لاتینِ چسبیده به فارسی (یا زنجیره ویرگول) -> ، ؛ مگر بین دو رقم
  const DIG = '[0-9\\u06F0-\\u06F9\\u0660-\\u0669]';
  out = out.replace(new RegExp('(?<=' + L + '|،),+|,+(?=' + L + '|،)', 'g'), (m, off, str) => {
    const before = str[off - 1] || '';
    const after = str[off + m.length] || '';
    const isDig = (ch) => /[0-9\u06F0-\u06F9\u0660-\u0669]/.test(ch || '');
    if (m === ',' && isDig(before) && isDig(after)) return m;
    return '،'.repeat(m.length);
  });
  // ; و ? تکراریِ چسبیده به فارسی (یا به هم‌خانواده خودشان) -> ؛ ؟
  out = out.replace(new RegExp('(?<=' + L + '|؛);+|;+(?=' + L + '|؛)', 'g'), (m) => '؛'.repeat(m.length));
  out = out.replace(new RegExp('(?<=' + L + '|؟)\\?+|\\?+(?=' + L + '|؟)', 'g'), (m) => '؟'.repeat(m.length));
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

  // محافظت از URL/ایمیل/دامنه (حتی بدون پروتکل مثل example.com)
  const placeholders = [];
  const bareDomain = '(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\\.)+[A-Za-z]{2,}(?::\\d{1,5})?(?:\\/[^\\s<>"\']*)?';
  const urlRe = new RegExp('https?:\\/\\/[^\\s<>"\']+|www\\.[^\\s<>"\']+|[\\w.+-]+@[\\w-]+\\.[\\w.]+|' + bareDomain, 'g');
  let out = text.replace(urlRe, (m) => {
    placeholders.push(m);
    return '\uE000' + ptfIdxToLetters(placeholders.length - 1) + '\uE001';
  });

  out = ptfFixChars(out, opts);
  out = ptfFixWords(out, opts);

  // بازگردانی URLها
  out = out.replace(/\uE000([A-Z]+)\uE001/g, (m, letters) => {
    let idx = 0;
    for (const ch of letters) idx = idx * 26 + (ch.charCodeAt(0) - 64);
    idx = idx - 1;
    return placeholders[idx] !== undefined ? placeholders[idx] : m;
  });

  return out;
}

// --- تفکیک امن برای حین تایپ ---
// فاز حروف: جایگزینی تک‌حرفی 1:1، همیشه و همه‌جا امن (کرسر جابه‌جا نمی‌شود)
function ptfFixChars(t, opts) {
  let out = t;
  if (opts.fixArabicYK) out = ptfFixArabicYK(out);
  if (opts.fixArabicAlef) out = ptfFixArabicAlef(out);
  if (opts.fixArabicDigits) out = ptfFixArabicDigits(out);
  if (opts.fixLatinDigits) out = ptfFixLatinDigits(out);
  return out;
}

// فاز کلمات: ادغام/حذف/فاصله‌گذاری — فقط روی متن تمام‌شده امن است
function ptfFixWords(t, opts) {
  let out = t;
  if (opts.fixKashida) out = ptfFixKashida(out);
  if (opts.fixTashkeel) out = ptfFixTashkeel(out);
  out = ptfNormalizeZWNJSpaces(out);
  // دیکشنری شخصی اول — حرف کاربر بر داخلی‌ها مقدم است
  out = ptfFixCustomWords(out, opts.customWords);
  if (opts.fixZWNJ) out = ptfFixZWNJ(out);
  if (opts.fixCompounds) out = ptfFixCompounds(out);
  if (opts.fixZWNJ) out = ptfFixZWNJ(out); // دومین پاس برای ترکیبات جدید
  if (opts.fixAttachedHa) out = ptfFixAttachedHa(out);
  if (opts.fixCommonTypos) out = ptfFixCommonTypos(out);
  if (opts.fixCommonTypos) out = ptfFixSubs(out);
  if (opts.fixCompounds) out = ptfFixStems(out);
  if (opts.fixCompounds) out = ptfFixAttachedWords(out);
  if (opts.fixZWNJ) out = ptfFixZWNJ(out); // سومین پاس برای کلمات جدید
  if (opts.fixSeparators) out = ptfFixSeparators(out);
  // اول علائم لاتین به فارسی، بعد فاصله‌گذاری — تا ؟ تازه‌ساخته هم فاصله بگیرد
  if (opts.fixPersianPunct) out = ptfFixPersianPunct(out);
  if (opts.fixPunctuation) out = ptfFixPunctuationSpacing(out);
  if (opts.fixDoubleSpace) out = ptfFixDoubleSpace(out);
  if (opts.fixPunctuation && opts.fixDoubleSpace) out = out.replace(/ {2,}/g, ' ');
  if (opts.fixRepeat) out = ptfFixRepeat(out);
  if (opts.fixQuotes) out = ptfFixQuotes(out);
  return out;
}

// متن قبل از کرسر را به (بخش تمام‌شده + کلمه بازِ در حال تایپ) تقسیم کن
function ptfSplitStable(before) {
  const m = before.match(/^([\s\S]*[\s.,،:؛!؟?;…)\]"'»\n])([^]*)$/);
  // کلمه باز فقط حروف است (بدون فاصله/نقطه‌گذاری) — وگرنه همه بسته است
  if (m && new RegExp('^[' + FA_L + '\\u200C]*$').test(m[2])) return { closed: m[1], open: m[2] };
  if (new RegExp('^[' + FA_L + '\\u200C]*$').test(before)) return { closed: '', open: before };
  return { closed: before, open: '' };
}

// فاز کلمات روی «کلمه باز»: فقط قوانین تک‌کلمه‌ای امن
// (قوانین فاصله‌دار خودکار no-op می‌شوند چون فاصله‌ای نیست؛ می چسبیده فقط
// اگر با خانواده استثنا قاطی نشود — مثلا «مید» ممکن است «میدان» شود)
function ptfFixOpenWord(open, opts) {
  if (!open) return open;
  let out = open;
  // دیکشنری شخصی اول — حرف کاربر بر داخلی‌ها مقدم است
  out = ptfFixCustomWords(out, opts.customWords);
  if (opts.fixZWNJ && !ptfHitsSet(out, MI_ATTACHED_EXCEPTIONS) && !ptfHitsSet(out, NEMI_ATTACHED_EXCEPTIONS)) {
    out = ptfFixAttachedMi(out);
  }
  if (opts.fixTashkeel) out = ptfFixTashkeel(out);
  if (opts.fixKashida) out = ptfFixKashida(out);
  if (opts.fixAttachedHa) out = ptfFixAttachedHa(out);
  if (opts.fixCompounds) { out = ptfFixCompounds(out); out = ptfFixStems(out); out = ptfFixAttachedWords(out); }
  if (opts.fixCommonTypos) out = ptfFixCommonTypos(out);
  if (opts.fixRepeat) out = ptfFixRepeat(out);
  return out;
}

// اصلاح مخصوص حین تایپ: فاز حروف روی کل متن + فاز کلمات روی بخش تمام‌شده
// + قوانین تک‌کلمه‌ای امن روی کلمه باز — خروجی: {text, cursor} دقیق و بدون حدس
function ptfFixTypingValue(value, cursor, opts) {
  opts = opts || PTF_DEFAULTS;
  if (!value || typeof value !== 'string') return { text: value, cursor };
  const mapped = ptfFixChars(value, opts); // 1:1 پس کرسر عددی سر جایش می‌ماند
  const c = Math.max(0, Math.min(cursor == null ? mapped.length : cursor, mapped.length));
  const before = mapped.slice(0, c);
  const after = mapped.slice(c);
  const parts = ptfSplitStable(before);
  const fixedClosed = ptfFixWords(parts.closed, opts);
  const fixedOpen = ptfFixOpenWord(parts.open, opts);
  return { text: fixedClosed + fixedOpen + after, cursor: fixedClosed.length + fixedOpen.length };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PTF_DEFAULTS, ptfFixText, ptfFindNotices, ptfFixChars, ptfFixWords, ptfSplitStable, ptfFixOpenWord, ptfFixTypingValue, ptfFixCustomWords, ptfHitsSet };
}
