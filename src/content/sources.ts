import type { Source } from './types'

/** سجل المصادر المركزي — كل عنصر يشير إليه بـ sourceId (research/01_SOURCE_INDEX.md للتفصيل) */
export const sources: Record<string, Source> = {
  'team-text': { id: 'team-text', level: 1, publisher: 'الثانوية السادسة والثلاثون', title: 'الآيات وتفسير «تيسير الكريم الرحمن» (السعدي)', date: '2026-09-19' },
  'team-video-security': { id: 'team-video-security', level: 1, publisher: 'الثانوية السادسة والثلاثون', title: 'مقطع توعوي عن الأمن الوطني (شرائح)', date: '2026-09-18' },
  'quran-tanzil': { id: 'quran-tanzil', level: 3, publisher: 'Tanzil Project (عبر alquran.cloud)', title: 'نص المصحف العثماني — Tanzil Uthmani', url: 'https://api.alquran.cloud/', accessed: '2026-09-19' },
  'quran-com': { id: 'quran-com', level: 3, publisher: 'Quran.com (Quran Foundation)', title: 'Quran.com API v4 — text_uthmani', url: 'https://api.quran.com/api/v4/', accessed: '2026-09-19' },
  'spa-identity-2026': { id: 'spa-identity-2026', level: 2, publisher: 'وكالة الأنباء السعودية (واس)', title: 'رئيس هيئة الترفيه يعلن إطلاق هوية اليوم الوطني لعام 2026 تحت شعار «عزّنا بطبعنا»', url: 'https://www.spa.gov.sa/N2642350', date: '2026-07-27', accessed: '2026-09-19' },
  'spa-national-day-95': { id: 'spa-national-day-95', level: 2, publisher: 'وكالة الأنباء السعودية (واس)', title: 'Celebrating 95 Years of Unity: Saudi Arabia’s National Day', url: 'https://www.spa.gov.sa/en/w2404431', date: '2025-09-22', accessed: '2026-09-19' },
  'unesco-whc-sa': { id: 'unesco-whc-sa', level: 5, publisher: 'UNESCO World Heritage Centre', title: 'Saudi Arabia — State Party', url: 'https://whc.unesco.org/en/statesparties/sa', accessed: '2026-09-19' },
  'unesco-ich-sa': { id: 'unesco-ich-sa', level: 5, publisher: 'UNESCO — Intangible Cultural Heritage', title: 'Saudi Arabia — Elements on the Lists', url: 'https://ich.unesco.org/en/state/saudi-arabia-SA?info=elements-on-the-lists', accessed: '2026-09-19' },
  'unesco-ich-coffee': { id: 'unesco-ich-coffee', level: 5, publisher: 'UNESCO — Intangible Cultural Heritage', title: 'Arabic coffee, a symbol of generosity', url: 'https://ich.unesco.org/en/RL/arabic-coffee-a-symbol-of-generosity-02111', accessed: '2026-09-19' },
  'unesco-ich-sadu': { id: 'unesco-ich-sadu', level: 5, publisher: 'UNESCO — Intangible Cultural Heritage', title: 'Traditional weaving of Al Sadu', url: 'https://ich.unesco.org/en/RL/traditional-weaving-of-al-sadu-02158', accessed: '2026-09-19' },
  'unesco-ich-majlis': { id: 'unesco-ich-majlis', level: 5, publisher: 'UNESCO — Intangible Cultural Heritage', title: 'Majlis, a cultural and social space', url: 'https://ich.unesco.org/en/RL/majlis-a-cultural-and-social-space-01076', accessed: '2026-09-19' },
  'saudipedia-provinces': { id: 'saudipedia-provinces', level: 2, publisher: 'سعوديبيديا (الموسوعة السعودية) — عن نظام المناطق وهيئة الإحصاء', title: 'Provinces of Saudi Arabia', url: 'https://saudipedia.com/en/provinces-of-saudi-arabia', date: '2020-12-29', accessed: '2026-09-19' },
  geoboundaries: { id: 'geoboundaries', level: 6, publisher: 'geoBoundaries (William & Mary geoLab) — © OpenStreetMap contributors (ODbL 1.0)', title: 'gbOpen SAU ADM0/ADM1 (simplified) — سنة التمثيل 2017', url: 'https://www.geoboundaries.org/', accessed: '2026-09-19' },
  'saudipedia-flag-law': { id: 'saudipedia-flag-law', level: 2, publisher: 'سعوديبيديا — عن هيئة الخبراء بمجلس الوزراء', title: 'Law of the Flag of Saudi Arabia', url: 'https://saudipedia.com/en/law-of-the-flag-of-saudi-arabia', date: '2023-04-12', accessed: '2026-09-19' },
}

