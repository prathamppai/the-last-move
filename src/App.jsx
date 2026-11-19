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

    /* ── DECORATIVE PHONE FIGURES ───────────────────────────────── */
    .deco-phone {
      position: absolute;
      pointer-events: none;
      z-index: 0;
      opacity: 0.6;
      will-change: transform, opacity;
    }
    .hero-section__bg .deco-phone,
    .story-section__bg .deco-phone,
    .screenplay-section__bg .deco-phone,
    .closing-section__bg .deco-phone {
      animation: phone-float 20s ease-in-out infinite;
    }
    .deco-phone--1 {
      width: clamp(80px, 8vw, 140px);
      height: clamp(120px, 12vw, 210px);
      top: 15%;
      left: 5%;
      animation-delay: 0s;
      transform-origin: center center;
    }
    .deco-phone--2 {
      width: clamp(60px, 6vw, 100px);
      height: clamp(120px, 12vw, 200px);
      top: 60%;
      right: 8%;
      animation-delay: -4s;
      transform-origin: center center;
    }
    .deco-phone--3 {
      width: clamp(70px, 7vw, 120px);
      height: clamp(140px, 14vw, 240px);
      bottom: 10%;
      left: 3%;
      animation-delay: -8s;
      transform-origin: center center;
    }
    .deco-phone--4 {
      width: clamp(50px, 5vw, 80px);
      height: clamp(90px, 9vw, 150px);
      top: 35%;
      right: 15%;
      animation-delay: -12s;
      transform-origin: center center;
    }
    .deco-phone--5 {
      width: clamp(60px, 6vw, 100px);
      height: clamp(110px, 11vw, 180px);
      bottom: 25%;
      right: 5%;
      animation-delay: -16s;
      transform-origin: center center;
    }
    .deco-jenga {
      position: absolute;
      pointer-events: none;
      z-index: 0;
      opacity: 0.4;
      animation: jenga-float 15s ease-in-out infinite;
    }
    .deco-jenga--1 {
      width: clamp(100px, 10vw, 180px);
      height: clamp(40px, 4vw, 72px);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-12deg);
      animation-delay: -2s;
    }
    .deco-particles {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
      opacity: 0.3;
      animation: particles-drift 30s linear infinite;
    }
    .deco-accent-line {
      position: absolute;
      pointer-events: none;
      z-index: 0;
      opacity: 0.5;
    }

    @keyframes phone-float {
      0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0.5; }
      12.5% { transform: translateY(-20px) translateX(10px) rotate(2deg); opacity: 0.7; }
      25% { transform: translateY(-10px) translateX(-15px) rotate(-1deg); opacity: 0.55; }
      37.5% { transform: translateY(-30px) translateX(5px) rotate(1.5deg); opacity: 0.65; }
      50% { transform: translateY(-15px) translateX(-10px) rotate(-0.5deg); opacity: 0.5; }
      62.5% { transform: translateY(-25px) translateX(15px) rotate(1deg); opacity: 0.7; }
      75% { transform: translateY(-5px) translateX(-5px) rotate(-1.5deg); opacity: 0.55; }
      87.5% { transform: translateY(-35px) translateX(0px) rotate(0.5deg); opacity: 0.6; }
    }
    @keyframes jenga-float {
      0%, 100% { transform: translate(-50%, -50%) rotate(-12deg) translateY(0); opacity: 0.35; }
      50% { transform: translate(-50%, -50%) rotate(-12deg) translateY(-15px); opacity: 0.5; }
    }
    @keyframes particles-drift {
      0% { transform: translateY(0) translateX(0) rotate(0deg); }
      25% { transform: translateY(-50px) translateX(30px) rotate(90deg); }
      50% { transform: translateY(-100px) translateX(-20px) rotate(180deg); }
      75% { transform: translateY(-50px) translateX(-40px) rotate(270deg); }
      100% { transform: translateY(0) translateX(0) rotate(360deg); }
    }

    @media (prefers-reduced-motion: reduce) {
      .deco-phone,
      .deco-jenga,
      .deco-particles { animation: none !important; opacity: 0.3; }
    }
    @media (max-width: 900px) {
      .deco-phone { opacity: 0.35; }
      .deco-phone--3, .deco-phone--5 { display: none; }
    }
    @media (max-width: 600px) {
      .deco-phone { opacity: 0.25; }
      .deco-phone--2, .deco-phone--4 { display: none; }
      .deco-jenga { opacity: 0.2; }
    }

    /* ── /* ── MYSTERIOUS ATMOSPHERIC BACKGROUNDS ─────────────────────── */
    /* Base section background - deep, layered darkness with texture */
    .section {
      position: relative;
      isolation: isolate;
    }
    .section::before {
      content: '';
      position: absolute;
      inset: -20%;
      z-index: -1;
      background:
        /* Deep color zones */
        radial-gradient(ellipse 90% 70% at 15% 25%, rgba(184,42,42,0.05), transparent 55%),
        radial-gradient(ellipse 80% 90% at 85% 30%, rgba(120,60,20,0.035), transparent 50%),
        radial-gradient(ellipse 70% 80% at 20% 80%, rgba(20,20,60,0.04), transparent 55%),
        radial-gradient(ellipse 100% 100% at 80% 80%, rgba(60,15,15,0.03), transparent 45%),
        radial-gradient(ellipse 110% 110% at 50% 100%, rgba(25,10,10,0.1), transparent 35%),
        /* Subtle color atmosphere */
        radial-gradient(ellipse 60% 60% at 50% 50%, rgba(184,42,42,0.015), transparent 70%),
        /* Base darkness */
        #020202;
      pointer-events: none;
    }

    /* Global film grain overlay */
    .section::after {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 100;
      pointer-events: none;
      opacity: 0.03;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
      animation: grain-shift 8s steps(10) infinite;
    }

    @keyframes grain-shift {
      0%, 100% { transform: translate(0, 0); }
      10% { transform: translate(-1px, 1px); }
      20% { transform: translate(1px, -1px); }
      30% { transform: translate(-1px, -1px); }
      40% { transform: translate(1px, 1px); }
      50% { transform: translate(0, -1px); }
      60% { transform: translate(-1px, 0); }
      70% { transform: translate(1px, 0); }
      80% { transform: translate(0, 1px); }
      90% { transform: translate(-1px, 0); }
    }
