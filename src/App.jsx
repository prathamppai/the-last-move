import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'

// ============================================
// INTERNAL STYLES
// ============================================
const InternalStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    /* ── CINEMATIC SCROLL REVEAL ───────────────────────────────── */
    /* Base hidden state: blurred, translated, transparent */
    .cr {
      opacity: 0;
      transform: translateY(28px);
      filter: blur(6px);
      transition:
        opacity  0.75s cubic-bezier(0.16, 1, 0.3, 1),
        transform 0.75s cubic-bezier(0.16, 1, 0.3, 1),
        filter   0.75s cubic-bezier(0.16, 1, 0.3, 1);
      will-change: opacity, transform, filter;
    }
    /* Visible state */
    .cr.in {
      opacity: 1;
      transform: translateY(0);
      filter: blur(0px);
    }
    /* Exit state: fade up and blur out gently when scrolling past */
    .cr.out {
      opacity: 0;
      transform: translateY(-18px);
      filter: blur(4px);
      transition:
        opacity  0.5s cubic-bezier(0.4, 0, 1, 1),
        transform 0.5s cubic-bezier(0.4, 0, 1, 1),
        filter   0.5s cubic-bezier(0.4, 0, 1, 1);
    }
    /* Faster enter for small elements */
    .cr-fast {
      opacity: 0;
      transform: translateY(16px);
      filter: blur(3px);
      transition:
        opacity  0.5s cubic-bezier(0.16, 1, 0.3, 1),
        transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
        filter   0.5s cubic-bezier(0.16, 1, 0.3, 1);
      will-change: opacity, transform, filter;
    }
    .cr-fast.in { opacity: 1; transform: translateY(0); filter: blur(0px); }
    .cr-fast.out { opacity: 0; transform: translateY(-10px); filter: blur(2px); transition-duration: 0.35s; }

    /* Stagger delays applied via inline style on each child */
    /* -- delay classes */
    .cr-d1 { transition-delay: 80ms; }
    .cr-d2 { transition-delay: 160ms; }
    .cr-d3 { transition-delay: 240ms; }
    .cr-d4 { transition-delay: 320ms; }
    .cr-d5 { transition-delay: 400ms; }
    .cr-d6 { transition-delay: 480ms; }

    /* When exiting, remove delays so they all fade together */
    .cr.out.cr-d1,
    .cr.out.cr-d2,
    .cr.out.cr-d3,
    .cr.out.cr-d4,
    .cr.out.cr-d5,
    .cr.out.cr-d6,
    .cr-fast.out.cr-d1,
    .cr-fast.out.cr-d2,
    .cr-fast.out.cr-d3,
    .cr-fast.out.cr-d4,
    .cr-fast.out.cr-d5,
    .cr-fast.out.cr-d6 { transition-delay: 0ms; }

    @media (prefers-reduced-motion: reduce) {
      .cr, .cr-fast { opacity: 1 !important; transform: none !important; filter: none !important; transition: none !important; }
    }
    @media (max-width: 700px) {
      .cr  { transform: translateY(18px); }
      .cr-fast { transform: translateY(10px); }
    }

    /* ── STORY SECTION ENHANCEMENTS ───────────────────────────── */
    .story-section {
      padding: clamp(100px, 14vw, 180px) 0;
    }
    .story-section__acts {
      display: flex;
      flex-direction: column;
      gap: 0;
    }
    .story-section__act {
      display: grid;
      grid-template-columns: 160px 1fr;
      gap: 0 clamp(32px, 5vw, 70px);
      padding: clamp(44px, 6vw, 72px) 0;
      border-top: 1px solid rgba(255,255,255,0.045);
      align-items: start;
      position: relative;
    }
    .story-section__act::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(184,42,42,0.0) 15%, rgba(255,255,255,0.055) 50%, transparent);
      pointer-events: none;
    }
    .story-section__act:last-child {
      border-bottom: 1px solid rgba(255,255,255,0.04);
    }
    .story-section__act:last-child::after { display: none; }
    .story-section__act-header {
      position: sticky;
      top: calc(78px + 24px);
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-top: 2px;
    }
    .story-section__act-number {
      font-size: 0.6rem;
      letter-spacing: 0.28em;
      color: var(--accent-red);
      text-transform: uppercase;
      font-family: var(--font-mono);
    }
    .story-section__act-title {
      font-family: var(--font-display);
      font-size: clamp(0.82rem, 1.2vw, 1.05rem);
      font-weight: 600;
      letter-spacing: 0.04em;
      color: #d8d0d0;
      line-height: 1.35;
      text-transform: uppercase;
    }
    .story-section__act-body {
      display: flex;
      flex-direction: column;
      gap: 1.5em;
    }
    .story-section__act-para {
      color: rgba(200,192,192,0.75);
      font-family: var(--font-serif);
      font-size: clamp(1.08rem, 1.55vw, 1.28rem);
      line-height: 1.82;
      white-space: pre-line;
    }
    .story-section__act:last-child .story-section__act-para {
      color: rgba(160,152,152,0.65);
      font-style: italic;
    }
    /* Ending special emphasis */
    .story-section__act--ending .story-section__act-body {
      border-left: 2px solid rgba(184,42,42,0.25);
      padding-left: 1.5rem;
      margin-left: 0.25rem;
    }

    /* Film-meta strip */
    .story-section__meta {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1px;
      background: rgba(255,255,255,0.045);
      border: 1px solid rgba(255,255,255,0.045);
      border-radius: 3px;
      margin-bottom: clamp(60px, 10vw, 100px);
      overflow: hidden;
    }
    .story-section__meta-item {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: clamp(18px, 2.5vw, 28px);
      background: rgba(8,8,8,0.9);
      transition: background 0.3s ease;
    }
    .story-section__meta-item:hover {
      background: rgba(14,10,10,0.95);
    }
    .story-section__meta-label {
      font-family: var(--font-mono);
      font-size: 0.57rem;
      letter-spacing: 0.24em;
      color: var(--accent-red);
      text-transform: uppercase;
    }
    .story-section__meta-value {
      color: rgba(160,150,150,0.85);
      font-size: clamp(0.78rem, 1.1vw, 0.9rem);
      line-height: 1.6;
      font-family: var(--font-sans);
    }

    /* Mobile story */
    @media (max-width: 800px) {
      .story-section__act {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      .story-section__act-header {
        position: static;
        flex-direction: row;
        align-items: center;
        gap: 14px;
        flex-wrap: wrap;
      }
      .story-section__meta {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 500px) {
      .story-section__meta {
        grid-template-columns: 1fr;
      }
    }

    /* ── SCREENPLAY SECTION ENHANCEMENTS ──────────────────────── */
    .screenplay-section {
      padding: clamp(100px, 14vw, 180px) 0;
      background:
        radial-gradient(ellipse at 90% 10%, rgba(184,42,42,0.03), transparent 45%),
        #050505;
    }
    .screenplay-section__script {
      max-width: 760px;
      margin: 0 auto;
    }
    /* Scene block */
    .screenplay-scene {
      position: relative;
      padding: clamp(32px, 4.5vw, 56px) 0;
      border-top: 1px solid rgba(255,255,255,0.038);
    }
    .screenplay-scene:last-child {
      border-bottom: 1px solid rgba(255,255,255,0.038);
    }
    /* Accent dot on scene left edge */
    .screenplay-scene::before {
      content: '';
      position: absolute;
      top: clamp(32px,4.5vw,56px);
      left: -24px;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--accent-red);
      opacity: 0;
      transition: opacity 0.4s ease;
    }
    .screenplay-scene.in::before { opacity: 0.6; }

    .screenplay-scene__header {
      display: flex;
      align-items: baseline;
      gap: 20px;
      margin-bottom: 22px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(255,255,255,0.025);
    }
    .screenplay-scene__number {
      flex-shrink: 0;
      font-family: var(--font-mono);
      font-size: 0.58rem;
      letter-spacing: 0.22em;
      color: var(--accent-red);
      text-transform: uppercase;
      min-width: 72px;
      opacity: 0.9;
    }
    .screenplay-scene__title {
      font-family: var(--font-display);
      font-size: clamp(0.82rem, 1.4vw, 1.08rem);
      font-weight: 600;
      letter-spacing: 0.03em;
      color: rgba(220,210,210,0.92);
      text-transform: uppercase;
      line-height: 1.3;
    }
    /* Scene description (action lines) */
    .screenplay-line--scene-desc {
      font-family: var(--font-sans);
      font-size: clamp(0.88rem, 1.25vw, 1rem);
      line-height: 1.78;
      color: rgba(140,130,130,0.8);
      font-style: italic;
      margin-bottom: 10px;
    }
    .screenplay-line--action {
      font-family: var(--font-sans);
      font-size: clamp(0.88rem, 1.25vw, 1rem);
      line-height: 1.72;
      color: rgba(126,118,118,0.78);
      margin-bottom: 8px;
    }
    /* Character name: centred, all caps, elevated */
    .screenplay-line--character {
      display: block;
      font-family: var(--font-mono);
      font-size: 0.68rem;
      letter-spacing: 0.18em;
      color: rgba(224,210,210,0.92);
      text-transform: uppercase;
      margin-top: 20px;
      margin-bottom: 4px;
      text-align: center;
    }
    .screenplay-line--dialogue {
      font-family: var(--font-serif);
      font-size: clamp(0.95rem, 1.35vw, 1.08rem);
      font-style: italic;
      color: rgba(195,183,183,0.85);
      line-height: 1.72;
      padding: 0 clamp(20px, 6vw, 80px);
      text-align: center;
      margin-bottom: 8px;
    }
    /* Sub-scene */
    .screenplay-subscene {
      margin-top: 22px;
      padding: 16px 0 4px clamp(16px, 3.5vw, 36px);
      border-left: 1px solid rgba(255,255,255,0.055);
      position: relative;
    }
    .screenplay-subscene::before {
      content: '';
      position: absolute;
      top: 20px; left: 0;
      width: 8px; height: 1px;
      background: rgba(184,42,42,0.4);
    }
    .screenplay-subscene__number {
      font-family: var(--font-mono);
      font-size: 0.54rem;
      letter-spacing: 0.18em;
      color: rgba(100,88,88,0.75);
      text-transform: uppercase;
      margin-bottom: 10px;
    }

    /* Mobile screenplay */
    @media (max-width: 800px) {
      .screenplay-scene__header {
        flex-direction: column;
        gap: 8px;
      }
      .screenplay-scene::before { display: none; }
    }

    /* ── STORY / SCREENPLAY SECTION HEADER POLISH ─────────────── */
    .section-header {
      margin-bottom: clamp(3rem, 7vw, 6rem);
    }
    .section-header__label {
      display: inline-flex;
      align-items: center;
      gap: 14px;
      color: var(--accent-red);
      font-family: var(--font-mono);
      font-size: 0.65rem;
      letter-spacing: 0.26em;
      text-transform: uppercase;
      margin-bottom: 20px;
      opacity: 0.85;
    }
    .section-header__label::before {
      content: '';
      width: 28px; height: 1px;
      background: var(--accent-red);
      opacity: 0.6;
    }
    .section-header__title {
      font-family: var(--font-display);
      font-size: clamp(2.8rem, 7vw, 6rem);
      font-weight: 600;
      letter-spacing: -0.065em;
      line-height: 0.95;
      text-transform: uppercase;
    }
  ` }} />
)

// ============================================
// HOOK: useCinematicReveal
// Bi-directional: 'in' when entering, 'out' when exited above viewport.
// ============================================
function useCinematicReveal(opts = {}) {
  const {
    enterMargin = '-8%',   // how far into viewport before triggering in
    exitTopMargin = '0px', // top margin — when above this, trigger out
  } = opts

  const refs = useRef(new Map())
  const stateMap = useRef({})         // 'hidden' | 'in' | 'out'
  const [, forceUpdate] = useState(0)
  const rafRef = useRef(null)

  const setRef = useCallback((key) => (el) => {
    if (el) refs.current.set(key, el)
    else refs.current.delete(key)
  }, [])

  const compute = useCallback(() => {
    let changed = false
    const vh = window.innerHeight
    const enterThreshold = vh * 0.92  // element must be within 92% from top to enter
    const exitThreshold = vh * 0.08   // element exits when its bottom is above 8% from top

    refs.current.forEach((el, key) => {
      if (!el) return
      const rect = el.getBoundingClientRect()
      const prev = stateMap.current[key] || 'hidden'
      let next = prev

      if (rect.bottom < exitThreshold) {
        // Element has scrolled above viewport — fade out upward
        next = 'out'
      } else if (rect.top < enterThreshold && rect.bottom > exitThreshold) {
        // Element is in view — reveal
        next = 'in'
      } else if (rect.top >= enterThreshold) {
        // Element is below the fold — hidden, ready to enter
        next = 'hidden'
      }

      if (next !== prev) { stateMap.current[key] = next; changed = true }
    })

    if (changed) forceUpdate(n => n + 1)
  }, [])

  const onScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(compute)
  }, [compute])

  useEffect(() => {
    compute()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [compute, onScroll])

  const getClass = useCallback((key, base = 'cr', extra = '') => {
    const state = stateMap.current[key] || 'hidden'
    const cls = state === 'in' ? `${base} in` : state === 'out' ? `${base} out` : base
    return extra ? `${cls} ${extra}` : cls
  }, [])

  return { setRef, getClass, stateMap: stateMap.current }
}

// ============================================
// COMPONENT: FilmGrain
// ============================================
function FilmGrain() {
  return <div className="film-grain" aria-hidden="true" />
}

// ============================================
// COMPONENT: Vignette
// ============================================
function Vignette() {
  return <div className="vignette" aria-hidden="true" />
}

// ============================================
// COMPONENT: DustParticles
// ============================================
function DustParticles({ className = '' }) {
  return <div className={`dust-particles ${className}`} aria-hidden="true" />
}

// ============================================
// COMPONENT: SkipLink
// ============================================
function SkipLink({ target }) {
  return <a href={target} className="skip-link">Skip to main content</a>
}

// ============================================
// COMPONENT: BackgroundMusic
// ============================================
function BackgroundMusic() {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = 0.35
    audio.loop = true
    const tryPlay = () => {
      audio.play().then(() => { setPlaying(true); setBlocked(false) })
        .catch(() => { setBlocked(true); setPlaying(false) })
    }
    tryPlay()
    const onInteract = () => { if (!playing) tryPlay() }
    document.addEventListener('click', onInteract, { once: true })
    document.addEventListener('keydown', onInteract, { once: true })
    return () => {
      document.removeEventListener('click', onInteract)
      document.removeEventListener('keydown', onInteract)
    }
  }, [])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause(); setPlaying(false) }
    else { audio.play().then(() => { setPlaying(true); setBlocked(false) }).catch(() => setBlocked(true)) }
  }

  return (
    <>
      <audio ref={audioRef} src="/blurrynights.mp3" preload="auto" />
      {visible && (
        <div className={`music-control ${blocked && !playing ? 'music-control--blocked' : ''}`} aria-label="Background music control">
          <button className="music-control__btn" onClick={toggle}
            aria-label={playing ? 'Pause background music' : 'Play background music'}>
            {playing ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
            <span className="music-control__label mono">
              {blocked && !playing ? 'PLAY MUSIC' : playing ? 'MUSIC ON' : 'MUSIC OFF'}
            </span>
          </button>
          <button className="music-control__dismiss" onClick={() => setVisible(false)} aria-label="Dismiss music control">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}
    </>
  )
}

// ============================================
// COMPONENT: StudioIntro
// ============================================
function StudioIntro({ onComplete }) {
  const [state, setState] = useState('fade-in')
  const [showSkip, setShowSkip] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    const skipTimer = setTimeout(() => setShowSkip(true), 1000)
    timeoutRef.current = setTimeout(() => {
      setState('hold')
      setTimeout(() => {
        setState('fade-out')
        setTimeout(() => { setState('done'); onComplete() }, 1500)
      }, 1500)
    }, 1500)
    return () => { clearTimeout(skipTimer); clearTimeout(timeoutRef.current) }
  }, [onComplete])

  const handleSkip = useCallback(() => {
    clearTimeout(timeoutRef.current)
    setState('fade-out')
    setTimeout(() => { setState('done'); onComplete() }, 500)
  }, [onComplete])

  if (state === 'done') return null

  const opacity = state === 'hold' ? 1 : 0
  const scale = state === 'fade-in' ? 1.1 : state === 'fade-out' ? 0.9 : 1

  return (
    <div
      className="studio-intro"
      role="presentation"
      aria-hidden={state === 'done'}
      style={{
        opacity,
        transform: `scale(${scale})`,
        transition: 'opacity 1.5s cubic-bezier(0.16, 1, 0.3, 1), transform 1.5s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div className="studio-intro__bg">
        <DustParticles />
        <div className="studio-intro__glow" />
      </div>
      <div className="studio-intro__content">
        <div className="studio-intro__logo-wrap">
          <div className="studio-intro__name text-gradient glitch" data-text="BABLADÉ STUDIOS">
            BABLADÉ STUDIOS
          </div>
        </div>
        <div className="studio-intro__presents">PRESENTS</div>
      </div>
      {showSkip && (
        <button className="studio-intro__skip btn btn-ghost" onClick={handleSkip} aria-label="Skip studio introduction">
          SKIP INTRO
        </button>
      )}
    </div>
  )
}

// ============================================
// COMPONENT: Navigation
// ============================================
function Navigation({ activeSection, onNavigate }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { id: 'hero', label: 'HOME' },
    { id: 'story', label: 'THE STORY' },
    { id: 'screenplay', label: 'SCREENPLAY' },
  ]

  return (
    <>
      <SkipLink target="#main-content" />
      <nav className={`navigation ${scrolled ? 'scrolled' : ''}`} role="navigation" aria-label="Main navigation">
        <div className="navigation__container container">
          <div className="navigation__logo" aria-label="The Last Move - Home">
            <img
              src="/[bablade].png"
              alt="Babladé Studios"
              className="navigation__logo-img"
            />
            <span className="navigation__logo-text">THE LAST MOVE</span>
          </div>
          <button
            className="navigation__toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="nav-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            <span className="navigation__toggle-bar" />
            <span className="navigation__toggle-bar" />
            <span className="navigation__toggle-bar" />
          </button>
          <ul id="nav-menu" className={`navigation__menu ${mobileOpen ? 'open' : ''}`} role="menubar">
            {navItems.map((item) => (
              <li key={item.id} role="none">
                <button
                  role="menuitem"
                  className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => { onNavigate(item.id); setMobileOpen(false) }}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  )
}

// ============================================
// COMPONENT: ScrollIndicator
// ============================================
function ScrollIndicator() {
  return (
    <div className="scroll-indicator" aria-hidden="true">
      <div className="scroll-indicator__mouse">
        <div className="scroll-indicator__wheel" />
      </div>
      <span className="scroll-indicator__text">SCROLL</span>
    </div>
  )
}

// ============================================
// COMPONENT: Hero
// ============================================
function Hero({ sectionRef }) {
  return (
    <section id="hero" ref={sectionRef} className="hero-section section" aria-labelledby="hero-title">
      <div className="hero-section__bg slow-zoom">
        <div className="hero-section__overlay" />
        <DustParticles className="hero-section__dust" />
      </div>
      <div className="hero-section__content container">
        <div className="hero-section__tagline reveal">A PSYCHOLOGICAL THRILLER</div>
        <h1 id="hero-title" className="hero-section__title reveal glitch" data-text="THE LAST MOVE">
          THE LAST MOVE
        </h1>
        <div className="hero-section__divider reveal" style={{ transitionDelay: '200ms' }} />
        <p className="hero-section__tagline-text reveal serif" style={{ transitionDelay: '300ms' }}>
          "Every game has a final move. Every friendship has a breaking point."
        </p>
        <div className="hero-section__meta reveal" style={{ transitionDelay: '400ms' }}>
          <span className="hero-section__genre">PSYCHOLOGICAL THRILLER</span>
          <span className="hero-section__divider" aria-hidden="true" />
          <span className="hero-section__theme">MYSTERY</span>
          <span className="hero-section__divider" aria-hidden="true" />
          <span className="hero-section__theme">PARANORMAL DRAMA</span>
        </div>
      </div>
      <ScrollIndicator />
    </section>
  )
}

// ============================================
// COMPONENT: Story
// ============================================
function Story({ sectionRef }) {
  const acts = [
    {
      number: 'ACT 1',
      title: 'THE BEGINNING',
      body: `Five friends share an interest in paranormal activities. One day, they visit an abandoned building and begin playing Jenga. While the others talk and laugh, Dev is gradually left out. One pull of a block makes everyone roar with laughter. When they turn back towards the game, Dev has mysteriously disappeared.

Rahul immediately gets up to search for him, but the others stop him, arguing that entering the building is dangerous and could put another person's life at risk. A heated argument breaks out about friendship, responsibility and safety. Eventually, they leave the building without finding Dev.`
    },
    {
      number: 'ACT 2',
      title: 'THE AFTERMATH',
      body: `A few days later, they learn that Dev is officially missing. The friends begin blaming one another, questioning their decisions and wondering whether they could have done something differently. Unable to face each other after the incident, they gradually lose contact. For an entire year, they remain separated, carrying the guilt of that night.`
    },
    {
      number: 'ACT 3',
      title: 'THE MESSAGE',
      body: `One year later, Rahul receives a message from an unknown number: "Remember the last game?" Attached is an old photograph of all five friends playing Jenga, with Dev clearly visible. Everyone receives the same message and photograph. Shocked, they contact one another and decide to meet. One friend mentions that he will bring their old Jenga set.`
    },
    {
      number: 'ACT 4',
      title: 'THE RETURN',
      body: `At their meeting place, the friend reveals that he never opened the Jenga box after Dev disappeared. However, he recently discovered that two blocks were missing. Just then, a mysterious black figure appears behind him, moving unnervingly. Following a trail of dark matter, the friends follow it. When someone asks, "Where is that thing taking us?", Rahul recognises the surroundings — they are heading towards the same abandoned building where Dev disappeared.`
    },
    {
      number: 'ACT 5',
      title: 'THE LAST GAME',
      body: `The friends enter the building, return to their original playing spot and set up the Jenga tower despite the two missing blocks. As the tower approaches collapse, they find a dusty box containing a phone playing a distorted voice recording and a Jenga block inscribed with:

"MY BEST FRIEND BETRAYED ME…"

Confused, one friend asks, "This is just one block. Where's the last block?"

Suddenly, footsteps emerge from behind them. A mysterious figure stands wearing a black hoodie, its face concealed. The friends slowly turn around.

The figure removes its hood. "It is Dev."

In his hand is the final missing Jenga block, bearing a single word:

"FORGIVENESS."

Dev looks at his former friends and says: "DEV'S FINAL DIALOGUE — TO BE DECIDED."

He approaches the tower and places the final block, making the last move. The tower collapses.`
    },
    {
      number: 'ENDING',
      title: null,
      body: `The screen cuts to black. The collapsing Jenga tower symbolises the collapse of their friendship. Although forgiveness may be offered, it cannot necessarily restore what has already been broken.`
    }
  ]

  const { setRef, getClass } = useCinematicReveal()

  return (
    <section id="story" ref={sectionRef} className="story-section section" aria-labelledby="story-title">
      <div className="story-section__bg"><DustParticles /></div>
      <div className="container">

        {/* Section header */}
        <div className={getClass('story-header', 'cr', 'section-header')}>
          <span className="section-header__label">THE NARRATIVE</span>
          <h2 id="story-title" className="section-header__title glitch" data-text="THE STORY">
            THE STORY
          </h2>
        </div>
        {/* dummy ref registration */}
        <span ref={setRef('story-header')} style={{ display: 'none' }} aria-hidden="true" />

        {/* Meta strip */}
        <div className={getClass('story-meta', 'cr', 'story-section__meta')} ref={setRef('story-meta')}>
          <div className="story-section__meta-item">
            <span className="story-section__meta-label">GENRE</span>
            <span className="story-section__meta-value">Psychological Thriller / Mystery / Paranormal Drama</span>
          </div>
          <div className="story-section__meta-item">
            <span className="story-section__meta-label">THEMES</span>
            <span className="story-section__meta-value">Friendship, Betrayal, Guilt &amp; Forgiveness</span>
          </div>
          <div className="story-section__meta-item">
            <span className="story-section__meta-label">CENTRAL SYMBOL</span>
            <span className="story-section__meta-value">The Jenga Board Game</span>
          </div>
          <div className="story-section__meta-item">
            <span className="story-section__meta-label">TAGLINE</span>
            <span className="story-section__meta-value">Every game has a final move.</span>
          </div>
        </div>

        {/* Acts */}
        <div className="story-section__acts">
          {acts.map((act, index) => {
            const key = `story-act-${index}`
            const paragraphs = act.body.split('\n\n').filter(Boolean)
            const isEnding = act.number === 'ENDING'

            return (
              <article
                key={act.number}
                ref={setRef(key)}
                className={getClass(key, 'cr', `story-section__act${isEnding ? ' story-section__act--ending' : ''}`)}
              >
                <div className="story-section__act-header">
                  <span className="story-section__act-number mono">{act.number}</span>
                  {act.title && (
                    <h3 className="story-section__act-title">{act.title}</h3>
                  )}
                </div>
                <div className="story-section__act-body">
                  {paragraphs.map((para, i) => (
                    <p key={i} className={`story-section__act-para cr-fast cr-d${Math.min(i + 1, 6)} ${getClass(key, 'cr-fast', '').includes('in') ? 'in' : getClass(key, 'cr-fast', '').includes('out') ? 'out' : ''}`}>
                      {para}
                    </p>
                  ))}
                </div>
              </article>
            )
          })}
        </div>

      </div>
    </section>
  )
}