/** مصادر الوجهات والحكومة والمقالات (قُرئت 2026-09-19) */
const more: Source[] = [
  { id: 'unesco-whc-1293', level: 5, publisher: 'UNESCO World Heritage Centre', title: 'Hegra Archaeological Site (al-Hijr / Madā’in Ṣāliḥ)', url: 'https://whc.unesco.org/en/list/1293/', accessed: '2026-09-19' },
  { id: 'unesco-whc-1329', level: 5, publisher: 'UNESCO World Heritage Centre', title: 'At-Turaif District in ad-Dir’iyah', url: 'https://whc.unesco.org/en/list/1329/', accessed: '2026-09-19' },
  { id: 'unesco-whc-1361', level: 5, publisher: 'UNESCO World Heritage Centre', title: 'Historic Jeddah, the Gate to Makkah', url: 'https://whc.unesco.org/en/list/1361/', accessed: '2026-09-19' },
  { id: 'unesco-whc-1472', level: 5, publisher: 'UNESCO World Heritage Centre', title: 'Rock Art in the Hail Region of Saudi Arabia', url: 'https://whc.unesco.org/en/list/1472/', accessed: '2026-09-19' },
  { id: 'unesco-whc-1563', level: 5, publisher: 'UNESCO World Heritage Centre', title: 'Al-Ahsa Oasis, an Evolving Cultural Landscape', url: 'https://whc.unesco.org/en/list/1563/', accessed: '2026-09-19' },
  { id: 'unesco-whc-1619', level: 5, publisher: 'UNESCO World Heritage Centre', title: 'Ḥimā Cultural Area', url: 'https://whc.unesco.org/en/list/1619/', accessed: '2026-09-19' },
  { id: 'unesco-whc-1699', level: 5, publisher: 'UNESCO World Heritage Centre', title: '’Uruq Bani Ma’arid', url: 'https://whc.unesco.org/en/list/1699/', accessed: '2026-09-19' },
  { id: 'unesco-whc-1712', level: 5, publisher: 'UNESCO World Heritage Centre', title: 'The Cultural Landscape of Al-Faw Archaeological Area', url: 'https://whc.unesco.org/en/list/1712/', accessed: '2026-09-19' },
  { id: 'mofa-national-day', level: 2, publisher: 'وزارة الخارجية السعودية', title: 'اليوم الوطني — نبذة تاريخية', url: 'https://www.mofa.gov.sa/ar/ksa/Pages/nationalday.aspx', accessed: '2026-09-19' },
  { id: 'spa-founding-day', level: 2, publisher: 'وكالة الأنباء السعودية (واس)', title: 'أمر ملكي: يوم التأسيس (أ/371)', url: 'https://www.spa.gov.sa/2324646', date: '2022-01-27', accessed: '2026-09-19' },
  { id: 'spa-vision-2030', level: 2, publisher: 'وكالة الأنباء السعودية (واس)', title: 'مجلس الوزراء يقرّ رؤية المملكة 2030', url: 'https://www.spa.gov.sa/1493540', date: '2016-04-25', accessed: '2026-09-19' },
  { id: 'saudiflag', level: 2, publisher: 'وزارة الثقافة — موقع علم المملكة', title: 'علم المملكة العربية السعودية — الحقائق التاريخية', url: 'https://saudiflag.sa/', accessed: '2026-09-19' },
  { id: 'basic-law-text', level: 4, publisher: 'مكتبة حقوق الإنسان، جامعة مينيسوتا (نص النظام)', title: 'النظام الأساسي للحكم — أمر ملكي رقم أ/90 وتاريخ 27/8/1412هـ', url: 'https://hrlibrary.umn.edu/arabic/Saudi_Con.html', accessed: '2026-09-19' },
  { id: 'saudipedia-basic-law', level: 2, publisher: 'سعوديبيديا', title: 'Basic Law of Governance in Saudi Arabia', url: 'https://saudipedia.com/en/basic-law-of-governance-in-saudi-arabia', accessed: '2026-09-19' },
  { id: 'saudipedia-ministers', level: 2, publisher: 'سعوديبيديا', title: 'Saudi Arabia’s Council of Ministers', url: 'https://saudipedia.com/en/saudi-arabia%22s-council-of-ministers', date: '2020-12-30', accessed: '2026-09-19' },
  { id: 'wiki-council-ministers', level: 6, publisher: 'Wikipedia', title: 'Council of Ministers of Saudi Arabia', url: 'https://en.wikipedia.org/wiki/Council_of_Ministers_of_Saudi_Arabia', accessed: '2026-09-19' },
  { id: 'wiki-shura', level: 6, publisher: 'Wikipedia', title: 'Consultative Assembly of Saudi Arabia', url: 'https://en.wikipedia.org/wiki/Consultative_Assembly_of_Saudi_Arabia', accessed: '2026-09-19' },
  { id: 'saudipedia-judiciary', level: 2, publisher: 'سعوديبيديا', title: 'Board of Grievances', url: 'https://saudipedia.com/en/article/2837/government-and-politics/justice-and-the-judiciary/board-of-grievances', accessed: '2026-09-19' },
  { id: 'wiki-judiciary', level: 6, publisher: 'Wikipedia', title: 'Judiciary of Saudi Arabia', url: 'https://en.wikipedia.org/wiki/Judiciary_of_Saudi_Arabia', accessed: '2026-09-19' },
  { id: 'saudipedia-provinces-law', level: 2, publisher: 'سعوديبيديا', title: 'Provinces of Saudi Arabia', url: 'https://saudipedia.com/en/provinces-of-saudi-arabia', accessed: '2026-09-19' },
  { id: 'wiki-salman', level: 6, publisher: 'Wikipedia', title: 'Salman of Saudi Arabia', url: 'https://en.wikipedia.org/wiki/Salman_of_Saudi_Arabia', accessed: '2026-09-19' },
  { id: 'wiki-mbs', level: 6, publisher: 'Wikipedia', title: 'Mohammed bin Salman', url: 'https://en.wikipedia.org/wiki/Mohammed_bin_Salman', accessed: '2026-09-19' },
  { id: 'wiki-ibn-saud', level: 6, publisher: 'Wikipedia', title: 'Ibn Saud (Abdulaziz of Saudi Arabia)', url: 'https://en.wikipedia.org/wiki/Ibn_Saud', accessed: '2026-09-19' },
  { id: 'wiki-masmak', level: 6, publisher: 'Wikipedia', title: 'Masmak Fort', url: 'https://en.wikipedia.org/wiki/Masmak_Fort', accessed: '2026-09-19' },
  { id: 'wiki-rijal', level: 6, publisher: 'Wikipedia', title: 'Rijal Almaa', url: 'https://en.wikipedia.org/wiki/Rijal_Almaa', accessed: '2026-09-19' },
  { id: 'wiki-farasan', level: 6, publisher: 'Wikipedia', title: 'Farasan Islands', url: 'https://en.wikipedia.org/wiki/Farasan_Islands', accessed: '2026-09-19' },
  { id: 'wiki-elephant-rock', level: 6, publisher: 'Wikipedia', title: 'Elephant Rock (Saudi Arabia)', url: 'https://en.wikipedia.org/wiki/Elephant_Rock_(Saudi_Arabia)', accessed: '2026-09-19' },
  { id: 'wiki-shubra', level: 6, publisher: 'Wikipedia', title: 'Shubra Palace', url: 'https://en.wikipedia.org/wiki/Shubra_Palace', accessed: '2026-09-19' },
  { id: 'wiki-ithra', level: 6, publisher: 'Wikipedia', title: 'King Abdulaziz Center for World Culture', url: 'https://en.wikipedia.org/wiki/King_Abdulaziz_Center_for_World_Culture', accessed: '2026-09-19' },
  { id: 'wiki-quba', level: 6, publisher: 'Wikipedia', title: 'Quba Mosque', url: 'https://en.wikipedia.org/wiki/Quba_Mosque', accessed: '2026-09-19' },
  { id: 'wiki-nabawi', level: 6, publisher: 'Wikipedia', title: 'Prophet’s Mosque', url: 'https://en.wikipedia.org/wiki/Prophet%27s_Mosque', accessed: '2026-09-19' },
  { id: 'wiki-haram', level: 6, publisher: 'Wikipedia', title: 'Masjid al-Haram', url: 'https://en.wikipedia.org/wiki/Masjid_al-Haram', accessed: '2026-09-19' },
  { id: 'wiki-national-museum', level: 6, publisher: 'Wikipedia', title: 'National Museum of Saudi Arabia', url: 'https://en.wikipedia.org/wiki/National_Museum_of_Saudi_Arabia', accessed: '2026-09-19' },
  { id: 'wiki-kingdom-centre', level: 6, publisher: 'Wikipedia', title: 'Kingdom Centre', url: 'https://en.wikipedia.org/wiki/Kingdom_Centre', accessed: '2026-09-19' },
  { id: 'iugs-wahbah', level: 4, publisher: 'IUGS — الاتحاد الدولي للعلوم الجيولوجية', title: 'The Pleistocene Al Wahbah dry maar crater', url: 'https://iugs-geoheritage.org/geoheritage_sites/the-pleistocene-al-wahbah-dry-maar-crater/', accessed: '2026-09-19' },
  { id: 'wiki-tuwaiq', level: 6, publisher: 'Wikipedia', title: 'Tuwaiq', url: 'https://en.wikipedia.org/wiki/Tuwaiq', accessed: '2026-09-19' },
  { id: 'travel-edge-world', level: 6, publisher: 'Mercure (Accor) / Time Out Riyadh — دليل سياحي', title: 'Edge of the World Riyadh', url: 'https://mercure.accor.com/en/mercure-local-guide/cultural-treasures/edge-of-the-world-riyadh.html', accessed: '2026-09-19' },
  { id: 'travel-wadi-disah', level: 6, publisher: 'Wasalt — دليل سياحي', title: 'Wadi Al Disah', url: 'https://blog.wasalt.sa/en/wadi-al-disah/', accessed: '2026-09-19' },
]
for (const s of more) sources[s.id] = s