/* Hero - ominous entrance with rich layers */
    .hero-section__bg {
      position: absolute;
      inset: 0;
      overflow: hidden;
      z-index: 0;
    }
    .hero-section__bg::before {
      content: '';
      position: absolute;
      inset: -10%;
      background:
        /* Deep volumetric fog layers */
        radial-gradient(ellipse 130% 90% at 50% 110%, rgba(184,42,42,0.035), transparent 65%),
        radial-gradient(ellipse 90% 130% at 5% 50%, rgba(100,30,15,0.03), transparent 55%),
        radial-gradient(ellipse 90% 130% at 95% 50%, rgba(100,30,15,0.03), transparent 55%),
        radial-gradient(ellipse 70% 70% at 30% 30%, rgba(20,15,40,0.025), transparent 60%),
        radial-gradient(ellipse 70% 70% at 70% 30%, rgba(20,15,40,0.025), transparent 60%),
        /* God rays / light shafts */
        linear-gradient(180deg,
          rgba(255,255,255,0.015) 0%,
          rgba(255,255,255,0.008) 15%,
          transparent 25%,
          rgba(184,42,42,0.005) 40%,
          transparent 60%
        ),
        /* Ambient color wash */
        radial-gradient(ellipse at 50% 80%, rgba(184,42,42,0.02), transparent 60%),
        /* Deep vignette */
        radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.55) 100%);
      animation: hero-atmosphere 30s ease-in-out infinite;
      pointer-events: none;
    }
    .hero-section__bg::after {
      content: '';
      position: absolute;
      inset: 0;
      background:
        /* Subtle texture - vertical streaks */
        repeating-linear-gradient(
          90deg,
          rgba(255,255,255,0.0005) 0px,
          rgba(255,255,255,0.0005) 1px,
          transparent 1px,
          transparent 6px
        ),
        /* Horizontal film damage */
        repeating-linear-gradient(
          0deg,
          rgba(184,42,42,0.0003) 0px,
          rgba(184,42,42,0.0003) 1px,
          transparent 1px,
          transparent 20px
        );
      pointer-events: none;
      opacity: 0.5;
    }
    .hero-section__overlay {
      position: absolute;
      inset: 0;
      background:
        /* Scanline texture */
        repeating-linear-gradient(
          0deg,
          rgba(255,255,255,0.0015) 0px,
          rgba(255,255,255,0.0015) 1px,
          transparent 1px,
          transparent 3px
        ),
        /* Top light falloff */
        radial-gradient(ellipse at 50% -10%, rgba(184,42,42,0.02), transparent 60%),
        /* Corner darkening */
        radial-gradient(ellipse at 0% 0%, rgba(0,0,0,0.3), transparent 50%),
        radial-gradient(ellipse at 100% 0%, rgba(0,0,0,0.3), transparent 50%);
      pointer-events: none;
    }
    .hero-section__dust {
      position: absolute;
      inset: -15%;
      background-image:
        /* Large slow motes */
        radial-gradient(2px 2px at 12% 22%, rgba(184,42,42,0.2), transparent),
        radial-gradient(1.5px 1.5px at 88% 78%, rgba(184,42,42,0.15), transparent),
        radial-gradient(2px 2px at 42% 58%, rgba(255,220,180,0.08), transparent),
        radial-gradient(1px 1px at 72% 28%, rgba(255,255,255,0.05), transparent),
        radial-gradient(1.5px 1.5px at 28% 82%, rgba(184,42,42,0.12), transparent),
        radial-gradient(2px 2px at 58% 12%, rgba(255,220,180,0.06), transparent),
        /* Medium motes */
        radial-gradient(1px 1px at 35% 45%, rgba(184,42,42,0.1), transparent),
        radial-gradient(1px 1px at 65% 65%, rgba(255,255,255,0.04), transparent),
        radial-gradient(1px 1px at 15% 65%, rgba(184,42,42,0.08), transparent),
        radial-gradient(1px 1px at 85% 35%, rgba(255,220,180,0.05), transparent),
        /* Small fast motes */
        radial-gradient(0.5px 0.5px at 25% 15%, rgba(255,255,255,0.06), transparent),
        radial-gradient(0.5px 0.5px at 75% 85%, rgba(184,42,42,0.08), transparent),
        radial-gradient(0.5px 0.5px at 45% 75%, rgba(255,220,180,0.04), transparent),
        radial-gradient(0.5px 0.5px at 55% 25%, rgba(255,255,255,0.05), transparent);
      background-size:
        420px 420px, 390px 390px, 440px 440px, 370px 370px, 460px 460px, 400px 400px,
        380px 380px, 410px 410px, 360px 360px, 430px 430px,
        300px 300px, 320px 320px, 280px 280px, 310px 310px;
      animation: dust-drift 80s linear infinite;
      opacity: 0.7;
      pointer-events: none;
    }
    .hero-section__embers {
      position: absolute;
      inset: -10%;
      background-image:
        radial-gradient(3px 3px at 20% 85%, rgba(184,42,42,0.15), transparent),
        radial-gradient(2px 2px at 80% 90%, rgba(200,80,30,0.12), transparent),
        radial-gradient(2.5px 2.5px at 50% 95%, rgba(184,42,42,0.1), transparent),
        radial-gradient(1.5px 1.5px at 35% 88%, rgba(220,100,40,0.08), transparent),
        radial-gradient(2px 2px at 65% 82%, rgba(184,42,42,0.09), transparent);
      background-size:
        500px 500px, 480px 480px, 520px 520px, 460px 460px, 490px 490px;
      animation: ember-rise 20s ease-in-out infinite;
      opacity: 0.4;
      pointer-events: none;
    }

    @keyframes hero-atmosphere {
      0%, 100% { transform: scale(1) rotate(0deg) translate(0,0); opacity: 1; }
      12.5% { transform: scale(1.015) rotate(0.2deg) translate(-1%, 0.5%); opacity: 0.97; }
      25% { transform: scale(1.02) rotate(0.3deg) translate(0.5%, -1%); opacity: 0.95; }
      37.5% { transform: scale(1.018) rotate(-0.15deg) translate(-0.5%, 0.5%); opacity: 0.98; }
      50% { transform: scale(1.01) rotate(-0.2deg) translate(1%, -0.5%); opacity: 1; }
      62.5% { transform: scale(1.012) rotate(0.1deg) translate(-0.5%, -0.5%); opacity: 0.99; }
      75% { transform: scale(1.015) rotate(0.15deg) translate(0.5%, 1%); opacity: 0.97; }
      87.5% { transform: scale(1.01) rotate(-0.1deg) translate(-1%, -0.5%); opacity: 0.98; }
    }
    @keyframes dust-drift {
      0% { transform: translate(0, 0) rotate(0deg); }
      16.6% { transform: translate(-25px, -15px) rotate(60deg); }
      33.3% { transform: translate(15px, -35px) rotate(120deg); }
      50% { transform: translate(-20px, -20px) rotate(180deg); }
      66.6% { transform: translate(30px, -10px) rotate(240deg); }
      83.3% { transform: translate(-10px, 10px) rotate(300deg); }
      100% { transform: translate(0, 0) rotate(360deg); }
    }
    @keyframes ember-rise {
      0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
      50% { transform: translateY(-40px) scale(1.1); opacity: 0.6; }
    }
