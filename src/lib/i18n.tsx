import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Lang = 'en' | 'ar'

const STRINGS = {
  // navigation
  navExplore: { en: 'Explore', ar: 'استكشف' },
  navSaved: { en: 'Saved', ar: 'المحفوظة' },
  navAbout: { en: 'How it works', ar: 'إزاي بيشتغل' },
  openMap: { en: 'Open the map', ar: 'افتح الخريطة' },
  switchLang: { en: 'عربي', ar: 'English' },
  switchLangLabel: { en: 'Switch to Arabic', ar: 'التحويل إلى الإنجليزية' },
  skip: { en: 'Skip to content', ar: 'انتقل إلى المحتوى' },

  // home
  heroLine1: { en: 'Find your', ar: 'لاقي' },
  heroLine2: { en: 'ahwa', ar: 'قهوتك' },
  heroSentence: {
    en: 'Real cafés across Cairo on one map. Filter by open now, Wi-Fi and seating, then go.',
    ar: 'كافيهات حقيقية في القاهرة كلها على خريطة واحدة. فلتر بالمفتوح دلوقتي والواي فاي والقعدة، وانزل.',
  },
  heroArt: {
    en: 'Street graffiti of a glass of red tea, with the word ahwa sprayed in Arabic',
    ar: 'جرافيتي على الحيطة لكوباية شاي أحمر وكلمة قهوة مرشوشة بالعربي',
  },
  openRightNow: { en: 'open right now', ar: 'مفتوحة دلوقتي' },
  ofListed: { en: 'of {n} with listed hours', ar: 'من {n} مواعيدها معروفة' },
  boardHead1: { en: 'Built for', ar: 'معمول' },
  boardHead2: { en: 'studying', ar: 'للمذاكرة' },
  tOpenNow: { en: 'Open now', ar: 'مفتوح دلوقتي' },
  tOpenNowLine: { en: 'Worked out from each café’s listed hours, in Cairo time.', ar: 'محسوبة من مواعيد كل كافيه بتوقيت القاهرة.' },
  tWifi: { en: 'Wi-Fi', ar: 'واي فاي' },
  tWifiLine: { en: 'Only where it is actually listed.', ar: 'بس لما تكون مذكورة فعلاً.' },
  tNear: { en: 'Near me', ar: 'قريب مني' },
  tNearLine: { en: 'Sorted by distance from you.', ar: 'مترتبة حسب المسافة منك.' },
  tClosing: { en: 'Closing soon', ar: 'هيقفل قريب' },
  tClosingLine: { en: 'So you are not packed up at 9:55.', ar: 'عشان متتفاجئش وانت بتلم حاجتك.' },
  tSave: { en: 'Save', ar: 'احفظ' },
  tSaveLine: { en: 'Keep a list of your spots.', ar: 'خلّي عندك لستة أماكنك.' },
  tLang: { en: 'Two languages', ar: 'لغتين' },
  tLangLine: { en: 'English and Arabic, right to left done properly.', ar: 'عربي وإنجليزي، والاتجاه مظبوط.' },
  tOutdoor: { en: 'Outdoor seating', ar: 'قعدة برة' },
  tOutdoorLine: { en: 'For the evenings.', ar: 'للسهرة.' },
  showHead: { en: 'Flip the switch', ar: 'جرّب الزرار' },
  showLine: {
    en: 'This is the real count from the map, worked out for this minute in Cairo.',
    ar: 'ده العدد الحقيقي من الخريطة، محسوب للدقيقة دي بتوقيت القاهرة.',
  },
  showOn: { en: 'open now', ar: 'مفتوح دلوقتي' },
  showOff: { en: 'cafés mapped', ar: 'كافيه على الخريطة' },
  showSee: { en: 'See them on the map', ar: 'شوفهم على الخريطة' },
  historyHead1: { en: 'Cairo has', ar: 'القاهرة بتشرب' },
  historyHead2: { en: 'always sat down', ar: 'قهوة من زمان' },
  historyLine: {
    en: 'Coffee houses have been part of Cairo street life since the 1500s. The seats changed; the habit did not.',
    ar: 'القهاوي جزء من شارع القاهرة من القرن السادس عشر. الكراسي اتغيرت، والعادة لأ.',
  },
  howHead: { en: 'How it works', ar: 'إزاي بيشتغل' },
  howT1: { en: 'Seconds', ar: 'ثواني' },
  howC1: { en: 'First, pick what you need: open now, Wi-Fi, outdoors.', ar: 'الأول، اختار اللي محتاجه: مفتوح، واي فاي، برة.' },
  howT2: { en: 'A minute', ar: 'دقيقة' },
  howC2: { en: 'Then scan the map and open a café to check its hours.', ar: 'بعدين بص على الخريطة وافتح الكافيه وشوف مواعيده.' },
  howT3: { en: 'The rest of your afternoon', ar: 'باقي يومك' },
  howC3: { en: 'Finally, get directions and settle in with your laptop.', ar: 'وفي الآخر، خد الاتجاهات واقعد بلابتوبك.' },
  ctaHead1: { en: 'Your seat', ar: 'كرسيك' },
  ctaHead2: { en: 'is waiting', ar: 'مستنيك' },
  ctaLine: { en: 'Open the map and find a table before the good ones go.', ar: 'افتح الخريطة ولاقي ترابيزة قبل الحلوين ما يتاخدوا.' },
  footData: {
    en: 'Café data © OpenStreetMap contributors, ODbL. Missing or wrong? Fix it on OpenStreetMap and it will reach Ahwa on the next update.',
    ar: 'بيانات الكافيهات © مساهمو OpenStreetMap برخصة ODbL. في حاجة ناقصة أو غلط؟ صلّحها على OpenStreetMap وهتوصل لـ Ahwa في التحديث الجاي.',
  },
  footPhotos: { en: 'Photographs', ar: 'الصور' },
  footMade: { en: 'A student portfolio project.', ar: 'مشروع ضمن بورتفوليو طالب.' },

  // explore
  searchPlaceholder: { en: 'Search a café or area', ar: 'دوّر على كافيه أو منطقة' },
  searchLabel: { en: 'Search cafés', ar: 'دوّر على الكافيهات' },
  fOpen: { en: 'Open now', ar: 'مفتوح دلوقتي' },
  fWifi: { en: 'Wi-Fi', ar: 'واي فاي' },
  fOutdoor: { en: 'Outdoor', ar: 'قعدة برة' },
  fAc: { en: 'Air-con', ar: 'تكييف' },
  fNoSmoke: { en: 'No smoking', ar: 'ممنوع التدخين' },
  fLocal: { en: 'Not a chain', ar: 'مش سلسلة' },
  fArea: { en: 'Area', ar: 'المنطقة' },
  fAllAreas: { en: 'All areas', ar: 'كل المناطق' },
  nearMe: { en: 'Near me', ar: 'قريب مني' },
  locating: { en: 'Finding you…', ar: 'بنحدد مكانك…' },
  locDenied: { en: 'Location is off, so cafés are sorted by name.', ar: 'الموقع مقفول، فالكافيهات مترتبة بالاسم.' },
  results: { en: '{n} cafés', ar: '{n} كافيه' },
  result1: { en: '1 café', ar: 'كافيه واحد' },
  clearFilters: { en: 'Clear filters', ar: 'امسح الفلاتر' },
  emptyHead: { en: 'Nothing matches', ar: 'مفيش نتايج' },
  emptyLine: {
    en: 'Few cafés list every detail yet, so strict filters hide a lot. Try removing one.',
    ar: 'كافيهات قليلة مذكور عنها كل التفاصيل، فالفلاتر الكتير بتخبي كتير. جرّب تشيل واحد.',
  },
  hoursNote: { en: 'Only {k} of {n} cafés list their hours, so "Open now" shows those.', ar: '{k} بس من {n} كافيه مواعيدهم معروفة، فـ"مفتوح دلوقتي" بيعرض دول.' },
  showList: { en: 'List', ar: 'القائمة' },
  showMap: { en: 'Map', ar: 'الخريطة' },
  details: { en: 'Details', ar: 'التفاصيل' },
  kmAway: { en: '{d} km away', ar: 'على بعد {d} كم' },
  mAway: { en: '{d} m away', ar: 'على بعد {d} م' },

  // states
  open: { en: 'Open', ar: 'مفتوح' },
  closed: { en: 'Closed', ar: 'مقفول' },
  unknownHours: { en: 'Hours not listed', ar: 'المواعيد مش مذكورة' },
  open247: { en: 'Open 24 hours', ar: 'مفتوح ٢٤ ساعة' },
  closesIn: { en: 'Closes in {t}', ar: 'هيقفل بعد {t}' },
  opensIn: { en: 'Opens in {t}', ar: 'هيفتح بعد {t}' },
  min: { en: '{n} min', ar: '{n} دقيقة' },
  hr: { en: '{n} h', ar: '{n} ساعة' },

  // detail
  back: { en: 'Back to the map', ar: 'ارجع للخريطة' },
  save: { en: 'Save', ar: 'احفظ' },
  saved: { en: 'Saved', ar: 'محفوظ' },
  directions: { en: 'Directions', ar: 'الاتجاهات' },
  website: { en: 'Website', ar: 'الموقع' },
  instagram: { en: 'Instagram', ar: 'إنستجرام' },
  call: { en: 'Call', ar: 'اتصل' },
  hoursHead: { en: 'This week', ar: 'الأسبوع ده' },
  hoursAsListed: { en: 'Listed as', ar: 'مكتوبة كده' },
  closedAllDay: { en: 'Closed', ar: 'مقفول' },
  today: { en: 'Today', ar: 'النهارده' },
  detailsHead: { en: 'What we know', ar: 'اللي نعرفه' },
  yes: { en: 'Yes', ar: 'أيوه' },
  no: { en: 'No', ar: 'لأ' },
  unknown: { en: 'Not listed', ar: 'مش مذكور' },
  aWifi: { en: 'Wi-Fi', ar: 'واي فاي' },
  aOutdoor: { en: 'Outdoor seating', ar: 'قعدة برة' },
  aAc: { en: 'Air conditioning', ar: 'تكييف' },
  aSmoking: { en: 'Smoking', ar: 'التدخين' },
  aTakeaway: { en: 'Takeaway', ar: 'تيك أواي' },
  aWheelchair: { en: 'Wheelchair access', ar: 'مناسب للكراسي المتحركة' },
  smokingNo: { en: 'Not allowed', ar: 'ممنوع' },
  smokingYes: { en: 'Allowed', ar: 'مسموح' },
  smokingOutside: { en: 'Outside only', ar: 'برة بس' },
  smokingSeparated: { en: 'Separate area', ar: 'منطقة منفصلة' },
  notesHead: { en: 'Your notes', ar: 'ملاحظاتك' },
  notesLine: { en: 'Only you see these; they stay on this device.', ar: 'انت بس اللي بتشوفها، ومتسجلة على الجهاز ده.' },
  quiet: { en: 'Quiet enough to study?', ar: 'هادي للمذاكرة؟' },
  outlets: { en: 'Power outlets?', ar: 'فيه فيش كهربا؟' },
  quietYes: { en: 'Quiet', ar: 'هادي' },
  quietMid: { en: 'Some noise', ar: 'شوية دوشة' },
  quietNo: { en: 'Loud', ar: 'دوشة' },
  fixOsm: { en: 'Something wrong? Edit it on OpenStreetMap', ar: 'فيه غلط؟ عدّله على OpenStreetMap' },
  notFound: { en: 'This café is not on the map', ar: 'الكافيه ده مش على الخريطة' },
  chain: { en: 'Chain', ar: 'سلسلة' },
  inArea: { en: 'in {a}', ar: 'في {a}' },
  nearbyHead: { en: 'Nearby', ar: 'قريب منه' },

  // saved
  savedHead: { en: 'Your spots', ar: 'أماكنك' },
  savedEmptyHead: { en: 'Nothing saved yet', ar: 'لسه مفيش حاجة محفوظة' },
  savedEmptyLine: { en: 'Tap Save on any café and it will wait for you here.', ar: 'دوس احفظ على أي كافيه وهتلاقيه هنا.' },
  remove: { en: 'Remove', ar: 'شيل' },
} as const

