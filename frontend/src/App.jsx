import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { HashRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import './styles.css'

/* ---------------------------------- helpers ---------------------------------- */

function daysAgo(amount) {
  return new Date(Date.now() - amount * 24 * 60 * 60 * 1000).toISOString()
}

function futureDate(days, hour) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

function daysUntilUrgent(reportedAt) {
  const threshold = 14 * 24 * 60 * 60 * 1000
  return Date.now() - new Date(reportedAt).getTime() - threshold
}

function formatDate(dateString, lang) {
  return new Date(dateString).toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-US', { month: 'short', day: 'numeric' })
}

function formatTime(dateString, lang) {
  return new Date(dateString).toLocaleTimeString(lang === 'ar' ? 'ar-JO' : 'en-US', { hour: '2-digit', minute: '2-digit' })
}

function rankLabel(index) {
  return String(index + 1).padStart(2, '0')
}

/** Reads a bilingual field. Seed content is stored as {en, ar}; user-submitted
 *  content is a plain string typed in whichever language was active. */
function pick(field, lang) {
  if (field && typeof field === 'object') return field[lang] ?? field.en ?? Object.values(field)[0]
  return field
}

/* ------------------------------------ icons ----------------------------------- */

const Icon = {
  Pin: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 22s7-7.58 7-13a7 7 0 1 0-14 0c0 5.42 7 13 7 13Z" /><circle cx="12" cy="9" r="2.5" />
    </svg>
  ),
  Clock: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
    </svg>
  ),
  Users: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1" /><circle cx="9" cy="7" r="3.4" />
      <path d="M22 19v-1a3.8 3.8 0 0 0-2.8-3.66" /><path d="M15.4 4.3a3.4 3.4 0 0 1 0 6.4" />
    </svg>
  ),
  Check: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="m5 12 5 5L20 7" />
    </svg>
  ),
  Arrow: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  Spark: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.8 2.8M15.2 15.2 18 18M18 6l-2.8 2.8M8.8 15.2 6 18" />
    </svg>
  ),
  Chart: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 20V10M12 20V4M20 20v-7" />
    </svg>
  ),
  Globe: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9s1.3-6.4 3.8-9Z" />
    </svg>
  )
}

/* -------------------------------------- copy ----------------------------------- */

