import type { Product, StoreSettings } from './types';
import { ViewMode, OrderStatus } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod1',
    name: 'تي شيرت أنيق',
    description: 'تي شيرت قطني مريح بتصميم عصري وجذاب، مناسب لجميع الأوقات.',
    price: 2500,
    category: 'ملابس',
    images: [
      'https://picsum.photos/id/1025/600/600',
      'https://picsum.photos/id/1062/600/600',
      'https://picsum.photos/id/237/600/600'
    ],
    options: [
      { id: 'opt1', name: 'الحجم', values: ['S', 'M', 'L', 'XL'] },
      { id: 'opt2', name: 'اللون', values: ['أسود', 'أبيض', 'أزرق'] }
    ],
    rating: { average: 4.5, count: 120 }
  },
  {
    id: 'prod2',
    name: 'حذاء رياضي',
    description: 'حذاء رياضي خفيف الوزن ومناسب للجري والتمارين الرياضية.',
    price: 4800,
    category: 'أحذية',
    images: ['https://picsum.photos/id/21/600/600', 'https://picsum.photos/id/1074/600/600'],
    options: [
      { id: 'opt1', name: 'الحجم', values: ['40', '41', '42', '43'] },
      { id: 'opt2', name: 'اللون', values: ['رمادي', 'أحمر'] }
    ],
    rating: { average: 4.8, count: 85 }
  },
  {
    id: 'prod3',
    name: 'ساعة يد ذكية',
    description: 'ساعة ذكية متطورة مع ميزات تتبع اللياقة البدنية والإشعارات.',
    price: 12000,
    category: 'إلكترونيات',
    images: ['https://picsum.photos/id/175/600/600', 'https://picsum.photos/id/180/600/600'],
    options: [],
    rating: { average: 4.2, count: 45 }
  }
];