/* Hooded Figure - Central mysterious presence */
    .hooded-figure {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: clamp(200px, 28vw, 380px);
      height: clamp(260px, 37vw, 500px);
      pointer-events: none;
      z-index: 5;
      opacity: 0.6;
      filter: drop-shadow(0 20px 60px rgba(0,0,0,0.5));
      animation: figure-breathe 8s ease-in-out infinite, figure-drift 25s ease-in-out infinite;
      will-change: transform, opacity, filter;
    }

    @keyframes figure-breathe {
      0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.55; filter: drop-shadow(0 20px 60px rgba(0,0,0,0.5)); }
      50% { transform: translate(-50%, -50%) scale(1.015); opacity: 0.65; filter: drop-shadow(0 25px 70px rgba(184,42,42,0.12)); }
    }

    @keyframes figure-drift {
      0%, 100% { transform: translate(-50%, -50%) rotate(0deg) translateX(0) translateY(0); }
      20% { transform: translate(-50%, -50%) rotate(0.3deg) translateX(-8px) translateY(-5px); }
      40% { transform: translate(-50%, -50%) rotate(-0.2deg) translateX(5px) translateY(-10px); }
      60% { transform: translate(-50%, -50%) rotate(0.15deg) translateX(-5px) translateY(3px); }
      80% { transform: translate(-50%, -50%) rotate(-0.25deg) translateX(8px) translateY(-8px); }
    }

    /* Figure emerges on scroll reveal */
    .hero-section__bg .hooded-figure {
      opacity: 0;
      transform: translate(-50%, -40%) scale(0.95);
      transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1),
                  transform 1.2s cubic-bezier(0.16, 1, 0.3, 1),
                  filter 1.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .hero-section.in .hero-section__bg .hooded-figure {
      opacity: 0.6;
      transform: translate(-50%, -50%) scale(1);
    }

    @media (prefers-reduced-motion: reduce) {
      .hooded-figure {
        animation: none !important;
        opacity: 0.5 !important;
        transform: translate(-50%, -50%) !important;
        filter: drop-shadow(0 20px 60px rgba(0,0,0,0.4)) !important;
      }
      .hero-section__bg .hooded-figure {
        opacity: 0.5 !important;
        transform: translate(-50%, -50%) !important;
        transition: none !important;
      }
    }
    @media (max-width: 900px) {
      .hooded-figure { opacity: 0.5; }
    }
    @media (max-width: 600px) {
      .hooded-figure { opacity: 0.4; width: clamp(160px, 35vw, 280px); }
    }

    /* Story section - building tension */
    .story-section__bg {
      position: absolute;
      inset: 0;
      overflow: hidden;
      z-index: 0;
    }
    .story-section__bg::before {
      content: '';
      position: absolute;
      inset: -10%;
      background:
        /* Cold, creeping fog - multi-layered */
        radial-gradient(ellipse 90% 60% at 15% 20%, rgba(184,42,42,0.025), transparent 65%),
        radial-gradient(ellipse 70% 90% at 85% 80%, rgba(100,15,15,0.025), transparent 60%),
        radial-gradient(ellipse 80% 70% at 50% 10%, rgba(20,15,40,0.02), transparent 55%),
        radial-gradient(ellipse 70% 80% at 50% 90%, rgba(30,10,20,0.02), transparent 55%),
        /* Horizontal mist bands - animated */
        linear-gradient(90deg,
          transparent 0%,
          rgba(184,42,42,0.012) 15%,
          transparent 30%,
          rgba(184,42,42,0.008) 45%,
          transparent 55%,
          rgba(120,60,20,0.01) 70%,
          transparent 85%,
          rgba(184,42,42,0.012) 100%
        ),
        /* Subtle color atmosphere */
        radial-gradient(ellipse 50% 50% at 30% 40%, rgba(184,42,42,0.01), transparent 70%),
        radial-gradient(ellipse 50% 50% at 70% 60%, rgba(120,60,20,0.01), transparent 70%),
        /* Deepening darkness at edges */
        radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.45) 100%);
      animation: story-mist 45s ease-in-out infinite;
      pointer-events: none;
    }
    .story-section__bg::after {
      content: '';
      position: absolute;
      inset: 0;
      background:
        /* Subtle scanline texture */
        repeating-linear-gradient(
          0deg,
          rgba(255,255,255,0.001) 0px,
          rgba(255,255,255,0.001) 1px,
          transparent 1px,
          transparent 4px
        ),
        /* Vertical film scratches */
        repeating-linear-gradient(
          90deg,
          rgba(184,42,42,0.0004) 0px,
          rgba(184,42,42,0.0004) 1px,
          transparent 1px,
          transparent 50px
        );
      pointer-events: none;
      opacity: 0.6;
    }
    .story-section__fog {
      position: absolute;
      inset: -20%;
      background-image:
        radial-gradient(3px 3px at 10% 30%, rgba(184,42,42,0.08), transparent),
        radial-gradient(2px 2px at 90% 70%, rgba(184,42,42,0.06), transparent),
        radial-gradient(2.5px 2.5px at 40% 50%, rgba(255,220,180,0.04), transparent),
        radial-gradient(1.5px 1.5px at 70% 40%, rgba(255,255,255,0.03), transparent),
        radial-gradient(2px 2px at 25% 75%, rgba(184,42,42,0.05), transparent),
        radial-gradient(3px 3px at 60% 20%, rgba(255,220,180,0.04), transparent),
        radial-gradient(2px 2px at 85% 50%, rgba(184,42,42,0.05), transparent),
        radial-gradient(1.5px 1.5px at 35% 85%, rgba(255,255,255,0.02), transparent);
      background-size:
        450px 450px, 420px 420px, 480px 480px, 400px 400px,
        460px 460px, 430px 430px, 410px 410px, 390px 390px;
      animation: story-fog-drift 70s linear infinite;
      opacity: 0.5;
      pointer-events: none;
    }

    @keyframes story-mist {
      0%, 100% { transform: translateX(0) translateY(0) scale(1); opacity: 0.8; }
      12.5% { transform: translateX(-1.5%) translateY(-0.5%) scale(1.008); opacity: 0.88; }
      25% { transform: translateX(1%) translateY(-1.5%) scale(1.005); opacity: 0.85; }
      37.5% { transform: translateX(-1%) translateY(0.5%) scale(1.01); opacity: 0.92; }
      50% { transform: translateX(1.5%) translateY(-1%) scale(1.008); opacity: 0.95; }
      62.5% { transform: translateX(-0.5%) translateY(1.5%) scale(1.005); opacity: 0.88; }
      75% { transform: translateX(0.5%) translateY(-0.5%) scale(1.008); opacity: 0.9; }
      87.5% { transform: translateX(-1%) translateY(1%) scale(1.005); opacity: 0.85; }
    }
    @keyframes story-fog-drift {
      0% { transform: translate(0, 0) rotate(0deg); }
      20% { transform: translate(-20px, -15px) rotate(72deg); }
      40% { transform: translate(15px, -30px) rotate(144deg); }
      60% { transform: translate(-15px, -10px) rotate(216deg); }
      80% { transform: translate(25px, 5px) rotate(288deg); }
      100% { transform: translate(0, 0) rotate(360deg); }
    }