const translations = {
  en: {
    tagline: 'Our neighborhood, in progress',
    langButton: 'العربية',
    nav: { home: 'Home', issues: 'Issues', events: 'Events', impact: 'Impact' },
    hero: {
      eyebrow: 'Frontend demo · no backend required',
      title: 'See what your street needs. Show up for it.',
      text: 'Report a problem, watch it land on the neighborhood map, and adopt it into a scheduled cleanup, paint day, or planting hour. Every card is live — click through it the way a resident would.',
      cta1: 'Explore the board',
      cta2: 'Why it works',
      mapLive: 'Live neighborhood map',
      mapNote: 'Pin size follows how many open reports each district has. Tap a pin to filter the issue board.',
      legendOpen: 'Needs a volunteer', legendAdopted: 'Adopted', legendResolved: 'Resolved'
    },
    stats: { open: 'Open issues', resolved: 'Resolved', events: 'Events', urgent: 'Urgent' },
    pitch: {
      title: 'Why it works', subtitle: 'A simpler story than waiting on a work order',
      f1t: 'One map, every report', f1: 'A littered park and a broken bench sit on the same public board instead of scattered chat groups.',
      f2t: "Adopt, don't assign", f2: 'Any resident or youth group can turn an open issue into a scheduled event with one click.',
      f3t: 'Progress people can see', f3: 'Completion rates and a district leaderboard turn cleanup into something worth showing up for.',
      notesTitle: 'What to notice first', notesSubtitle: 'Presentation cues for this demo',
      n1: "The hill map mirrors Amman's own skyline of jabals — pins sit on the district they represent.",
      n2: 'Every action (adopt, join, report) updates the board instantly, no page reload.',
      n3: 'Layout holds up on a phone: the same board a resident would use in the field.'
    },
    issuesPage: {
      pageTitle: 'Neighborhood issues', pageSubtitle: 'Filter, search, and adopt local problems',
      searchPlaceholder: 'Search by street, neighborhood, or issue',
      emptyTitle: 'No issues match these filters.', emptyText: 'Clear the category or neighborhood filter, or report a new issue below.',
      reportTitle: 'Report an issue', reportSubtitle: 'Add a new pin to the public board',
      fieldTitle: 'Issue title', fieldTitlePh: 'Broken lights near the park',
      fieldNeighborhood: 'Neighborhood', fieldNeighborhoodPh: 'Downtown',
      fieldCategory: 'Category',
      fieldDescription: 'Description', fieldDescriptionPh: 'Describe what needs to happen and why it matters.',
      fieldSupplies: 'Needed supplies (optional)', fieldSuppliesPh: 'One item per line',
      submit: 'Add to the board',
      errTitle: 'Give the issue a short, specific title.',
      errNeighborhood: 'Tell us which neighborhood this is in.',
      errDescription: 'Add a sentence describing what needs to happen.',
      adopt: 'Adopt', resolve: 'Mark resolved',
      daysOld: (d) => `${d} days old`,
      needsVolunteer: 'Needs a volunteer',
      adoptedByFn: (name) => `Adopted by ${name}`,
      toastReported: 'Issue reported and placed on the map.',
      toastFillRequired: 'Fill in the required fields first.',
      toastAdopted: 'Issue adopted on the demo board.',
      toastResolved: 'Marked as resolved.'
    },
    eventsPage: {
      pageTitle: 'Volunteer events', pageSubtitle: 'Sign up for a scheduled day of work',
      join: 'Join event', joined: 'Signed up',
      scheduleTitle: 'Schedule an event', scheduleSubtitle: 'Turn an adopted issue into a work day',
      fieldEventTitle: 'Event title', fieldEventTitlePh: 'Saturday cleanup sprint',
      fieldLocation: 'Location', fieldLocationPh: 'King Abdullah Park',
      fieldDate: 'Date and time', fieldVolunteers: 'Volunteers needed',
      fieldEventDescription: 'Event description', fieldEventDescriptionPh: 'What should people expect on the day?',
      addEvent: 'Add event',
      errEventTitle: 'Give the event a title.',
      errLocation: 'Add a location so volunteers know where to go.',
      errDate: 'Pick a date and time.',
      toastJoined: 'You joined the event.',
      toastScheduled: 'Event scheduled.'
    },
    impactPage: {
      pageTitle: 'Community impact', pageSubtitle: 'What needs attention, and who is leading the way',
      urgentTitle: 'Needs attention', urgentSubtitle: 'Open past 14 days with no adopter',
      urgentEmptyTitle: 'Nothing is overdue right now.',
      urgentEmptyText: 'No open issue has passed the 14-day threshold in this demo state.',
      overdueLabel: 'Overdue', adoptNow: 'Adopt now',
      leaderboardTitle: 'Community leaderboard', leaderboardSubtitle: 'Resolution rate by district',
      resolvedOf: (r, t) => `${r}/${t} resolved`
    }
  },
  ar: {
    tagline: 'حارتنا، في طور الإصلاح',
    langButton: 'English',
    nav: { home: 'الرئيسية', issues: 'البلاغات', events: 'الفعاليات', impact: 'الأثر' },
    hero: {
      eyebrow: 'نموذج أولي للواجهة · بدون خادم',
      title: 'اعرف ما يحتاجه حيّك، وكن أول من يلبّي.',
      text: 'أبلغ عن مشكلة، شاهدها تظهر على خريطة الحي، ثم تبنّها لتتحول إلى يوم تنظيف أو طلاء أو زراعة مجدول. كل بطاقة في الأسفل تفاعلية فعلاً، جرّبها كما يفعل أي مقيم.',
      cta1: 'استعرض اللوحة',
      cta2: 'لماذا تنجح الفكرة',
      mapLive: 'خريطة الحي المباشرة',
      mapNote: 'حجم الدبوس يعكس عدد البلاغات المفتوحة في كل حي. اضغط على الدبوس لتصفية لوحة البلاغات.',
      legendOpen: 'بحاجة لمتطوع', legendAdopted: 'متبنّاة', legendResolved: 'منجزة'
    },
    stats: { open: 'بلاغات مفتوحة', resolved: 'تم حلها', events: 'فعاليات', urgent: 'عاجلة' },
    pitch: {
      title: 'لماذا تنجح الفكرة', subtitle: 'حل أبسط من انتظار أمر عمل بلدي',
      f1t: 'خريطة واحدة، لكل البلاغات', f1: 'حديقة مليئة بالنفايات ومقعد مكسور يظهران على نفس اللوحة العامة، بدل التشتت بين مجموعات فيسبوك.',
      f2t: 'تبنَّ المهمة، لا تنتظر تكليفها', f2: 'أي مقيم أو مجموعة شبابية يمكنها تحويل بلاغ مفتوح إلى فعالية مجدولة بضغطة واحدة.',
      f3t: 'تقدّم يراه الجميع', f3: 'نسب الإنجاز ولوحة صدارة الأحياء تحوّل التنظيف إلى إنجاز يستحق المشاركة فيه.',
      notesTitle: 'ما الذي يستحق الانتباه إليه أولاً', notesSubtitle: 'ملاحظات لعرض هذا النموذج',
      n1: 'خريطة التلال تحاكي أفق تلال عمّان الحقيقي، وكل دبوس في مكان الحي الذي يمثله.',
      n2: 'كل إجراء — تبنٍّ، انضمام، بلاغ — يحدّث اللوحة فوراً دون إعادة تحميل الصفحة.',
      n3: 'التصميم يعمل بسلاسة على الهاتف، بنفس اللوحة التي يستخدمها المقيم في الميدان.'
    },
    issuesPage: {
      pageTitle: 'بلاغات الحي', pageSubtitle: 'صفِّ، ابحث، وتبنَّ مشاكل حيّك',
      searchPlaceholder: 'ابحث حسب الشارع أو الحي أو البلاغ',
      emptyTitle: 'لا توجد بلاغات مطابقة لهذه التصفية.', emptyText: 'ألغِ تصفية الفئة أو الحي، أو أضف بلاغاً جديداً في الأسفل.',
      reportTitle: 'أضف بلاغاً', reportSubtitle: 'أضف دبوساً جديداً إلى اللوحة العامة',
      fieldTitle: 'عنوان البلاغ', fieldTitlePh: 'إنارة معطلة قرب الحديقة',
      fieldNeighborhood: 'الحي', fieldNeighborhoodPh: 'وسط البلد',
      fieldCategory: 'الفئة',
      fieldDescription: 'الوصف', fieldDescriptionPh: 'صف ما الذي يجب حدوثه ولماذا هو مهم.',
      fieldSupplies: 'المستلزمات المطلوبة (اختياري)', fieldSuppliesPh: 'عنصر واحد في كل سطر',
      submit: 'أضف إلى اللوحة',
      errTitle: 'أدخل عنواناً قصيراً ومحدداً للبلاغ.',
      errNeighborhood: 'حدد الحي الذي يقع فيه البلاغ.',
      errDescription: 'أضف جملة تصف ما يجب القيام به.',
      adopt: 'تبنَّ', resolve: 'وضع كمنجز',
      daysOld: (d) => `منذ ${d} يوم`,
      needsVolunteer: 'بحاجة لمتطوع',
      adoptedByFn: (name) => `تبنّاها ${name}`,
      toastReported: 'تم إضافة البلاغ ووضعه على الخريطة.',
      toastFillRequired: 'يرجى تعبئة الحقول المطلوبة أولاً.',
      toastAdopted: 'تم تبنّي البلاغ في اللوحة التجريبية.',
      toastResolved: 'تم وضع علامة كمنجز.'
    },
    eventsPage: {
      pageTitle: 'فعاليات تطوعية', pageSubtitle: 'سجّل للمشاركة في يوم عمل مجدول',
      join: 'انضم للفعالية', joined: 'تم التسجيل',
      scheduleTitle: 'جدولة فعالية', scheduleSubtitle: 'حوّل بلاغاً متبنّى إلى يوم عمل',
      fieldEventTitle: 'عنوان الفعالية', fieldEventTitlePh: 'حملة تنظيف يوم السبت',
      fieldLocation: 'الموقع', fieldLocationPh: 'حديقة الملك عبدالله',
      fieldDate: 'التاريخ والوقت', fieldVolunteers: 'عدد المتطوعين المطلوب',
      fieldEventDescription: 'وصف الفعالية', fieldEventDescriptionPh: 'ما الذي يجب أن يتوقعه المشاركون في ذلك اليوم؟',
      addEvent: 'أضف الفعالية',
      errEventTitle: 'أدخل عنواناً للفعالية.',
      errLocation: 'أضف موقعاً ليعرف المتطوعون وجهتهم.',
      errDate: 'اختر التاريخ والوقت.',
      toastJoined: 'لقد انضممت إلى الفعالية.',
      toastScheduled: 'تمت جدولة الفعالية.'
    },
    impactPage: {
      pageTitle: 'أثر المجتمع', pageSubtitle: 'ما يحتاج انتباهاً، ومن يقود التقدّم',
      urgentTitle: 'بحاجة لانتباه', urgentSubtitle: 'مفتوحة منذ أكثر من 14 يوماً دون متبنٍّ',
      urgentEmptyTitle: 'لا يوجد بلاغ متأخر حالياً.',
      urgentEmptyText: 'لم يتجاوز أي بلاغ مفتوح حد الـ14 يوماً في هذه الحالة التجريبية.',
      overdueLabel: 'متأخر', adoptNow: 'تبنَّ الآن',
      leaderboardTitle: 'لوحة صدارة الأحياء', leaderboardSubtitle: 'نسبة الإنجاز حسب الحي',
      resolvedOf: (r, t) => `${r}/${t} منجز`
    }
  }
}

