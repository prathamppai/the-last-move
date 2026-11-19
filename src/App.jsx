import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import './App.css'

// ============================================
// INTERNAL STYLES — Scroll-based text animations
// ============================================
const ScrollAnimationStyles = () => (
  <style dangerouslySetInnerHTML={ { __html: `
    /* Scroll-based reveal animations for Story & Screenplay */
    .scroll-reveal {
      opacity: 0;
      transform: translateY(30px);
      filter: blur(4px);
      will-change: opacity, transform, filter;
      transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                  transform 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                  filter 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .scroll-reveal.is-visible {
      opacity: 1;
      transform: translateY(0);
      filter: blur(0);
    }

    /* Stagger delays for child elements */
    .scroll-reveal-stagger > * {
      opacity: 0;
      transform: translateY(20px);
      filter: blur(3px);
      will-change: opacity, transform, filter;
      transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                  transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                  filter 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .scroll-reveal-stagger.is-visible > *:nth-child(1)  { transition-delay: 0ms; }
    .scroll-reveal-stagger.is-visible > *:nth-child(2)  { transition-delay: 60ms; }
    .scroll-reveal-stagger.is-visible > *:nth-child(3)  { transition-delay: 120ms; }
    .scroll-reveal-stagger.is-visible > *:nth-child(4)  { transition-delay: 180ms; }
    .scroll-reveal-stagger.is-visible > *:nth-child(5)  { transition-delay: 240ms; }
    .scroll-reveal-stagger.is-visible > *:nth-child(6)  { transition-delay: 300ms; }
    .scroll-reveal-stagger.is-visible > *:nth-child(7)  { transition-delay: 360ms; }
    .scroll-reveal-stagger.is-visible > *:nth-child(8)  { transition-delay: 420ms; }
    .scroll-reveal-stagger.is-visible > *:nth-child(9)  { transition-delay: 480ms; }
    .scroll-reveal-stagger.is-visible > *:nth-child(10) { transition-delay: 540ms; }
    .scroll-reveal-stagger.is-visible > *:nth-child(11) { transition-delay: 600ms; }
    .scroll-reveal-stagger.is-visible > *:nth-child(12) { transition-delay: 660ms; }

    .scroll-reveal-stagger.is-visible > * {
      opacity: 1;
      transform: translateY(0);
      filter: blur(0);
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .scroll-reveal,
      .scroll-reveal-stagger > * {
        opacity: 1 !important;
        transform: none !important;
        filter: none !important;
        transition: none !important;
      }
    }

    /* Mobile optimizations */
    @media (max-width: 700px) {
      .scroll-reveal {
        transform: translateY(20px);
      }
      .scroll-reveal-stagger > * {
        transform: translateY(15px);
      }
    }
  ` } } />
)

// ============================================
// HOOK: useScrollReveal — Scroll-based reversible animations
// ============================================
function useScrollReveal(elementRefs, options = {}) {
  const {
    rootMargin = '0px 0px -15% 0px', // Trigger when element enters lower 85% of viewport
    threshold = 0.05,
    staggerDelay = 60,
    maxStagger = 600,
    once = false, // false = reversible, true = one-time
  } = options

  const [visibilityMap, setVisibilityMap] = useState({})
  const observerRef = useRef(null)
  const rafRef = useRef(null)
  const scrollYRef = useRef(0)

  // Calculate visibility based on scroll position (for smooth, reversible animations)
  const calculateVisibility = useCallback(() => {
    if (!elementRefs.current || elementRefs.current.size === 0) return

    const scrollY = window.scrollY
    scrollYRef.current = scrollY
    const viewportHeight = window.innerHeight
    const triggerPoint = viewportHeight * 0.85 // Element triggers at 85% from top

    const newVisibility = {}
    let hasChanges = false

    elementRefs.current.forEach((el, key) => {
      if (!el) return
      const rect = el.getBoundingClientRect()
      const elementTop = rect.top + scrollY
      const elementBottom = elementTop + rect.height
      const scrollBottom = scrollY + viewportHeight

      // Calculate progress: 0 when element bottom at viewport top, 1 when element top at viewport 85%
      const startReveal = elementTop - triggerPoint
      const endReveal = elementBottom - scrollY
      const revealDistance = rect.height + viewportHeight * 0.15

      let progress = 0
      if (scrollBottom > elementTop && scrollY < elementBottom) {
        // Element is intersecting viewport
        const intersectionStart = Math.max(scrollY, elementTop - viewportHeight)
        const intersectionEnd = Math.min(scrollBottom, elementBottom)
        const intersection = intersectionEnd - intersectionStart
        progress = Math.min(1, Math.max(0, intersection / revealDistance))
      } else if (scrollY >= elementBottom) {
        // Scrolled past element
        progress = 1
      }

      // For reversible: visible when progress > 0.15 (entered viewport enough)
      const isVisible = progress > 0.15
      const wasVisible = visibilityMap[key]

      newVisibility[key] = isVisible
      if (isVisible !== wasVisible) hasChanges = true
    })

    if (hasChanges) {
      setVisibilityMap(prev => {
        // Only update if actually changed
        const changed = Object.keys(newVisibility).some(k => newVisibility[k] !== prev[k])
        return changed ? newVisibility : prev
      })
    }
  }, [elementRefs, visibilityMap])

  // RAF-based scroll handler for smooth 60fps updates
  const handleScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(calculateVisibility)
  }, [calculateVisibility])

  useEffect(() => {
    // Initial calculation
    calculateVisibility()

    // Scroll listener with passive flag for performance
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [calculateVisibility, handleScroll])

  // Also set up IntersectionObserver as fallback for elements that might be missed
  useEffect(() => {
    if (!elementRefs.current || elementRefs.current.size === 0) return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const key = entry.target.dataset.scrollKey
        if (!key) return
        const isVisible = entry.isIntersecting && entry.intersectionRatio > 0.1
        setVisibilityMap(prev => {
          if (prev[key] !== isVisible) {
            return { ...prev, [key]: isVisible }
          }
          return prev
        })
      })
    }, { rootMargin, threshold })

    elementRefs.current.forEach((el, key) => {
      if (el) {
        el.dataset.scrollKey = key
        observer.observe(el)
      }
    })

    return () => observer.disconnect()
  }, [elementRefs, rootMargin, threshold])

  return visibilityMap
}