/* Screenplay section - cold, clinical, unsettling */
    .screenplay-section__bg {
      position: absolute;
      inset: 0;
      overflow: hidden;
      z-index: 0;
    }
    .screenplay-section__bg::before {
      content: '';
      position: absolute;
      inset: -15%;
      background:
        /* Sharp, deliberate light shafts */
        linear-gradient(135deg,
          transparent 0%,
          rgba(184,42,42,0.015) 12%,
          transparent 25%,
          rgba(184,42,42,0.01) 38%,
          transparent 50%,
          rgba(120,60,20,0.012) 62%,
          transparent 75%,
          rgba(184,42,42,0.015) 88%,
          transparent 100%
        ),
        /* Central focus glow */
        radial-gradient(ellipse 60% 80% at 50% 50%, rgba(184,42,42,0.02), transparent 70%),
        /* Side accent glows */
        radial-gradient(ellipse 40% 60% at 10% 50%, rgba(184,42,42,0.012), transparent 65%),
        radial-gradient(ellipse 40% 60% at 90% 50%, rgba(184,42,42,0.012), transparent 65%),
        /* Corner oppression */
        radial-gradient(ellipse 100% 100% at 0% 0%, rgba(0,0,0,0.55), transparent 50%),
        radial-gradient(ellipse 100% 100% at 100% 0%, rgba(0,0,0,0.55), transparent 50%),
        radial-gradient(ellipse 100% 100% at 0% 100%, rgba(0,0,0,0.55), transparent 50%),
        radial-gradient(ellipse 100% 100% at 100% 100%, rgba(0,0,0,0.55), transparent 50%),
        /* Subtle cool tone */
        radial-gradient(ellipse 70% 70% at 50% 50%, rgba(15,15,30,0.03), transparent 65%);
      animation: script-atmosphere 40s ease-in-out infinite;
      pointer-events: none;
    }
    .screenplay-section__bg::after {
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        /* Grid-like texture suggesting script pages / confinement */
        linear-gradient(rgba(184,42,42,0.004) 1px, transparent 1px),
        linear-gradient(90deg, rgba(184,42,42,0.004) 1px, transparent 1px);
      background-size: 80px 80px;
      animation: grid-drift 150s linear infinite;
      pointer-events: none;
      opacity: 0.4;
    }
    .screenplay-section__scanlines {
      position: absolute;
      inset: 0;
      background:
        repeating-linear-gradient(
          0deg,
          rgba(255,255,255,0.0008) 0px,
          rgba(255,255,255,0.0008) 1px,
          transparent 1px,
          transparent 3px
        );
      animation: scanline-flicker 0.15s steps(2) infinite;
      pointer-events: none;
      opacity: 0.3;
    }
    .screenplay-section__glitch {
      position: absolute;
      inset: 0;
      background:
        linear-gradient(90deg,
          transparent 0%,
          rgba(184,42,42,0.003) 49%,
          rgba(184,42,42,0.006) 50%,
          rgba(184,42,42,0.003) 51%,
          transparent 100%
        );
      animation: glitch-line 3s ease-in-out infinite;
      pointer-events: none;
      opacity: 0.5;
    }

    @keyframes script-atmosphere {
      0%, 100% { transform: scale(1) rotate(0deg); filter: hue-rotate(0deg); }
      16.6% { transform: scale(1.012) rotate(0.15deg); filter: hue-rotate(1.5deg); }
      33.3% { transform: scale(1.005) rotate(-0.1deg); filter: hue-rotate(-1deg); }
      50% { transform: scale(1.01) rotate(0.1deg); filter: hue-rotate(2deg); }
      66.6% { transform: scale(1.008) rotate(-0.1deg); filter: hue-rotate(-0.5deg); }
      83.3% { transform: scale(1.01) rotate(0.05deg); filter: hue-rotate(1deg); }
    }
    @keyframes grid-drift {
      0% { background-position: 0 0, 0 0; }
      100% { background-position: 80px 80px, -80px 80px; }
    }
    @keyframes scanline-flicker {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.25; }
    }
    @keyframes glitch-line {
      0%, 100% { transform: translateX(-100%); opacity: 0; }
      5% { transform: translateX(-80%); opacity: 0.5; }
      10% { transform: translateX(-60%); opacity: 0; }
      90% { transform: translateX(100%); opacity: 0; }
      95% { transform: translateX(120%); opacity: 0.5; }
      100% { transform: translateX(140%); opacity: 0; }
    }