export const sourceLevelLabel: Record<number, string> = {
  1: 'مادة المشروع',
  2: 'مصدر سعودي رسمي',
  3: 'مؤسسة أرشيفية/ثقافية',
  4: 'أكاديمي',
  5: 'مؤسسة دولية',
  6: 'بيانات عامة',
}

/** المجلة المدرسية «من قيمنا إلى رؤيتنا» — نصوص الجداريات (content/murals.ts) نُقلت من صور صفحاتها */
sources['team-magazine'] = { id: 'team-magazine', level: 1, publisher: 'الثانوية السادسة والثلاثون', title: 'مجلة «من قيمنا إلى رؤيتنا» (14 صفحة)', date: '2026-09-18' }

/** مصادر «طريق الحكاية» (research/_parts/timeline_facts.md — قُرئت 2026-09-19) */
const pathSources: Source[] = [
  { id: 'saudipedia-battle-riyadh', level: 2, publisher: 'سعوديبيديا (الموسوعة السعودية)', title: 'Battle of Riyadh', url: 'https://saudipedia.com/en/battle-of-riyadh', accessed: '2026-09-19' },
  { id: 'saudipedia-unification-timeline', level: 2, publisher: 'سعوديبيديا (الموسوعة السعودية)', title: 'Timeline of the Unification of Saudi Arabia', url: 'https://saudipedia.com/en/timeline-of-the-unification-of-saudi-arabia', date: '06/02/2023', accessed: '2026-09-19' },
  { id: 'saudipedia-unification-announced', level: 2, publisher: 'سعوديبيديا (الموسوعة السعودية)', title: 'When was the Unification of Saudi Arabia officially announced?', url: 'https://saudipedia.com/en/when-was-the-unification-of-saudi-arabia-officially-announced', date: '2025-08-25', accessed: '2026-09-19' },
  { id: 'saudipedia-national-day', level: 2, publisher: 'سعوديبيديا (الموسوعة السعودية)', title: 'Saudi National Day', url: 'https://saudipedia.com/en/saudi-national-day', date: '2020-12-30', accessed: '2026-09-19' },
  { id: 'saudipedia-dammam-7', level: 2, publisher: 'سعوديبيديا (الموسوعة السعودية)', title: 'Dammam No. 7', url: 'https://saudipedia.com/en/dammam-no.-seven', date: '03/04/2021', accessed: '2026-09-19' },
  { id: 'aramco-history', level: 2, publisher: 'أرامكو السعودية (شركة وطنية)', title: 'Our history', url: 'https://www.aramco.com/en/about-us/our-history', accessed: '2026-09-19' },
  { id: 'un-founders', level: 5, publisher: 'الأمم المتحدة — مكتبة داغ همرشولد', title: 'UN Members: Founding Members', url: 'https://research.un.org/en/unmembers/founders', accessed: '2026-09-19' },
  { id: 'un-saudi-about', level: 5, publisher: 'الأمم المتحدة — المملكة العربية السعودية', title: 'About the UN', url: 'https://saudiarabia.un.org/en/about/about-the-un', accessed: '2026-09-19' },
  { id: 'spa-vision-pillars', level: 2, publisher: 'وكالة الأنباء السعودية (واس)', title: 'إعلان مرتكزات رؤية المملكة 2030', url: 'https://www.spa.gov.sa/1493725', date: '2016-04-25', accessed: '2026-09-19' },
  { id: 'vision2030-overview', level: 2, publisher: 'رؤية المملكة 2030', title: 'Vision 2030 — Overview', url: 'https://www.vision2030.gov.sa/en/overview', accessed: '2026-09-19' },
]
for (const s of pathSources) sources[s.id] = s

