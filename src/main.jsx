import React, { useMemo, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, Baby, Apple, CalendarDays, Heart, Home, Moon, Sun, Menu, X, ArrowRight,
  ChartNoAxesColumnIncreasing, ClipboardCheck, Sparkles, ShieldCheck, Zap,
  MonitorSmartphone, Stethoscope, Info, ChevronRight, ChevronLeft, Calendar,
  AlertTriangle, CheckCircle2, RotateCcw, Printer, Star
} from 'lucide-react';
import { developmentalMilestones } from './milestones.js';
import { assessmentAges } from './assessment.js';
import { getTheme, applyTheme, syncFrames, THEME_EVENT } from './theme.js';
import './style.css';

const tools = [
  { key: 'growth', title: 'Child Growth Chart', desc: 'Height, weight, BMI & head circumference centiles', href: 'growth.html', icon: ChartNoAxesColumnIncreasing, tone: 'cyan', sub: 'WHO / IAP Centiles' },
  { key: 'milestones', title: 'Developmental Milestones', desc: 'Age-wise skills and developmental checklist', href: 'milestones.html', icon: Baby, tone: 'violet', sub: 'Age-wise Development' },
  { key: 'period', title: 'Period & Cycle Calculator', desc: 'Cycle details, next period, ovulation & fertile calendar', href: 'period.html', icon: CalendarDays, tone: 'pink', sub: 'Cycle & Fertility Calendar' },
  { key: 'edd', title: 'EDD Calculator', desc: 'Expected delivery date, pregnancy calendar & trimesters', href: 'edd.html', icon: Heart, tone: 'cyan', sub: 'Pregnancy Calendar' },
  { key: 'nutrition', title: 'Nutrition Guide', desc: 'Age-based feeding and balanced-meal guidance', href: 'nutrition.html', icon: Apple, tone: 'pink', sub: 'Age-wise Nutrition' },
];

function normalizeRoute(p) {
  const clean = (p || '').toLowerCase().replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  if (clean === '/growth' || clean.endsWith('/growth')) return 'growth';
  if (clean === '/milestones' || clean.endsWith('/milestones')) return 'milestones';
  if (clean === '/period' || clean.endsWith('/period')) return 'period';
  if (clean === '/edd' || clean.endsWith('/edd')) return 'edd';
  if (clean === '/nutrition' || clean.endsWith('/nutrition')) return 'nutrition';
  return 'home';
}

function parseDate(v) {
  if (!v) return null;
  const parts = v.split('-').map(Number);
  if (parts.length !== 3) return null;
  const x = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  return Number.isNaN(x.getTime()) ? null : x;
}