/* Closing section - finality, silence */
    .closing-section__bg {
      position: absolute;
      inset: 0;
      overflow: hidden;
      z-index: 0;
    }
    .closing-section__bg::before {
      content: '';
      position: absolute;
      inset: -20%;
      background:
        /* Collapsing inward - multi-ring */
        radial-gradient(ellipse at center, transparent 0%, rgba(184,42,42,0.015) 20%, transparent 50%),
        radial-gradient(ellipse at center, transparent 0%, rgba(184,42,42,0.01) 30%, transparent 65%),
        radial-gradient(ellipse at center, transparent 0%, rgba(30,10,10,0.04) 35%, transparent 75%),
        radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, transparent 55%),
        /* Fading light from above */
        linear-gradient(180deg, rgba(255,255,255,0.008) 0%, transparent 40%),
        /* Final ember glow at bottom */
        radial-gradient(ellipse 80% 40% at 50% 100%, rgba(184,42,42,0.02), transparent 60%);
      animation: closing-collapse 35s ease-in-out infinite;
      pointer-events: none;
    }
    .closing-section__bg::after {
      content: '';
      position: absolute;
      inset: 0;
      background:
        /* Heavy film grain */
        repeating-linear-gradient(
          0deg,
          rgba(255,255,255,0.0006) 0px,
          rgba(255,255,255,0.0006) 1px,
          transparent 1px,
          transparent 2px
        ),
        repeating-linear-gradient(
          90deg,
          rgba(184,42,42,0.0004) 0px,
          rgba(184,42,42,0.0004) 1px,
          transparent 1px,
          transparent 8px
        );
      pointer-events: none;
      opacity: 0.4;
    }
    .closing-section__vignette {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.85) 100%),
        radial-gradient(ellipse at 50% 0%, rgba(184,42,42,0.01), transparent 70%);
      pointer-events: none;
    }
    .closing-section__particles {
      position: absolute;
      inset: -10%;
      background-image:
        radial-gradient(2px 2px at 20% 30%, rgba(184,42,42,0.1), transparent),
        radial-gradient(1.5px 1.5px at 80% 40%, rgba(255,220,180,0.07), transparent),
        radial-gradient(2px 2px at 40% 70%, rgba(184,42,42,0.08), transparent),
        radial-gradient(1px 1px at 70% 80%, rgba(255,255,255,0.04), transparent),
        radial-gradient(1.5px 1.5px at 10% 60%, rgba(184,42,42,0.06), transparent),
        radial-gradient(2px 2px at 90% 20%, rgba(255,220,180,0.05), transparent),
        radial-gradient(1px 1px at 30% 10%, rgba(255,255,255,0.03), transparent),
        radial-gradient(1.5px 1.5px at 60% 90%, rgba(184,42,42,0.05), transparent);
      background-size:
        400px 400px, 380px 380px, 420px 420px, 360px 360px,
        440px 440px, 390px 390px, 370px 370px, 410px 410px;
      animation: closing-particles 50s linear infinite;
      opacity: 0.5;
      pointer-events: none;
    }

    @keyframes closing-collapse {
      0%, 100% { transform: scale(1); opacity: 0.7; }
      25% { transform: scale(0.98); opacity: 0.8; }
      50% { transform: scale(0.95); opacity: 0.9; }
      75% { transform: scale(0.97); opacity: 0.85; }
    }
    @keyframes closing-particles {
      0% { transform: translate(0, 0) rotate(0deg); }
      25% { transform: translate(-15px, -20px) rotate(90deg); }
      50% { transform: translate(10px, -15px) rotate(180deg); }
      75% { transform: translate(-10px, 10px) rotate(270deg); }
      100% { transform: translate(0, 0) rotate(360deg); }
    }