/** مصادر قاعة «نحو المستقبل» (قُرئت 2026-09-19) — التفاصيل والجمل المعتمدة في research/_parts/future_facts.md */
const futureSources: Source[] = [
  { id: 'fut-v2030-overview', level: 2, publisher: 'رؤية السعودية 2030 (الموقع الرسمي)', title: 'رؤية السعودية 2030 — نبذة تعريفية (المحاور الثلاثة)', url: 'https://www.vision2030.gov.sa/ar/overview', accessed: '2026-09-19' },
  { id: 'fut-v2030-doc', level: 2, publisher: 'رؤية السعودية 2030 (الموقع الرسمي)', title: 'رؤية المملكة العربية السعودية 2030 — الوثيقة (المحاور الفرعية)', url: 'https://www.vision2030.gov.sa/media/5ptbkbxn/saudi_vision2030_ar.pdf', date: '2016', accessed: '2026-09-19' },
  { id: 'fut-v2030-neom', level: 2, publisher: 'رؤية السعودية 2030 (الموقع الرسمي)', title: 'المشاريع — نيوم', url: 'https://www.vision2030.gov.sa/ar/explore/projects/neom', date: '2025-03-26', accessed: '2026-09-19' },
  { id: 'fut-v2030-qiddiya', level: 2, publisher: 'رؤية السعودية 2030 (الموقع الرسمي)', title: 'المشاريع — القدية', url: 'https://www.vision2030.gov.sa/ar/explore/projects/qiddya', date: '2024-08-15', accessed: '2026-09-19' },
  { id: 'fut-v2030-diriyah', level: 2, publisher: 'رؤية السعودية 2030 (الموقع الرسمي)', title: 'المشاريع — بوابة الدرعية', url: 'https://www.vision2030.gov.sa/ar/explore/projects/diriyah', accessed: '2026-09-19' },
  { id: 'fut-v2030-redsea', level: 2, publisher: 'رؤية السعودية 2030 (الموقع الرسمي)', title: 'المشاريع — البحر الأحمر الدولية', url: 'https://www.vision2030.gov.sa/ar/explore/projects/red-sea-global', date: '2026-08-05', accessed: '2026-09-19' },
  { id: 'fut-neom-official', level: 2, publisher: 'نيوم — الموقع الرسمي (مشروع مملوك لصندوق الاستثمارات العامة)', title: 'NEOM: Made to Change', url: 'https://www.neom.com/en-us', accessed: '2026-09-19' },
  { id: 'fut-rsg-official', level: 2, publisher: 'شركة البحر الأحمر الدولية — الموقع الرسمي (مملوكة لصندوق الاستثمارات العامة)', title: 'The Red Sea: A Regenerative Tourism Destination', url: 'https://www.redseaglobal.com/en/our-destinations/the-red-sea/', accessed: '2026-09-19' },
  { id: 'fut-saudipedia-tabuk', level: 2, publisher: 'سعوديبيديا (الموسوعة السعودية)', title: 'Tabuk Province', url: 'https://saudipedia.com/en/tabuk-province', accessed: '2026-09-19' },
  { id: 'fut-bie-173', level: 5, publisher: 'المكتب الدولي للمعارض (BIE)', title: '173rd General Assembly of the BIE — انتخاب الرياض لاستضافة إكسبو 2030', url: 'https://www.bie-paris.org/site/en/news-announcements/bie-activity/173rd-general-assembly-of-the-bie', date: '2023-11-28', accessed: '2026-09-19' },
  { id: 'fut-fifa-2034', level: 5, publisher: 'الاتحاد الدولي لكرة القدم (FIFA)', title: 'Extraordinary FIFA Congress appoints hosts of 2030 and 2034 editions of FIFA World Cup', url: 'https://inside.fifa.com/media-releases/extraordinary-congress-appoints-hosts-of-2030-and-2034-editions-of-fifa-world-cup', date: '2024-12-11', accessed: '2026-09-19' },
]
for (const s of futureSources) sources[s.id] = s