export type StringKey = keyof typeof STRINGS

type Ctx = {
  lang: Lang
  dir: 'ltr' | 'rtl'
  setLang: (l: Lang) => void
  t: (k: StringKey, vars?: Record<string, string | number>) => string
  num: (n: number) => string
}

const LangCtx = createContext<Ctx | null>(null)

function readLang(): Lang {
  try {
    const v = localStorage.getItem('ahwa-lang')
    if (v === 'ar' || v === 'en') return v
  } catch { /* storage blocked: fall through */ }
  return navigator.language?.startsWith('ar') ? 'ar' : 'en'
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readLang)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = dir
    try { localStorage.setItem('ahwa-lang', lang) } catch { /* ignore */ }
  }, [lang, dir])

  const setLang = useCallback((l: Lang) => {
    // the whole page flips direction, so let the browser cross-fade it instead of jumping
    const run = () => setLangState(l)
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || reduce) { run(); return }
    const vt = document.startViewTransition(run)
    // a second click mid-transition cancels the first; that is expected, not an error
    vt.ready.catch(() => {}); vt.finished.catch(() => {})
  }, [])

  const value = useMemo<Ctx>(() => {
    const nf = new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-GB')
    return {
      lang, dir, setLang,
      num: (n) => nf.format(n),
      t: (k, vars) => {
        let s: string = STRINGS[k][lang]
        if (vars) for (const [key, v] of Object.entries(vars)) s = s.replace(`{${key}}`, typeof v === 'number' ? nf.format(v) : v)
        return s
      },
    }
  }, [lang, dir, setLang])

  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>
}

export function useLang() {
  const c = useContext(LangCtx)
  if (!c) throw new Error('useLang outside LangProvider')
  return c
}