/* Silhouette shapes - mysterious figures in the mist */
    .silhouette {
      position: absolute;
      pointer-events: none;
      z-index: 1;
      opacity: 0.04;
      will-change: transform, opacity;
    }
    .silhouette--figure {
      width: clamp(60px, 6vw, 100px);
      height: clamp(140px, 14vw, 240px);
      background: linear-gradient(180deg, transparent 0%, rgba(184,42,42,0.3) 50%, rgba(184,42,42,0.15) 100%);
      mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 240'%3E%3Cpath d='M50 10 C70 10, 90 40, 90 80 L90 180 C90 220, 70 230, 50 230 C30 230, 10 220, 10 180 L10 80 C10 40, 30 10, 50 10 Z' fill='black'/%3E%3C/svg%3E");
      mask-size: cover;
      mask-repeat: no-repeat;
      mask-position: center;
      -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 240'%3E%3Cpath d='M50 10 C70 10, 90 40, 90 80 L90 180 C90 220, 70 230, 50 230 C30 230, 10 220, 10 180 L10 80 C10 40, 30 10, 50 10 Z' fill='black'/%3E%3C/svg%3E");
      -webkit-mask-size: cover;
      -webkit-mask-repeat: no-repeat;
      -webkit-mask-position: center;
    }
    .silhouette--figure-1 { top: 20%; left: 8%; animation: silhouette-drift-1 45s ease-in-out infinite; }
    .silhouette--figure-2 { top: 55%; right: 10%; animation: silhouette-drift-2 50s ease-in-out infinite; animation-delay: -15s; }
    .silhouette--figure-3 { bottom: 15%; left: 12%; animation: silhouette-drift-3 55s ease-in-out infinite; animation-delay: -30s; }
    .silhouette--figure-4 { top: 35%; right: 18%; animation: silhouette-drift-4 48s ease-in-out infinite; animation-delay: -8s; }

    @keyframes silhouette-drift-1 {
      0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.03; }
      25% { transform: translate(-15px, -20px) scale(1.02); opacity: 0.05; }
      50% { transform: translate(10px, -10px) scale(0.98); opacity: 0.04; }
      75% { transform: translate(-10px, 15px) scale(1.01); opacity: 0.05; }
    }
    @keyframes silhouette-drift-2 {
      0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.025; }
      33% { transform: translate(20px, -15px) scale(1.03); opacity: 0.045; }
      66% { transform: translate(-10px, 20px) scale(0.97); opacity: 0.03; }
    }
    @keyframes silhouette-drift-3 {
      0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.035; }
      50% { transform: translate(15px, -25px) scale(1.02); opacity: 0.055; }
    }
    @keyframes silhouette-drift-4 {
      0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.02; }
      40% { transform: translate(-20px, 10px) scale(1.04); opacity: 0.04; }
      80% { transform: translate(10px, -15px) scale(0.96); opacity: 0.03; }
    }

    /* Red accent glimmer - subtle, mysterious */
    .glimmer {
      position: absolute;
      pointer-events: none;
      z-index: 2;
      border-radius: 50%;
      filter: blur(2px);
      animation: glimmer-pulse 4s ease-in-out infinite;
    }
    .glimmer-1 { width: 4px; height: 4px; top: 18%; left: 12%; background: rgba(184,42,42,0.4); animation-delay: 0s; }
    .glimmer-2 { width: 3px; height: 3px; top: 62%; right: 15%; background: rgba(184,42,42,0.35); animation-delay: -1s; }
    .glimmer-3 { width: 5px; height: 5px; bottom: 20%; left: 20%; background: rgba(184,42,42,0.3); animation-delay: -2s; }
    .glimmer-4 { width: 2px; height: 2px; top: 40%; right: 25%; background: rgba(184,42,42,0.45); animation-delay: -3s; }
    .glimmer-5 { width: 4px; height: 4px; bottom: 35%; right: 8%; background: rgba(184,42,42,0.25); animation-delay: -1.5s; }

    @keyframes glimmer-pulse {
      0%, 100% { transform: scale(1); opacity: 0.3; box-shadow: 0 0 4px currentColor; }
      50% { transform: scale(2.5); opacity: 0.8; box-shadow: 0 0 16px currentColor; }
    }

    @media (prefers-reduced-motion: reduce) {
      .hero-section__bg::before,
      .hero-section__dust,
      .story-section__bg::before,
      .screenplay-section__bg::before,
      .screenplay-section__bg::after,
      .closing-section__bg::before,
      .silhouette,
      .glimmer { animation: none !important; }
      .silhouette { opacity: 0.02 !important; }
      .glimmer { opacity: 0.2 !important; transform: scale(1) !important; }
    }
    @media (max-width: 900px) {
      .silhouette { opacity: 0.02; }
      .glimmer { display: none; }
    }
    @media (max-width: 600px) {
      .silhouette { display: none; }
      .hero-section__dust { opacity: 0.3; }
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
function useCinematicReveal() {
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

  return { setRef, getClass }
}

// ============================================
// COMPONENT: HoodedFigure
// Central mysterious figure - Dev in the black hoodie
// ============================================
function HoodedFigure() {
  return (
    <svg
      className="hooded-figure"
      viewBox="0 0 300 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
      aria-label="Mysterious figure in black hoodie"
    >
      <defs>
        {/* Subtle glow filter for the figure */}
        <filter id="hoodie-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        {/* Inner shadow for depth */}
        <filter id="inner-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feOffset dx="0" dy="4" />
          <feGaussianBlur stdDeviation="2" result="offset-blur"/>
          <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
          <feFlood floodColor="rgba(0,0,0,0.6)" floodOpacity="1"/>
          <feComposite operator="in" in2="inverse" result="shadow"/>
          <feMerge>
            <feMergeNode in="shadow"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        {/* Gradient for the hoodie fabric - brighter, more visible */}
        <linearGradient id="hoodie-fabric" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a1a1a" />
          <stop offset="30%" stopColor="#1f1f1f" />
          <stop offset="60%" stopColor="#161616" />
          <stop offset="100%" stopColor="#0f0f0f" />
        </linearGradient>
        {/* Highlight on folds - more visible */}
        <linearGradient id="hoodie-highlight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(184,42,42,0.12)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.06)" />
          <stop offset="100%" stopColor="rgba(184,42,42,0.08)" />
        </linearGradient>
        {/* Face shadow gradient - less opaque to show depth */}
        <radialGradient id="face-shadow" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.7)" />
          <stop offset="40%" stopColor="rgba(0,0,0,0.55)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.8)" />
        </radialGradient>
        {/* Eye glint - more visible */}
        <radialGradient id="eye-glint" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(184,42,42,0.5)" />
          <stop offset="100%" stopColor="rgba(184,42,42,0.1)" />
        </radialGradient>
      </defs>

      {/* Outer ambient glow */}
      <ellipse
        cx="150" cy="320"
        rx="100" ry="30"
        fill="rgba(184,42,42,0.06)"
        filter="url(#hoodie-glow)"
      />

      {/* Main hoodie body */}
      <path
        d="M80 380
           L80 200
           C80 160, 100 130, 150 130
           C200 130, 220 160, 220 200
           L220 380
           C220 395, 205 405, 150 405
           C95 405, 80 395, 80 380 Z"
        fill="url(#hoodie-fabric)"
        stroke="rgba(184,42,42,0.18)"
        strokeWidth="1.2"
        filter="url(#inner-shadow)"
      />

      {/* Hoodie highlight/fold suggestion */}
      <path
        d="M110 200
           Q130 180, 150 185
           Q170 190, 190 200"
        stroke="url(#hoodie-highlight)"
        strokeWidth="2"
        fill="none"
        opacity="0.9"
      />

      {/* Left shoulder fold */}
      <path
        d="M80 200
           Q95 210, 105 230
           Q110 240, 110 260"
        stroke="rgba(184,42,42,0.1)"
        strokeWidth="1.2"
        fill="none"
      />

      {/* Right shoulder fold */}
      <path
        d="M220 200
           Q205 210, 195 230
           Q190 240, 190 260"
        stroke="rgba(184,42,42,0.1)"
        strokeWidth="1.2"
        fill="none"
      />

      {/* Hood opening / face area */}
      <ellipse
        cx="150" cy="165"
        rx="48" ry="42"
        fill="url(#face-shadow)"
      />

      {/* Hood inner depth - lighter to show face cavity */}
      <ellipse
        cx="150" cy="170"
        rx="42" ry="36"
        fill="rgba(0,0,0,0.6)"
      />

      {/* Hood rim highlight - more visible */}
      <ellipse
        cx="150" cy="155"
        rx="50" ry="44"
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="1"
      />

      {/* Eyes - visible but mysterious */}
      <ellipse
        cx="135" cy="160"
        rx="4" ry="3"
        fill="url(#eye-glint)"
        opacity="0.8"
      />
      <ellipse
        cx="165" cy="160"
        rx="4" ry="3"
        fill="url(#eye-glint)"
        opacity="0.7"
      />

      {/* Hood drawstring hints */}
      <circle cx="135" cy="185" r="2.5" fill="rgba(184,42,42,0.2)" />
      <circle cx="165" cy="185" r="2.5" fill="rgba(184,42,42,0.2)" />
      <path
        d="M135 185 Q150 180 165 185"
        stroke="rgba(184,42,42,0.15)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Chest pocket suggestion */}
      <rect x="125" y="280" width="50" height="35" rx="3"
        fill="rgba(0,0,0,0.5)"
        stroke="rgba(184,42,42,0.12)"
        strokeWidth="0.8"
      />

      {/* Zipper line */}
      <path
        d="M150 185 L150 280"
        stroke="rgba(184,42,42,0.1)"
        strokeWidth="1.2"
        strokeDasharray="4 6"
        strokeLinecap="round"
      />

      {/* Bottom hem detail */}
      <path
        d="M85 380 Q150 390 215 380"
        stroke="rgba(184,42,42,0.12)"
        strokeWidth="1.8"
        fill="none"
      />

      {/* Particle/dust motes around figure */}
      <g opacity="0.3" filter="url(#hoodie-glow)">
        <circle cx="50" cy="100" r="1.2" fill="rgba(184,42,42,0.5)" />
        <circle cx="260" cy="80" r="0.8" fill="rgba(184,42,42,0.4)" />
        <circle cx="40" cy="300" r="1" fill="rgba(184,42,42,0.35)" />
        <circle cx="270" cy="320" r="1.2" fill="rgba(184,42,42,0.4)" />
        <circle cx="150" cy="50" r="0.7" fill="rgba(184,42,42,0.45)" />
        <circle cx="150" cy="390" r="1" fill="rgba(184,42,42,0.3)" />
      </g>
    </svg>
  )
}