/** مصادر «الأرض» — مباني كل منطقة وقصصها، والأزياء والثقافة الإقليمية (قُرئت 2026-09-22) */
const architectureSources: Source[] = [
  { id: 'wiki-historic-jeddah', level: 6, publisher: 'Wikipedia', title: 'Historic Jeddah', url: 'https://en.wikipedia.org/wiki/Historic_Jeddah', accessed: '2026-09-22' },
  { id: 'saudipedia-qasr-ibrahim', level: 2, publisher: 'سعوديبيديا (الموسوعة السعودية)', title: 'قصر إبراهيم الأثري', url: 'https://saudipedia.com/article/17016', accessed: '2026-09-22' },
  { id: 'wiki-tabuk-castle', level: 6, publisher: 'Wikipedia', title: 'Tabuk Castle', url: 'https://en.wikipedia.org/wiki/Tabuk_Castle', accessed: '2026-09-22' },
  { id: 'wiki-barzan-palace', level: 6, publisher: 'Wikipedia', title: 'Barzan Palace', url: 'https://en.wikipedia.org/wiki/Barzan_Palace', accessed: '2026-09-22' },
  { id: 'saudipedia-arar-palace', level: 2, publisher: 'سعوديبيديا (الموسوعة السعودية)', title: 'قصر الإمارة القديم في عرعر', url: 'https://saudipedia.com/article/15971', accessed: '2026-09-22' },
  { id: 'wiki-najran-palace', level: 6, publisher: 'ويكيبيديا', title: 'قصر إمارة نجران', url: 'https://ar.wikipedia.org/wiki/قصر_إمارة_نجران', accessed: '2026-09-22' },
  { id: 'wiki-thee-ain', level: 6, publisher: 'Wikipedia', title: 'Thee Ain', url: 'https://en.wikipedia.org/wiki/Thee_Ain', accessed: '2026-09-22' },
  { id: 'wiki-marid-castle', level: 6, publisher: 'Wikipedia', title: 'Marid Castle', url: 'https://en.wikipedia.org/wiki/Marid_Castle', accessed: '2026-09-22' },
  { id: 'wiki-dubaikhi-museum', level: 6, publisher: 'ويكيبيديا', title: 'متحف قصر الدبيخي', url: 'https://ar.wikipedia.org/wiki/متحف_قصر_الدبيخي', accessed: '2026-09-22' },
  { id: 'saudipedia-dress-women', level: 2, publisher: 'سعوديبيديا (الموسوعة السعودية)', title: 'الأزياء الشعبية النسائية في السعودية', url: 'https://saudipedia.com/article/16216', accessed: '2026-09-22' },
  { id: 'albiladpress-dress-regions', level: 6, publisher: 'جريدة البلاد', title: 'تميّز الملابس التقليدية السعودية بحسب مناطقها', url: 'https://www.albiladpress.com/news/2025/5975/spaces/903595.html', accessed: '2026-09-22' },
  { id: 'saudipedia-dress-eastern', level: 2, publisher: 'سعوديبيديا (الموسوعة السعودية)', title: 'الأزياء الشعبية في المنطقة الشرقية', url: 'https://saudipedia.com/الأزياء-الشعبية-في-المنطقة-الشرقية', accessed: '2026-09-22' },
  { id: 'saudipedia-dress-jazan', level: 2, publisher: 'سعوديبيديا (الموسوعة السعودية)', title: 'الأزياء الشعبية في منطقة جازان', url: 'https://saudipedia.com/الأزياء-الشعبية-في-منطقة-جازان', accessed: '2026-09-22' },
  { id: 'saudipedia-dress-jawf', level: 2, publisher: 'سعوديبيديا (الموسوعة السعودية)', title: 'الأزياء الشعبية في منطقة الجوف', url: 'https://saudipedia.com/الأزياء-الشعبية-في-منطقة-الجوف', accessed: '2026-09-22' },
  { id: 'saudipedia-dress-northern', level: 2, publisher: 'سعوديبيديا (الموسوعة السعودية)', title: 'الأزياء الشعبية في منطقة الحدود الشمالية', url: 'https://saudipedia.com/الأزياء-الشعبية-في-منطقة-الحدود-الشمالية', accessed: '2026-09-22' },
  { id: 'spa-bisht-hasawi', level: 2, publisher: 'وكالة الأنباء السعودية (واس)', title: '«البشت الحساوي».. شهرة وحضور في المحافل المحلية والدولية', url: 'https://www.spa.gov.sa/N2238237', accessed: '2026-09-22' },
  { id: 'wiki-bisht-hasawi', level: 6, publisher: 'ويكيبيديا', title: 'بشت أحسائي', url: 'https://ar.wikipedia.org/wiki/بشت_أحسائي', accessed: '2026-09-22' },
  { id: 'spa-jawf-olive', level: 2, publisher: 'وكالة الأنباء السعودية (واس)', title: 'الجوف تستعد لمهرجان الزيتون بـ١٠ ملايين لتر من الزيت البِكر', url: 'https://www.spa.gov.sa/1582445', accessed: '2026-09-22' },
  { id: 'visitsaudi-qassim', level: 2, publisher: 'الهيئة السعودية للسياحة (Visit Saudi)', title: 'Qassim — Agricultural Heart & Traditional Culture', url: 'https://www.visitsaudi.com/en/qassim', accessed: '2026-09-22' },
]