function toISODate(d) {
  if (!d) return '';
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(d, n) {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

function isSameDay(d1, d2) {
  if (!d1 || !d2) return false;
  return d1.getUTCFullYear() === d2.getUTCFullYear() &&
         d1.getUTCMonth() === d2.getUTCMonth() &&
         d1.getUTCDate() === d2.getUTCDate();
}

function isBetween(d, start, end) {
  if (!d || !start || !end) return false;
  const t = d.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

function fmtDate(d) {
  if (!d) return '';
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(d);
}

function fmtMonthYear(d) {
  if (!d) return '';
  return new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
}

function getLocalToday() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

// Age-specific developmental warning signs (Red flags)
const ageRedFlags = {
  2: ['Doesn’t respond to loud sounds', 'Doesn’t watch things as they move', 'Doesn’t smile at people', 'Doesn’t bring hands to mouth', 'Cannot hold head up when pushing up on tummy'],
  4: ['Doesn’t watch things as they move', 'Doesn’t smile at people', 'Cannot hold head steady', 'Doesn’t coo or make sounds', 'Doesn’t push down with legs when feet placed on flat surface'],
  6: ['Doesn’t try to get things in reach', 'Shows no affection to caregivers', 'Doesn’t respond to sounds around them', 'Doesn’t make vowel sounds (“ah”, “eh”, “oh”)', 'Doesn’t roll over in either direction', 'Seems very stiff or very floppy'],
  9: ['Doesn’t bear weight on legs with support', 'Doesn’t sit with help', 'Doesn’t babble (“mama”, “baba”)', 'Doesn’t play games involving back-and-forth', 'Doesn’t respond to own name', 'Doesn’t seem to recognize familiar people'],
  12: ['Doesn’t crawl', 'Cannot stand when supported', 'Doesn’t search for things that are hidden', 'Doesn’t say single words like “mama” or “dada”', 'Doesn’t learn gestures like waving or shaking head', 'Doesn’t point to things'],
  15: ['Doesn’t point to show things to others', 'Cannot walk', 'Doesn’t know what common objects are for', 'Doesn’t copy others', 'Doesn’t gain new words (fewer than 1–2 words)'],
  18: ['Doesn’t point to show things', 'Cannot walk independently', 'Doesn’t know what familiar things are for (cup, spoon)', 'Doesn’t copy others', 'Doesn’t have at least 6 words', 'Loses skills once had'],
  24: ['Doesn’t use 2-word phrases (e.g. “more milk”)', 'Doesn’t know what to do with common things (brush, phone, fork)', 'Doesn’t copy actions or words', 'Doesn’t follow simple directions', 'Doesn’t walk steadily', 'Loses skills once had'],
  30: ['Doesn’t speak in sentences of 3 or more words', 'Difficulty walking or running smoothly', 'Poor eye contact', 'Doesn’t engage in pretend play', 'Difficulty understanding simple instructions'],
  36: ['Falls down a lot or has trouble with stairs', 'Drools or has very unclear speech', 'Cannot work simple toys (puzzles, turning handles)', 'Doesn’t speak in sentences', 'Doesn’t understand simple instructions', 'Doesn’t make eye contact'],
  48: ['Cannot jump in place', 'Has trouble scribbling', 'Shows no interest in interactive games or make-believe', 'Ignores other children or doesn’t respond to people outside family', 'Resists dressing, sleeping, using the toilet', 'Cannot retell a favorite story'],
  60: ['Doesn’t show a wide range of emotions', 'Shows extreme behavior (unusually fearful, aggressive, shy, sad)', 'Unusually withdrawn and not active', 'Easily distracted, cannot focus for more than 5 minutes', 'Cannot tell what’s real and what’s make-believe', 'Cannot brush teeth or wash hands independently']
};

function Header({ active, onNavigate }) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(getTheme);
  const dark = theme === 'dark';

  useEffect(() => {
    const onChange = (e) => setTheme(e.detail);
    window.addEventListener(THEME_EVENT, onChange);
    return () => window.removeEventListener(THEME_EVENT, onChange);
  }, []);

  const navItems = [
    ['Home', 'index.html', 'home'],
    ['Growth', 'growth.html', 'growth'],
    ['Milestones', 'milestones.html', 'milestones'],
    ['Period & Cycle', 'period.html', 'period'],
    ['EDD Calculator', 'edd.html', 'edd'],
    ['Nutrition', 'nutrition.html', 'nutrition'],
  ];

  return (
    <header className="topbar">
      <a className="brand" href="index.html" onClick={(e) => { e.preventDefault(); onNavigate('home', 'index.html'); }}>
        <span className="brandmark"><Activity /></span>
        <span><b>GrowVita</b><small>by Dr Mir Bilal, MBBS, MD Pediatrics</small></span>
      </a>
      <nav className={open ? 'nav open' : 'nav'}>
        {navItems.map(([name, href, key]) => (
          <a
            className={active === key ? 'selected' : ''}
            href={href}
            key={key}
            onClick={(e) => { e.preventDefault(); setOpen(false); onNavigate(key, href); }}
          >
            {name}
          </a>
        ))}
      </nav>
      <div className="head-actions">
        <button
          className="icon-btn"
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          data-theme-toggle
          onClick={() => setTheme(applyTheme(dark ? 'light' : 'dark'))}
        >
          {dark ? <Sun /> : <Moon />}
        </button>
        <button
          className="icon-btn menu-btn"
          aria-label="Open menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}

function BottomNav({ active, onNavigate }) {
  const items = [
    ['Home', 'index.html', Home, 'home'],
    ['Growth', 'growth.html', ChartNoAxesColumnIncreasing, 'growth'],
    ['Milestones', 'milestones.html', Baby, 'milestones'],
    ['Period', 'period.html', CalendarDays, 'period'],
    ['EDD', 'edd.html', Heart, 'edd'],
    ['Nutrition', 'nutrition.html', Apple, 'nutrition'],
  ];

  return (
    <nav className="bottom-nav">
      {items.map(([name, href, Icon, key]) => (
        <a
          className={active === key ? 'active' : ''}
          href={href}
          key={key}
          onClick={(e) => { e.preventDefault(); onNavigate(key, href); }}
        >
          <Icon />
          <span>{name}</span>
        </a>
      ))}
    </nav>
  );
}

function Footer() {
  return (
    <footer className="trust">
      <div><ShieldCheck /><b>Privacy First</b><small>Your data stays on your device</small></div>
      <div><Zap /><b>Fast & Easy</b><small>Instant calculations</small></div>
      <div><MonitorSmartphone /><b>Works Everywhere</b><small>Mobile, tablet and desktop</small></div>
      <div><Heart /><b>Doctor Verified</b><small>Built for parents & clinicians</small></div>
    </footer>
  );
}

function PageIntro({ icon: Icon, kicker, title, desc, active, onNavigate }) {
  return (
    <>
      <Header active={active} onNavigate={onNavigate} />
      <div className="page-intro">
        <span className="page-icon"><Icon /></span>
        <div>
          <span className="eyebrow">{kicker}</span>
          <h1>{title}</h1>
          <p>{desc}</p>
        </div>
      </div>
    </>
  );
}

// Reusable Month-by-Month Calendar Component
function InteractiveCalendar({
  viewDate,
  onViewDateChange,
  selectedDate,
  onSelectDate,
  title = 'Select Date on Calendar',
  highlightConfig = {},
  legendItems = [],
  jumpActions = []
}) {
  const year = viewDate.getUTCFullYear();
  const month = viewDate.getUTCMonth();
  const today = useMemo(() => getLocalToday(), []);

  const { cells, monthLabel } = useMemo(() => {
    const firstDay = new Date(Date.UTC(year, month, 1));
    const startDayOfWeek = firstDay.getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const label = fmtMonthYear(firstDay);

    const cellList = [];
    // Leading empty slots
    for (let i = 0; i < startDayOfWeek; i++) {
      cellList.push({ empty: true, key: `empty-${i}` });
    }
    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(Date.UTC(year, month, day));
      cellList.push({
        empty: false,
        day,
        date,
        key: `day-${year}-${month}-${day}`
      });
    }
    return { cells: cellList, monthLabel: label };
  }, [year, month]);

  const prevMonth = () => {
    onViewDateChange(new Date(Date.UTC(year, month - 1, 1)));
  };

  const nextMonth = () => {
    onViewDateChange(new Date(Date.UTC(year, month + 1, 1)));
  };

  return (
    <div className="calendar-card">
      <div className="calendar-top">
        <div className="calendar-title">
          <Calendar />
          <span>{title}</span>
        </div>
        <div className="calendar-nav">
          <button className="cal-nav-btn" type="button" onClick={prevMonth} aria-label="Previous month">
            <ChevronLeft size={18} />
          </button>
          <span className="cal-month-label">{monthLabel}</span>
          <button className="cal-nav-btn" type="button" onClick={nextMonth} aria-label="Next month">
            <ChevronRight size={18} />
          </button>
          {jumpActions.map(action => (
            <button
              key={action.label}
              className="cal-jump-btn"
              type="button"
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="cal-day-name">{d}</div>
        ))}
        {cells.map(c => {
          if (c.empty) {
            return <div key={c.key} className="cal-day-cell empty" />;
          }

          const isSelected = selectedDate && isSameDay(c.date, selectedDate);
          const isToday = isSameDay(c.date, today);

          // Custom highlight tags
          let customClass = '';
          let badge = '';

          if (highlightConfig.isPeriod && highlightConfig.isPeriod(c.date)) {
            customClass += ' period';
            badge = 'Period';
          }
          if (highlightConfig.isOvulation && highlightConfig.isOvulation(c.date)) {
            customClass += ' ovulation';
            badge = '★ Peak';
          } else if (highlightConfig.isFertile && highlightConfig.isFertile(c.date)) {
            customClass += ' fertile';
            badge = 'Fertile';
          }
          if (highlightConfig.isNextPeriod && highlightConfig.isNextPeriod(c.date)) {
            customClass += ' next-period';
            badge = badge || 'Next';
          }
          if (highlightConfig.isEdd && highlightConfig.isEdd(c.date)) {
            customClass += ' edd-day';
            badge = '♥ Due Date';
          }
          if (highlightConfig.isConception && highlightConfig.isConception(c.date)) {
            customClass += ' conception-day';
            badge = 'Conception';
          }
          if (highlightConfig.isTrimester && highlightConfig.isTrimester(c.date)) {
            customClass += ' trimester-day';
            badge = highlightConfig.getTrimesterLabel ? highlightConfig.getTrimesterLabel(c.date) : 'Trim';
          }

          return (
            <div
              key={c.key}
              className={`cal-day-cell ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${customClass}`}
              onClick={() => onSelectDate && onSelectDate(c.date)}
            >
              <span>{c.day}</span>
              {badge && <span className="cal-badge">{badge}</span>}
            </div>
          );
        })}
      </div>

      {legendItems.length > 0 && (
        <div className="calendar-legend">
          {legendItems.map(item => (
            <div key={item.label} className="legend-item">
              <span className={`legend-dot ${item.type}`} />
              <span>{item.label}</span>
            </div>
          ))}
          <div className="legend-item">
            <span className="legend-dot today" />
            <span>Today</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------
// Dedicated Page 1: Child Growth Chart
// ----------------------------------------
function GrowthPage({ onNavigate }) {
  const iframeRef = React.useRef(null);
  const [iframeHeight, setIframeHeight] = useState(900);

  // The embedded page reports the height of its own content (body), which does
  // not depend on the frame's height — so resizing the frame can't feed back
  // into a new, larger measurement (the previous cause of endless scrolling).
  useEffect(() => {
    const handleMsg = (e) => {
      const frame = iframeRef.current;
      if (!frame || e.source !== frame.contentWindow || !e.data) return;
      if (e.data.type === 'GROWTH_READY') syncFrames();
      if (e.data.type === 'GROWTH_RESIZE' && Number.isFinite(e.data.height)) {
        const h = Math.max(400, Math.ceil(e.data.height));
        setIframeHeight((prev) => (Math.abs(prev - h) > 1 ? h : prev));
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);

  return (
    <>
      <Header active="growth" onNavigate={onNavigate} />
      <main className="legacy-wrap">
        <div className="legacy-title">
          <span className="eyebrow">WHO 2006 · IAP 2015</span>
          <h1>Child Growth Chart & Centile Calculator</h1>
          <p>
            Dedicated pediatric growth assessment. Calculates weight-for-age, height/length-for-age,
            BMI-for-age, and head circumference centiles, interactive growth trajectory charts,
            mid-parental target height, and serial visit logs.
          </p>
        </div>
        <iframe
          ref={iframeRef}
          title="GrowVita Growth Chart & Centile Assessment"
          src="legacy-growth.html"
          scrolling="no"
          style={{
            width: '100%',
            height: `${iframeHeight}px`,
            border: 'none',
            display: 'block',
            overflow: 'hidden',
            background: 'transparent'
          }}
          loading="eager"
          onLoad={() => syncFrames()}
        />
      </main>
      <BottomNav active="growth" onNavigate={onNavigate} />
    </>
  );
}

// ----------------------------------------
// Dedicated Page 2: Developmental Milestones
// (ONLY the required parameters for the entered age are visible)
// ----------------------------------------
function MilestonesPage({ onNavigate }) {
  const [y, setY] = useState('');
  const [m, setM] = useState('');
  const [evaluatedAge, setEvaluatedAge] = useState(null);
  const [checkedSkills, setCheckedSkills] = useState({});

  const presetAges = [
    { label: '2 mo', years: '0', months: '2' },
    { label: '4 mo', years: '0', months: '4' },
    { label: '6 mo', years: '0', months: '6' },
    { label: '9 mo', years: '0', months: '9' },
    { label: '12 mo (1y)', years: '1', months: '0' },
    { label: '15 mo', years: '1', months: '3' },
    { label: '18 mo', years: '1', months: '6' },
    { label: '2 yrs', years: '2', months: '0' },
    { label: '30 mo (2.5y)', years: '2', months: '6' },
    { label: '3 yrs', years: '3', months: '0' },
    { label: '4 yrs', years: '4', months: '0' },
    { label: '5 yrs', years: '5', months: '0' },
  ];

  const hasEnteredAge = y !== '' || m !== '';
  const totalMonths = (Number(y) || 0) * 12 + (Number(m) || 0);
  const isValidAge = !hasEnteredAge || (
    Number.isInteger(Number(y || 0)) && Number.isInteger(Number(m || 0)) &&
    Number(y || 0) >= 0 && Number(y || 0) <= 18 && Number(m || 0) >= 0 && Number(m || 0) <= 11 &&
    !(Number(y || 0) === 18 && Number(m || 0) > 0)
  );

  function handleEvaluate(overrideMonths = null) {
    if (overrideMonths !== null) {
      setEvaluatedAge(overrideMonths);
      setCheckedSkills({});
      return;
    }
    if (!hasEnteredAge) return;
    setEvaluatedAge(totalMonths);
    setCheckedSkills({});
  }

  function handleSelectPreset(preset) {
    setY(preset.years);
    setM(preset.months);
    const months = Number(preset.years) * 12 + Number(preset.months);
    handleEvaluate(months);
  }

  // Filter CDC milestone data strictly for the evaluated age
  const matchedMilestone = useMemo(() => {
    if (evaluatedAge === null) return null;
    const candidates = developmentalMilestones.filter(x => x.months <= evaluatedAge);
    return candidates.length > 0 ? candidates[candidates.length - 1] : developmentalMilestones[0];
  }, [evaluatedAge]);

  // Match the single clinical assessment domain group (1–5 years) for the evaluated age
  const matchedClinicalAssessment = useMemo(() => {
    if (evaluatedAge === null || evaluatedAge < 12 || evaluatedAge > 72) return null;
    // Map age in months to 12, 24, 36, 48, or 60
    const matched = assessmentAges.filter(a => a.months <= evaluatedAge).at(-1);
    return matched || assessmentAges[0];
  }, [evaluatedAge]);

  // Red flags for this specific age
  const currentRedFlags = useMemo(() => {
    if (evaluatedAge === null) return null;
    const availableAges = Object.keys(ageRedFlags).map(Number).sort((a, b) => a - b);
    const match = availableAges.filter(a => a <= evaluatedAge).at(-1) || availableAges[0];
    return { age: match, items: ageRedFlags[match] };
  }, [evaluatedAge]);

  // Calculate completion percentage strictly for the active parameters
  const activeSkillsCount = useMemo(() => {
    let count = 0;
    if (matchedMilestone && evaluatedAge >= 2 && evaluatedAge <= 60) {
      count += (matchedMilestone.groups || []).reduce((sum, g) => sum + g[2].length, 0);
    }
    if (matchedClinicalAssessment) {
      count += (matchedClinicalAssessment.domains || []).reduce((sum, d) => sum + d.items.length, 0);
    }
    return count;
  }, [matchedMilestone, matchedClinicalAssessment, evaluatedAge]);

  const completedCount = Object.values(checkedSkills).filter(Boolean).length;
  const progressPercent = activeSkillsCount > 0 ? Math.round((completedCount / activeSkillsCount) * 100) : 0;

  return (
    <>
      <PageIntro
        icon={Baby}
        kicker="DEVELOPMENT TRACKER"
        title="Developmental Milestones"
        desc="Check milestones and clinical parameters specific to your child's age. Only the required parameters for the entered age are shown."
        active="milestones"
        onNavigate={onNavigate}
      />
      <main className="page-wrap">
        {/* Child's Age Input & Preset Chips */}
        <section className="panel">
          <h2>Child’s Age</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: -6, marginBottom: 14 }}>
            Enter the exact age or click any quick age chip to view only that age's developmental parameters.
          </p>
          <div className="preset-chips">
            {presetAges.map(preset => {
              const chipMonths = Number(preset.years) * 12 + Number(preset.months);
              const isActive = evaluatedAge === chipMonths;
              return (
                <button
                  key={preset.label}
                  type="button"
                  className={`preset-chip ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectPreset(preset)}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
          <div className="age-fields">
            <label>
              Age in years (0–18)
              <input
                type="number"
                min="0"
                max="18"
                value={y}
                onChange={e => setY(e.target.value)}
              />
            </label>
            <label>
              Additional months (0–11)
              <input
                type="number"
                min="0"
                max="11"
                value={m}
                onChange={e => setM(e.target.value)}
              />
            </label>
          </div>
          <button className="primary" onClick={() => handleEvaluate()}>
            Check Milestones for this Age <ArrowRight />
          </button>
          {!isValidAge && (
            <p className="error" style={{ marginTop: 14 }}>
              Please enter a valid age from 0 to 18 years and 0 to 11 additional months.
            </p>
          )}
        </section>

        {/* Display strictly the parameters for the entered age */}
        {evaluatedAge !== null && isValidAge && (
          <>
            {/* Age Banner & Single Age Progress */}
            <div className="age-focus-banner">
              <div>
                <span className="age-focus-badge">Parameters for Selected Age</span>
                <h3 className="age-focus-title">
                  {evaluatedAge < 2
                    ? 'Birth – 2 Months (Infant Early Parameters)'
                    : evaluatedAge > 60
                    ? `${Math.floor(evaluatedAge / 12)} Years ${evaluatedAge % 12 ? `${evaluatedAge % 12} Months` : ''} (School Age)`
                    : matchedMilestone?.label || `${evaluatedAge} Months`}
                </h3>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                  {completedCount} of {activeSkillsCount} parameters observed ({progressPercent}%)
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="secondary-action"
                  type="button"
                  onClick={() => window.print()}
                  title="Print this assessment"
                >
                  <Printer size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  Print / Save PDF
                </button>
              </div>
            </div>

            <div className="progress">
              <div><i style={{ width: `${progressPercent}%` }} /></div>
            </div>

            {/* Core Developmental Skills Checklist (Only this age) */}
            {evaluatedAge < 2 ? (
              <section className="panel results">
                <div className="result-head">
                  <span className="eyebrow">NEWBORN PARAMETERS</span>
                  <h2>Birth to 2 Months Milestones</h2>
                  <p>For newborns younger than 2 months, observe the following early behavioral and motor parameters:</p>
                </div>
                <div className="milestone-group">
                  {[
                    'Alertness and spontaneous movement of arms and legs',
                    'Turns head toward caregiver voice and familiar sounds',
                    'Focuses on faces and high-contrast objects at 20–30 cm',
                    'Calms when spoken to or held',
                    'Feeds smoothly with coordinated suck and swallow'
                  ].map((skill, idx) => (
                    <label className="check" key={idx}>
                      <input
                        type="checkbox"
                        checked={!!checkedSkills[`early-${idx}`]}
                        onChange={e => setCheckedSkills(v => ({ ...v, [`early-${idx}`]: e.target.checked }))}
                      />
                      <span>{skill}</span>
                    </label>
                  ))}
                </div>
              </section>
            ) : evaluatedAge > 60 ? (
              <section className="panel results">
                <div className="result-head">
                  <span className="eyebrow">SCHOOL-AGE DEVELOPMENT</span>
                  <h2>{Math.floor(evaluatedAge / 12)} Years Old — Developmental Parameters</h2>
                  <p>For school-age children (older than 5 years), observe these key functional parameters:</p>
                </div>
                <div className="milestone-group">
                  {[
                    'Clear, complex sentence communication with peers and adults',
                    'Following multi-step complex instructions and classroom routines',
                    'Active physical coordination (hopping, skipping, balance, catching ball)',
                    'Developing friendships, sharing, empathy and peer interactions',
                    'Independent daily living skills: dressing, eating, personal hygiene'
                  ].map((skill, idx) => (
                    <label className="check" key={idx}>
                      <input
                        type="checkbox"
                        checked={!!checkedSkills[`school-${idx}`]}
                        onChange={e => setCheckedSkills(v => ({ ...v, [`school-${idx}`]: e.target.checked }))}
                      />
                      <span>{skill}</span>
                    </label>
                  ))}
                </div>
              </section>
            ) : (
              <section className="panel results">
                <div className="result-head">
                  <span className="eyebrow">AGE-SPECIFIC DEVELOPMENTAL SKILLS</span>
                  <h2>{matchedMilestone?.label} Developmental Milestones</h2>
                  <p>Check the observable skills for this specific age across social, communication, learning, and motor domains:</p>
                </div>
                <div className="milestone-groups">
                  {(matchedMilestone?.groups || []).map(([domainName, emoji, skills]) => (
                    <article className="milestone-group" key={domainName}>
                      <h3>{emoji} {domainName}</h3>
                      {skills.map((skill, i) => {
                        const id = `skill-${matchedMilestone.months}-${domainName}-${i}`;
                        return (
                          <label className="check" key={id}>
                            <input
                              type="checkbox"
                              checked={!!checkedSkills[id]}
                              onChange={e => setCheckedSkills(v => ({ ...v, [id]: e.target.checked }))}
                            />
                            <span>{skill}</span>
                          </label>
                        );
                      })}
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Clinical Developmental Checklist (Only for the matched age band) */}
            {matchedClinicalAssessment && (
              <section className="panel assessment-panel">
                <div className="assessment-heading">
                  <div>
                    <span className="eyebrow">CLINICAL DOMAIN CHECKLIST</span>
                    <h2>{matchedClinicalAssessment.label} — 5 Domains</h2>
                    <p>Parameters specifically verified by pediatricians for this age band:</p>
                  </div>
                </div>
                <div className="assessment-domains">
                  {matchedClinicalAssessment.domains.map(domain => (
                    <article className="milestone-group" key={domain.name}>
                      <h4>{domain.name}</h4>
                      {domain.items.map((item, index) => {
                        const id = `clin-${matchedClinicalAssessment.months}-${domain.name}-${index}`;
                        return (
                          <label className="check" key={id}>
                            <input
                              type="checkbox"
                              checked={!!checkedSkills[id]}
                              onChange={e => setCheckedSkills(v => ({ ...v, [id]: e.target.checked }))}
                            />
                            <span>{item}</span>
                          </label>
                        );
                      })}
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Contextual Red Flags / When to seek clinical evaluation */}
            {currentRedFlags && currentRedFlags.items.length > 0 && (
              <div className="red-flags-card">
                <h4>
                  <AlertTriangle size={18} />
                  Developmental Warning Signs at {currentRedFlags.age < 12 ? `${currentRedFlags.age} Months` : `${currentRedFlags.age / 12} Years`}
                </h4>
                <ul>
                  {currentRedFlags.items.map((flag, idx) => (
                    <li key={idx}>{flag}</li>
                  ))}
                </ul>
                <p style={{ margin: '10px 0 0', fontSize: 11, color: 'var(--danger-text)' }}>
                  If you notice any of these warning signs, or if the child loses previously learned skills, consult your pediatrician for a comprehensive developmental assessment.
                </p>
              </div>
            )}
          </>
        )}

        {evaluatedAge === null && (
          <section className="panel" style={{ textAlign: 'center', padding: '38px 20px', marginTop: 18 }}>
            <Baby style={{ width: 46, height: 46, color: 'var(--purple)', margin: '0 auto 12px', display: 'block', opacity: 0.8 }} />
            <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>No Age Selected</h3>
            <p style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 460, margin: '0 auto' }}>
              Enter completed years and additional months above, or choose an age preset to view age-specific developmental skills and warning signs.
            </p>
          </section>
        )}

        <Footer />
      </main>
      <BottomNav active="milestones" onNavigate={onNavigate} />
    </>
  );
}

// ----------------------------------------
// Dedicated Page 3: Period & Cycle Calculator (with Interactive Calendar)
// ----------------------------------------
function PeriodPage({ onNavigate }) {
  const [lmpStr, setLmpStr] = useState('');
  const [cycleLength, setCycleLength] = useState('28');
  const [bleedDays, setBleedDays] = useState('5');
  const [calViewDate, setCalViewDate] = useState(() => getLocalToday());
  const [clickedDayInfo, setClickedDayInfo] = useState(null);

  const parsedLmp = useMemo(() => parseDate(lmpStr), [lmpStr]);
  const cycle = Number(cycleLength);
  const bleed = Number(bleedDays) || 5;
  const today = useMemo(() => getLocalToday(), []);

  // Cycle calculations
  const cycleData = useMemo(() => {
    if (!parsedLmp || Number.isNaN(cycle) || cycle < 21 || cycle > 40) return null;

    const elapsed = Math.round((today.getTime() - parsedLmp.getTime()) / 86400000);
    const completedCycles = elapsed >= 0 ? Math.floor(elapsed / cycle) : 0;
    const currentCycleStart = addDays(parsedLmp, completedCycles * cycle);
    const nextPeriodStart = addDays(currentCycleStart, cycle);
    const nextPeriodEnd = addDays(nextPeriodStart, bleed - 1);

    // Current cycle ovulation & fertile window
    const currentOvulation = addDays(nextPeriodStart, -14);
    const currentFertileStart = addDays(currentOvulation, -5);
    const currentFertileEnd = addDays(currentOvulation, 0);

    // Following cycle (for calendar lookahead)
    const cycle3Start = addDays(nextPeriodStart, cycle);
    const cycle2Ovulation = addDays(cycle3Start, -14);
    const cycle2FertileStart = addDays(cycle2Ovulation, -5);

    const currentCycleDay = elapsed >= 0 ? (elapsed % cycle) + 1 : 0;
    const daysUntilNext = Math.round((nextPeriodStart.getTime() - today.getTime()) / 86400000);

    return {
      currentCycleStart,
      currentCycleDay,
      nextPeriodStart,
      nextPeriodEnd,
      currentOvulation,
      currentFertileStart,
      currentFertileEnd,
      cycle3Start,
      cycle2Ovulation,
      cycle2FertileStart,
      daysUntilNext,
      isOngoing: elapsed >= 0
    };
  }, [parsedLmp, cycle, bleed, today]);

  // Calendar Highlight Configuration
  const highlightConfig = useMemo(() => {
    if (!cycleData) return {};

    return {
      isPeriod: (d) => {
        // Bleeding of current cycle
        const curStart = cycleData.currentCycleStart;
        const curEnd = addDays(curStart, bleed - 1);
        if (isBetween(d, curStart, curEnd)) return true;
        // Bleeding of previous cycle
        const prevStart = addDays(curStart, -cycle);
        const prevEnd = addDays(prevStart, bleed - 1);
        if (isBetween(d, prevStart, prevEnd)) return true;
        return false;
      },
      isNextPeriod: (d) => {
        // Next period
        const nxtStart = cycleData.nextPeriodStart;
        const nxtEnd = cycleData.nextPeriodEnd;
        if (isBetween(d, nxtStart, nxtEnd)) return true;
        // Cycle after next
        const nxt2Start = cycleData.cycle3Start;
        const nxt2End = addDays(nxt2Start, bleed - 1);
        if (isBetween(d, nxt2Start, nxt2End)) return true;
        return false;
      },
      isOvulation: (d) => {
        return isSameDay(d, cycleData.currentOvulation) || isSameDay(d, cycleData.cycle2Ovulation);
      },
      isFertile: (d) => {
        return isBetween(d, cycleData.currentFertileStart, cycleData.currentFertileEnd) ||
               isBetween(d, cycleData.cycle2FertileStart, cycleData.cycle2Ovulation);
      }
    };
  }, [cycleData, cycle, bleed]);

  const legendItems = [
    { label: 'Menstrual Period', type: 'period' },
    { label: 'Fertile Window', type: 'fertile' },
    { label: 'Ovulation Day (Peak)', type: 'ovulation' },
    { label: 'Next Expected Period', type: 'next-period' },
  ];

  const presets = [
    { label: 'Today', daysAgo: 0 },
    { label: '7 Days Ago', daysAgo: 7 },
    { label: '14 Days Ago', daysAgo: 14 },
    { label: '21 Days Ago', daysAgo: 21 },
    { label: '28 Days Ago', daysAgo: 28 },
  ];

  function handleSelectDate(d) {
    const iso = toISODate(d);
    setLmpStr(iso);
    setClickedDayInfo({
      date: d,
      text: `Selected as Last Period: ${fmtDate(d)}`
    });
  }

  return (
    <>
      <PageIntro
        icon={CalendarDays}
        kicker="WOMEN’S HEALTH"
        title="Period & Cycle Calculator"
        desc="Interactive menstrual and fertility calendar. Track next period, ovulation day, and the fertile window directly on a monthly calendar."
        active="period"
        onNavigate={onNavigate}
      />
      <main className="page-wrap">
        {/* Cycle Inputs & Quick Presets */}
        <section className="panel">
          <h2>Cycle Details</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: -6, marginBottom: 14 }}>
            Click any day on the calendar below or select a date preset to set the first day of your last period.
          </p>
          <div className="preset-chips">
            {presets.map(p => {
              const target = addDays(today, -p.daysAgo);
              const iso = toISODate(target);
              const isSelected = lmpStr === iso;
              return (
                <button
                  key={p.label}
                  type="button"
                  className={`preset-chip ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    setLmpStr(iso);
                    setCalViewDate(target);
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <div className="form-grid">
            <label>
              First day of last menstrual period (LMP)
              <input
                type="date"
                value={lmpStr}
                onChange={e => {
                  setLmpStr(e.target.value);
                  const p = parseDate(e.target.value);
                  if (p) setCalViewDate(p);
                }}
              />
            </label>
            <label>
              Average cycle length: <b>{cycleLength} days</b>
              <input
                type="range"
                min="21"
                max="40"
                value={cycleLength}
                onChange={e => setCycleLength(e.target.value)}
              />
              <small>Common normal range: 21 to 40 days (average 28 days).</small>
            </label>
          </div>
        </section>

        {/* Interactive Cycle Calendar View - Placed Prominently Right Under Cycle Details! */}
        <InteractiveCalendar
          viewDate={calViewDate}
          onViewDateChange={setCalViewDate}
          selectedDate={parsedLmp}
          onSelectDate={handleSelectDate}
          title={parsedLmp ? "Interactive Menstrual & Fertility Calendar" : "Click Any Date on Calendar to Set Last Period (LMP)"}
          highlightConfig={highlightConfig}
          legendItems={legendItems}
          jumpActions={[
            ...(parsedLmp ? [{ label: 'View Last Period', onClick: () => setCalViewDate(parsedLmp) }] : []),
            { label: 'View Current Month', onClick: () => setCalViewDate(today) },
            ...(cycleData ? [{ label: 'View Next Period', onClick: () => setCalViewDate(cycleData.nextPeriodStart) }] : [])
          ]}
        />

        {/* Results Cards */}
        {cycleData ? (
          <section className="panel results">
            <div className="result-head">
              <span className="eyebrow">CYCLE OVERVIEW</span>
              <h2>Your Cycle Predictions</h2>
            </div>
            <div className="calc-results">
              <article className="calc-result primary-result">
                <small>Next Expected Period</small>
                <b>{fmtDate(cycleData.nextPeriodStart)}</b>
                <span>
                  {cycleData.daysUntilNext > 0
                    ? `Expected in ${cycleData.daysUntilNext} days`
                    : cycleData.daysUntilNext === 0
                    ? 'Expected today'
                    : `${Math.abs(cycleData.daysUntilNext)} days overdue`}
                </span>
              </article>
              <article className="calc-result">
                <small>Estimated Ovulation (Peak Fertility)</small>
                <b>{fmtDate(cycleData.currentOvulation)}</b>
                <span>Highest probability of conception (~14 days before next period)</span>
              </article>
              <article className="calc-result">
                <small>Fertile Window</small>
                <b>{fmtDate(cycleData.currentFertileStart)} – {fmtDate(cycleData.currentFertileEnd)}</b>
                <span>6-day fertile phase: 5 days before ovulation through ovulation day</span>
              </article>
              <article className="calc-result">
                <small>Current Cycle Phase</small>
                <b>{cycleData.isOngoing ? `Day ${cycleData.currentCycleDay} of ${cycle}` : 'LMP in Future'}</b>
                <span>
                  {cycleData.currentCycleDay <= bleed
                    ? 'Menstrual Phase'
                    : cycleData.currentCycleDay <= cycle - 14
                    ? 'Follicular / Fertile Phase'
                    : 'Luteal Phase'}
                </span>
              </article>
            </div>
          </section>
        ) : (
          <section className="panel" style={{ textAlign: 'center', padding: '36px 20px', marginTop: 18 }}>
            <CalendarDays style={{ width: 44, height: 44, color: 'var(--pink)', margin: '0 auto 10px', display: 'block', opacity: 0.8 }} />
            <h3 style={{ margin: '0 0 6px', fontSize: 17 }}>No Period Date Selected</h3>
            <p style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 460, margin: '0 auto' }}>
              Select the first day of your last period on the calendar above, type your date into the input field, or choose a quick date preset to calculate your next period and fertility window.
            </p>
          </section>
        )}

        <p className="note">
          <b>Clinical note:</b> Menstrual dates and fertility windows are estimations based on regular cycle patterns. Ovulation timing can fluctuate due to stress, illness, sleep, or hormonal changes. This calendar is an educational tracking aid and should not be relied upon as a primary contraceptive method.
        </p>

        <Footer />
      </main>
      <BottomNav active="period" onNavigate={onNavigate} />
    </>
  );
}

// ----------------------------------------
// Dedicated Page 4: Expected Date of Delivery (EDD) Calculator (with Interactive Calendar)
// ----------------------------------------
function EddPage({ onNavigate }) {
  const [lmpStr, setLmpStr] = useState('');
  const [calViewDate, setCalViewDate] = useState(() => getLocalToday());

  const parsedLmp = useMemo(() => parseDate(lmpStr), [lmpStr]);
  const today = useMemo(() => getLocalToday(), []);

  // EDD calculations (Naegele's rule: LMP + 280 days)
  const eddData = useMemo(() => {
    if (!parsedLmp) return null;

    const edd = addDays(parsedLmp, 280);
    const conception = addDays(parsedLmp, 14);
    const t1End = addDays(parsedLmp, 13 * 7); // end of week 13
    const t2End = addDays(parsedLmp, 27 * 7); // end of week 27
    const fullTerm = addDays(parsedLmp, 37 * 7); // 37 weeks

    const gestationalDays = Math.round((today.getTime() - parsedLmp.getTime()) / 86400000);
    const weeks = Math.floor(gestationalDays / 7);
    const days = gestationalDays % 7;
    const remainingDays = Math.round((edd.getTime() - today.getTime()) / 86400000);

    const progressPercent = Math.min(100, Math.max(0, Math.round((gestationalDays / 280) * 100)));

    let trimester = 'First Trimester';
    if (weeks >= 28) trimester = 'Third Trimester';
    else if (weeks >= 14) trimester = 'Second Trimester';

    return {
      edd,
      conception,
      t1End,
      t2End,
      fullTerm,
      gestationalDays,
      weeks,
      days,
      remainingDays,
      progressPercent,
      trimester
    };
  }, [parsedLmp, today]);

  // Calendar Highlight Configuration for Pregnancy Milestones
  const highlightConfig = useMemo(() => {
    if (!eddData || !parsedLmp) return {};

    return {
      isPeriod: (d) => isSameDay(d, parsedLmp), // LMP
      isConception: (d) => isSameDay(d, eddData.conception),
      isTrimester: (d) => isSameDay(d, eddData.t1End) || isSameDay(d, eddData.t2End) || isSameDay(d, eddData.fullTerm),
      getTrimesterLabel: (d) => {
        if (isSameDay(d, eddData.t1End)) return 'T1 End';
        if (isSameDay(d, eddData.t2End)) return 'T2 End';
        if (isSameDay(d, eddData.fullTerm)) return 'Term';
        return '';
      },
      isEdd: (d) => isSameDay(d, eddData.edd),
    };
  }, [eddData, parsedLmp]);

  const legendItems = [
    { label: 'LMP (Cycle Start)', type: 'period' },
    { label: 'Conception (~Day 14)', type: 'conception' },
    { label: 'Trimester Milestone', type: 'fertile' },
    { label: 'Due Date (EDD)', type: 'edd' },
  ];

  const presets = [
    { label: '4 Weeks Ago', weeks: 4 },
    { label: '8 Weeks Ago', weeks: 8 },
    { label: '12 Weeks Ago', weeks: 12 },
    { label: '20 Weeks Ago', weeks: 20 },
    { label: 'Today', weeks: 0 },
  ];

  function handleSelectDate(d) {
    const iso = toISODate(d);
    setLmpStr(iso);
  }

  return (
    <>
      <PageIntro
        icon={Heart}
        kicker="PREGNANCY DATING"
        title="Expected Date of Delivery (EDD)"
        desc="Calculate estimated due date, gestational age, and view your pregnancy calendar and trimester milestones."
        active="edd"
        onNavigate={onNavigate}
      />
      <main className="page-wrap">
        {/* Pregnancy Dating Inputs & Presets */}
        <section className="panel">
          <h2>Pregnancy Dating</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: -6, marginBottom: 14 }}>
            Click on the calendar or choose a quick preset to set the first day of your last menstrual period (LMP).
          </p>
          <div className="preset-chips">
            {presets.map(p => {
              const target = addDays(today, -p.weeks * 7);
              const iso = toISODate(target);
              const isSelected = lmpStr === iso;
              return (
                <button
                  key={p.label}
                  type="button"
                  className={`preset-chip ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    setLmpStr(iso);
                    setCalViewDate(target);
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <div className="form-grid single">
            <label>
              First day of last menstrual period (LMP)
              <input
                type="date"
                value={lmpStr}
                onChange={e => {
                  setLmpStr(e.target.value);
                  const p = parseDate(e.target.value);
                  if (p) setCalViewDate(p);
                }}
              />
            </label>
          </div>
        </section>

        {/* Interactive Pregnancy Month Calendar - Prominently placed right under Pregnancy Dating! */}
        <InteractiveCalendar
          viewDate={calViewDate}
          onViewDateChange={setCalViewDate}
          selectedDate={parsedLmp}
          onSelectDate={handleSelectDate}
          title={parsedLmp ? "Pregnancy Journey Calendar" : "Click Any Date on Calendar to Set Last Menstrual Period (LMP)"}
          highlightConfig={highlightConfig}
          legendItems={legendItems}
          jumpActions={[
            ...(parsedLmp ? [{ label: 'View LMP Month', onClick: () => setCalViewDate(parsedLmp) }] : []),
            { label: 'View Today’s Month', onClick: () => setCalViewDate(today) },
            ...(eddData ? [{ label: 'View Due Date Month', onClick: () => setCalViewDate(eddData.edd) }] : [])
          ]}
        />

        {/* Results Overview */}
        {eddData ? (
          <section className="panel results">
            <div className="result-head">
              <span className="eyebrow">DUE DATE ESTIMATION</span>
              <h2>Your Pregnancy Milestones</h2>
            </div>
            <div className="calc-results">
              <article className="calc-result primary-result">
                <small>Expected Date of Delivery (EDD)</small>
                <b>{fmtDate(eddData.edd)}</b>
                <span>40 weeks (280 days) from the first day of LMP</span>
              </article>
              <article className="calc-result">
                <small>Current Gestational Age</small>
                <b>
                  {eddData.gestationalDays < 0
                    ? 'LMP date is in future'
                    : `${eddData.weeks} weeks ${eddData.days} days`}
                </b>
                <span>{eddData.trimester} ({eddData.progressPercent}% of pregnancy)</span>
              </article>
              <article className="calc-result">
                <small>Countdown to Due Date</small>
                <b>
                  {eddData.remainingDays >= 0
                    ? `${eddData.remainingDays} days remaining`
                    : `${Math.abs(eddData.remainingDays)} days past due date`}
                </b>
                <span>Based on 40 weeks standard gestational duration</span>
              </article>
              <article className="calc-result">
                <small>Estimated Conception Date</small>
                <b>{fmtDate(eddData.conception)}</b>
                <span>Approximate timing based on a standard 28-day cycle</span>
              </article>
            </div>

            {/* Trimester Progress Bar */}
            <div className="trimester-container">
              <div className="trimester-header">
                <span>Trimester Progress</span>
                <span>{eddData.weeks}w {eddData.days}d · {eddData.trimester}</span>
              </div>
              <div className="trimester-bar-track">
                <div
                  className="trimester-segment t1"
                  style={{ width: `${Math.min(32.5, (eddData.gestationalDays / 280) * 100)}%` }}
                />
                <div
                  className="trimester-segment t2"
                  style={{ width: `${Math.max(0, Math.min(35, ((eddData.gestationalDays - 91) / 280) * 100))}%` }}
                />
                <div
                  className="trimester-segment t3"
                  style={{ width: `${Math.max(0, Math.min(32.5, ((eddData.gestationalDays - 189) / 280) * 100))}%` }}
                />
              </div>
              <div className="trimester-labels">
                <span>1st Trimester (0–13w)</span>
                <span>2nd Trimester (14–27w)</span>
                <span>3rd Trimester (28–40w)</span>
              </div>
            </div>
          </section>
        ) : (
          <section className="panel" style={{ textAlign: 'center', padding: '36px 20px', marginTop: 18 }}>
            <Heart style={{ width: 44, height: 44, color: 'var(--cyan)', margin: '0 auto 10px', display: 'block', opacity: 0.8 }} />
            <h3 style={{ margin: '0 0 6px', fontSize: 17 }}>No LMP Date Selected</h3>
            <p style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 460, margin: '0 auto' }}>
              Select the first day of your last menstrual period (LMP) on the calendar above, type the date into the field, or choose a quick preset to view your estimated due date, gestational age, and trimester timeline.
            </p>
          </section>
        )}

        <p className="note">
          <b>Clinical note:</b> Standard Naegele-style estimate (LMP + 280 days). Assumes a regular 28-day cycle and ovulation around cycle day 14. Due dates vary naturally, and only ~4% of babies arrive precisely on their estimated due date. Always verify dating and fetal development with your healthcare provider and ultrasound biometric measurements.
        </p>

        <Footer />
      </main>
      <BottomNav active="edd" onNavigate={onNavigate} />
    </>
  );
}

// ----------------------------------------
// Dedicated Page 5: Nutrition Guide
// ----------------------------------------
const nutritionBands = [
  { max: .5, title: 'Milk-feeding guidance · Under 6 months', lead: 'For infants younger than 6 months, breast milk alone is generally recommended; if breastfeeding is not possible or insufficient, use an appropriate infant formula with clinician guidance. Do not start solids based only on a growth-chart result.', meals: [['Feeding', 'Breast milk', 'Feed responsively, including at night; seek lactation support if feeds are painful, ineffective, or wet nappies/weight gain are concerning.'], ['If needed', 'Infant formula', 'Use age-appropriate infant formula and prepare exactly as directed. Never dilute or concentrate it.'], ['Avoid', 'No solids yet', 'Do not give water, honey, juice, cereal in a bottle, or homemade animal-milk substitutes.']], tips: ['Review feeding technique, urine output and serial weight if growth is a concern.', 'Prematurity, poor feeding, dehydration, lethargy or persistent vomiting need prompt clinical review.'] },
  { max: .75, title: 'First complementary foods · 6–8 months', lead: 'Continue breastfeeding. Start small amounts of soft, thick, nutrient-dense foods and gradually increase variety, texture and amount as the infant develops.', meals: [['Morning', 'Soft staple + iron source', 'Offer a thick, soft cereal or other familiar staple, paired with an iron-rich food suitable for the infant, such as mashed pulses, iron-fortified infant cereal, or well-cooked egg if safely introduced.'], ['Midday', 'Staple + protein + vegetables', 'Combine a familiar soft staple with mashed beans/lentils or another suitable protein and soft vegetables; add a small amount of suitable fat if needed.'], ['Later meal', 'Fruit or nutrient-rich food', 'Offer soft fruit and/or another age-appropriate nutrient-rich food, prepared to a safe texture.'], ['Feeding pattern', '2–3 meals/day', 'Offer small, frequent feeds; breastfeed responsively between meals. Adapt texture to developmental skills.']], tips: ['Offer iron-rich foods regularly: dal, beans, iron-fortified cereal, egg or meat/fish if used by the family.', 'Keep food soft and supervise closely; avoid choking hazards, added salt/sugar and honey before 12 months.'] },
  { max: 1, title: 'Complementary foods · 9–11 months', lead: 'Continue breastfeeding and offer 3–4 meals daily, with texture advancing to mashed, chopped-soft and safe finger foods as skills allow.', meals: [['Breakfast', 'Staple + protein', 'A familiar soft grain or starchy staple with a suitable protein-rich food, prepared to a safe texture.'], ['Lunch', 'Mixed food groups', 'A staple food plus well-cooked pulses/beans, egg, fish, meat or another suitable protein, with soft vegetables.'], ['Snack', 'Fruit or suitable snack', 'Soft fruit or another nutrient-rich food prepared safely for the child’s skills.'], ['Dinner', 'Varied family foods', 'A different familiar staple, protein-rich food and vegetables; adapt texture and size to chewing skills.']], tips: ['Offer water in an open or training cup with meals; breast milk remains important.', 'Avoid whole nuts, popcorn, whole grapes, hard raw vegetables and other choking hazards.'] },
  { max: 2, title: 'Toddler food ideas · 12–23 months', lead: 'Continue breastfeeding to 2 years or beyond if desired. Offer 3–4 meals and 1–2 nutritious snacks, using varied family foods in safe bite sizes.', meals: [['Breakfast', 'Staple + protein', 'Choose a familiar grain or starchy staple (such as oats, bread, rice, maize or other local staple) with egg, beans, yoghurt or another suitable protein; add fruit if available.'], ['Lunch', 'Balanced meal', 'Combine a staple food with beans/lentils, egg, fish, meat, tofu or another protein, plus vegetables; include a suitable source of dietary fat.'], ['Snack', 'Fruit or nourishing snack', 'Offer whole fruit, plain yoghurt, cheese, cooked beans or another safe, age-appropriate snack; adapt for allergies and family food access.'], ['Dinner', 'Varied family meal', 'Serve a familiar staple with a protein-rich food and vegetables or fruit, using a texture and portion suitable for the child’s age.']], tips: ['Feed responsively: encourage, but do not force; keep meals calm and screen-free.', 'Offer iron-rich foods daily and varied fruits/vegetables; avoid sugary drinks and frequent packaged snacks.'] },
  { max: 19, title: 'Flexible balanced-meal ideas · 2 years and older', lead: 'Use these as flexible food-group ideas, not a fixed menu: combine locally available staple foods, protein-rich foods, vegetables and fruit, and dairy or a suitable alternative if used. Adapt to culture, budget, allergies and the child’s appetite.', meals: [['Breakfast', 'Staple + protein', 'A familiar grain or starchy food (for example oats, bread, maize or another local staple) with egg, beans, yoghurt or another suitable protein; offer fruit too.'], ['Lunch', 'Balanced meal', 'Combine a staple with beans/lentils, egg, fish, meat, tofu or another protein, plus vegetables and a suitable fat.'], ['Snack', 'Simple, nourishing', 'Offer fruit, plain yoghurt, cheese, cooked beans or another safe snack that suits the child’s age, allergies and family diet.'], ['Dinner', 'Variety', 'Choose a different staple, protein-rich food and vegetables; offer water as the usual drink.']], tips: ['Offer variety across the week using affordable foods available to the family; include protein-rich foods, vegetables and fruit where available.', 'Avoid using sugary drinks, appetite tonics or high-calorie supplements without a clinical indication.'] }
];

function NutritionPage({ onNavigate }) {
  const [y, setY] = useState('');
  const [m, setM] = useState('');
  const [shown, setShown] = useState(false);

  const hasAge = y !== '' || m !== '';
  const age = (Number(y) || 0) + (Number(m) || 0) / 12;
  const valid = hasAge && Number.isInteger(Number(y || 0)) && Number.isInteger(Number(m || 0)) &&
    Number(y || 0) >= 0 && Number(y || 0) <= 18 && Number(m || 0) >= 0 && Number(m || 0) <= 11;
  const band = nutritionBands.find(x => age < x.max) || nutritionBands.at(-1);

  const presets = [
    { label: '0–6 Months', y: '0', m: '3' },
    { label: '6–8 Months', y: '0', m: '7' },
    { label: '9–11 Months', y: '0', m: '10' },
    { label: '1–2 Years', y: '1', m: '4' },
    { label: '2+ Years', y: '3', m: '0' },
  ];

  return (
    <>
      <PageIntro
        icon={Apple}
        kicker="AGE-BASED FOOD GUIDE"
        title="Nutrition Guide"
        desc="Practical age-appropriate feeding ideas and balanced-meal guidance. No growth assessment required."
        active="nutrition"
        onNavigate={onNavigate}
      />
      <main className="page-wrap">
        <section className="panel">
          <h2>Child’s Age</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: -6, marginBottom: 14 }}>
            Enter child’s age in completed years and months, or select an age preset to view age-appropriate meal guidance.
          </p>
          <div className="preset-chips">
            {presets.map(p => {
              const isSelected = y === p.y && m === p.m && shown;
              return (
                <button
                  key={p.label}
                  type="button"
                  className={`preset-chip ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    setY(p.y);
                    setM(p.m);
                    setShown(true);
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <div className="age-fields">
            <label>
              Age in years (0–18)
              <input type="number" min="0" max="18" placeholder="0" value={y} onChange={e => setY(e.target.value)} />
            </label>
            <label>
              Additional months (0–11)
              <input type="number" min="0" max="11" placeholder="0" value={m} onChange={e => setM(e.target.value)} />
            </label>
          </div>
          <button className="primary" onClick={() => setShown(true)}>
            View Nutrition Guide <ArrowRight />
          </button>
        </section>

        {shown && valid && (
          <section className="panel results">
            <div className="result-head">
              <span className="eyebrow">AGE-APPROPRIATE GUIDANCE</span>
              <h2>{band.title}</h2>
              <p>{band.lead}</p>
            </div>
            <div className="meal-grid">
              {band.meals.map(([time, name, desc]) => (
                <article className="meal" key={time}>
                  <small>{time}</small>
                  <h3>{name}</h3>
                  <p>{desc}</p>
                </article>
              ))}
            </div>
            <div className="tip-list">
              {band.tips.map(t => (
                <p key={t}>✓ &nbsp;{t}</p>
              ))}
            </div>
            <p className="note">
              General food ideas only — not a therapeutic diet or an individual calorie prescription. Adapt for feeding skills, allergies, growth, illness, culture and family food access.
            </p>
          </section>
        )}
        {shown && !valid && <p className="error">Please enter a valid age from 0 to 18 years and 0 to 11 additional months.</p>}
        {!shown && (
          <section className="panel" style={{ textAlign: 'center', padding: '36px 20px', marginTop: 18 }}>
            <Apple style={{ width: 44, height: 44, color: 'var(--pink)', margin: '0 auto 10px', display: 'block', opacity: 0.8 }} />
            <h3 style={{ margin: '0 0 6px', fontSize: 17 }}>No Age Selected</h3>
            <p style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 460, margin: '0 auto' }}>
              Enter child’s age in years and months above or choose an age preset to view meal ideas and feeding advice.
            </p>
          </section>
        )}
        <Footer />
      </main>
      <BottomNav active="nutrition" onNavigate={onNavigate} />
    </>
  );
}

// ----------------------------------------
// Dashboard / Home Page
// ----------------------------------------
function HomePage({ onNavigate }) {
  return (
    <>
      <Header active="home" onNavigate={onNavigate} />
      <main className="wrap">
        <section className="hero">
          <img src="assets/hero.jpg" alt="A mother walking hand in hand with her young child" />
          <div className="hero-shade" />
          <div className="hero-copy">
            <div className="eyebrow">PEDIATRICS · GROWTH · DEVELOPMENT</div>
            <h1>Child Growth, Development & <em>Women’s Health Tools</em></h1>
            <p>Professional independent clinical tools for pediatric growth assessment, developmental milestones, menstrual tracking and pregnancy calculation.</p>
            <div className="quicklinks">
              {tools.slice(0, 4).map(t => (
                <a
                  href={t.href}
                  key={t.key}
                  onClick={(e) => { e.preventDefault(); onNavigate(t.key, t.href); }}
                >
                  <t.icon />
                  <span>{t.title}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="tool-grid">
          {tools.slice(0, 4).map(t => (
            <a
              key={t.key}
              className={`tool-card ${t.tone}`}
              href={t.href}
              onClick={(e) => { e.preventDefault(); onNavigate(t.key, t.href); }}
            >
              <span className="tool-icon"><t.icon /></span>
              <span className="tool-copy">
                <b>{t.title}</b>
                <small>{t.desc}</small>
              </span>
              <span className="arrow"><ChevronRight /></span>
            </a>
          ))}
        </section>

        <div className="section-heading">
          <Sparkles />
          <h2>All Tools — Dedicated Pages</h2>
        </div>

        <section className="all-tools">
          {tools.map(t => (
            <a
              href={t.href}
              key={t.key}
              onClick={(e) => { e.preventDefault(); onNavigate(t.key, t.href); }}
            >
              <t.icon />
              <b>{t.title}</b>
            </a>
          ))}
        </section>

        <section className="welcome">
          <div>
            <span className="eyebrow">CLINICAL TOOLKIT</span>
            <h2>Each tool on its own dedicated separate page</h2>
            <p>
              Use each tool independently. The Growth Chart, Developmental Milestones, Period Calendar,
              and EDD Calculator now exist on separate, clean pages without unnecessary clutter.
            </p>
          </div>
          <Stethoscope />
        </section>

        <Footer />
      </main>
      <BottomNav active="home" onNavigate={onNavigate} />
    </>
  );
}

// ----------------------------------------
// Main Application with Robust Routing
// ----------------------------------------
function App() {
  const [currentRoute, setCurrentRoute] = useState(() => {
    return normalizeRoute(window.location.pathname);
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(normalizeRoute(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (key, href) => {
    // Opened from a folder (file://) the browser forbids pushState, which left the
    // address bar on the old page and broke reload/back. Every route is a real
    // HTML page, so fall back to a normal page load there.
    try {
      window.history.pushState({}, '', href);
    } catch (_) {
      window.location.href = href;
      return;
    }
    setCurrentRoute(key);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  switch (currentRoute) {
    case 'growth':
      return <GrowthPage onNavigate={navigate} />;
    case 'milestones':
      return <MilestonesPage onNavigate={navigate} />;
    case 'period':
      return <PeriodPage onNavigate={navigate} />;
    case 'edd':
      return <EddPage onNavigate={navigate} />;
    case 'nutrition':
      return <NutritionPage onNavigate={navigate} />;
    default:
      return <HomePage onNavigate={navigate} />;
  }
}

createRoot(document.getElementById('root')).render(<App />);
