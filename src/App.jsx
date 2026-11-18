import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'

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
// COMPONENT: StudioIntro - Bablade Studios introduction sequence
// ============================================
function StudioIntro({ onComplete, onSkip }) {
  const [state, setState] = useState('fade-in') // fade-in, hold, fade-out, done
  const [showSkip, setShowSkip] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    // Show skip button after 1 second
    const skipTimer = setTimeout(() => setShowSkip(true), 1000)

    // Sequence: fade-in (1.5s) -> hold (1.5s) -> fade-out (1.5s) -> complete
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

  const opacity = state === 'fade-in' ? 0 : state === 'fade-out' ? 0 : 1
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
        <div className="studio-intro__name text-gradient glitch" data-text="BABLADÉ STUDIOS">
          BABLADÉ STUDIOS
        </div>
        <div className="studio-intro__presents reveal" style={{ transitionDelay: '800ms' }}>
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
function Navigation({ sections, activeSection, onNavigate }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { id: 'about', label: 'ABOUT' },
    { id: 'story', label: 'THE STORY' },
    { id: 'jenga', label: 'THE SYMBOL' },
    { id: 'message', label: 'THE MESSAGE' },
    { id: 'final-block', label: 'FINAL BLOCK' },
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
            <span className="navigation__logo-mark">TLM</span>
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
function Hero() {
  return (
    <section
      id="hero"
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
// COMPONENT: About - About the film section
// ============================================
function About() {
  return (
    <section
      id="about"
      className="about-section section"
      aria-labelledby="about-title"
    >
      <div className="container">
        <div className="section-header reveal">
          <span className="section-header__label">ABOUT THE FILM</span>
          <h2 id="about-title" className="section-header__title glitch" data-text="THE STORY">
            THE STORY
          </h2>
        </div>

        <div className="about-section__grid">
          <div className="about-section__synopsis reveal">
            <p className="serif about-section__text">
              Five friends. One abandoned building. One unfinished game. A year after an unexplained disappearance,
              a mysterious message brings them back together. But some games were never meant to be played again.
            </p>
          </div>

          <div className="about-section__details reveal" style={{ transitionDelay: '100ms' }}>
            <div className="about-section__detail">
              <span className="about-section__detail-label">GENRE</span>
              <span className="about-section__detail-value">Psychological Thriller / Mystery / Paranormal Drama</span>
            </div>
            <div className="about-section__detail">
              <span className="about-section__detail-label">THEMES</span>
              <span className="about-section__detail-value">Friendship, Betrayal, Guilt, Forgiveness</span>
            </div>
            <div className="about-section__detail">
              <span className="about-section__detail-label">CENTRAL SYMBOL</span>
              <span className="about-section__detail-value">The Jenga Tower</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================
// COMPONENT: StoryTimeline - Five chapters cinematic timeline
// ============================================
function StoryTimeline() {
  const chapters = [
    {
      number: '01',
      title: 'THE BEGINNING',
      description: 'Five friends visit an abandoned building and begin playing Jenga. While the others are distracted, Dev mysteriously disappears.'
    },
    {
      number: '02',
      title: 'THE AFTERMATH',
      description: 'The disappearance tears the group apart. An argument over safety and responsibility leaves everyone carrying guilt. They stop communicating for a year.'
    },
    {
      number: '03',
      title: 'THE MESSAGE',
      description: 'An anonymous message arrives: "Remember the last game?" Attached is an old photograph of the five friends, including Dev.'
    },
    {
      number: '04',
      title: 'THE RETURN',
      description: 'The friends reunite. A mysterious black figure leads them back to the abandoned building where Dev disappeared.'
    },
    {
      number: '05',
      title: 'THE LAST GAME',
      description: 'A mysterious box reveals a distorted recording and a Jenga block reading "MY BEST FRIEND BETRAYED ME..." Dev eventually appears holding the final block, marked "FORGIVENESS."'
    }
  ]

  return (
    <section
      id="story"
      className="story-section section"
      aria-labelledby="story-title"
    >
      <div className="container">
        <div className="section-header reveal">
          <span className="section-header__label">THE NARRATIVE</span>
          <h2 id="story-title" className="section-header__title glitch" data-text="FIVE CHAPTERS">
            FIVE CHAPTERS
          </h2>
        </div>

        <div className="story-section__timeline" role="list">
          {chapters.map((chapter, index) => (
            <article
              key={chapter.number}
              className={`story-section__chapter reveal ${index % 2 === 0 ? 'left' : 'right'}`}
              role="listitem"
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="story-section__chapter-marker">
                <span className="story-section__chapter-number mono">{chapter.number}</span>
                <div className="story-section__chapter-line" aria-hidden="true" />
              </div>
              <div className="story-section__chapter-content">
                <h3 className="story-section__chapter-title">{chapter.title}</h3>
                <p className="story-section__chapter-text serif">{chapter.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================
// COMPONENT: JengaSymbol - Central symbol section
// ============================================
function JengaSymbol() {
  return (
    <section
      id="jenga"
      className="jenga-section section"
      aria-labelledby="jenga-title"
    >
      <div className="jenga-section__bg">
        <div className="jenga-section__gradient" />
        <DustParticles />
      </div>

      <div className="container">
        <div className="jenga-section__layout">
          <div className="jenga-section__visual reveal">
            <div className="jenga-tower" role="img" aria-label="Jenga tower representing friendship">
              {[...Array(18)].map((_, i) => (
                <div
                  key={i}
                  className={`jenga-block ${i === 17 ? 'jenga-block--final' : ''}`}
                  style={{
                    animationDelay: `${i * 0.05}s`,
                    '--block-hue': i === 17 ? '0, 85%, 45%' : '0, 0%, 25%'
                  }}
                >
                  {i === 17 && <span className="jenga-block__text">FORGIVENESS</span>}
                </div>
              ))}
            </div>
            <div className="jenga-tower__shadow" aria-hidden="true" />
          </div>

          <div className="jenga-section__content reveal" style={{ transitionDelay: '200ms' }}>
            <span className="section-header__label">THE CENTRAL SYMBOL</span>
            <h2 id="jenga-title" className="section-header__title">JENGA</h2>

            <div className="jenga-section__quote">
              <p className="serif jenga-section__text">
                "The tower represents the friendship shared by five people.
                Every block represents a memory, a decision or a bond.
                And sometimes, one final move is all it takes to bring everything down."
              </p>
            </div>

            <div className="jenga-section__meaning">
              <div className="jenga-section__meaning-item">
                <span className="jenga-section__meaning-number mono">01</span>
                <span>Each block = a shared memory</span>
              </div>
              <div className="jenga-section__meaning-item">
                <span className="jenga-section__meaning-number mono">02</span>
                <span>Removing blocks = testing trust</span>
              </div>
              <div className="jenga-section__meaning-item">
                <span className="jenga-section__meaning-number mono">03</span>
                <span>The final move = the breaking point</span>
              </div>
              <div className="jenga-section__meaning-item">
                <span className="jenga-section__meaning-number mono">04</span>
                <span>Rebuilding = forgiveness</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================
// COMPONENT: MysteriousMessage - The message recreation
// ============================================
function MysteriousMessage() {
  const [messageVisible, setMessageVisible] = useState(false)
  const [photoVisible, setPhotoVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setMessageVisible(true), 300)
          setTimeout(() => setPhotoVisible(true), 1200)
        }
      },
      { threshold: 0.3 }
    )

    const el = document.getElementById('message')
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="message"
      className="message-section section"
      aria-labelledby="message-title"
    >
      <div className="message-section__bg">
        <div className="message-section__scanlines" aria-hidden="true" />
        <DustParticles />
      </div>

      <div className="container">
        <div className="section-header reveal">
          <span className="section-header__label">THE CATALYST</span>
          <h2 id="message-title" className="section-header__title glitch" data-text="THE MESSAGE">
            THE MESSAGE
          </h2>
        </div>

        <div className="message-section__layout">
          <div className={`message-section__phone reveal ${messageVisible ? 'visible' : ''}`} role="img" aria-label="Phone screen showing mysterious message">
            <div className="message-section__phone-frame">
              <div className="message-section__phone-notch" />
              <div className="message-section__phone-screen">
                <div className="message-section__message-bubble">
                  <div className="message-section__sender mono">Unknown Number</div>
                  <div className="message-section__time mono">23:47</div>
                  <p className="message-section__message-text serif">
                    "Remember the last game?"
                  </p>
                  <div className="message-section__message-status">
                    <span className="message-section__delivered mono">Delivered</span>
                    <span className="message-section__read mono">Read</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`message-section__photo reveal ${photoVisible ? 'visible' : ''}`} role="img" aria-label="Old photograph of five friends including Dev">
            <div className="message-section__photo-frame">
              <div className="message-section__photo-image">
                <div className="message-section__photo-placeholder">
                  <span className="message-section__photo-text mono">PHOTOGRAPH</span>
                  <span className="message-section__photo-subtext">Five friends • Dev included</span>
                </div>
                <div className="message-section__photo-corners" />
                <div className="message-section__photo-tape" />
                <div className="message-section__photo-wear" />
              </div>
              <div className="message-section__photo-caption">
                <p className="serif mono">Attached to the message. Taken the night Dev disappeared.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================
// COMPONENT: FinalBlock - Two dramatic Jenga blocks
// ============================================
function FinalBlock() {
  const [revealStage, setRevealStage] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setRevealStage(1), 200)
          setTimeout(() => setRevealStage(2), 1500)
          setTimeout(() => setRevealStage(3), 3000)
        }
      },
      { threshold: 0.4 }
    )

    const el = document.getElementById('final-block')
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="final-block"
      className="final-block-section section"
      aria-labelledby="final-block-title"
    >
      <div className="final-block-section__bg">
        <div className="final-block-section__spotlight" />
        <DustParticles />
      </div>

      <div className="container">
        <div className="section-header reveal">
          <span className="section-header__label">THE CLIMAX</span>
          <h2 id="final-block-title" className="section-header__title glitch" data-text="FINAL BLOCK">
            FINAL BLOCK
          </h2>
        </div>

        <div className="final-block-section__blocks">
          <div
            className={`final-block-section__block reveal ${revealStage >= 1 ? 'visible' : ''}`}
            role="img"
            aria-label='First Jenga block reading "MY BEST FRIEND BETRAYED ME..."'
          >
            <div className="final-block-section__block-inner">
              <div className="final-block-section__block-text">
                <span className="final-block-section__block-line">MY BEST FRIEND</span>
                <span className="final-block-section__block-line">BETRAYED ME...</span>
              </div>
              <div className="final-block-section__block-grain" aria-hidden="true" />
            </div>
          </div>

          <div
            className={`final-block-section__block final-block-section__block--final reveal ${revealStage >= 2 ? 'visible' : ''}`}
            role="img"
            aria-label='Final Jenga block reading "FORGIVENESS."'
          >
            <div className="final-block-section__block-inner">
              <div className="final-block-section__block-text final-block-section__block-text--final">
                <span className="final-block-section__block-line">FORGIVENESS.</span>
              </div>
              <div className="final-block-section__block-glow" aria-hidden="true" />
              <div className="final-block-section__block-grain" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div
          className={`final-block-section__reflection reveal ${revealStage >= 3 ? 'visible' : ''}`}
          style={{ transitionDelay: '500ms' }}
        >
          <p className="serif final-block-section__reflection-text">
            Some friendships survive mistakes.
            Others collapse under the weight of them.
          </p>
        </div>
      </div>
    </section>
  )
}

// ============================================
// COMPONENT: Closing - Final cinematic closing
// ============================================
function Closing() {
  return (
    <section
      id="closing"
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
  const [sectionsRef] = useState({
    hero: null,
    about: null,
    story: null,
    jenga: null,
    message: null,
    'final-block': null,
    closing: null
  })
  const sectionElements = useRef({})

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false)
    // Trigger initial reveal animations
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
    const sectionIds = ['hero', 'about', 'story', 'jenga', 'message', 'final-block', 'closing']

    for (const id of sectionIds) {
      const el = sectionElements.current[id]
      if (el) {
        const rect = el.getBoundingClientRect()
        const top = rect.top + window.scrollY
        const bottom = top + rect.height
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
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    document.querySelectorAll('.reveal:not(.visible)').forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <FilmGrain />
      <Vignette />

      {showIntro && (
        <StudioIntro onComplete={handleIntroComplete} onSkip={handleIntroComplete} />
      )}

      <Navigation
        sections={sectionElements.current}
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      <main id="main-content" role="main">
        <Hero
          ref={(el) => { sectionElements.current.hero = el }}
        />
        <About
          ref={(el) => { sectionElements.current.about = el }}
        />
        <StoryTimeline
          ref={(el) => { sectionElements.current.story = el }}
        />
        <JengaSymbol
          ref={(el) => { sectionElements.current.jenga = el }}
        />
        <MysteriousMessage
          ref={(el) => { sectionElements.current.message = el }}
        />
        <FinalBlock
          ref={(el) => { sectionElements.current['final-block'] = el }}
        />
        <Closing
          ref={(el) => { sectionElements.current.closing = el }}
        />
      </main>
    </>
  )
}

export default App