export const ALGERIA_DATA: { wilaya_name_ar: string; baladiyats: { baladiya_name_ar: string }[] }[] = [
    { wilaya_name_ar: "أدرار", baladiyats: [ { baladiya_name_ar: "أدرار" }, { baladiya_name_ar: "أوقروت" }, { baladiya_name_ar: "أولف" }, { baladiya_name_ar: "برج باجي مختار" }, { baladiya_name_ar: "بودة" }, { baladiya_name_ar: "شروين" }, { baladiya_name_ar: "دلدول" }, { baladiya_name_ar: "فنوغيل" }, { baladiya_name_ar: "إن زغمير" }, { baladiya_name_ar: "قصر قدور" }, { baladiya_name_ar: "رقان" }, { baladiya_name_ar: "السبع" }, { baladiya_name_ar: "تامنطيط" }, { baladiya_name_ar: "تيمياوين" }, { baladiya_name_ar: "تيميمون" }, { baladiya_name_ar: "تنركوك" }, { baladiya_name_ar: "تسابيت" }, { baladiya_name_ar: "زاوية كونتة" } ] },
    { wilaya_name_ar: "الشلف", baladiyats: [ { baladiya_name_ar: "أبو الحسن" }, { baladiya_name_ar: "عين مران" }, { baladiya_name_ar: "بني حواء" }, { baladiya_name_ar: "بني راشد" }, { baladiya_name_ar: "بوقادير" }, { baladiya_name_ar: "بوزغاية" }, { baladiya_name_ar: "بريرة" }, { baladiya_name_ar: "الشلف" }, { baladiya_name_ar: "الشطية" }, { baladiya_name_ar: "الظهرة" }, { baladiya_name_ar: "الكريمية" }, { baladiya_name_ar: "المرسى" }, { baladiya_name_ar: "أولاد عباس" }, { baladiya_name_ar: "أولاد بن عبد القادر" }, { baladiya_name_ar: "أولاد فارس" }, { baladiya_name_ar: "أم الدروع" }, { baladiya_name_ar: "وادي الفضة" }, { baladiya_name_ar: "وادي سلي" }, { baladiya_name_ar: "سيدي عبد الرحمن" }, { baladiya_name_ar: "سيدي عكاشة" }, { baladiya_name_ar: "تاجنة" }, { baladiya_name_ar: "تلعصة" }, { baladiya_name_ar: "تنس" }, { baladiya_name_ar: "الزبوچة" } ] },
    { wilaya_name_ar: "الأغواط", baladiyats: [ { baladiya_name_ar: "آفلو" }, { baladiya_name_ar: "عين ماضي" }, { baladiya_name_ar: "عين سيدي علي" }, { baladiya_name_ar: "البيضاء" }, { baladiya_name_ar: "بريدة" }, { baladiya_name_ar: "الغيشة" }, { baladiya_name_ar: "الحويطة" }, { baladiya_name_ar: "قلتة سيدي سعد" }, { baladiya_name_ar: "قصر الحيران" }, { baladiya_name_ar: "الأغواط" }, { baladiya_name_ar: "وادي مرة" }, { baladiya_name_ar: "وادي مزي" }, { baladiya_name_ar: "سبقاق" }, { baladiya_name_ar: "سيدي بوزيد" }, { baladiya_name_ar: "تاجموت" }, { baladiya_name_ar: "تاجرونة" }, { baladiya_name_ar: "تاويالة" } ] },
    { wilaya_name_ar: "أم البواقي", baladiyats: [ { baladiya_name_ar: "عين البيضاء" }, { baladiya_name_ar: "عين الديس" }, { baladiya_name_ar: "عين فكرون" }, { baladiya_name_ar: "عين كرشة" }, { baladiya_name_ar: "عين مليلة" }, { baladiya_name_ar: "عين الزيتون" }, { baladiya_name_ar: "بحير الشرقي" }, { baladiya_name_ar: "بريش" }, { baladiya_name_ar: "الضلعة" }, { baladiya_name_ar: "الفجوج بوغرارة سعودي" }, { baladiya_name_ar: "الحرملية" }, { baladiya_name_ar: "قصر الصباحي" }, { baladiya_name_ar: "مسكيانة" }, { baladiya_name_ar: "أم البواقي" }, { baladiya_name_ar: "أولاد قاسم" }, { baladiya_name_ar: "سيقوس" }, { baladiya_name_ar: "سوق نعمان" } ] },
    { wilaya_name_ar: "باتنة", baladiyats: [ { baladiya_name_ar: "عين جاسر" }, { baladiya_name_ar: "عين التوتة" }, { baladiya_name_ar: "عين ياقوت" }, { baladiya_name_ar: "أريس" }, { baladiya_name_ar: "بريكة" }, { baladiya_name_ar: "باتنة" }, { baladiya_name_ar: "بوزينة" }, { baladiya_name_ar: "الشمرة" }, { baladiya_name_ar: "الجزّار" }, { baladiya_name_ar: "فسديس" }, { baladiya_name_ar: "إشمول" }, { baladiya_name_ar: "المعذر" }, { baladiya_name_ar: "منعة" }, { baladiya_name_ar: "مروانة" }, { baladiya_name_ar: "نقاوس" }, { baladiya_name_ar: "أولاد سي سليمان" }, { baladiya_name_ar: "رأس العيون" }, { baladiya_name_ar: "سفيان" }, { baladiya_name_ar: "سريانة" }, { baladiya_name_ar: "تازولت" }, { baladiya_name_ar: "ثنية العابد" }, { baladiya_name_ar: "تيمقاد" } ] },
    { wilaya_name_ar: "بجاية", baladiyats: [ { baladiya_name_ar: "أدكار" }, { baladiya_name_ar: "أقبو" }, { baladiya_name_ar: "أميزور" }, { baladiya_name_ar: "أوقاس" }, { baladiya_name_ar: "برباشة" }, { baladiya_name_ar: "بجاية" }, { baladiya_name_ar: "بني معوش" }, { baladiya_name_ar: "شميني" }, { baladiya_name_ar: "درقينة" }, { baladiya_name_ar: "القصر" }, { baladiya_name_ar: "إغيل علي" }, { baladiya_name_ar: "خراطة" }, { baladiya_name_ar: "صدوق" }, { baladiya_name_ar: "سيدي عيش" }, { baladiya_name_ar: " سوق الاثنين" }, { baladiya_name_ar: "تازمالت" }, { baladiya_name_ar: "تيشي" }, { baladiya_name_ar: "تيمزريت" } ] },
    { wilaya_name_ar: "بسكرة", baladiyats: [ { baladiya_name_ar: "بسكرة" }, { baladiya_name_ar: "البرانيس" }, { baladiya_name_ar: "الفيض" }, { baladiya_name_ar: "الغنثرة" }, { baladiya_name_ar: "الحاجب" }, { baladiya_name_ar: "جمورة" }, { baladiya_name_ar: "القنطرة" }, { baladiya_name_ar: "لوطاية" }, { baladiya_name_ar: "مشونش" }, { baladiya_name_ar: "أولاد جلال" }, { baladiya_name_ar: "أورلال" }, { baladiya_name_ar: "سيدي عقبة" }, { baladiya_name_ar: "سيدي خالد" }, { baladiya_name_ar: "طولقة" }, { baladiya_name_ar: "زريبة الوادي" } ] },
    { wilaya_name_ar: "بشار", baladiyats: [ { baladiya_name_ar: "بني عباس" }, { baladiya_name_ar: "بني ونيف" }, { baladiya_name_ar: "بشار" }, { baladiya_name_ar: "العبادلة" }, { baladiya_name_ar: "عرق فراج" }, { baladiya_name_ar: "إقلي" }, { baladiya_name_ar: "كرزاز" }, { baladiya_name_ar: "القنادسة" }, { baladiya_name_ar: "الأحمر" }, { baladiya_name_ar: "أولاد خضير" }, { baladiya_name_ar: "تاغيت" }, { baladiya_name_ar: "تبلبالة" } ] },
    { wilaya_name_ar: "البليدة", baladiyats: [ { baladiya_name_ar: "عين الرمانة" }, { baladiya_name_ar: "بني مراد" }, { baladiya_name_ar: "بني تامو" }, { baladiya_name_ar: "البليدة" }, { baladiya_name_ar: "بوعرفة" }, { baladiya_name_ar: "بوڨرة" }, { baladiya_name_ar: "بوفاريك" }, { baladiya_name_ar: "بوينان" }, { baladiya_name_ar: "شفة" }, { baladiya_name_ar: "الشفعة" }, { baladiya_name_ar: "العبادية" }, { baladiya_name_ar: "العفرون" }, { baladiya_name_ar: "قرواو" }, { baladiya_name_ar: "حمام ملوان" }, { baladiya_name_ar: "الأربعاء" }, { baladiya_name_ar: "مفتاح" }, { baladiya_name_ar: "موزاية" }, { baladiya_name_ar: "أولاد عيش" }, { baladiya_name_ar: "أولاد يعيش" }, { baladiya_name_ar: "وادي العلايق" }, { baladiya_name_ar: "صوحان" }, { baladiya_name_ar: "الصومعة" } ] },
    { wilaya_name_ar: "البويرة", baladiyats: [ { baladiya_name_ar: "عين بسام" }, { baladiya_name_ar: "عين الحجر" }, { baladiya_name_ar: "عين الترك" }, { baladiya_name_ar: "أغبالو" }, { baladiya_name_ar: "أهل القصر" }, { baladiya_name_ar: "أيت لعزيز" }, { baladiya_name_ar: "عمر" }, { baladiya_name_ar: "بشلول" }, { baladiya_name_ar: "بئر غبالو" }, { baladiya_name_ar: "برج أوخريص" }, { baladiya_name_ar: "البويرة" }, { baladiya_name_ar: "شرفة" }, { baladiya_name_ar: "ديرة" }, { baladiya_name_ar: "جباحية" }, { baladiya_name_ar: "الهاشمية" }, { baladiya_name_ar: "الحجرة الزرقاء" }, { baladiya_name_ar: "قادرية" }, { baladiya_name_ar: "الأخضرية" }, { baladiya_name_ar: "مشدا الله" }, { baladiya_name_ar: "سور الغزلان" } ] },
    { wilaya_name_ar: "تمنراست", baladiyats: [ { baladiya_name_ar: "أبالسة" }, { baladiya_name_ar: "عين أمڨل" }, { baladiya_name_ar: "عين قزام" }, { baladiya_name_ar: "عين صالح" }, { baladiya_name_ar: "إدلس" }, { baladiya_name_ar: "فقارة الزوى" }, { baladiya_name_ar: "تمنراست" }, { baladiya_name_ar: "تاظروك" }, { baladiya_name_ar: "تين زواتين" } ] },
    { wilaya_name_ar: "تبسة", baladiyats: [ { baladiya_name_ar: "عين الزرقاء" }, { baladiya_name_ar: "العقلة" }, { baladiya_name_ar: "بئر العاتر" }, { baladiya_name_ar: "بئر مقدم" }, { baladiya_name_ar: "الشريعة" }, { baladiya_name_ar: "الماء الأبيض" }, { baladiya_name_ar: "الحويجبة" }, { baladiya_name_ar: "الكويف" }, { baladiya_name_ar: "مرسط" }, { baladiya_name_ar: "نقرين" }, { baladiya_name_ar: "أم علي" }, { baladiya_name_ar: "الونزة" }, { baladiya_name_ar: "سطح قنطيس" }, { baladiya_name_ar: "تبسة" } ] },
    { wilaya_name_ar: "تلمسان", baladiyats: [ { baladiya_name_ar: "عين الكبيرة" }, { baladiya_name_ar: "عين تالوت" }, { baladiya_name_ar: "باب العسة" }, { baladiya_name_ar: "بني بوسعيد" }, { baladiya_name_ar: "بني مستر" }, { baladiya_name_ar: "بني صميل" }, { baladiya_name_ar: "بن سكران" }, { baladiya_name_ar: "شتوان" }, { baladiya_name_ar: "فلاوسن" }, { baladiya_name_ar: "الغزوات" }, { baladiya_name_ar: "الحناية" }, { baladiya_name_ar: "هنين" }, { baladiya_name_ar: "منصورة" }, { baladiya_name_ar: "مرسى بن مهيدي" }, { baladiya_name_ar: "مغنية" }, { baladiya_name_ar: "ندرومة" }, { baladiya_name_ar: "أولاد ميمون" }, { baladiya_name_ar: "الرمشي" }, { baladiya_name_ar: "سبدو" }, { baladiya_name_ar: "سيدي الجيلالي" }, { baladiya_name_ar: "تلمسان" } ] },
    { wilaya_name_ar: "تيارت", baladiyats: [ { baladiya_name_ar: "عين الذهب" }, { baladiya_name_ar: "عين كرمس" }, { baladiya_name_ar: "دحموني" }, { baladiya_name_ar: "فرندة" }, { baladiya_name_ar: "قصر الشلالة" }, { baladiya_name_ar: "المشرع الصفاء" }, { baladiya_name_ar: "مدريسة" }, { baladiya_name_ar: "مغيلة" }, { baladiya_name_ar: "مهدية" }, { baladiya_name_ar: "الرحوية" }, { baladiya_name_ar: "السوقر" }, { baladiya_name_ar: "تخمرت" }, { baladiya_name_ar: "تيارت" } ] },
    { wilaya_name_ar: "تيزي وزو", baladiyats: [ { baladiya_name_ar: "عين الحمام" }, { baladiya_name_ar: "أزفون" }, { baladiya_name_ar: "عزازقة" }, { baladiya_name_ar: "بني دوالة" }, { baladiya_name_ar: "بوغني" }, { baladiya_name_ar: "بوزغن" }, { baladiya_name_ar: "ذراع الميزان" }, { baladiya_name_ar: "ذراع بن خدة" }, { baladiya_name_ar: "الأربعاء نايث إيراثن" }, { baladiya_name_ar: "معاتقة" }, { baladiya_name_ar: "مقلع" }, { baladiya_name_ar: "واقنون" }, { baladiya_name_ar: "واضية" }, { baladiya_name_ar: "تيغزيرت" }, { baladiya_name_ar: "تيزي غنيف" }, { baladiya_name_ar: "تيزي وزو" }, { baladiya_name_ar: "تيزي راشد" } ] },
    { wilaya_name_ar: "الجزائر", baladiyats: [ { baladiya_name_ar: "الجزائر الوسطى" }, { baladiya_name_ar: "باب الوادي" }, { baladiya_name_ar: "باب الزوار" }, { baladiya_name_ar: "بئر مراد رايس" }, { baladiya_name_ar: "بئر توتة" }, { baladiya_name_ar: "براقي" }, { baladiya_name_ar: "برج البحري" }, { baladiya_name_ar: "برج الكيفان" }, { baladiya_name_ar: "بوزريعة" }, { baladiya_name_ar: "الدار البيضاء" }, { baladiya_name_ar: "درارية" }, { baladiya_name_ar: "الحراش" }, { baladiya_name_ar: "حسين داي" }, { baladiya_name_ar: "القبة" }, { baladiya_name_ar: "الرويبة" }, { baladiya_name_ar: "سيدي امحمد" }, { baladiya_name_ar: "زرالدة" } ] },
    { wilaya_name_ar: "الجلفة", baladiyats: [ { baladiya_name_ar: "عين الإبل" }, { baladiya_name_ar: "عين وسارة" }, { baladiya_name_ar: "البيرين" }, { baladiya_name_ar: "الشارف" }, { baladiya_name_ar: "دار الشيوخ" }, { baladiya_name_ar: "الجلفة" }, { baladiya_name_ar: "حد الصحاري" }, { baladiya_name_ar: "حاسي بحبح" }, { baladiya_name_ar: "الإدريسية" }, { baladiya_name_ar: "مسعد" }, { baladiya_name_ar: "سيدي لعجال" } ] },
    { wilaya_name_ar: "جيجل", baladiyats: [ { baladiya_name_ar: "الشقفة" }, { baladiya_name_ar: "العنصر" }, { baladiya_name_ar: "جيجل" }, { baladiya_name_ar: "الميلية" }, { baladiya_name_ar: "السطارة" }, { baladiya_name_ar: "الطاهير" }, { baladiya_name_ar: "تاكسنة" }, { baladiya_name_ar: "زيامة منصورية" } ] },
    { wilaya_name_ar: "سطيف", baladiyats: [ { baladiya_name_ar: "عين أرنات" }, { baladiya_name_ar: "عين أزال" }, { baladiya_name_ar: "عين الكبيرة" }, { baladiya_name_ar: "عين ولمان" }, { baladiya_name_ar: "عموشة" }, { baladiya_name_ar: "بابور" }, { baladiya_name_ar: "بني عزيز" }, { baladiya_name_ar: "بني ورتيلان" }, { baladiya_name_ar: "بئر العرش" }, { baladiya_name_ar: "بوعنداس" }, { baladiya_name_ar: "بوقاعة" }, { baladiya_name_ar: "جميلة" }, { baladiya_name_ar: "العلمة" }, { baladiya_name_ar: "قنزات" }, { baladiya_name_ar: "قجال" }, { baladiya_name_ar: "حمام قرقور" }, { baladiya_name_ar: "حمام السخنة" }, { baladiya_name_ar: "معاوية" }, { baladiya_name_ar: "صالح باي" }, { baladiya_name_ar: "سطيف" } ] },
    { wilaya_name_ar: "سعيدة", baladiyats: [ { baladiya_name_ar: "عين الحجر" }, { baladiya_name_ar: "الحساسنة" }, { baladiya_name_ar: "مولاي العربي" }, { baladiya_name_ar: "أولاد إبراهيم" }, { baladiya_name_ar: "سعيدة" }, { baladiya_name_ar: "سيدي بوبكر" }, { baladiya_name_ar: "يوب" } ] },
    { wilaya_name_ar: "سكيكدة", baladiyats: [ { baladiya_name_ar: "عين قشرة" }, { baladiya_name_ar: "عزابة" }, { baladiya_name_ar: "بن عزوز" }, { baladiya_name_ar: "القل" }, { baladiya_name_ar: "الحروش" }, { baladiya_name_ar: "رمضان جمال" }, { baladiya_name_ar: "سكيكدة" }, { baladiya_name_ar: "صالح بوالشعور" }, { baladiya_name_ar: "تمالوس" }, { baladiya_name_ar: "أم الطوب" }, { baladiya_name_ar: "الزيتونة" } ] },
    { wilaya_name_ar: "سيدي بلعباس", baladiyats: [ { baladiya_name_ar: "عين البرد" }, { baladiya_name_ar: "ابن باديس" }, { baladiya_name_ar: "مرحوم" }, { baladiya_name_ar: "مولاي سليسن" }, { baladiya_name_ar: "رأس الماء" }, { baladiya_name_ar: "سفيزف" }, { baladiya_name_ar: "سيدي بلعباس" }, { baladiya_name_ar: "سيدي علي بوسيدي" }, { baladiya_name_ar: "سيدي لحسن" }, { baladiya_name_ar: "تلاغ" }, { baladiya_name_ar: "تنيرة" }, { baladiya_name_ar: "تسالة" } ] },
    { wilaya_name_ar: "عنابة", baladiyats: [ { baladiya_name_ar: "عنابة" }, { baladiya_name_ar: "برحال" }, { baladiya_name_ar: "البوني" }, { baladiya_name_ar: "الشرفة" }, { baladiya_name_ar: "العلمة" }, { baladiya_name_ar: "الحجار" }, { baladiya_name_ar: "سرايدي" }, { baladiya_name_ar: "سيدي عمار" } ] },
    { wilaya_name_ar: "قالمة", baladiyats: [ { baladiya_name_ar: "عين مخلوف" }, { baladiya_name_ar: "بومهرة أحمد" }, { baladiya_name_ar: "قالمة" }, { baladiya_name_ar: "قلعة بوصبع" }, { baladiya_name_ar: "حمام دباغ" }, { baladiya_name_ar: "حمام النبائل" }, { baladiya_name_ar: "هيليوبوليس" }, { baladiya_name_ar: "وادي الزناتي" } ] },
    { wilaya_name_ar: "قسنطينة", baladiyats: [ { baladiya_name_ar: "عين عبيد" }, { baladiya_name_ar: "عين سمارة" }, { baladiya_name_ar: "قسنطينة" }, { baladiya_name_ar: "ديدوش مراد" }, { baladiya_name_ar: "حامة بوزيان" }, { baladiya_name_ar: "الخروب" }, { baladiya_name_ar: "زيغود يوسف" } ] },
    { wilaya_name_ar: "المدية", baladiyats: [ { baladiya_name_ar: "عين بوسيف" }, { baladiya_name_ar: "عزيز" }, { baladiya_name_ar: "بني سليمان" }, { baladiya_name_ar: "البرواقية" }, { baladiya_name_ar: "شلالة العذاورة" }, { baladiya_name_ar: "القلب الكبير" }, { baladiya_name_ar: "قصر البخاري" }, { baladiya_name_ar: "المدية" }, { baladiya_name_ar: "أوامري" }, { baladiya_name_ar: "سغوان" }, { baladiya_name_ar: "سي المحجوب" }, { baladiya_name_ar: "سيدي نعمان" }, { baladiya_name_ar: "تابلاط" }, { baladiya_name_ar: "وزرة" } ] },
    { wilaya_name_ar: "مستغانم", baladiyats: [ { baladiya_name_ar: "عشعاشة" }, { baladiya_name_ar: "عين نويسي" }, { baladiya_name_ar: "عين تادلس" }, { baladiya_name_ar: "بوقيراط" }, { baladiya_name_ar: "حاسي مماش" }, { baladiya_name_ar: "خير الدين" }, { baladiya_name_ar: "ماسرى" }, { baladiya_name_ar: "مزغران" }, { baladiya_name_ar: "مستغانم" }, { baladiya_name_ar: "سيدي علي" }, { baladiya_name_ar: "سيدي لخضر" }, { baladiya_name_ar: "ستيدية" } ] },
    { wilaya_name_ar: "المسيلة", baladiyats: [ { baladiya_name_ar: "عين الملح" }, { baladiya_name_ar: "بن سرور" }, { baladiya_name_ar: "بوسعادة" }, { baladiya_name_ar: "شلال" }, { baladiya_name_ar: "حمام ضلعة" }, { baladiya_name_ar: "الخبانة" }, { baladiya_name_ar: "مجدل" }, { baladiya_name_ar: "مقرة" }, { baladiya_name_ar: "المسيلة" }, { baladiya_name_ar: "أولاد دراج" }, { baladiya_name_ar: "سيدي عيسى" } ] },
    { wilaya_name_ar: "معسكر", baladiyats: [ { baladiya_name_ar: "عين فارس" }, { baladiya_name_ar: "عين فكان" }, { baladiya_name_ar: "بوحنيفية" }, { baladiya_name_ar: "غريس" }, { baladiya_name_ar: "حسين" }, { baladiya_name_ar: "معسكر" }, { baladiya_name_ar: "المحمدية" }, { baladiya_name_ar: "وادي الأبطال" }, { baladiya_name_ar: "سيق" }, { baladiya_name_ar: "تيغنيف" }, { baladiya_name_ar: "تيزي" }, { baladiya_name_ar: "زهانة" } ] },
    { wilaya_name_ar: "ورقلة", baladiyats: [ { baladiya_name_ar: "عين البيضاء" }, { baladiya_name_ar: "البرمة" }, { baladiya_name_ar: "حاسي مسعود" }, { baladiya_name_ar: "المنقر" }, { baladiya_name_ar: "المقارين" }, { baladiya_name_ar: "الطيبات" }, { baladiya_name_ar: "ورقلة" }, { baladiya_name_ar: "الرويسات" }, { baladiya_name_ar: "سيدي خويلد" }, { baladiya_name_ar: "تبسبست" }, { baladiya_name_ar: "تقرت" } ] },
    { wilaya_name_ar: "وهران", baladiyats: [ { baladiya_name_ar: "عين الترك" }, { baladiya_name_ar: "أرزيو" }, { baladiya_name_ar: "بطيوة" }, { baladiya_name_ar: "بئر الجير" }, { baladiya_name_ar: "بوتليليس" }, { baladiya_name_ar: "قديل" }, { baladiya_name_ar: "الكرمة" }, { baladiya_name_ar: "مرسى الكبير" }, { baladiya_name_ar: "وهران" }, { baladiya_name_ar: "السانية" } ] },
    { wilaya_name_ar: "البيض", baladiyats: [ { baladiya_name_ar: "بوقطب" }, { baladiya_name_ar: "بريزينة" }, { baladiya_name_ar: "بوسمغون" }, { baladiya_name_ar: "الشلالة" }, { baladiya_name_ar: "البيض" }, { baladiya_name_ar: "الأبيض سيدي الشيخ" }, { baladiya_name_ar: "رقاصة" } ] },
    { wilaya_name_ar: "إليزي", baladiyats: [ { baladiya_name_ar: "برج عمر إدريس" }, { baladiya_name_ar: "جانت" }, { baladiya_name_ar: "دبداب" }, { baladiya_name_ar: "إليزي" }, { baladiya_name_ar: "عين أميناس" } ] },
    { wilaya_name_ar: "برج بوعريريج", baladiyats: [ { baladiya_name_ar: "عين تاغروت" }, { baladiya_name_ar: "بئر قاصد علي" }, { baladiya_name_ar: "برج بوعريريج" }, { baladiya_name_ar: "برج الغدير" }, { baladiya_name_ar: "برج زمورة" }, { baladiya_name_ar: "الجعافرة" }, { baladiya_name_ar: "الحمادية" }, { baladiya_name_ar: "المنصورة" }, { baladiya_name_ar: "مجانة" }, { baladiya_name_ar: "رأس الوادي" } ] },
    { wilaya_name_ar: "بومرداس", baladiyats: [ { baladiya_name_ar: "بغلية" }, { baladiya_name_ar: "بن شود" }, { baladiya_name_ar: "برج منايل" }, { baladiya_name_ar: "بودواو" }, { baladiya_name_ar: "بومرداس" }, { baladiya_name_ar: "دلس" }, { baladiya_name_ar: "يسر" }, { baladiya_name_ar: "خميس الخشنة" }, { baladiya_name_ar: "الناصرية" }, { baladiya_name_ar: "الثنية" }, { baladiya_name_ar: "تجلابين" } ] },
    { wilaya_name_ar: "الطارف", baladiyats: [ { baladiya_name_ar: "بن مهيدي" }, { baladiya_name_ar: "بسباس" }, { baladiya_name_ar: "بوحجار" }, { baladiya_name_ar: "بوثلجة" }, { baladiya_name_ar: "الذرعان" }, { baladiya_name_ar: "القالة" }, { baladiya_name_ar: "الطارف" } ] },
    { wilaya_name_ar: "تندوف", baladiyats: [ { baladiya_name_ar: "تندوف" }, { baladiya_name_ar: "أم العسل" } ] },
    { wilaya_name_ar: "تيسمسيلت", baladiyats: [ { baladiya_name_ar: "برج بونعامة" }, { baladiya_name_ar: "خميستي" }, { baladiya_name_ar: "الأزهرية" }, { baladiya_name_ar: "لرجام" }, { baladiya_name_ar: "ثنية الاحد" }, { baladiya_name_ar: "تيسمسيلت" } ] },
    { wilaya_name_ar: "الوادي", baladiyats: [ { baladiya_name_ar: "البياضة" }, { baladiya_name_ar: "الدبيلة" }, { baladiya_name_ar: "الوادي" }, { baladiya_name_ar: "قمار" }, { baladiya_name_ar: "حساني عبد الكريم" }, { baladiya_name_ar: "حاسي خليفة" }, { baladiya_name_ar: "المقَرن" }, { baladiya_name_ar: "الرقيبة" }, { baladiya_name_ar: "الرباح" }, { baladiya_name_ar: "الطالب العربي" } ] },
    { wilaya_name_ar: "خنشلة", baladiyats: [ { baladiya_name_ar: "عين الطويلة" }, { baladiya_name_ar: "بابار" }, { baladiya_name_ar: "بوحمامة" }, { baladiya_name_ar: "ششار" }, { baladiya_name_ar: "الحامة" }, { baladiya_name_ar: "قايس" }, { baladiya_name_ar: "خنشلة" }, { baladiya_name_ar: "أولاد رشاش" }, { baladiya_name_ar: "الرميلة" } ] },
    { wilaya_name_ar: "سوق أهراس", baladiyats: [ { baladiya_name_ar: "الحنانشة" }, { baladiya_name_ar: "الحدادة" }, { baladiya_name_ar: "المراهنة" }, { baladiya_name_ar: "مداوروش" }, { baladiya_name_ar: "المشروحة" }, { baladiya_name_ar: "أولاد إدريس" }, { baladiya_name_ar: "أم العظائم" }, { baladiya_name_ar: "سدراتة" }, { baladiya_name_ar: "سوق أهراس" }, { baladiya_name_ar: "تاورة" } ] },
    { wilaya_name_ar: "تيبازة", baladiyats: [ { baladiya_name_ar: "أغبال" }, { baladiya_name_ar: "أحمر العين" }, { baladiya_name_ar: "بوهارون" }, { baladiya_name_ar: "بوسماعيل" }, { baladiya_name_ar: "شرشال" }, { baladiya_name_ar: "الداموس" }, { baladiya_name_ar: "فوكة" }, { baladiya_name_ar: "القليعة" }, { baladiya_name_ar: "حجرة النص" }, { baladiya_name_ar: "سيدي غيلاس" }, { baladiya_name_ar: "تيبازة" } ] },
    { wilaya_name_ar: "ميلة", baladiyats: [ { baladiya_name_ar: "عين البيضاء أحريش" }, { baladiya_name_ar: "شلغوم العيد" }, { baladiya_name_ar: "فرجيوة" }, { baladiya_name_ar: "ميلة" }, { baladiya_name_ar: "وادي النجاء" }, { baladiya_name_ar: "الرواشد" }, { baladiya_name_ar: "سيدي مروان" }, { baladiya_name_ar: "تاجنانت" }, { baladiya_name_ar: "تلاغمة" }, { baladiya_name_ar: "تسدان حدادة" } ] },
    { wilaya_name_ar: "عين الدفلى", baladiyats: [ { baladiya_name_ar: "عين الدفلى" }, { baladiya_name_ar: "عين لشياخ" }, { baladiya_name_ar: "بربوش" }, { baladiya_name_ar: "بومدفع" }, { baladiya_name_ar: "جليدة" }, { baladiya_name_ar: "جمعة أولاد الشيخ" }, { baladiya_name_ar: "حمام ريغة" }, { baladiya_name_ar: "خميس مليانة" }, { baladiya_name_ar: "مليانة" }, { baladiya_name_ar: "الروينة" } ] },
    { wilaya_name_ar: "النعامة", baladiyats: [ { baladiya_name_ar: "عين بن خليل" }, { baladiya_name_ar: "عين الصفراء" }, { baladiya_name_ar: "عسلة" }, { baladiya_name_ar: "مكمن بن عمار" }, { baladiya_name_ar: "مشرية" }, { baladiya_name_ar: "النعامة" }, { baladiya_name_ar: "سفيسيفة" }, { baladiya_name_ar: "تيوت" } ] },
    { wilaya_name_ar: "عين تيموشنت", baladiyats: [ { baladiya_name_ar: "عين الأربعاء" }, { baladiya_name_ar: "عين الكيحل" }, { baladiya_name_ar: "عين تيموشنت" }, { baladiya_name_ar: "بني صاف" }, { baladiya_name_ar: "العامرية" }, { baladiya_name_ar: "حمام بوحجر" }, { baladiya_name_ar: "ولهاصة الغرابة" } ] },
    { wilaya_name_ar: "غرداية", baladiyats: [ { baladiya_name_ar: "بريان" }, { baladiya_name_ar: "ضاية بن ضحوة" }, { baladiya_name_ar: "القرارة" }, { baladiya_name_ar: "غرداية" }, { baladiya_name_ar: "المنيعة" }, { baladiya_name_ar: "متليلي" }, { baladiya_name_ar: "زلفانة" } ] },
    { wilaya_name_ar: "غليزان", baladiyats: [ { baladiya_name_ar: "عمي موسى" }, { baladiya_name_ar: "عين طارق" }, { baladiya_name_ar: "جديوية" }, { baladiya_name_ar: "الحمادنة" }, { baladiya_name_ar: "المازونة" }, { baladiya_name_ar: "منداس" }, { baladiya_name_ar: "وادي ارهيو" }, { baladiya_name_ar: "غليزان" }, { baladiya_name_ar: "سيدي امحمد بن علي" }, { baladiya_name_ar: "يلل" }, { baladiya_name_ar: "زمورة" } ] }
];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'المتجر العصري',
  logo: 'https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600',
  deliveryFees: ALGERIA_DATA.map(w => ({
      wilaya: w.wilaya_name_ar,
      office: 300,
      home: 500,
  })),
  deliveryCompanies: ["Yalidine", "Zr Express"],
  contactInfo: {
    phone: '+213 123 456 789',
    email: 'contact@store.dz',
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    whatsapp: 'https://wa.me/213123456789'
  },
  theme: {
    light: {
      primary: '#4f46e5',
      secondary: '#10b981',
      accent: '#f59e0b',
      background: '#f9fafb',
      text: '#111827',
      textMuted: '#6b7280',
    },
    dark: {
      primary: '#6366f1',
      secondary: '#34d399',
      accent: '#fbbf24',
      background: '#111827',
      text: '#f9fafb',
      textMuted: '#9ca3af',
    }
  },
  storeDescription: 'متجركم المفضل للحصول على أفضل المنتجات بأحسن الأسعار.',
  adminUsername: 'admin',
  adminPassword: 'admin',
  managedCategories: ['ملابس', 'أحذية', 'إلكترونيات'],
  productCardStyle: 'default',
  productGridLayout: 'default',
  storeNameStyle: {
    style: 'default',
    gradientFrom: '#818cf8',
    gradientTo: '#4f46e5',
  },
};