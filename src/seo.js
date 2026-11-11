// Per-page SEO: titles, descriptions, FAQs and structured data.
// Imported by the app (FAQ section, title updates) and by vite.config.js
// (injects <head> tags into each HTML page at build time).

// Change this one value if the domain changes.
export const SITE_URL = 'https://growvita.app';
export const SITE_NAME = 'GrowVita';
export const OG_IMAGE = `${SITE_URL}/og-image.jpg`;
// Optional: your X (Twitter) handle, e.g. '@growvita'. Leave empty if none.
export const TWITTER_HANDLE = '';

// Per-page social cards (1200x630, in /public)
const SOCIAL = {
  home: ['og-image.jpg', 'GrowVita – child growth, pregnancy and period calculators by Dr Mir Bilal'],
  growth: ['og-growth.jpg', 'GrowVita child growth chart and percentile calculator (WHO 2006, IAP 2015)'],
  milestones: ['og-milestones.jpg', 'GrowVita developmental milestones checklist with DQ score'],
  period: ['og-period.jpg', 'GrowVita period and ovulation calculator with fertile window'],
  edd: ['og-edd.jpg', 'GrowVita due date and pregnancy week calculator'],
  nutrition: ['og-nutrition.jpg', 'GrowVita baby and child food chart by age'],
};
export const socialImage = (key) => `${SITE_URL}/${(SOCIAL[key] || SOCIAL.home)[0]}`;
const socialAlt = (key) => (SOCIAL[key] || SOCIAL.home)[1];

export const AUTHOR = {
  '@type': 'Person',
  '@id': `${SITE_URL}/#author`,
  name: 'Dr Mir Bilal',
  honorificSuffix: 'MBBS, MD Pediatrics',
  jobTitle: 'Pediatrician',
  email: 'mailto:medladder@gmail.com',
  knowsAbout: ['Pediatrics', 'Child growth', 'Developmental milestones', 'Child nutrition', 'Maternal health'],
};

// Bump when the medical content is reviewed again.
export const LAST_REVIEWED = '2026-11-11';