const categoryKeys = ['All', 'Cleanup', 'Painting', 'Planting', 'Maintenance']
const categoryLabels = {
  All: { en: 'All', ar: 'الكل' },
  Cleanup: { en: 'Cleanup', ar: 'تنظيف' },
  Painting: { en: 'Painting', ar: 'طلاء' },
  Planting: { en: 'Planting', ar: 'زراعة' },
  Maintenance: { en: 'Maintenance', ar: 'صيانة' }
}
const statusLabels = {
  Open: { en: 'Open', ar: 'مفتوحة' },
  Adopted: { en: 'Adopted', ar: 'متبنّاة' },
  Closed: { en: 'Closed', ar: 'منجزة' }
}
const neighborhoodLabels = {
  'Al-Lweibdeh': { en: 'Al-Lweibdeh', ar: 'اللويبدة' },
  'Jabal Amman': { en: 'Jabal Amman', ar: 'جبل عمّان' },
  'Abdoun': { en: 'Abdoun', ar: 'عبدون' },
  'Khalda': { en: 'Khalda', ar: 'خلدا' }
}
function neighborhoodName(key, lang) {
  return neighborhoodLabels[key]?.[lang] || key
}

/* -------------------------------------- data ----------------------------------- */

const issueSeed = [
  {
    id: 1,
    category: 'Maintenance',
    neighborhood: 'Al-Lweibdeh',
    status: 'Open',
    reportedAt: daysAgo(3),
    adoptedBy: '',
    title: { en: 'Broken sidewalk near the school entrance', ar: 'رصيف متضرر قرب مدخل المدرسة' },
    description: { en: 'Uneven concrete creates a trip hazard during busy pickup hours. Needs a quick patch and a cleanup pass.', ar: 'الإسمنت غير المستوي يشكّل خطر تعثر خلال أوقات انصراف الطلاب، ويحتاج ترقيعاً سريعاً وتنظيفاً بسيطاً.' },
    supplies: { en: 'Concrete mix\nSafety cones\nWork gloves', ar: 'خلطة إسمنت\nمخاريط سلامة\nقفازات عمل' }
  },
  {
    id: 2,
    category: 'Cleanup',
    neighborhood: 'Jabal Amman',
    status: 'Adopted',
    reportedAt: daysAgo(9),
    adoptedBy: { en: 'Jabal Amman Youth Circle', ar: 'مجموعة شباب جبل عمّان' },
    title: { en: 'Weekend park cleanup and trash pickup', ar: 'تنظيف الحديقة وجمع النفايات في نهاية الأسبوع' },
    description: { en: 'A local youth group has already adopted the task and is organizing volunteers for Saturday morning.', ar: 'تبنّت إحدى مجموعات الشباب المحلية المهمة بالفعل، وتنظّم المتطوعين ليوم السبت صباحاً.' },
    supplies: { en: 'Trash bags\nReusable gloves\nWater bottles', ar: 'أكياس نفايات\nقفازات قابلة لإعادة الاستخدام\nزجاجات مياه' }
  },
  {
    id: 3,
    category: 'Painting',
    neighborhood: 'Abdoun',
    status: 'Closed',
    reportedAt: daysAgo(17),
    adoptedBy: { en: 'Abdoun Street Makers', ar: 'صنّاع شارع عبدون' },
    title: { en: 'Refresh the community mural wall', ar: 'تجديد جدارية الحي' },
    description: { en: 'A faded mural is ready for a new coat of color. The wall has already been approved by the local committee.', ar: 'الجدارية الباهتة جاهزة لطبقة ألوان جديدة، وتمت الموافقة على الجدار مسبقاً من اللجنة المحلية.' },
    supplies: { en: 'Primer\nPaint rollers\nDrop cloths', ar: 'طبقة أساس\nرولات دهان\nأقمشة حماية' }
  },
  {
    id: 4,
    category: 'Planting',
    neighborhood: 'Khalda',
    status: 'Open',
    reportedAt: daysAgo(15),
    adoptedBy: '',
    title: { en: 'Need plant beds watered during the heat wave', ar: 'أحواض الزراعة بحاجة للري خلال موجة الحر' },
    description: { en: 'Raised planters near the walking path need a volunteer team to water and inspect the new seedlings.', ar: 'تحتاج الأحواض المرتفعة قرب ممشى المشاة إلى فريق متطوعين لريّها وفحص الشتلات الجديدة.' },
    supplies: { en: 'Watering cans\nMulch\nShade cloth', ar: 'أوعية ري\nنشارة خشب\nقماش تظليل' }
  }
]

