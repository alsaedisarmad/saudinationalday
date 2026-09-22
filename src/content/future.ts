import type { Certainty, Gated } from './types'

/**
 * «نحو المستقبل» — رؤية السعودية ٢٠٣٠ (موثّق ومستهدف) ومشاريعها.
 * كل جملة منسوبة إلى صفحة رسمية قُرئت 2026-09-19 (الجمل الحرفية في research/_parts/future_facts.md).
 * القاعدة: ما حدث = certainty:'documented' · ما هو هدف أو خطة = 'vision' وتظهر له شارة «مستهدف».
 * لا رقم بلا صفحة رسمية؛ وكل رقم مؤرَّخ (السنة + المصدر).
 */
export type PillarId = 'society' | 'economy' | 'nation'
export type FutureKind = 'origin' | 'pillar' | 'theme' | 'project' | 'milestone'

/** جملة واحدة مستقلة داخل بطاقة، لها يقينها الخاص (مثلًا: تدشين مشروع = موثّق، وهدفه المعلن = مستهدف) */
export interface FutureFact {
  text: string
  certainty: Certainty
  year?: number
}

/** رقم مؤرَّخ: value + unit + label، و`year` هي سنة الصفحة/الهدف، و`asOf` نصّ يظهر للزائر */
export interface FutureFigure {
  value: string
  unit: string
  label: string
  certainty: Certainty
  year: number
  asOf: string
}

export interface FutureItem extends Gated {
  id: string
  kind: FutureKind
  title: string
  /** نص قصير (≤ ٣ جمل) */
  text: string
  /** سنة صريحة للحدث/الوثيقة */
  year: number
  /** تاريخ كما يُقرأ للزائر (اختياري) */
  when?: string
  /** وسم قصير يوضّح ما تعنيه السنة (يظهر تحت اسم النجمة على الخريطة) */
  tag?: string
  /** للركائز والمحاور الفرعية */
  pillar?: PillarId
  /** ربط تحريري: أي ركائز يخدمها المشروع بحسب أهدافه المعلنة في صفحته الرسمية */
  serves?: PillarId[]
  /** موقع على مستوى المنطقة الإدارية فقط (لا إحداثيات دقيقة) */
  regionId?: string
  /** وصف الموقع كما ورد في المصدر */
  where?: string
  /** حدث على مستوى المملكة كلها (بلا نقطة منطقة) */
  national?: boolean
  facts?: FutureFact[]
  figures?: FutureFigure[]
  /** العناوين الفرعية للفصل كما وردت في وثيقة الرؤية (للمحاور الفرعية) */
  commitments?: string[]
  /** صورة حقيقية مرخّصة (content/photos.ts) — فقط لمشروع قائم وموثَّق بصريًا، لا تصوّرات ترويجية لمشروع قيد الإنشاء */
  photoId?: string
}

export const futureLabels = {
  documented: 'موثّق',
  vision: 'مستهدف',
  creative: 'تصوّر إبداعي',
  mapNote: 'الموقع تقريبي على مستوى المنطقة',
  nationalNote: 'على مستوى المملكة',
  themesOf: 'المحاور الفرعية في وثيقة الرؤية',
  projectsOf: 'مشاريع تخدم أهدافها المعلنة',
  projectsNote: 'الربط بين الركيزة والمشروع ربط تحريري بحسب أهداف المشروع المعلنة في صفحته الرسمية.',
  officialWords: 'من نص الوثيقة الرسمية',
  commitments: 'عناوين الفصل في الوثيقة',
  allPillars: 'كل الركائز',
  onGround: 'على الأرض',
  worldStage: 'محطات عالمية',
}

export const futureIntro = {
  kicker: 'رؤية ٢٠٣٠',
  title: 'نحو المستقبل',
  lead: 'ثلاث ركائز رسمتها الرؤية للوطن. المس نجمة ركيزةٍ لتُضيء خيطها، ثم انظر أين تلتقي الرؤية بالأرض.',
  creative: 'النجوم والخيوط رمزٌ فنّي؛ والوقائع منسوبة إلى مصادرها.',
  mapAlt: 'خريطة المملكة ليلًا، عليها نجوم المشاريع في مناطقها (الموقع تقريبي على مستوى المنطقة)',
}