// ============================================
// COMPONENT: Screenplay
// ============================================
function Screenplay({ sectionRef }) {
  const { setRef, getClass } = useCinematicReveal()

  const scenes = [
    {
      id: 'S1',
      number: 'SCENE 1',
      title: 'ALL FRIENDS DOING THEIR CHORES NORMALLY',
      lines: [
        { type: 'scene-desc', text: 'Each friend is in their own world.' },
      ],
      subscenes: [
        {
          id: 'S1.1',
          number: 'SCENE 1.1',
          lines: [
            { type: 'character', text: 'DHANUSH' },
            { type: 'action', text: 'Watching TV.' },
            { type: 'character', text: 'ARNAV' },
            { type: 'action', text: 'Eating his food.' },
            { type: 'character', text: 'RIHAAN' },
            { type: 'action', text: 'Working on his laptop.' },
            { type: 'character', text: 'BEGIN' },
            { type: 'action', text: 'Listening to music.' },
            { type: 'character', text: 'DEV' },
            { type: 'action', text: 'Wearing a black hoodie, sitting on the couch and thinking deeply.' },
          ]
        }
      ]
    },
    {
      id: 'S2',
      number: 'SCENE 2',
      title: 'DEV PICKS HIS PHONE AND DOES A CONFERENCE CALL TO ALL HIS FRIENDS',
      lines: [],
      subscenes: [
        {
          id: 'S2.1',
          number: 'SCENE 2.1',
          lines: [
            { type: 'action', text: 'The other people are also in the call.' },
            { type: 'action', text: 'Dev invites people.' },
          ]
        },
        {
          id: 'S2.2',
          number: 'SCENE 2.2',
          lines: [
            { type: 'action', text: 'People agree to go to an abandoned place at night.' },
          ]
        },
        {
          id: 'S2.3',
          number: 'SCENE 2.3',
          lines: [
            { type: 'action', text: 'The people are in front of the place and enter.' },
          ]
        }
      ]
    },
    {
      id: 'S3',
      number: 'SCENE 3',
      title: 'INSIDE THE ABANDONED BUILDING',
      lines: [
        { type: 'scene-desc', text: 'They go in and ask what they do now. Arnav has Jenga — they set it up and play. After playing for a while, Rihaan shows all four a reel and they laugh. Then Dev feels a little left out and they look at the people. When they look up, Dhanush notices Dev is not there. Everyone argues for a moment. Dhanush gets up to stop them and tells them about safety and risk.' },
      ],
      subscenes: [
        {
          id: 'S3.1',
          number: 'SCENE 3.1',
          lines: [
            { type: 'action', text: 'All people get up to go home.' },
          ]
        },
        {
          id: 'S3.2',
          number: 'SCENE 3.2',
          lines: [
            { type: 'action', text: 'Dhanush stops for a moment and looks at the staircase. The screen blackouts. Arnav says, "What are you looking at — let\'s go."' },
          ]
        }
      ]
    },
    {
      id: 'S4',
      number: 'SCENE 4',
      title: 'HOME SCENE',
      lines: [],
      subscenes: [
        {
          id: 'S4.1',
          number: 'SCENE 4.1',
          lines: [
            { type: 'action', text: 'Dhanush calls the 3 people, says Dev is missing.' },
          ]
        },
        {
          id: 'S4.2',
          number: 'SCENE 4.2',
          lines: [
            { type: 'action', text: 'Everyone blames each other. Guilty with argument. They don\'t meet each other.' },
          ]
        },
        {
          id: 'S4.3',
          number: 'SCENE 4.3',
          lines: [
            { type: 'action', text: '18 months — they don\'t talk.' },
          ]
        },
        {
          id: 'S4.4',
          number: 'SCENE 4.4',
          lines: [
            { type: 'action', text: 'Scene where Dhanush\'s room is shown with Dev flashing in his mind.' },
          ]
        }
      ]
    },
    {
      id: 'S5',
      number: 'SCENE 5',
      title: 'NIGHTMARE',
      lines: [
        { type: 'scene-desc', text: 'Dreamy nightmare with thunder and rain. Dev talks to Dhanush and starts scaring him. Dhanush wakes up in the night.' },
      ],
      subscenes: []
    },
    {
      id: 'S6',
      number: 'SCENE 6',
      title: 'THE MESSAGE',
      lines: [
        { type: 'scene-desc', text: 'Dev — everyone gets a message: "Do you remember the last game?" with a photo of everyone with Dev. Everyone is shocked. They contact each other and decide to meet up at a place.' },
      ],
      subscenes: []
    },
    {
      id: 'S7',
      number: 'SCENE 7',
      title: 'THEY ALL MEET AT A STREET',
      lines: [
        { type: 'scene-desc', text: 'Arnav gets the same Jenga game.' },
      ],
      subscenes: [
        {
          id: 'S7.1',
          number: 'SCENE 7.1',
          lines: [
            { type: 'action', text: 'They find that 2 blocks are missing.' },
          ]
        }
      ]
    },
    {
      id: 'S8',
      number: 'SCENE 8',
      title: 'THE HOODED FIGURE',
      lines: [
        { type: 'scene-desc', text: 'Right after that, they feel a black hooded guy passing like a lightning from their back.' },
      ],
      subscenes: [
        {
          id: 'S8.1',
          number: 'SCENE 8.1',
          lines: [
            { type: 'action', text: 'Dhanush chases it and everyone follows him. The black hooded guy teleports from one direction to another. They all keep following him.' },
          ]
        }
      ]
    },
    {
      id: 'S9',
      number: 'SCENE 9',
      title: 'THE ABANDONED BUILDING — AGAIN',
      lines: [
        { type: 'scene-desc', text: 'After they are done following, they come to an abandoned building — the same abandoned building where Dev disappeared.' },
      ],
      subscenes: [
        {
          id: 'S9.1',
          number: 'SCENE 9.1',
          lines: [
            { type: 'action', text: 'They all are shocked. They find a place and set up the same Jenga block there to play. They recall their memories until it\'s on the verge of falling.' },
          ]
        }
      ]
    },
    {
      id: 'S10',
      number: 'SCENE 10',
      title: 'THE PHONE IN THE DUSTY BOX',
      lines: [
        { type: 'scene-desc', text: 'Suddenly they hear a phone buzzing near them. The phone was kept in a dusty box.' },
      ],
      subscenes: []
    },
    {
      id: 'S10A',
      number: 'SCENE 10.1',
      title: null,
      lines: [
        { type: 'action', text: 'They all approach the box. They find a Jenga block in that box — they pick it up and read it. It was sealed, so they neatly open it. The one who reads it becomes more terrified.' },
        { type: 'action', text: 'They look to tell Dhanush. The two of them blame Dhanush and question him about it.' },
      ],
      subscenes: []
    },
    {
      id: 'S11',
      number: 'SCENE 11',
      title: null,
      lines: [
        { type: 'action', text: 'They all approach the box, find a Jenga block in that box — they pick it up and read it. It was sealed, so they neatly open it. The phone reads it. The one reading becomes more terrified. They look to tell Dhanush. Two of them blame Dhanush and question him about it.' },
      ],
      subscenes: []
    },
    {
      id: 'S12',
      number: 'SCENE 12',
      title: 'ONE OF THEM ALSO KNOWS WHERE THE LAST BLOCK IS',
      lines: [
        { type: 'scene-desc', text: 'One of them also knows where as the last block is. They look from front up.' },
      ],
      subscenes: []
    },
    {
      id: 'S12A',
      number: 'SCENE 12.1',
      title: null,
      lines: [
        { type: 'action', text: 'The same black hooded guy as before is standing their midst — they are confused of them. They are as lost (up).' },
      ],
      subscenes: []
    },
    {
      id: 'S13',
      number: 'SCENE 13',
      title: 'THE BLACK HOODED FIGURE REMOVES HIS HOOD',
      lines: [
        { type: 'scene-desc', text: 'The black hooded guy removes his hood — everyone is shocked, standing in their midst, confused.' },
      ],
      subscenes: [
        {
          id: 'S13.1',
          number: 'SCENE 13.1',
          lines: [
            { type: 'action', text: 'The focus shifts to de it\'s hand — it\'s a Jenga block.' },
          ]
        },
        {
          id: 'S13.2',
          number: 'SCENE 13.2',
          lines: [
            { type: 'action', text: 'Dark word on a Jenga block.' },
          ]
        },
        {
          id: 'S13.3',
          number: 'SCENE 13.3',
          lines: [
            { type: 'action', text: 'We thought the strokes on it were lost from flashing. On we discover "FORGIVENESS" written on it.' },
          ]
        },
        {
          id: 'S13.B',
          number: 'SCENE 13 — FLASHBACK',
          lines: [
            { type: 'action', text: 'Dev goes to the staircase and when he reaches the last stop — a black hand pulls him into darkness.' },
            { type: 'action', text: 'Flashback ends.' },
          ]
        },
        {
          id: 'S13.4',
          number: 'SCENE 13.4',
          lines: [
            { type: 'action', text: 'He goes to the tower slowly and puts the last piece and plays the last move… and the tower falls.' },
          ]
        }
      ]
    }
  ]

  return (
    <section id="screenplay" ref={sectionRef} className="screenplay-section section" aria-labelledby="screenplay-title">
      <div className="screenplay-section__bg"><DustParticles /></div>
      <div className="container">

        <div className={getClass('sp-header', 'cr', 'section-header')} ref={setRef('sp-header')}>
          <span className="section-header__label">THE SCRIPT</span>
          <h2 id="screenplay-title" className="section-header__title glitch" data-text="SCREENPLAY">
            SCREENPLAY
          </h2>
        </div>

        <div className="screenplay-section__script">
          {scenes.map((scene, index) => {
            const key = `sp-scene-${scene.id}`
            const cls = getClass(key, 'cr', 'screenplay-scene')

            return (
              <article
                key={scene.id}
                ref={setRef(key)}
                className={cls}
              >
                <header className="screenplay-scene__header">
                  <span className="screenplay-scene__number mono">{scene.number}</span>
                  {scene.title && (
                    <h3 className="screenplay-scene__title">{scene.title}</h3>
                  )}
                </header>

                <div className="screenplay-scene__body">
                  {scene.lines.map((line, i) => (
                    <div key={i} className={`screenplay-line screenplay-line--${line.type}`}>
                      {line.text}
                    </div>
                  ))}

                  {scene.subscenes && scene.subscenes.map((sub) => {
                    const subKey = `sp-sub-${sub.id}`
                    return (
                      <div
                        key={sub.id}
                        ref={setRef(subKey)}
                        className={getClass(subKey, 'cr-fast', 'screenplay-subscene')}
                      >
                        <div className="screenplay-subscene__number mono">{sub.number}</div>
                        {sub.lines.map((line, i) => (
                          <div key={i} className={`screenplay-line screenplay-line--${line.type}`}>
                            {line.text}
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ============================================
// COMPONENT: Closing
// ============================================
function Closing({ sectionRef }) {
  return (
    <section id="closing" ref={sectionRef} className="closing-section section" aria-labelledby="closing-title">
      <div className="closing-section__bg">
        <div className="closing-section__vignette" />
        <DustParticles />
      </div>
      <div className="container">
        <div className="closing-section__content reveal">
          <h1 id="closing-title" className="closing-section__title glitch" data-text="THE LAST MOVE">
            THE LAST MOVE
          </h1>
          <div className="closing-section__divider" aria-hidden="true" />
          <p className="closing-section__credit serif">A FILM BY</p>
          <p className="closing-section__studio text-gradient">BABLADÉ STUDIOS</p>
        </div>
      </div>
    </section>
  )
}

// ============================================
// MAIN APP COMPONENT
// ============================================
function App() {
  const [showIntro, setShowIntro] = useState(true)
  const [activeSection, setActiveSection] = useState('hero')
  const sectionElements = useRef({})

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false)
    requestAnimationFrame(() => {
      document.querySelectorAll('.reveal').forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), i * 50)
      })
    })
  }, [])

  const handleNavigate = useCallback((sectionId) => {
    const element = sectionElements.current[sectionId]
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setActiveSection(sectionId)
    }
  }, [])

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY + window.innerHeight / 3
    const sectionIds = ['hero', 'story', 'screenplay', 'closing']
    for (const id of sectionIds) {
      const el = sectionElements.current[id]
      if (el) {
        const top = el.offsetTop
        const bottom = top + el.offsetHeight
        if (scrollY >= top && scrollY < bottom) { setActiveSection(id); break }
      }
    }
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // IntersectionObserver for .reveal elements (hero + closing)
  useEffect(() => {
    if (showIntro) return
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible') }) },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('.reveal:not(.visible)').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [showIntro])

  return (
    <>
      <InternalStyles />
      <FilmGrain />
      <Vignette />
      <BackgroundMusic />

      {showIntro && <StudioIntro onComplete={handleIntroComplete} />}

      {!showIntro && (
        <Navigation activeSection={activeSection} onNavigate={handleNavigate} />
      )}

      <main id="main-content" role="main">
        <Hero sectionRef={(el) => { sectionElements.current.hero = el }} />
        <Story sectionRef={(el) => { sectionElements.current.story = el }} />
        <Screenplay sectionRef={(el) => { sectionElements.current.screenplay = el }} />
        <Closing sectionRef={(el) => { sectionElements.current.closing = el }} />
      </main>
    </>
  )
}

export default App