const eventSeed = [
  {
    id: 1,
    date: futureDate(2, 10),
    volunteersNeeded: 16,
    volunteers: ['Mira', 'Omar', 'Lina', 'Yousef', 'Sara', 'Ali', 'Nour'],
    title: { en: 'Friday morning park reset', ar: 'صباح الجمعة: إعادة تأهيل الحديقة' },
    description: { en: 'A short cleanup sprint for litter pickup, path sweeping, and a quick supplies handoff.', ar: 'جلسة تنظيف قصيرة لجمع النفايات وكنس الممرات وتسليم سريع للمستلزمات.' },
    location: { en: 'King Abdullah Park', ar: 'حديقة الملك عبدالله' }
  },
  {
    id: 2,
    date: futureDate(6, 15),
    volunteersNeeded: 12,
    volunteers: ['Aya', 'Hani', 'Leen'],
    title: { en: 'Mural paint day', ar: 'يوم رسم الجدارية' },
    description: { en: 'Community painting session with a simple palette, clear roles, and a photo-ready finish.', ar: 'جلسة رسم مجتمعية بألوان بسيطة وأدوار واضحة ونتيجة جاهزة للتصوير.' },
    location: { en: 'Abdoun Alley Wall', ar: 'جدار زقاق عبدون' }
  },
  {
    id: 3,
    date: futureDate(9, 9),
    volunteersNeeded: 10,
    volunteers: ['Tariq', 'Dana', 'Rana', 'Zaid'],
    title: { en: 'Neighborhood planting hour', ar: 'ساعة الزراعة في الحي' },
    description: { en: 'Watering, soil prep, and planting for the shared green strip near the market.', ar: 'ري وتجهيز تربة وزراعة للشريط الأخضر المشترك قرب السوق.' },
    location: { en: 'Khalda Community Strip', ar: 'الشريط المجتمعي في خلدا' }
  }
]

/* Approximate positions along the hill skyline (viewBox 0 0 800 300).
   New neighborhoods typed into the report form get a deterministic
   position so the map always has somewhere to put the pin. */
const neighborhoodCoords = {
  'Al-Lweibdeh': { x: 140, y: 176 },
  'Jabal Amman': { x: 300, y: 132 },
  'Abdoun': { x: 470, y: 168 },
  'Khalda': { x: 630, y: 138 }
}

function hillY(x) {
  return 190 - 46 * Math.sin((x / 800) * Math.PI * 2 + 0.6)
}

function coordsFor(name) {
  if (neighborhoodCoords[name]) return neighborhoodCoords[name]
  let hash = 0
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) % 1000
  const x = 70 + (hash % 660)
  return { x, y: hillY(x) }
}

/* ------------------------------------- context ---------------------------------- */

const AppContext = createContext(null)
function useApp() { return useContext(AppContext) }

/* ---------------------------------------- app ----------------------------------- */

export default function App() {
  return (
    <HashRouter>
      <AppShell />
    </HashRouter>
  )
}