// ============================================
// COMPONENT: FilmGrain - Ambient film grain overlay
// ============================================
function FilmGrain() {
  return <div className="film-grain" aria-hidden="true" />
}

// ============================================
// COMPONENT: Vignette - Subtle vignette effect
// ============================================
function Vignette() {
  return <div className="vignette" aria-hidden="true" />
}

// ============================================
// COMPONENT: DustParticles - Floating dust particles
// ============================================
function DustParticles({ className = '' }) {
  return <div className={`dust-particles ${className}`} aria-hidden="true" />
}

// ============================================
// COMPONENT: SkipLink - Accessibility skip link
// ============================================
function SkipLink({ target }) {
  return (
    <a href={target} className="skip-link">
      Skip to main content
    </a>
  )
}

// ============================================
// COMPONENT: BackgroundMusic - Autoplay loop with fallback control
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
      audio.play().then(() => {
        setPlaying(true)
        setBlocked(false)
      }).catch(() => {
        setBlocked(true)
        setPlaying(false)
      })
    }

    // Attempt autoplay immediately
    tryPlay()

    // Also try on first user interaction
    const onInteract = () => {
      if (!playing) tryPlay()
    }
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
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().then(() => {
        setPlaying(true)
        setBlocked(false)
      }).catch(() => setBlocked(true))
    }
  }

  return (
    <>
      <audio ref={audioRef} src="/blurrynights.mp3" preload="auto" />
      {visible && (
        <div
          className={`music-control ${blocked && !playing ? 'music-control--blocked' : ''}`}
          aria-label="Background music control"
        >
          <button
            className="music-control__btn"
            onClick={toggle}
            aria-label={playing ? 'Pause background music' : 'Play background music'}
            title={playing ? 'Pause music' : 'Play music'}
          >
            {playing ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="4" width="4" height="16" rx="1"/>
                <rect x="14" y="4" width="4" height="16" rx="1"/>
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
          <button
            className="music-control__dismiss"
            onClick={() => setVisible(false)}
            aria-label="Dismiss music control"
          >
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
// COMPONENT: StudioIntro - Bablade Studios introduction sequence
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
        setTimeout(() => {
          setState('done')
          onComplete()
        }, 1500)
      }, 1500)
    }, 1500)

    return () => {
      clearTimeout(skipTimer)
      clearTimeout(timeoutRef.current)
    }
  }, [onComplete])

  const handleSkip = useCallback(() => {
    clearTimeout(timeoutRef.current)
    setState('fade-out')
    setTimeout(() => {
      setState('done')
      onComplete()
    }, 500)
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
          <img
            src="/bablade.png"
            alt="Babladé Studios"
            className="studio-intro__logo-img"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'block'
            }}
          />
          <div className="studio-intro__name text-gradient glitch" data-text="BABLADÉ STUDIOS" style={{ display: 'none' }}>
            BABLADÉ STUDIOS
          </div>
        </div>
        <div className="studio-intro__presents">
          PRESENTS
        </div>
      </div>

      {showSkip && (
        <button
          className="studio-intro__skip btn btn-ghost"
          onClick={handleSkip}
          aria-label="Skip studio introduction"
        >
          SKIP INTRO
        </button>
      )}
    </div>
  )
}