export const PAGES = {
  home: {
    path: '/',
    file: 'index.html',
    name: 'Home',
    title: 'GrowVita: Child Growth, Pregnancy & Period Calculators',
    description:
      'Free child growth chart (WHO & IAP), baby milestones, due date, period and ovulation calculators and a food chart, by pediatrician Dr Mir Bilal.',
    faqs: [
      ['What is GrowVita?',
        'GrowVita is a free set of health calculators for parents and doctors: a child growth chart and percentile calculator (WHO and IAP), developmental milestones by age, a due date (EDD) calculator, a period and ovulation calendar, and an age-wise nutrition guide.'],
      ['Who made GrowVita?',
        'GrowVita is built and clinically reviewed by Dr Mir Bilal, MBBS, MD Pediatrics.'],
      ['Is GrowVita free?',
        'Yes. All tools are free to use with no sign-up.'],
      ['Is my data private?',
        'Yes. Calculations run in your browser and the details you enter are not sent to a server.'],
      ['Can GrowVita replace a doctor visit?',
        'No. The tools are for education and screening support. Always discuss growth, development, pregnancy or menstrual concerns with your doctor.'],
    ],
  },

  growth: {
    path: '/growth.html',
    file: 'growth.html',
    name: 'Child Growth Chart',
    appName: 'Child Growth Chart & Percentile Calculator',
    features: ["WHO Child Growth Standards 2006 (0–5 years)", "IAP 2015 Indian charts (5–18 years) or WHO 2007 reference", "Height/length, weight, BMI and head circumference centiles and z-scores", "BMI categories per reference (WHO, IAP adult-equivalent 23/27)", "Mid-parental target height", "Interactive growth chart and visit log"],
    prefill: {"template": "sex={sex}&years={years}&months={months}&height={height}&weight={weight}&hc={hc}&father={father}&mother={mother}&ref={ref}", "params": {"sex": "male|female", "years": "0-18", "months": "0-11", "height": "cm", "weight": "kg", "hc": "cm", "father": "cm", "mother": "cm", "ref": "iap2015|who2007"}, "example": "sex=male&years=2&months=6&height=88&weight=12.5&hc=48", "note": "age_months may replace years+months; hc only up to 5 years; ref selects the 5–18 year reference (default iap2015)"},
    title: 'Child Growth Chart & Percentile Calculator | GrowVita',
    description:
      'Check height, weight, BMI and head circumference percentiles on WHO and IAP growth charts, plus mid-parental target height. Ages 0–18 years.',
    faqs: [
      ['What does a growth percentile mean?',
        'A percentile compares your child with 100 children of the same age and sex. At the 50th percentile, 50 children are smaller and 50 are bigger. At the 10th percentile, 10 of 100 children are smaller.'],
      ['What is a normal percentile for height and weight?',
        'Most healthy children fall between the 3rd and 97th percentile. A steady line over time matters more than a single reading. Values below the 3rd or above the 97th, or a drop or rise across two major percentile lines, should be checked by a doctor.'],
      ['Which growth chart should I use, WHO or another?',
        'The WHO growth standards are used internationally for children under 5. For older children, many countries use a national reference: in the US, the CDC recommends WHO charts up to age 2 and CDC charts from 2 to 19. GrowVita offers WHO charts and the IAP 2015 charts for ages 5 to 18.'],
      ['How is a child’s BMI interpreted?',
        'Child BMI is read against age- and sex-specific charts, not adult cut-offs. Under 5 (WHO): above +2 SD is overweight and above +3 SD obesity. From 5 to 18, the IAP 2015 charts use the lines equivalent to an adult BMI of 23 (overweight) and 27 (obesity); WHO 2007 uses +1 SD and +2 SD. US CDC charts use the 85th and 95th percentiles.'],
      ['What is mid-parental (target) height?',
        'It estimates a child’s adult height from the parents’ heights. For boys: (father’s height + mother’s height + 13 cm) ÷ 2. For girls: (father’s height + mother’s height − 13 cm) ÷ 2. Most children end within about 8.5 cm of this value.'],
      ['How do I measure my child’s height correctly?',
        'Under 2 years, measure length lying down. From 2 years, measure standing height without shoes, heels against the wall, looking straight ahead. Lying length is about 0.7 cm more than standing height.'],
    ],
  },

  milestones: {
    path: '/milestones.html',
    file: 'milestones.html',
    name: 'Developmental Milestones',
    appName: 'Developmental Milestones Checklist',
    features: ["CDC milestone checklist by age (2 months – 5 years)", "Five-domain scoring: gross motor, fine motor, language, cognitive, social-emotional", "Items scored 0/1/2 across basal, current and ceiling checkpoints", "Developmental quotient (DQ) per domain and composite, with interpretation bands", "Global developmental delay flag (DQ < 70 in ≥ 2 domains)", "Red flags by age"],
    prefill: {"template": "years={years}&months={months}", "params": {"years": "0-18", "months": "0-11"}, "example": "years=2&months=0", "note": "age_months may replace years+months; DQ scoring is available from 12 months to 6 years"},
    title: 'Developmental Milestones by Month (0–5 Yrs) | GrowVita',
    description:
      'Developmental milestones from 2 months to 5 years, with a 5-domain score and developmental quotient (DQ), plus red flags to discuss with your doctor.',
    faqs: [
      ['When do babies smile, sit, crawl and walk?',
        'Most babies give a social smile by 6–8 weeks, hold their head steady by 3–4 months, roll over by 4–6 months, sit without support by 6–8 months, crawl around 9 months and walk alone between 12 and 15 months.'],
      ['When should my baby start talking?',
        'Babbling such as “baba” or “mama” starts around 6–9 months, the first meaningful words around 12 months, and two-word phrases such as “more milk” by 2 years.'],
      ['My baby is late on a milestone. Should I worry?',
        'Children reach milestones across a wide age range, so one slightly late skill is often normal. See your doctor if several milestones are delayed, a red flag sign appears, or your child loses a skill they already had.'],
      ['What are developmental red flags?',
        'Examples include no social smile by 2 months, no head control by 4 months, not sitting by 9 months, not walking by 18 months, no words by 16 months, no two-word phrases by 2 years, and any loss of speech or skills at any age.'],
      ['How do I check milestones for a premature baby?',
        'Use corrected age until about 2 years: subtract the number of weeks your baby was born early from their actual age.'],
      ['How can I help my child’s development?',
        'Talk, sing and read to your child daily, give tummy time to babies, play simple back-and-forth games, and avoid screen time under 2 years except video calls with family.'],
    ],
  },

  period: {
    path: '/period.html',
    file: 'period.html',
    name: 'Period & Ovulation Calculator',
    appName: 'Period & Ovulation Calculator',
    features: ["Next period prediction", "Ovulation day and 6-day fertile window", "Interactive cycle calendar", "Calendar reminders (.ics) the day before and on the day"],
    prefill: {"template": "lmp={lmp}&cycle={cycle}", "params": {"lmp": "YYYY-MM-DD", "cycle": "21-40"}, "example": "lmp=2026-11-01&cycle=28", "note": "lmp = first day of last period"},
    title: 'Period & Ovulation Calculator – Fertile Days | GrowVita',
    description:
      'Predict your next period, ovulation day and fertile window from your last period and cycle length, shown on an interactive monthly calendar.',
    faqs: [
      ['How is my next period calculated?',
        'Your next period is predicted by adding your average cycle length to the first day of your last period. For example, with a 28-day cycle starting on 1 March, the next period is due around 29 March.'],
      ['When am I most fertile?',
        'You are most fertile in the 5 days before ovulation and on ovulation day itself. The chance of pregnancy is highest in the 2 days before ovulation and on the day of ovulation.'],
      ['When do I ovulate?',
        'Ovulation usually happens about 14 days before your next period. That is day 14 only in a 28-day cycle; in a 32-day cycle it is closer to day 18.'],
      ['What is a normal menstrual cycle length?',
        'For adults, a cycle of 21 to 35 days is normal, with bleeding for 2 to 7 days. In the first few years after periods start, cycles of up to 45 days can be normal.'],
      ['Does this work if my periods are irregular?',
        'Predictions are less reliable when cycle length changes from month to month. Ovulation test kits or tracking cervical mucus can help. See a doctor if your cycles are often shorter than 21 days, longer than 35 days, or very unpredictable.'],
      ['Can I use a period calculator as birth control?',
        'No. Calendar predictions are estimates and ovulation can shift with stress, illness or travel. Use a reliable contraceptive method if you want to avoid pregnancy.'],
      ['Can I get pregnant on my period?',
        'It is unlikely but possible, especially with short cycles, because sperm can survive up to 5 days and ovulation may happen soon after bleeding ends.'],
    ],
  },

  edd: {
    path: '/edd.html',
    file: 'edd.html',
    name: 'Due Date Calculator',
    appName: 'Due Date (EDD) Calculator',
    features: ["Due date by Naegele's rule (LMP + 280 days)", "Gestational age in weeks and days", "Trimester progress", "Pregnancy calendar", "Calendar reminders for weeks 36–39 and the due date"],
    prefill: {"template": "lmp={lmp}", "params": {"lmp": "YYYY-MM-DD"}, "example": "lmp=2026-03-17", "note": "lmp = first day of last menstrual period"},
    title: 'Due Date Calculator – EDD & Pregnancy Weeks | GrowVita',
    description:
      'Calculate your due date (EDD) from your last period. See how many weeks pregnant you are, your trimester and key dates on a pregnancy calendar.',
    faqs: [
      ['How is the due date calculated?',
        'The due date (EDD) is calculated with Naegele’s rule: 280 days, or 40 weeks, from the first day of your last menstrual period (LMP). It assumes a regular 28-day cycle.'],
      ['How accurate is my due date?',
        'A due date is an estimate. Only about 4–5% of babies are born on their exact due date; most arrive within 2 weeks before or after it.'],
      ['How many weeks pregnant am I?',
        'Pregnancy weeks are counted from the first day of your last period, not from conception. So at conception you are already about 2 weeks pregnant.'],
      ['What if my cycle is longer or shorter than 28 days?',
        'This calculator assumes a 28-day cycle. If your cycles are regularly longer or shorter, your due date moves later or earlier by about the difference. An early ultrasound gives a more accurate date.'],
      ['Can an ultrasound change my due date?',
        'Yes. An early ultrasound, ideally before 14 weeks, is the most accurate way to date a pregnancy. If it differs from the LMP date by more than about a week, doctors usually use the ultrasound date.'],
      ['When does each trimester start?',
        'The first trimester runs from week 1 to the end of week 13, the second from week 14 to the end of week 27, and the third from week 28 until birth.'],
      ['What counts as full term?',
        'Babies born from 37 weeks are term. 39 to 40 weeks is full term, 37–38 weeks is early term, 41 weeks is late term, and 42 weeks or more is post-term.'],
    ],
  },

  nutrition: {
    path: '/nutrition.html',
    file: 'nutrition.html',
    name: 'Nutrition Guide',
    appName: 'Child Nutrition Guide',
    features: ["Age-wise food chart (0–18 years)", "When and how to start solids", "Meals per day by age", "Balanced meal ideas and feeding tips"],
    title: 'Baby & Child Food Chart by Age – Diet Guide | GrowVita',
    description:
      'Baby and child food chart by age: when to start solids, what to feed at 6 months and 1 year, how many meals a day, and balanced meal ideas.',
    faqs: [
      ['When should I start solid food for my baby?',
        'Start complementary (solid) foods at around 6 months, while continuing breastfeeding. Exclusive breastfeeding is recommended for the first 6 months.'],
      ['What are good first foods for a 6-month-old baby?',
        'Smooth, thick, iron-rich foods such as iron-fortified cereal or porridge, mashed lentils or beans, puréed meat or egg, and mashed vegetables and fruit. Offer one new food at a time.'],
      ['How many meals a day does a baby need?',
        'At 6–8 months, 2–3 meals a day; at 9–11 months, 3–4 meals plus 1–2 snacks; from 12 to 24 months, 3–4 meals plus 1–2 snacks, alongside breastfeeding.'],
      ['When can my baby have cow’s milk?',
        'Avoid cow’s milk as a main drink before 12 months. Small amounts cooked into food are fine after 6 months.'],
      ['Can I give my baby honey, salt or sugar?',
        'Do not give honey before 1 year because of the risk of infant botulism. Avoid added salt and sugar in the first year, and keep sugary foods and drinks to a minimum after that.'],
      ['What should a toddler eat in a day?',
        'Three meals and two snacks with a mix of grains, beans or lentils, vegetables, fruits, milk or yogurt, and eggs, fish or meat if your family eats them. Offer water rather than juice or sweet drinks.'],
      ['My child is a picky eater. What should I do?',
        'Offer small portions of family foods on a regular schedule, keep offering new foods without pressure, avoid filling up on milk or snacks between meals, and eat together. See a doctor if your child is losing weight or falling off their growth curve.'],
    ],
  },
};