function AppShell() {
  const navigate = useNavigate()
  const [language, setLanguage] = useState('en')
  const [issues, setIssues] = useState(issueSeed)
  const [events, setEvents] = useState(eventSeed)
  const [activeCategory, setActiveCategory] = useState('All')
  const [neighborhoodFilter, setNeighborhoodFilter] = useState('')
  const [search, setSearch] = useState('')
  const [joinedEvents, setJoinedEvents] = useState(new Set())
  const [issueForm, setIssueForm] = useState({ title: '', neighborhood: '', category: 'Cleanup', description: '', supplies: '' })
  const [eventForm, setEventForm] = useState({ title: '', location: '', date: '', description: '', volunteersNeeded: '8' })
  const [formErrors, setFormErrors] = useState({})
  const [notification, setNotification] = useState('')

  const t = translations[language]

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  }, [language])

  const stats = useMemo(() => {
    const open = issues.filter(issue => issue.status === 'Open').length
    const adopted = issues.filter(issue => issue.status === 'Adopted' || issue.status === 'Closed').length
    const urgent = issues.filter(issue => issue.status === 'Open' && daysUntilUrgent(issue.reportedAt) >= 0).length
    return { total: issues.length, open, adopted, events: events.length, urgent }
  }, [issues, events])

  const neighborhoods = useMemo(() => {
    const groups = new Map()
    issues.forEach(issue => {
      const entry = groups.get(issue.neighborhood) || { name: issue.neighborhood, open: 0, adopted: 0, closed: 0, urgent: 0 }
      if (issue.status === 'Open') entry.open += 1
      if (issue.status === 'Adopted') entry.adopted += 1
      if (issue.status === 'Closed') entry.closed += 1
      if (issue.status === 'Open' && daysUntilUrgent(issue.reportedAt) >= 0) entry.urgent += 1
      groups.set(issue.neighborhood, entry)
    })
    return Array.from(groups.values()).map(entry => ({ ...entry, total: entry.open + entry.adopted + entry.closed, ...coordsFor(entry.name) }))
  }, [issues])

  const visibleIssues = useMemo(() => {
    const lowered = search.trim().toLowerCase()
    return issues.filter(issue => {
      const matchesCategory = activeCategory === 'All' || issue.category === activeCategory
      const matchesNeighborhood = !neighborhoodFilter || issue.neighborhood === neighborhoodFilter
      const haystack = [pick(issue.title, language), issue.neighborhood, neighborhoodName(issue.neighborhood, language), pick(issue.description, language)]
      const matchesSearch = !lowered || haystack.some(value => value.toLowerCase().includes(lowered))
      return matchesCategory && matchesNeighborhood && matchesSearch
    })
  }, [activeCategory, neighborhoodFilter, issues, search, language])

  const urgentIssues = useMemo(() => {
    return issues
      .filter(issue => issue.status === 'Open' && daysUntilUrgent(issue.reportedAt) >= 0)
      .sort((left, right) => new Date(left.reportedAt) - new Date(right.reportedAt))
  }, [issues])

  const leaderboard = useMemo(() => {
    const scores = new Map()
    issues.forEach(issue => {
      const entry = scores.get(issue.neighborhood) || { name: issue.neighborhood, total: 0, resolved: 0 }
      entry.total += 1
      if (issue.status === 'Adopted' || issue.status === 'Closed') entry.resolved += 1
      scores.set(issue.neighborhood, entry)
    })
    return Array.from(scores.values())
      .map(entry => ({ ...entry, completion: entry.total === 0 ? 0 : Math.round((entry.resolved / entry.total) * 100) }))
      .sort((left, right) => right.completion - left.completion || right.resolved - left.resolved)
  }, [issues])

  function notify(message) {
    setNotification(message)
    window.clearTimeout(notify.timer)
    notify.timer = window.setTimeout(() => setNotification(''), 2600)
  }

  function adoptIssue(issueId) {
    setIssues(current => current.map(issue => issue.id === issueId
      ? { ...issue, status: 'Adopted', adoptedBy: issue.adoptedBy || 'Demo Volunteer' }
      : issue))
    notify(t.issuesPage.toastAdopted)
  }

  function closeIssue(issueId) {
    setIssues(current => current.map(issue => issue.id === issueId ? { ...issue, status: 'Closed' } : issue))
    notify(t.issuesPage.toastResolved)
  }

  function handleIssueSubmit(event) {
    event.preventDefault()
    const errors = {}
    if (!issueForm.title.trim()) errors.title = t.issuesPage.errTitle
    if (!issueForm.neighborhood.trim()) errors.neighborhood = t.issuesPage.errNeighborhood
    if (!issueForm.description.trim()) errors.description = t.issuesPage.errDescription
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) {
      notify(t.issuesPage.toastFillRequired)
      return
    }

    const nextIssue = {
      id: Date.now(),
      title: issueForm.title.trim(),
      neighborhood: issueForm.neighborhood.trim(),
      category: issueForm.category,
      description: issueForm.description.trim(),
      supplies: issueForm.supplies.trim(),
      status: 'Open',
      reportedAt: new Date().toISOString(),
      adoptedBy: ''
    }

    setIssues(current => [nextIssue, ...current])
    setIssueForm({ title: '', neighborhood: '', category: 'Cleanup', description: '', supplies: '' })
    notify(t.issuesPage.toastReported)
  }

  function handleEventSubmit(event) {
    event.preventDefault()
    const errors = {}
    if (!eventForm.title.trim()) errors.eventTitle = t.eventsPage.errEventTitle
    if (!eventForm.location.trim()) errors.location = t.eventsPage.errLocation
    if (!eventForm.date.trim()) errors.date = t.eventsPage.errDate
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) {
      notify(t.issuesPage.toastFillRequired)
      return
    }

    const nextEvent = {
      id: Date.now(),
      title: eventForm.title.trim(),
      location: eventForm.location.trim(),
      date: new Date(eventForm.date).toISOString(),
      description: eventForm.description.trim(),
      volunteersNeeded: Number(eventForm.volunteersNeeded) || 8,
      volunteers: []
    }

    setEvents(current => [nextEvent, ...current])
    setEventForm({ title: '', location: '', date: '', description: '', volunteersNeeded: '8' })
    notify(t.eventsPage.toastScheduled)
  }

  function joinEvent(eventId) {
    if (joinedEvents.has(eventId)) return
    setJoinedEvents(current => new Set([...current, eventId]))
    setEvents(current => current.map(entry => entry.id === eventId ? { ...entry, volunteers: [...entry.volunteers, 'You'] } : entry))
    notify(t.eventsPage.toastJoined)
  }

  function pickNeighborhood(name) {
    setNeighborhoodFilter(current => (current === name ? '' : name))
    navigate('/issues')
  }

  const value = {
    language, t, issues, events, stats, neighborhoods, visibleIssues, urgentIssues, leaderboard,
    activeCategory, setActiveCategory, neighborhoodFilter, setNeighborhoodFilter, search, setSearch,
    joinedEvents, issueForm, setIssueForm, eventForm, setEventForm, formErrors,
    adoptIssue, closeIssue, handleIssueSubmit, handleEventSubmit, joinEvent, pickNeighborhood
  }

  return (
    <AppContext.Provider value={value}>
      <div className="app-shell">
        {notification && <div className="toast"><Icon.Check />{notification}</div>}

        <header className="topbar">
          <NavLink to="/" className="brand">
            <span className="brand-mark">ح</span>
            <span>
              <strong>Haretna</strong>
              <small>{t.tagline}</small>
            </span>
          </NavLink>

          <nav className="topnav">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}><Icon.Spark width={15} height={15} /> {t.nav.home}</NavLink>
            <NavLink to="/issues" className={({ isActive }) => isActive ? 'active' : ''}><Icon.Pin width={15} height={15} /> {t.nav.issues}</NavLink>
            <NavLink to="/events" className={({ isActive }) => isActive ? 'active' : ''}><Icon.Users width={15} height={15} /> {t.nav.events}</NavLink>
            <NavLink to="/impact" className={({ isActive }) => isActive ? 'active' : ''}><Icon.Chart width={15} height={15} /> {t.nav.impact}</NavLink>
            <button className="lang-toggle" onClick={() => setLanguage(current => (current === 'en' ? 'ar' : 'en'))}>
              <Icon.Globe width={15} height={15} /> {t.langButton}
            </button>
          </nav>
        </header>

        <main className="layout">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/issues" element={<IssuesPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/impact" element={<ImpactPage />} />
          </Routes>
        </main>
      </div>
    </AppContext.Provider>
  )
}