/** مصادر مقالات نقاط «المجلس» الست (قُرئت 2026-09-22) */
const majlisSources: Source[] = [
  { id: 'wiki-majlis', level: 6, publisher: 'Wikipedia', title: 'Majlis', url: 'https://en.wikipedia.org/wiki/Majlis', accessed: '2026-09-22' },
  { id: 'wiki-al-sadu', level: 6, publisher: 'Wikipedia', title: 'Al Sadu', url: 'https://en.wikipedia.org/wiki/Al_Sadu', accessed: '2026-09-22' },
  { id: 'aramcoworld-sadu', level: 6, publisher: 'AramcoWorld', title: 'The cultural expression of Sadu weaving', url: 'https://www.aramcoworld.com/articles/2025/ja25/al-sadu-weaves-stories-of-culture-and-identity', accessed: '2026-09-22' },
  { id: 'wiki-bisht-clothing', level: 6, publisher: 'Wikipedia', title: 'Bisht (clothing)', url: 'https://en.wikipedia.org/wiki/Bisht_(clothing)', accessed: '2026-09-22' },
  { id: 'wiki-dallah', level: 6, publisher: 'Wikipedia', title: 'Dallah', url: 'https://en.wikipedia.org/wiki/Dallah', accessed: '2026-09-22' },
  { id: 'alriyadh-dallah', level: 6, publisher: 'جريدة الرياض', title: 'دلة القهوة.. الأصالة والكرم', url: 'https://www.alriyadh.com/2163338', accessed: '2026-09-22' },
  { id: 'moc-saudi-coffee-year', level: 2, publisher: 'وزارة الثقافة السعودية', title: 'عام القهوة السعودية 2022 — المبادرة الرسمية', url: 'https://engage.moc.gov.sa/year-of-saudi-coffee/?lang=ar', date: '2022', accessed: '2026-09-23' },
  { id: 'moc-saudi-coffee-rename', level: 2, publisher: 'وزارتا الثقافة والتجارة السعوديتان', title: 'اعتماد اسم «القهوة السعودية» بدلًا من «القهوة العربية» في جميع منافذ البيع بالمملكة', url: 'https://engage.moc.gov.sa/year-of-saudi-coffee/track-911/', accessed: '2026-09-23' },
  { id: 'saudipedia-youth-percentage', level: 2, publisher: 'سعوديبيديا (الموسوعة السعودية) — عن الهيئة العامة للإحصاء', title: 'What is the percentage of youth in the Kingdom?', url: 'https://saudipedia.com/en/what-is-the-percentage-of-youth-in-the-kingdom', accessed: '2026-09-22' },
]
for (const s of majlisSources) sources[s.id] = s