/** جملة الختام: تربط بـ«عزّنا بطبعنا» وعنوان مجلة الفريق «من قيمنا إلى رؤيتنا» */
export const futureClosing: Gated & { slogan: string; line: string; quote: string; quoteFrom: string } = {
  slogan: 'عزّنا بطبعنا',
  line: 'من قيمنا إلى رؤيتنا',
  quote: 'هويتنا ليست عائقًا أمام المستقبل، بل يمكن أن تكون جزءًا من صناعته.',
  quoteFrom: 'من مجلة الفريق «من قيمنا إلى رؤيتنا»',
  status: 'verified',
  sourceIds: ['team-magazine', 'spa-identity-2026'],
}

/** سطر الفريق تحت ركيزة «وطن طموح» (مواطنه مسؤول) — من صفحة «شباب اليوم.. قادة الغد» في مجلة الفريق */
export const futureNationNote: Gated & { text: string; from: string } = {
  text: 'قد لا نبني مشروعًا ضخمًا اليوم، لكننا نبني الإنسان الذي سيشارك في بناء مشاريع الغد.',
  from: 'من مجلة الفريق: «شباب اليوم.. قادة الغد»',
  status: 'verified',
  sourceIds: ['team-magazine'],
}

export const futurePillarOrder: PillarId[] = ['society', 'economy', 'nation']

const DOC = ['fut-v2030-doc']
const OV = ['fut-v2030-overview']