/* ---------------------------------------- pages ---------------------------------- */

function HomePage() {
  const { language, t, stats, neighborhoods, neighborhoodFilter, pickNeighborhood } = useApp()

  return (
    <div className="page-stack">
      <section className="hero" id="hero">
        <div className="hero-copy">
          <span className="eyebrow"><Icon.Spark width={13} height={13} /> {t.hero.eyebrow}</span>
          <h1>{t.hero.title}</h1>
          <p className="hero-text">{t.hero.text}</p>

          <div className="hero-actions">
            <NavLink to="/issues" className="btn btn-primary">{t.hero.cta1} <Icon.Arrow /></NavLink>
            <a href="#pitch" className="btn btn-secondary">{t.hero.cta2}</a>
          </div>

          <div className="stat-row">
            <Stat label={t.stats.open} value={stats.open} tone="warning" />
            <Stat label={t.stats.resolved} value={stats.adopted} tone="success" />
            <Stat label={t.stats.events} value={stats.events} tone="info" />
            <Stat label={t.stats.urgent} value={stats.urgent} tone="danger" />
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-card-top">
            <span className="live-pill"><span className="pulse-dot" /> {t.hero.mapLive}</span>
          </div>

          <div className="hill-map-wrap">
            <HillMap neighborhoods={neighborhoods} activeNeighborhood={neighborhoodFilter} onPick={pickNeighborhood} language={language} />
          </div>

          <div className="map-legend">
            <span><span className="legend-dot" style={{ background: 'var(--gold)' }} /> {t.hero.legendOpen}</span>
            <span><span className="legend-dot" style={{ background: 'var(--indigo)' }} /> {t.hero.legendAdopted}</span>
            <span><span className="legend-dot" style={{ background: 'var(--success)' }} /> {t.hero.legendResolved}</span>
          </div>

          <p className="mini-note">{t.hero.mapNote}</p>
        </div>
      </section>

      <section className="page-stack" id="pitch">
        <Panel title={t.pitch.title} subtitle={t.pitch.subtitle}>
          <div className="feature-grid">
            <Feature icon={<Icon.Pin />} title={t.pitch.f1t} text={t.pitch.f1} />
            <Feature icon={<Icon.Users />} title={t.pitch.f2t} text={t.pitch.f2} />
            <Feature icon={<Icon.Chart />} title={t.pitch.f3t} text={t.pitch.f3} />
          </div>
        </Panel>

        <Panel title={t.pitch.notesTitle} subtitle={t.pitch.notesSubtitle}>
          <ul className="note-list">
            <li><Icon.Check /> {t.pitch.n1}</li>
            <li><Icon.Check /> {t.pitch.n2}</li>
            <li><Icon.Check /> {t.pitch.n3}</li>
          </ul>
        </Panel>
      </section>
    </div>
  )
}

function IssuesPage() {
  const {
    language, t, visibleIssues, activeCategory, setActiveCategory, neighborhoodFilter, setNeighborhoodFilter,
    search, setSearch, issueForm, setIssueForm, formErrors, handleIssueSubmit, adoptIssue, closeIssue
  } = useApp()

  return (
    <div className="page-stack">
      <div className="page-head">
        <span className="panel-kicker">{t.nav.issues}</span>
        <h2>{t.issuesPage.pageTitle}</h2>
        <p>{t.issuesPage.pageSubtitle}</p>
      </div>

      <Panel bare>
        <div className="toolbar">
          <div className="chip-row">
            {categoryKeys.map(category => (
              <button key={category} className={`chip ${activeCategory === category ? 'active' : ''}`} onClick={() => setActiveCategory(category)}>
                {categoryLabels[category][language]}
              </button>
            ))}
            {neighborhoodFilter && (
              <button className="chip clear" onClick={() => setNeighborhoodFilter('')}>
                &times; {neighborhoodName(neighborhoodFilter, language)}
              </button>
            )}
          </div>
          <input className="search" value={search} onChange={event => setSearch(event.target.value)} placeholder={t.issuesPage.searchPlaceholder} />
        </div>

        {visibleIssues.length === 0 ? (
          <div className="empty-panel">
            <strong>{t.issuesPage.emptyTitle}</strong>
            <p>{t.issuesPage.emptyText}</p>
          </div>
        ) : (
          <div className="card-grid">
            {visibleIssues.map(issue => (
              <IssueCard key={issue.id} issue={issue} onAdopt={() => adoptIssue(issue.id)} onClose={() => closeIssue(issue.id)} />
            ))}
          </div>
        )}
      </Panel>

      <Panel title={t.issuesPage.reportTitle} subtitle={t.issuesPage.reportSubtitle}>
        <form className="stack-form" onSubmit={handleIssueSubmit} noValidate>
          <InputField label={t.issuesPage.fieldTitle} value={issueForm.title} onChange={value => setIssueForm({ ...issueForm, title: value })} placeholder={t.issuesPage.fieldTitlePh} error={formErrors.title} />
          <div className="form-grid">
            <InputField label={t.issuesPage.fieldNeighborhood} value={issueForm.neighborhood} onChange={value => setIssueForm({ ...issueForm, neighborhood: value })} placeholder={t.issuesPage.fieldNeighborhoodPh} error={formErrors.neighborhood} />
            <SelectField label={t.issuesPage.fieldCategory} value={issueForm.category} onChange={value => setIssueForm({ ...issueForm, category: value })} options={['Cleanup', 'Painting', 'Planting', 'Maintenance']} labels={categoryLabels} language={language} />
          </div>
          <TextAreaField label={t.issuesPage.fieldDescription} value={issueForm.description} onChange={value => setIssueForm({ ...issueForm, description: value })} placeholder={t.issuesPage.fieldDescriptionPh} error={formErrors.description} />
          <TextAreaField label={t.issuesPage.fieldSupplies} value={issueForm.supplies} onChange={value => setIssueForm({ ...issueForm, supplies: value })} placeholder={t.issuesPage.fieldSuppliesPh} />
          <button className="btn btn-primary" type="submit">{t.issuesPage.submit} <Icon.Arrow /></button>
        </form>
      </Panel>
    </div>
  )
}