/** مصادر «الأمن الوطني» — تحقّق من مادة الفريق (قيد المراجعة) مقابل مصادر رسمية (قُرئت 2026-09-23) */
const securitySources: Source[] = [
  { id: 'sahl-pillars', level: 6, publisher: 'منصة سهل (محتوى منهج الدراسات الاجتماعية، الصف الأول متوسط)', title: 'ركائز الأمن الوطني', url: 'https://sahl.io/sa/lesson/4889', accessed: '2026-09-23' },
  { id: 'wiki-moi-sa', level: 6, publisher: 'ويكيبيديا', title: 'وزارة الداخلية (السعودية)', url: 'https://ar.wikipedia.org/wiki/وزارة_الداخلية_(السعودية)', accessed: '2026-09-23' },
  { id: 'saudipedia-moi', level: 2, publisher: 'سعوديبيديا (الموسوعة السعودية)', title: 'وزارة الداخلية', url: 'https://saudipedia.com/en/ministry-of-interior', accessed: '2026-09-23' },
  { id: 'wiki-mod-sa', level: 6, publisher: 'ويكيبيديا', title: 'وزارة الدفاع (السعودية)', url: 'https://ar.wikipedia.org/wiki/وزارة_الدفاع_(السعودية)', accessed: '2026-09-23' },
  { id: 'saudipedia-mod', level: 2, publisher: 'سعوديبيديا (الموسوعة السعودية)', title: 'وزارة الدفاع', url: 'https://saudipedia.com/article/10093', accessed: '2026-09-23' },
  { id: 'wiki-state-security', level: 6, publisher: 'ويكيبيديا', title: 'رئاسة أمن الدولة (السعودية)', url: 'https://ar.wikipedia.org/wiki/رئاسة_أمن_الدولة_(السعودية)', accessed: '2026-09-23' },
  { id: 'saudipedia-state-security', level: 2, publisher: 'سعوديبيديا (الموسوعة السعودية)', title: 'رئاسة أمن الدولة', url: 'https://saudipedia.com/article/10141', accessed: '2026-09-23' },
  { id: 'argaam-state-security-decree', level: 6, publisher: 'أرقام (Argaam)', title: 'أمر ملكي: إنشاء جهاز «رئاسة أمن الدولة»', url: 'https://www.argaam.com/ar/article/articledetail/id/496453', date: '2017-07-20', accessed: '2026-09-23' },
  { id: 'wiki-national-guard-sa', level: 6, publisher: 'ويكيبيديا', title: 'الحرس الوطني (السعودية)', url: 'https://ar.wikipedia.org/wiki/الحرس_الوطني_(السعودية)', accessed: '2026-09-23' },
  { id: 'saudipedia-national-guard', level: 2, publisher: 'سعوديبيديا (الموسوعة السعودية)', title: 'وزارة الحرس الوطني', url: 'https://saudipedia.com/article/4393', accessed: '2026-09-23' },
]
for (const s of securitySources) sources[s.id] = s
for (const s of architectureSources) sources[s.id] = s