// ============================================
// COMPONENT: DecorativePhoneFigures
// Artistic phone illustrations for visual enhancement
// ============================================
function DecorativePhoneFigures() {
  return (
    <>
      {/* Phone 1 - Classic rotary style, top left */}
      <svg
        className="deco-phone deco-phone--1"
        viewBox="0 0 120 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <filter id="phone-glow-1" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <path
          d="M60 10 C90 10, 110 30, 110 60 L110 140 C110 170, 90 190, 60 190 C30 190, 10 170, 10 140 L10 60 C10 30, 30 10, 60 10 Z"
          stroke="rgba(184,42,42,0.15)"
          strokeWidth="1.5"
          filter="url(#phone-glow-1)"
        />
        <circle cx="60" cy="100" r="28" stroke="rgba(184,42,42,0.1)" strokeWidth="1" fill="rgba(8,8,8,0.4)" />
        <circle cx="60" cy="100" r="18" stroke="rgba(184,42,42,0.08)" strokeWidth="0.5" fill="none" />
        <path d="M60 85 L60 115" stroke="rgba(184,42,42,0.12)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M45 100 L75 100" stroke="rgba(184,42,42,0.12)" strokeWidth="1.5" strokeLinecap="round" />
        <ellipse cx="60" cy="25" rx="18" ry="8" stroke="rgba(184,42,42,0.1)" strokeWidth="1" fill="rgba(8,8,8,0.3)" />
        <path d="M50 20 Q60 15 70 20" stroke="rgba(184,42,42,0.08)" strokeWidth="1" fill="none" />
      </svg>

      {/* Phone 2 - Modern smartphone, floating */}
      <svg
        className="deco-phone deco-phone--2"
        viewBox="0 0 80 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <filter id="phone-glow-2" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <rect x="5" y="5" width="70" height="150" rx="12" stroke="rgba(255,255,255,0.03)" strokeWidth="1" fill="rgba(8,8,8,0.5)" filter="url(#phone-glow-2)" />
        <rect x="12" y="12" width="56" height="136" rx="8" stroke="rgba(184,42,42,0.06)" strokeWidth="0.5" fill="none" />
        <rect x="20" y="22" width="40" height="6" rx="3" fill="rgba(184,42,42,0.08)" />
        <rect x="25" y="35" width="30" height="1.5" rx="0.75" fill="rgba(184,42,42,0.05)" />
        <rect x="20" y="132" width="40" height="4" rx="2" fill="rgba(184,42,42,0.08)" />
        <circle cx="40" cy="140" r="3" fill="rgba(184,42,42,0.12)" />
        {/* Screen content hints */}
        <path d="M25 55 L55 55" stroke="rgba(184,42,42,0.06)" strokeWidth="1" strokeDasharray="4 4" />
        <path d="M25 75 L55 75" stroke="rgba(184,42,42,0.04)" strokeWidth="1" strokeDasharray="4 4" />
        <path d="M25 95 L45 95" stroke="rgba(184,42,42,0.04)" strokeWidth="1" strokeDasharray="4 4" />
        <path d="M25 115 L50 115" stroke="rgba(184,42,42,0.03)" strokeWidth="1" strokeDasharray="4 4" />
      </svg>

      {/* Phone 3 - Retro brick phone */}
      <svg
        className="deco-phone deco-phone--3"
        viewBox="0 0 90 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <filter id="phone-glow-3" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <path
          d="M45 15 C70 15, 85 30, 85 55 L85 165 C85 190, 70 205, 45 205 C20 205, 5 190, 5 165 L5 55 C5 30, 20 15, 45 15 Z"
          stroke="rgba(184,42,42,0.12)"
          strokeWidth="1.5"
          fill="rgba(8,8,8,0.4)"
          filter="url(#phone-glow-3)"
        />
        <rect x="15" y="30" width="60" height="4" rx="2" fill="rgba(184,42,42,0.08)" />
        <rect x="15" y="40" width="60" height="70" rx="2" stroke="rgba(184,42,42,0.06)" strokeWidth="0.5" fill="rgba(5,5,5,0.6)" />
        <path d="M30 50 L60 50" stroke="rgba(184,42,42,0.05)" strokeWidth="0.8" strokeDasharray="3 3" />
        <path d="M30 65 L60 65" stroke="rgba(184,42,42,0.04)" strokeWidth="0.8" strokeDasharray="3 3" />
        <path d="M30 80 L60 80" stroke="rgba(184,42,42,0.04)" strokeWidth="0.8" strokeDasharray="3 3" />
        <path d="M30 95 L60 95" stroke="rgba(184,42,42,0.03)" strokeWidth="0.8" strokeDasharray="3 3" />
        <circle cx="45" cy="120" r="12" stroke="rgba(184,42,42,0.1)" strokeWidth="1" fill="rgba(8,8,8,0.5)" />
        <circle cx="45" cy="120" r="6" fill="rgba(184,42,42,0.08)" />
        <rect x="20" y="145" width="50" height="30" rx="3" stroke="rgba(184,42,42,0.08)" strokeWidth="0.5" fill="rgba(5,5,5,0.4)" />
        <path d="M30 155 L60 155" stroke="rgba(184,42,42,0.04)" strokeWidth="0.8" strokeDasharray="3 3" />
        <path d="M30 165 L60 165" stroke="rgba(184,42,42,0.03)" strokeWidth="0.8" strokeDasharray="3 3" />
      </svg>

      {/* Phone 4 - Minimal floating handset */}
      <svg
        className="deco-phone deco-phone--4"
        viewBox="0 0 70 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M35 5 C55 5, 65 15, 65 35 L65 115 C65 135, 55 145, 35 145 C15 145, 5 135, 5 115 L5 35 C5 15, 15 5, 35 5 Z"
          stroke="rgba(184,42,42,0.08)"
          strokeWidth="1"
          fill="rgba(8,8,8,0.3)"
        />
        <ellipse cx="35" cy="75" rx="16" ry="10" stroke="rgba(184,42,42,0.06)" strokeWidth="0.5" fill="none" />
        <path d="M25 65 L45 65" stroke="rgba(184,42,42,0.05)" strokeWidth="1" strokeLinecap="round" />
        <path d="M25 75 L45 75" stroke="rgba(184,42,42,0.04)" strokeWidth="1" strokeLinecap="round" />
        <path d="M25 85 L45 85" stroke="rgba(184,42,42,0.04)" strokeWidth="1" strokeLinecap="round" />
      </svg>

      {/* Phone 5 - Broken/cracked screen phone (narrative relevant) */}
      <svg
        className="deco-phone deco-phone--5"
        viewBox="0 0 80 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect x="5" y="5" width="70" height="140" rx="10" stroke="rgba(184,42,42,0.1)" strokeWidth="1.5" fill="rgba(8,8,8,0.4)" />
        <rect x="12" y="12" width="56" height="126" rx="6" stroke="rgba(184,42,42,0.05)" strokeWidth="0.5" fill="rgba(3,3,3,0.7)" />
        {/* Crack lines */}
        <path d="M40 30 L55 80" stroke="rgba(184,42,42,0.15)" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M40 30 L25 70" stroke="rgba(184,42,42,0.12)" strokeWidth="1" strokeLinecap="round" />
        <path d="M55 80 L65 110" stroke="rgba(184,42,42,0.1)" strokeWidth="0.8" strokeLinecap="round" />
        <path d="M25 70 L15 100" stroke="rgba(184,42,42,0.08)" strokeWidth="0.8" strokeLinecap="round" />
        <path d="M40 30 L40 60" stroke="rgba(184,42,42,0.1)" strokeWidth="1" strokeLinecap="round" />
        <circle cx="40" cy="120" r="4" fill="rgba(184,42,42,0.12)" />
      </svg>

      {/* Jenga block decorative element */}
      <svg
        className="deco-jenga deco-jenga--1"
        viewBox="0 0 100 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <filter id="jenga-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <rect x="5" y="5" width="90" height="30" rx="3" stroke="rgba(184,42,42,0.12)" strokeWidth="1" fill="rgba(8,8,8,0.4)" filter="url(#jenga-glow)" />
        <rect x="12" y="10" width="76" height="20" rx="1.5" stroke="rgba(184,42,42,0.06)" strokeWidth="0.5" fill="rgba(12,12,12,0.6)" />
        <text x="50" y="26" text-anchor="middle" font-family="monospace" font-size="8" fill="rgba(184,42,42,0.15)" letter-spacing="0.3em">FORGIVENESS</text>
        <line x1="25" y1="16" x2="75" y2="16" stroke="rgba(184,42,42,0.04)" strokeWidth="0.5" />
        <line x1="25" y1="28" x2="75" y2="28" stroke="rgba(184,42,42,0.03)" strokeWidth="0.5" />
      </svg>

      {/* Floating particles / dust motes */}
      <svg className="deco-particles" viewBox="0 0 400 400" aria-hidden="true">
        <defs>
          <radialGradient id="particle-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(184,42,42,0.3)" />
            <stop offset="100%" stopColor="rgba(184,42,42,0)" />
          </radialGradient>
        </defs>
        <circle cx="20" cy="30" r="1.5" fill="url(#particle-glow)" opacity="0.4" />
        <circle cx="380" cy="60" r="1" fill="url(#particle-glow)" opacity="0.3" />
        <circle cx="50" cy="350" r="1" fill="url(#particle-glow)" opacity="0.25" />
        <circle cx="350" cy="370" r="1.5" fill="url(#particle-glow)" opacity="0.35" />
        <circle cx="180" cy="20" r="0.8" fill="url(#particle-glow)" opacity="0.3" />
        <circle cx="220" cy="380" r="1" fill="url(#particle-glow)" opacity="0.25" />
        <circle cx="80" cy="180" r="0.7" fill="url(#particle-glow)" opacity="0.2" />
        <circle cx="320" cy="200" r="1" fill="url(#particle-glow)" opacity="0.3" />
      </svg>

      {/* Red accent line / divider decorative */}
      <svg className="deco-accent-line" viewBox="0 0 200 4" aria-hidden="true">
        <defs>
          <linearGradient id="accent-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(184,42,42,0)" />
            <stop offset="50%" stopColor="rgba(184,42,42,0.4)" />
            <stop offset="100%" stopColor="rgba(184,42,42,0)" />
          </linearGradient>
        </defs>
        <rect width="200" height="2" fill="url(#accent-gradient)" />
      </svg>
    </>
  )
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
  const playingRef = useRef(playing)

  useEffect(() => { playingRef.current = playing }, [playing])

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
    const onInteract = () => { if (!playingRef.current) tryPlay() }
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
        <div className="hero-section__embers" aria-hidden="true" />
        <DecorativePhoneFigures />
        {/* Central hooded figure - Dev */}
        <HoodedFigure />
        {/* Mysterious silhouettes */}
        <div className="silhouette silhouette--figure silhouette--figure-1" aria-hidden="true" />
        <div className="silhouette silhouette--figure silhouette--figure-2" aria-hidden="true" />
        <div className="silhouette silhouette--figure silhouette--figure-3" aria-hidden="true" />
        <div className="silhouette silhouette--figure silhouette--figure-4" aria-hidden="true" />
        {/* Subtle red glimmers */}
        <div className="glimmer glimmer-1" aria-hidden="true" />
        <div className="glimmer glimmer-2" aria-hidden="true" />
        <div className="glimmer glimmer-3" aria-hidden="true" />
        <div className="glimmer glimmer-4" aria-hidden="true" />
        <div className="glimmer glimmer-5" aria-hidden="true" />
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
      <div className="story-section__bg"><DustParticles /><DecorativePhoneFigures /></div>
      <div className="story-section__fog" aria-hidden="true" />
      {/* Mysterious silhouettes in the mist */}
      <div className="silhouette silhouette--figure silhouette--figure-1" aria-hidden="true" />
      <div className="silhouette silhouette--figure silhouette--figure-2" aria-hidden="true" />
      <div className="silhouette silhouette--figure silhouette--figure-3" aria-hidden="true" />
      <div className="glimmer glimmer-1" aria-hidden="true" />
      <div className="glimmer glimmer-3" aria-hidden="true" />
      <div className="glimmer glimmer-5" aria-hidden="true" />
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
      <div className="screenplay-section__bg"><DustParticles /><DecorativePhoneFigures /></div>
      <div className="screenplay-section__scanlines" aria-hidden="true" />
      <div className="screenplay-section__glitch" aria-hidden="true" />
      {/* Cold, clinical silhouettes */}
      <div className="silhouette silhouette--figure silhouette--figure-2" aria-hidden="true" />
      <div className="silhouette silhouette--figure silhouette--figure-4" aria-hidden="true" />
      <div className="glimmer glimmer-2" aria-hidden="true" />
      <div className="glimmer glimmer-4" aria-hidden="true" />
      <div className="container">

        <div className={getClass('sp-header', 'cr', 'section-header')} ref={setRef('sp-header')}>
          <span className="section-header__label">THE SCRIPT</span>
          <h2 id="screenplay-title" className="section-header__title glitch" data-text="SCREENPLAY">
            SCREENPLAY
          </h2>
        </div>

        <div className="screenplay-section__script">
          {scenes.map((scene) => {
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
        <DecorativePhoneFigures />
        <div className="closing-section__particles" aria-hidden="true" />
        {/* Final collapsing silhouettes */}
        <div className="silhouette silhouette--figure silhouette--figure-1" aria-hidden="true" style={{ opacity: 0.02 }} />
        <div className="silhouette silhouette--figure silhouette--figure-3" aria-hidden="true" style={{ opacity: 0.02 }} />
        <div className="glimmer glimmer-3" aria-hidden="true" style={{ animationDuration: '6s' }} />
        <div className="glimmer glimmer-5" aria-hidden="true" style={{ animationDuration: '7s' }} />
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