// ============================================
// COMPONENT: Navigation - Sticky navigation bar
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
    { id: 'hero',       label: 'HOME' },
    { id: 'story',      label: 'THE STORY' },
    { id: 'screenplay', label: 'SCREENPLAY' },
  ]

  return (
    <>
      <SkipLink target="#main-content" />
      <nav
        className={`navigation ${scrolled ? 'scrolled' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="navigation__container container">
          <div className="navigation__logo" aria-label="The Last Move - Home">
            <img
              src="/bablade.png"
              alt="Babladé Studios"
              className="navigation__logo-img"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            <span className="navigation__logo-mark" style={{ display: 'none' }}>TLM</span>
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

          <ul
            id="nav-menu"
            className={`navigation__menu ${mobileOpen ? 'open' : ''}`}
            role="menubar"
          >
            {navItems.map((item) => (
              <li key={item.id} role="none">
                <button
                  role="menuitem"
                  className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => {
                    onNavigate(item.id)
                    setMobileOpen(false)
                  }}
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
// COMPONENT: ScrollIndicator - Animated scroll indicator
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
// COMPONENT: Hero - Full-screen cinematic hero section
// ============================================
function Hero({ sectionRef }) {
  return (
    <section
      id="hero"
      ref={sectionRef}
      className="hero-section section"
      aria-labelledby="hero-title"
    >
      <div className="hero-section__bg slow-zoom">
        <div className="hero-section__overlay" />
        <DustParticles className="hero-section__dust" />
      </div>

      <div className="hero-section__content container">
        <div className="hero-section__tagline reveal">
          A PSYCHOLOGICAL THRILLER
        </div>

        <h1
          id="hero-title"
          className="hero-section__title reveal glitch"
          data-text="THE LAST MOVE"
        >
          THE LAST MOVE
        </h1>

        <div className="hero-section__divider reveal" style={{ transitionDelay: '200ms' }} />

        <p
          className="hero-section__tagline-text reveal serif"
          style={{ transitionDelay: '300ms' }}
        >
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
// COMPONENT: Story - Five-act story from PDF pages 1-2
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

  return (
    <section
      id="story"
      ref={sectionRef}
      className="story-section section"
      aria-labelledby="story-title"
    >
      <div className="story-section__bg">
        <DustParticles />
      </div>

      <div className="container">
        <div className="section-header reveal">
          <span className="section-header__label">THE NARRATIVE</span>
          <h2 id="story-title" className="section-header__title glitch" data-text="THE STORY">
            THE STORY
          </h2>
        </div>

        <div className="story-section__meta reveal" style={{ transitionDelay: '100ms' }}>
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

        <div className="story-section__acts">
          {acts.map((act, index) => (
            <article
              key={act.number}
              className="story-section__act reveal"
              style={{ transitionDelay: `${index * 120}ms` }}
            >
              <div className="story-section__act-header">
                <span className="story-section__act-number mono">{act.number}</span>
                {act.title && (
                  <h3 className="story-section__act-title">{act.title}</h3>
                )}
              </div>
              <div className="story-section__act-body">
                {act.body.split('\n\n').map((para, i) => (
                  <p key={i} className="story-section__act-para serif">{para}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================
// COMPONENT: Screenplay - Full scene breakdown from PDF pages 3-7
// ============================================
function Screenplay({ sectionRef }) {
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
    <section
      id="screenplay"
      ref={sectionRef}
      className="screenplay-section section"
      aria-labelledby="screenplay-title"
    >
      <div className="screenplay-section__bg">
        <DustParticles />
      </div>

      <div className="container">
        <div className="section-header reveal">
          <span className="section-header__label">THE SCRIPT</span>
          <h2 id="screenplay-title" className="section-header__title glitch" data-text="SCREENPLAY">
            SCREENPLAY
          </h2>
        </div>

        <div className="screenplay-section__script">
          {scenes.map((scene, index) => (
            <article
              key={scene.id}
              className="screenplay-scene reveal"
              style={{ transitionDelay: `${Math.min(index * 80, 500)}ms` }}
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

                {scene.subscenes && scene.subscenes.map((sub) => (
                  <div key={sub.id} className="screenplay-subscene">
                    <div className="screenplay-subscene__number mono">{sub.number}</div>
                    {sub.lines.map((line, i) => (
                      <div key={i} className={`screenplay-line screenplay-line--${line.type}`}>
                        {line.text}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================
// COMPONENT: Closing - Final cinematic closing
// ============================================
function Closing({ sectionRef }) {
  return (
    <section
      id="closing"
      ref={sectionRef}
      className="closing-section section"
      aria-labelledby="closing-title"
    >
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

          <p className="closing-section__credit serif">
            A FILM BY
          </p>

          <p className="closing-section__studio text-gradient">
            BABLADÉ STUDIOS
          </p>
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
        if (scrollY >= top && scrollY < bottom) {
          setActiveSection(id)
          break
        }
      }
    }
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Intersection Observer for reveal animations
  useEffect(() => {
    if (showIntro) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )

    document.querySelectorAll('.reveal:not(.visible)').forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [showIntro])

  return (
    <>
      <FilmGrain />
      <Vignette />
      <BackgroundMusic />

      {showIntro && (
        <StudioIntro onComplete={handleIntroComplete} />
      )}

      {!showIntro && (
        <Navigation
          activeSection={activeSection}
          onNavigate={handleNavigate}
        />
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