export const futureItems: FutureItem[] = [
  // ——— نجمة البداية: إقرار الرؤية ———
  {
    id: 'vision-2016',
    kind: 'origin',
    title: 'انطلاق الرؤية',
    year: 2016,
    when: '٢٥ أبريل ٢٠١٦م',
    tag: 'أُقرّت ٢٠١٦م',
    text: 'في ٢٥ أبريل ٢٠١٦م وافق مجلس الوزراء على رؤية المملكة العربية السعودية ٢٠٣٠. وترتكز الرؤية، بحسب موقعها الرسمي، على ثلاث قوى: العمق العربي والإسلامي، والقوة الاستثمارية، والموقع الاستراتيجي بين ثلاث قارات.',
    facts: [{ text: 'صُمّمت الرؤية لتُنفَّذ على ثلاث مراحل رئيسية، تمتد كل مرحلة منها خمس سنوات.', certainty: 'documented', year: 2016 }],
    status: 'verified',
    certainty: 'documented',
    sourceIds: ['spa-vision-2030', ...OV],
  },

  // ——— الركائز الثلاث (نص الصفحة الرسمية «نبذة تعريفية») ———
  {
    id: 'pillar-society',
    kind: 'pillar',
    pillar: 'society',
    title: 'مجتمع حيوي',
    year: 2016,
    text: 'تسعى الرؤية إلى توفير الرفاهية والازدهار للمواطنين، وزيادة اعتزازهم بتاريخهم وتراثهم الممتد وهويتهم الثقافية الفريدة. ويكون ذلك بنمط حياة صحي مستدام، وأنظمة رعاية صحية واجتماعية فعّالة، وخيارات ترفيه عالمية المستوى، وروح متسامحة تعكس قيم الإسلام.',
    status: 'verified',
    certainty: 'vision',
    sourceIds: OV,
  },
  {
    id: 'pillar-economy',
    kind: 'pillar',
    pillar: 'economy',
    title: 'اقتصاد مزدهر',
    year: 2016,
    text: 'تبني الرؤية اقتصادًا ينعم فيه الجميع بفرص متعددة للنجاح، بتوفير بيئة عمل داعمة للشركات الصغيرة والمتوسطة والكبيرة، والاستثمار في التعليم استعدادًا لوظائف المستقبل.',
    status: 'verified',
    certainty: 'vision',
    sourceIds: OV,
  },
  {
    id: 'pillar-nation',
    kind: 'pillar',
    pillar: 'nation',
    title: 'وطن طموح',
    year: 2016,
    text: 'تتحقق الرؤية في وطن طموح يلتزم بالكفاءة والمسؤولية، وتديره حكومة فاعلة عالية الأداء، تتسم بالشفافية، وتخضع للمساءلة على جميع المستويات.',
    status: 'verified',
    certainty: 'vision',
    sourceIds: OV,
  },

  // ——— المحاور الفرعية التسعة كما في فهرس وثيقة الرؤية (٢٠١٦) ———
  {
    id: 'theme-roots',
    kind: 'theme',
    pillar: 'society',
    title: 'قيمه راسخة',
    year: 2016,
    text: 'تقول الوثيقة: تكمن ثروتنا الحقيقية في مجتمعنا وأفراده، وديننا الإسلامي ووحدتنا الوطنية اللذان هما مصدر اعتزازنا وتميزنا.',
    commitments: ['نحيا وفق مبادئنا الإسلامية', 'نعتز بهويتنا الوطنية', 'نُسخّر طاقاتنا وإمكاناتنا لخدمة ضيوف الرحمن'],
    status: 'verified',
    certainty: 'vision',
    sourceIds: DOC,
    note: 'الفصل ص١٦ في الطباعة؛ الجملة من الفقرة الافتتاحية.',
  },
  {
    id: 'theme-environment',
    kind: 'theme',
    pillar: 'society',
    title: 'بيئته عامرة',
    year: 2016,
    text: 'تقول الوثيقة: تأتي سعادة المواطنين والمقيمين على رأس أولوياتنا، وسعادتهم لا تتم دون اكتمال صحتهم البدنية والنفسية والاجتماعية.',
    commitments: ['نعيش حياة صحية', 'ندعم الثقافة والترفيه', 'نُطوّر مدننا', 'نُحقق استدامة بيئية'],
    status: 'verified',
    certainty: 'vision',
    sourceIds: DOC,
    note: 'الفصل ص٢٢. العنوانان الأخيران قُرئا من نص الملف (استخراج آلي)، والأولان بصريًا.',
  },
  {
    id: 'theme-foundation',
    kind: 'theme',
    pillar: 'society',
    title: 'بنيانه متين',
    year: 2016,
    text: 'تقول الوثيقة: هدفنا تعزيز مبادئ الرعاية الاجتماعية وتطويرها لبناء مجتمع قوي ومنتج، ويبدأ ذلك بتعزيز دور الأسرة.',
    commitments: ['نهتم بأسرنا', 'نبني شخصيات أبنائنا'],
    status: 'verified',
    certainty: 'vision',
    sourceIds: DOC,
    note: 'الفصل ص٢٨ (العنوانان قُرئا بصريًا).',
  },
  {
    id: 'theme-opportunity',
    kind: 'theme',
    pillar: 'economy',
    title: 'فرصه مثمرة',
    year: 2016,
    text: 'تقول الوثيقة: مهارات أبنائنا وقدراتهم من أهم مواردنا، وسنسعى إلى الاستفادة القصوى من طاقاتهم بإتاحة الفرص للجميع وإكسابهم المهارات اللازمة.',
    commitments: ['نتعلّم لنعمل', 'ندعم منشآتنا الناشئة والصغيرة والمتوسطة والأسر المنتجة'],
    status: 'verified',
    certainty: 'vision',
    sourceIds: DOC,
    note: 'الفصل ص٣٦.',
  },
  {
    id: 'theme-investment',
    kind: 'theme',
    pillar: 'economy',
    title: 'استثماره فاعل',
    year: 2016,
    text: 'تقول الوثيقة: تنويع الاقتصاد من أهم مقومات استدامته؛ فالنفط والغاز دعامة أساسية، لكن الرؤية تتوسع في الاستثمار في قطاعات إضافية.',
    commitments: ['نعظّم قدراتنا الاستثمارية', 'نُطلق قطاعاتنا الواعدة', 'نُخصخص خدماتنا الحكومية'],
    status: 'verified',
    certainty: 'vision',
    sourceIds: DOC,
    note: 'الفصل ص٤٢. أُسقطت أرقام النمو الواردة في الفقرة لأنها من ٢٠١٦.',
  },
  {
    id: 'theme-competitive',
    kind: 'theme',
    pillar: 'economy',
    title: 'تنافسيته جاذبة',
    year: 2016,
    text: 'تقول الوثيقة: إن الانفتاح على التجارة والأعمال سيمكننا من النمو والمنافسة مع الاقتصادات المتقدمة، وسيساعدنا على زيادة إنتاجيتنا.',
    commitments: ['نحسّن بيئة الأعمال', 'نعيد تأهيل المدن الاقتصادية'],
    status: 'verified',
    certainty: 'vision',
    sourceIds: DOC,
    note: 'الفصل ص٤٨.',
  },
  {
    id: 'theme-location',
    kind: 'theme',
    pillar: 'economy',
    title: 'موقعه مستغل',
    year: 2016,
    text: 'تقول الوثيقة: يقع وطننا في ملتقى أهم طرق التجارة العالمية، وسنستغلّ موقعنا الجغرافي المتفرد في زيادة تدفق التجارة العالمية بين آسيا وأوروبا وأفريقيا.',
    commitments: ['ننشئ منصة لوجستية مميزة', 'نتكامل إقليميًا ودوليًا'],
    status: 'verified',
    certainty: 'vision',
    sourceIds: DOC,
    note: 'الفصل ص٥٤.',
  },
  {
    id: 'theme-government',
    kind: 'theme',
    pillar: 'nation',
    title: 'حكومته فاعلة',
    year: 2016,
    text: 'تقول الوثيقة: تنامى دور الحكومة منذ تأسيس المملكة بشكل كبير، ولذلك سنسعى إلى العمل وفق معايير عالية من الشفافية والمساءلة، وإدارة مواردنا المالية بكفاءة واقتدار.',
    commitments: ['ننتهج الشفافية', 'نحافظ على مواردنا الحيوية'],
    status: 'verified',
    certainty: 'vision',
    sourceIds: DOC,
    note: 'الفصل ص٦٠.',
  },
  {
    id: 'theme-citizen',
    kind: 'theme',
    pillar: 'nation',
    title: 'مواطنه مسؤول',
    year: 2016,
    text: 'تقول الوثيقة: الوطن الذي ننشده لا يكتمل إلا بتكامل أدوارنا؛ فلدينا جميعًا مسؤوليات تجاه وطننا ومجتمعنا وأسرنا وتجاه أنفسنا كذلك.',
    commitments: ['نتحمل المسؤولية في حياتنا', 'نتحمل المسؤولية في أعمالنا', 'نتحمل المسؤولية في مجتمعنا'],
    status: 'verified',
    certainty: 'vision',
    sourceIds: DOC,
    note: 'الفصل ص٦٨.',
  },

  // ——— مشاريع المجلة الأربعة: نيوم · القدية · البحر الأحمر · الدرعية ———
  {
    id: 'neom',
    kind: 'project',
    title: 'نيوم',
    year: 2017,
    tag: 'أُطلق ٢٠١٧م',
    regionId: 'tabuk',
    where: 'شمال غرب المملكة، على ساحل البحر الأحمر',
    serves: ['economy'],
    text: 'أُطلق مشروع نيوم عام ٢٠١٧م بقيادة صندوق الاستثمارات العامة، في شمال غرب المملكة على ساحل البحر الأحمر. وتصفه صفحته الرسمية بأنه نموذج جديد للحياة المستدامة والعمل والازدهار.',
    facts: [
      { text: 'من أهدافه المعلنة: تنمية اقتصاد المملكة وتنويعه ووضعها على خريطة الريادة العالمية في التنمية والتطوير.', certainty: 'vision' },
      { text: 'يستهدف أن تعمل المنطقة بنسبة ١٠٠٪ بالطاقة المتجددة.', certainty: 'vision' },
    ],
    figures: [{ value: '٢٦٬٥٠٠', unit: 'كم²', label: 'مساحة نيوم', certainty: 'documented', year: 2026, asOf: 'الموقع الرسمي لنيوم، قُرئ ٢٠٢٦م' }],
    status: 'verified',
    certainty: 'documented',
    sourceIds: ['fut-v2030-neom', 'fut-neom-official', 'fut-saudipedia-tabuk'],
    note: 'صفحة الرؤية تعرض «26.5 كم²» (خطأ وحدة) — استُعمل الرقم المتطابق في neom.com وسعوديبيديا.',
  },
  {
    id: 'qiddiya',
    kind: 'project',
    title: 'القدية',
    year: 2018,
    tag: 'دُشّنت ٢٠١٨م',
    regionId: 'riyadh',
    where: 'منطقة الرياض',
    serves: ['society', 'economy'],
    text: 'دشّن خادم الحرمين الشريفين الملك سلمان بن عبدالعزيز مشروع القدية عام ٢٠١٨م، وبدأت الإنشاءات في العام التالي. وهو مشروع يركّز على الترفيه والرياضة والثقافة.',
    facts: [{ text: 'يستهدف أن يكون عاصمة المستقبل للترفيه والرياضة والثقافة في المملكة، وأن يوفر فرصًا جديدة لشباب المملكة وشاباتها.', certainty: 'vision' }],
    figures: [
      { value: '٣٦٠+', unit: 'كم²', label: 'المساحة الإجمالية للمدينة', certainty: 'vision', year: 2024, asOf: 'صفحة الرؤية، آخر تحديث أغسطس ٢٠٢٤م' },
      { value: '٤٨', unit: 'مليون زيارة سنويًا', label: 'المستهدف عند التشغيل الكامل', certainty: 'vision', year: 2024, asOf: 'صفحة الرؤية، آخر تحديث أغسطس ٢٠٢٤م' },
    ],
    status: 'verified',
    certainty: 'documented',
    sourceIds: ['fut-v2030-qiddiya'],
    note: 'موضع النقطة: منطقة الرياض (الصفحة: «في قلب الرياض»). لم تُستعمل أرقام السكان والوظائف.',
  },
  {
    id: 'red-sea',
    kind: 'project',
    title: 'البحر الأحمر',
    year: 2023,
    tag: 'أول ضيوفها ٢٠٢٣م',
    regionId: 'tabuk',
    where: 'الساحل الغربي للمملكة، بين أملج والوجه',
    serves: ['economy'],
    text: 'استقبلت وجهة البحر الأحمر ضيوفها الأوائل عام ٢٠٢٣م بافتتاح منتجع «سيكس سنسز الكثبان الجنوبية». وتمتد على الساحل الغربي للمملكة بين أملج والوجه، وتضم أكثر من ٩٠ جزيرة بكرًا.',
    facts: [
      { text: 'من أهدافه المعلنة: دفع عجلة الاقتصاد وتنويع مصادره، وتحسين نوعية الحياة للمجتمعات المحيطة.', certainty: 'vision' },
      { text: 'من المقرر أن تضم الوجهة عند إنجاز جميع مراحلها عام ٢٠٣٠م نحو ٥٠ منتجعًا.', certainty: 'vision', year: 2030 },
    ],
    figures: [
      { value: '٢٨٬٠٠٠', unit: 'كم²', label: 'مساحة الوجهة', certainty: 'documented', year: 2026, asOf: 'صفحة الرؤية وموقع الشركة، قُرئا ٢٠٢٦م' },
      { value: '٩٠+', unit: 'جزيرة بكر', label: 'ضمن الوجهة', certainty: 'documented', year: 2026, asOf: 'صفحة الرؤية، ٢٠٢٦م' },
      { value: '٥٠', unit: 'منتجعًا', label: 'المستهدف عند اكتمال المراحل', certainty: 'vision', year: 2030, asOf: 'صفحة الرؤية، ٢٠٢٦م' },
    ],
    status: 'verified',
    certainty: 'documented',
    sourceIds: ['fut-v2030-redsea', 'fut-rsg-official', 'fut-saudipedia-tabuk'],
    note: 'موضع النقطة: منطقة تبوك (سعوديبيديا: «Within its territory … NEOM, AMAALA, and the Red Sea Project»).',
  },
  {
    id: 'diriyah',
    kind: 'project',
    title: 'الدرعية',
    photoId: 'at-turaif',
    year: 2010,
    tag: 'اليونسكو ٢٠١٠م',
    when: 'قائمة اليونسكو للتراث العالمي — ٢٠١٠م',
    regionId: 'riyadh',
    where: '١٥ دقيقة شمال غرب الرياض',
    serves: ['society'],
    text: 'تقع الدرعية على بعد ١٥ دقيقة شمال غرب الرياض، وتحتضن حي الطريف التاريخي المسجّل في قائمة اليونسكو للتراث العالمي منذ عام ٢٠١٠م. وتصفه صفحة الرؤية الرسمية بأنه مهد انطلاق الدولة السعودية. ويجري تطويرها ضمن مشروع بوابة الدرعية المملوك لصندوق الاستثمارات العامة.',
    facts: [{ text: 'يستهدف المشروع أن يمزج بين التاريخ العريق والمعالم العصرية، وأن يحتفي بالتراث السعودي الأصيل.', certainty: 'vision' }],
    figures: [{ value: '٥٠+', unit: 'مليون زيارة سنويًا', label: 'المستهدف في عام ٢٠٣٠م', certainty: 'vision', year: 2030, asOf: 'صفحة الرؤية الرسمية، ٢٠٢٦م' }],
    status: 'verified',
    certainty: 'documented',
    sourceIds: ['fut-v2030-diriyah', 'unesco-whc-1329'],
    note: 'لم تُستعمل «أكثر من ٦٠٠ عام» (ترويج) ولا قيمة المشروع (تعارض بين النسختين العربية والإنجليزية).',
  },

  // ——— محطات عالمية ———
  {
    id: 'expo-2030',
    kind: 'milestone',
    title: 'إكسبو الرياض ٢٠٣٠',
    year: 2023,
    tag: 'اختيرت ٢٠٢٣م',
    when: '٢٨ نوفمبر ٢٠٢٣م',
    regionId: 'riyadh',
    where: 'مدينة الرياض',
    text: 'في ٢٨ نوفمبر ٢٠٢٣م صوّتت الدول الأعضاء في المكتب الدولي للمعارض (BIE) لصالح ملف المملكة لاستضافة معرض إكسبو العالمي ٢٠٣٠ في مدينة الرياض. وجرى ذلك في الجمعية العامة الـ١٧٣ للمكتب في باريس.',
    facts: [{ text: 'من المقرر أن يُقام المعرض بين ١ أكتوبر ٢٠٣٠م و٣١ مارس ٢٠٣١م.', certainty: 'vision', year: 2030 }],
    status: 'verified',
    certainty: 'documented',
    sourceIds: ['fut-bie-173'],
    note: 'لم يُذكر عدد الأصوات (لم يُقرأ في صفحة رسمية)، ولا ترجمة شعار المعرض العربية.',
  },
  {
    id: 'world-cup-2034',
    kind: 'milestone',
    title: 'كأس العالم ٢٠٣٤',
    year: 2024,
    tag: 'اختيرت ٢٠٢٤م',
    when: '١١ ديسمبر ٢٠٢٤م',
    national: true,
    where: 'المملكة العربية السعودية',
    text: 'في ١١ ديسمبر ٢٠٢٤م اختار مؤتمر الفيفا الاستثنائي، الذي جمع ٢١١ اتحادًا عضوًا عبر الاتصال المرئي، المملكة العربية السعودية لاستضافة كأس العالم ٢٠٣٤. وجاء تعيين المضيفين بالتزكية.',
    status: 'verified',
    certainty: 'documented',
    sourceIds: ['fut-fifa-2034'],
    note: 'بلا نقطة منطقة: لم تُقرأ المدن/الملاعب من مصدر رسمي.',
  },
]

export const futureById = (id: string) => futureItems.find((i) => i.id === id)
export const futureOfKind = (kind: FutureKind) => futureItems.filter((i) => i.kind === kind)
export const pillarItem = (p: PillarId) => futureItems.find((i) => i.kind === 'pillar' && i.pillar === p)!
export const themesOf = (p: PillarId) => futureItems.filter((i) => i.kind === 'theme' && i.pillar === p)
export const projectsServing = (p: PillarId) => futureItems.filter((i) => i.kind === 'project' && i.serves?.includes(p))
/** المشاريع والمحطات التي لها نقطة على مستوى منطقة إدارية */
export const mappableItems = () => futureItems.filter((i) => (i.kind === 'project' || i.kind === 'milestone') && i.regionId)