export const PAGE_BY_FILE = Object.fromEntries(Object.entries(PAGES).map(([k, p]) => [p.file, k]));

export function pageUrl(key) {
  return SITE_URL + PAGES[key].path;
}

export function buildJsonLd(key) {
  const p = PAGES[key];
  const url = pageUrl(key);
  const graph = [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      inLanguage: 'en',
      publisher: { '@id': `${SITE_URL}/#author` },
    },
    AUTHOR,
    {
      '@type': 'MedicalWebPage',
      '@id': `${url}#webpage`,
      url,
      name: p.title,
      description: p.description,
      inLanguage: 'en',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      author: { '@id': `${SITE_URL}/#author` },
      reviewedBy: { '@id': `${SITE_URL}/#author` },
      lastReviewed: LAST_REVIEWED,
      image: socialImage(key),
      audience: [{ '@type': 'PeopleAudience', audienceType: 'Parents' }, { '@type': 'MedicalAudience', audienceType: 'Clinician' }],
    },
  ];
  if (p.appName) {
    graph.push({
      '@type': 'WebApplication',
      '@id': `${url}#app`,
      name: p.appName,
      url,
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Any (web browser)',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      author: { '@id': `${SITE_URL}/#author` },
      screenshot: socialImage(key),
      ...(p.features ? { featureList: p.features } : {}),
      ...(p.prefill ? { potentialAction: { '@type': 'UseAction', target: { '@type': 'EntryPoint', urlTemplate: `${url}?${p.prefill.template}`, actionPlatform: ['https://schema.org/DesktopWebPlatform', 'https://schema.org/MobileWebPlatform'] } } } : {}),
    });
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: p.name, item: url },
      ],
    });
  }
  if (p.faqs?.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: p.faqs.map(([q, a]) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// <head> tags for a page (title + description are replaced, the rest added).
export function buildHeadTags(key) {
  const p = PAGES[key];
  const url = pageUrl(key);
  const json = JSON.stringify(buildJsonLd(key)).replace(/</g, '\\u003c');
  return [
    `<title>${esc(p.title)}</title>`,
    `<meta name="description" content="${esc(p.description)}"/>`,
    `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1"/>`,
    `<meta name="author" content="Dr Mir Bilal, MBBS, MD Pediatrics"/>`,
    `<link rel="canonical" href="${url}"/>`,
    `<meta property="og:type" content="website"/>`,
    `<meta property="og:site_name" content="${SITE_NAME}"/>`,
    `<meta property="og:locale" content="en_US"/>`,
    `<meta property="og:title" content="${esc(p.title)}"/>`,
    `<meta property="og:description" content="${esc(p.description)}"/>`,
    `<meta property="og:url" content="${url}"/>`,
    `<meta property="og:image" content="${socialImage(key)}"/>`,
    `<meta property="og:image:secure_url" content="${socialImage(key)}"/>`,
    `<meta property="og:image:type" content="image/jpeg"/>`,
    `<meta property="og:image:width" content="1200"/>`,
    `<meta property="og:image:height" content="630"/>`,
    `<meta property="og:image:alt" content="${esc(socialAlt(key))}"/>`,
    `<meta name="twitter:card" content="summary_large_image"/>`,
    ...(TWITTER_HANDLE ? [`<meta name="twitter:site" content="${esc(TWITTER_HANDLE)}"/>`] : []),
    `<meta name="twitter:title" content="${esc(p.title)}"/>`,
    `<meta name="twitter:description" content="${esc(p.description)}"/>`,
    `<meta name="twitter:image" content="${socialImage(key)}"/>`,
    `<meta name="twitter:image:alt" content="${esc(socialAlt(key))}"/>`,
    `<meta name="application-name" content="${SITE_NAME}"/>`,
    `<meta name="apple-mobile-web-app-title" content="${SITE_NAME}"/>`,
    `<meta name="apple-mobile-web-app-capable" content="yes"/>`,
    `<meta name="mobile-web-app-capable" content="yes"/>`,
    `<meta name="apple-mobile-web-app-status-bar-style" content="black"/>`,
    `<meta name="format-detection" content="telephone=no"/>`,
    `<link rel="icon" href="favicon.ico" sizes="48x48"/>`,
    `<link rel="icon" href="favicon.svg" type="image/svg+xml"/>`,
    `<link rel="apple-touch-icon" href="apple-touch-icon.png" sizes="180x180"/>`,
    `<link rel="manifest" href="site.webmanifest"/>`,
    `<script type="application/ld+json">${json}</script>`,
  ].join('');
}