function EventsPage() {
  const { language, t, events, joinedEvents, joinEvent, eventForm, setEventForm, formErrors, handleEventSubmit } = useApp()

  return (
    <div className="page-stack">
      <div className="page-head">
        <span className="panel-kicker">{t.nav.events}</span>
        <h2>{t.eventsPage.pageTitle}</h2>
        <p>{t.eventsPage.pageSubtitle}</p>
      </div>

      <Panel bare>
        <div className="card-grid">
          {events.map(event => {
            const joined = joinedEvents.has(event.id)
            return (
              <article className="event-card" key={event.id}>
                <div className="card-head">
                  <div>
                    <h3>{pick(event.title, language)}</h3>
                    <p>{pick(event.description, language)}</p>
                  </div>
                  <span className="count-pill"><Icon.Users width={13} height={13} /> {event.volunteers.length}/{event.volunteersNeeded}</span>
                </div>

                <div className="event-meta">
                  <span><Icon.Clock width={13} height={13} /> {formatDate(event.date, language)}, {formatTime(event.date, language)}</span>
                  <span><Icon.Pin width={13} height={13} /> {pick(event.location, language)}</span>
                </div>

                <div className="card-actions">
                  <button className={`btn btn-sm ${joined ? 'btn-muted' : 'btn-success'}`} onClick={() => joinEvent(event.id)} disabled={joined}>
                    {joined ? t.eventsPage.joined : t.eventsPage.join}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </Panel>

      <Panel title={t.eventsPage.scheduleTitle} subtitle={t.eventsPage.scheduleSubtitle}>
        <form className="stack-form" onSubmit={handleEventSubmit} noValidate>
          <InputField label={t.eventsPage.fieldEventTitle} value={eventForm.title} onChange={value => setEventForm({ ...eventForm, title: value })} placeholder={t.eventsPage.fieldEventTitlePh} error={formErrors.eventTitle} />
          <InputField label={t.eventsPage.fieldLocation} value={eventForm.location} onChange={value => setEventForm({ ...eventForm, location: value })} placeholder={t.eventsPage.fieldLocationPh} error={formErrors.location} />
          <div className="form-grid">
            <InputField label={t.eventsPage.fieldDate} type="datetime-local" value={eventForm.date} onChange={value => setEventForm({ ...eventForm, date: value })} error={formErrors.date} />
            <InputField label={t.eventsPage.fieldVolunteers} type="number" value={eventForm.volunteersNeeded} onChange={value => setEventForm({ ...eventForm, volunteersNeeded: value })} placeholder="8" />
          </div>
          <TextAreaField label={t.eventsPage.fieldEventDescription} value={eventForm.description} onChange={value => setEventForm({ ...eventForm, description: value })} placeholder={t.eventsPage.fieldEventDescriptionPh} />
          <button className="btn btn-primary" type="submit">{t.eventsPage.addEvent} <Icon.Arrow /></button>
        </form>
      </Panel>
    </div>
  )
}

function ImpactPage() {
  const { language, t, urgentIssues, leaderboard, adoptIssue } = useApp()

  return (
    <div className="page-stack">
      <div className="page-head">
        <span className="panel-kicker">{t.nav.impact}</span>
        <h2>{t.impactPage.pageTitle}</h2>
        <p>{t.impactPage.pageSubtitle}</p>
      </div>

      <Panel title={t.impactPage.urgentTitle} subtitle={t.impactPage.urgentSubtitle}>
        {urgentIssues.length === 0 ? (
          <div className="empty-panel">
            <strong>{t.impactPage.urgentEmptyTitle}</strong>
            <p>{t.impactPage.urgentEmptyText}</p>
          </div>
        ) : (
          <div className="urgency-list">
            {urgentIssues.map(issue => (
              <article className="urgency-card" key={issue.id}>
                <div>
                  <span className="urgency-label"><Icon.Clock width={12} height={12} /> {t.impactPage.overdueLabel}</span>
                  <h3>{pick(issue.title, language)}</h3>
                  <p>{neighborhoodName(issue.neighborhood, language)} &middot; {categoryLabels[issue.category][language]}</p>
                </div>
                <button className="btn btn-sm btn-danger" onClick={() => adoptIssue(issue.id)}>{t.impactPage.adoptNow}</button>
              </article>
            ))}
          </div>
        )}
      </Panel>

      <Panel title={t.impactPage.leaderboardTitle} subtitle={t.impactPage.leaderboardSubtitle}>
        <div className="leaderboard">
          {leaderboard.map((entry, index) => (
            <div className="leaderboard-row" key={entry.name}>
              <div className="rank-badge">{rankLabel(index)}</div>
              <div className="leaderboard-body">
                <div className="leaderboard-title">
                  <strong>{neighborhoodName(entry.name, language)}</strong>
                  <span>{t.impactPage.resolvedOf(entry.resolved, entry.total)}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${Math.max(entry.completion, 6)}%` }}>
                    <span>{entry.completion}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}

/* -------------------------------- presentational bits -------------------------------- */

function HillMap({ neighborhoods, activeNeighborhood, onPick, language }) {
  const maxOpen = Math.max(1, ...neighborhoods.map(n => n.open))

  return (
    <svg className="hill-map" viewBox="0 0 800 300" role="img" aria-label="Map of neighborhood districts">
      <path d="M0,240 C110,190 220,225 320,175 C420,128 520,185 620,155 C700,132 760,168 800,150 L800,300 L0,300 Z" fill="rgba(255,255,255,0.05)" />
      <path d="M0,260 C130,205 250,250 360,200 C460,155 560,210 660,180 C730,158 770,190 800,175 L800,300 L0,300 Z" fill="rgba(255,255,255,0.09)" />
      <path d="M0,280 C150,225 260,270 380,225 C480,185 580,235 690,205 C740,188 770,210 800,198 L800,300 L0,300 Z" fill="rgba(255,255,255,0.14)" />

      {neighborhoods.map(entry => {
        const color = entry.open > 0 ? 'var(--gold)' : entry.adopted > 0 ? 'var(--indigo)' : 'var(--success)'
        const radius = 9 + (entry.open / maxOpen) * 8
        const active = activeNeighborhood === entry.name
        return (
          <g
            key={entry.name}
            className={`pin-group ${active ? 'active' : ''}`}
            onClick={() => onPick(entry.name)}
            tabIndex={0}
            role="button"
            aria-label={`Filter issues in ${entry.name}`}
            onKeyDown={event => { if (event.key === 'Enter') onPick(entry.name) }}
          >
            {entry.urgent > 0 && <circle className="pin-ring" cx={entry.x} cy={entry.y} r={radius + 8} fill={color} opacity="0.25" />}
            <circle className="pin-core" cx={entry.x} cy={entry.y} r={radius} fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
            <text className="pin-label" x={entry.x} y={entry.y + radius + 14} textAnchor="middle">{neighborhoodName(entry.name, language)}</text>
          </g>
        )
      })}
    </svg>
  )
}

function Stat({ label, value, tone }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{String(value).padStart(2, '0')}</strong>
    </div>
  )
}

function Panel({ title, subtitle, children, bare }) {
  if (bare) return <section className="panel">{children}</section>
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <span className="panel-kicker">Haretna</span>
          <h2>{title}</h2>
        </div>
        <p>{subtitle}</p>
      </div>
      {children}
    </section>
  )
}

function Feature({ icon, title, text }) {
  return (
    <article className="feature-card">
      <span className="feature-icon">{icon}</span>
      <strong>{title}</strong>
      <p>{text}</p>
    </article>
  )
}

function IssueCard({ issue, onAdopt, onClose }) {
  const { language, t } = useApp()
  const daysOld = Math.max(0, Math.floor((Date.now() - new Date(issue.reportedAt).getTime()) / (1000 * 60 * 60 * 24)))
  const canAdopt = issue.status === 'Open'
  const statusClass = issue.status === 'Open' ? 'status-open' : issue.status === 'Adopted' ? 'status-adopted' : 'status-closed'
  const supplies = pick(issue.supplies, language)

  return (
    <article className="issue-card">
      <div className="card-head">
        <div>
          <h3>{pick(issue.title, language)}</h3>
          <p>{neighborhoodName(issue.neighborhood, language)} &middot; {categoryLabels[issue.category][language]}</p>
        </div>
        <span className={`status-pill ${statusClass}`}>{statusLabels[issue.status][language]}</span>
      </div>

      <p className="issue-copy">{pick(issue.description, language)}</p>

      <div className="issue-meta">
        <span><Icon.Clock width={13} height={13} /> {t.issuesPage.daysOld(daysOld)}</span>
        <span><Icon.Users width={13} height={13} /> {issue.adoptedBy ? t.issuesPage.adoptedByFn(pick(issue.adoptedBy, language)) : t.issuesPage.needsVolunteer}</span>
      </div>

      {supplies && (
        <div className="tag-cloud">
          {supplies.split('\n').filter(Boolean).map(item => <span key={item}>{item}</span>)}
        </div>
      )}

      <div className="card-actions">
        <button className="btn btn-sm btn-primary" onClick={onAdopt} disabled={!canAdopt}>{t.issuesPage.adopt}</button>
        <button className="btn btn-sm btn-ghost" onClick={onClose} disabled={issue.status === 'Closed'}>{t.issuesPage.resolve}</button>
      </div>
    </article>
  )
}

function InputField({ label, value, onChange, placeholder, type = 'text', error }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} aria-invalid={Boolean(error)} />
      {error && <span className="field-error">{error}</span>}
    </label>
  )
}

function SelectField({ label, value, onChange, options, labels, language }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={event => onChange(event.target.value)}>
        {options.map(option => <option key={option} value={option}>{labels[option][language]}</option>)}
      </select>
    </label>
  )
}

function TextAreaField({ label, value, onChange, placeholder, error }) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} rows="4" aria-invalid={Boolean(error)} />
      {error && <span className="field-error">{error}</span>}
    </label>
  )
}