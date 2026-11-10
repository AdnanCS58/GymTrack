
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Check,
  Dumbbell,
  Menu,
  Target,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react";

const features = [
  {
    number: "01",
    icon: Dumbbell,
    title: "Log every rep.",
    description:
      "Record exercises, sets, reps, and weights. Keep every training session organized.",
    tag: "WORKOUT TRACKING",
  },
  {
    number: "02",
    icon: TrendingUp,
    title: "See the difference.",
    description:
      "Track body weight and measurements to understand how your body changes over time.",
    tag: "BODY PROGRESS",
  },
  {
    number: "03",
    icon: BarChart3,
    title: "Train with insight.",
    description:
      "Review your workout history, performance trends, and personal records.",
    tag: "ANALYTICS",
  },
  {
    number: "04",
    icon: CalendarDays,
    title: "Stay consistent.",
    description:
      "Use your workout calendar and reusable templates to keep your routine on track.",
    tag: "PLANNING",
  },
];

const Landing = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("gt-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="gt-landing" id="top">
      {/* NAVIGATION */}
      <header className="gt-nav">
        <div className="gt-nav-inner">
          <Link to="/" className="gt-brand" onClick={closeMenu}>
            <span className="gt-brand-mark">
              <Dumbbell size={25} strokeWidth={2.8} />
            </span>
            <span>
              GYM<span>TRACK</span>
            </span>
          </Link>

          <nav className={`gt-nav-links ${menuOpen ? "gt-nav-open" : ""}`}>
            <a href="#features" onClick={closeMenu}>
              Features
            </a>
            <a href="#how-it-works" onClick={closeMenu}>
              How it works
            </a>
            <a href="#about" onClick={closeMenu}>
              About
            </a>

            <div className="gt-mobile-actions">
              <Link to="/login" onClick={closeMenu}>
                Sign in
              </Link>
              <Link
                to="/register"
                className="gt-mobile-cta"
                onClick={closeMenu}
              >
                Get started <ArrowRight size={16} />
              </Link>
            </div>
          </nav>

          <div className="gt-nav-actions">
            <Link to="/login" className="gt-login-link">
              Login
            </Link>
            <Link to="/register" className="gt-nav-cta">
              Get started <ArrowUpRight size={16} />
            </Link>
          </div>

          <button
            className="gt-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="gt-hero">
        <div className="gt-hero-grid" />

        <div className="gt-hero-image">
          <img
            src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1800&q=90"
            alt="Athlete training with weights in a gym"
          />
        </div>

        <div className="gt-hero-shade" />

        <div className="gt-hero-content">
          <div className="gt-eyebrow gt-hero-eyebrow gt-animate-up">
            <span className="gt-status-dot" />
            TRAIN <span>•</span> TRACK <span>•</span> ACHIEVE
          </div>

          <h1 className="gt-hero-title gt-animate-up gt-delay-1">
            BUILT BY
            <span>DISCIPLINE.</span>
          </h1>

          <p className="gt-hero-description gt-animate-up gt-delay-2">
            Track your workouts. Monitor your progress.
            <br className="gt-desktop-break" />
            Become the strongest version of yourself.
          </p>

          <div className="gt-hero-actions gt-animate-up gt-delay-3">
            <Link to="/register" className="gt-primary-cta">
              START YOUR JOURNEY <ArrowRight size={19} />
            </Link>

            <a href="#features" className="gt-secondary-cta">
              EXPLORE GYMTRACK <ArrowDown size={17} />
            </a>
          </div>

          <div className="gt-hero-bottom">
            <div className="gt-hero-note">
              <span className="gt-note-line" />
              <span>YOUR TRAINING. YOUR DATA. YOUR PROGRESS.</span>
            </div>
            <a href="#features" className="gt-scroll-indicator">
              SCROLL TO EXPLORE <ArrowDown size={15} />
            </a>
          </div>
        </div>

        <div className="gt-hero-index">01 / 04</div>
      </section>

      {/* TICKER */}
      <div className="gt-marquee">
        <div className="gt-marquee-track">
          {[0, 1].map((copy) => (
            <div className="gt-marquee-group" key={copy}>
              {[
                "NO SHORTCUTS",
                "TRACK YOUR WORK",
                "BUILD DISCIPLINE",
                "MEASURE PROGRESS",
                "STAY CONSISTENT",
              ].map((item) => (
                <span key={item}>
                  {item}
                  <i />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* INTRO */}
      <section className="gt-intro" id="about">
        <div className="gt-section-inner gt-intro-layout">
          <div className="gt-intro-label" data-reveal>
            <span className="gt-section-number">01 — THE MINDSET</span>
            <span className="gt-label-rule" />
          </div>

          <div className="gt-intro-main" data-reveal>
            <h2>
              YOUR GOALS
              <br />
              DON'T TRACK
              <br />
              <span>THEMSELVES.</span>
            </h2>

            <div className="gt-intro-bottom">
              <p>
                Progress comes from showing up, putting in the work, and
                knowing where you stand. GymTrack gives your fitness journey
                the structure it deserves.
              </p>
              <Link to="/register" className="gt-arrow-link">
                MAKE EVERY REP COUNT <ArrowUpRight size={19} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="gt-features" id="features">
        <div className="gt-section-inner">
          <div className="gt-section-heading" data-reveal>
            <div>
              <span className="gt-section-number">02 — THE TOOLKIT</span>
              <h2>
                BUILT FOR
                <br />
                <span>THE WORK.</span>
              </h2>
            </div>

            <p>
              Everything you need to organize your training and measure
              progress. No unnecessary noise.
            </p>
          </div>

          <div className="gt-feature-list">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article className="gt-feature-row" key={feature.number} data-reveal>
                  <span className="gt-feature-number">{feature.number}</span>

                  <div className="gt-feature-icon">
                    <Icon size={25} strokeWidth={1.6} />
                  </div>

                  <div className="gt-feature-copy">
                    <span>{feature.tag}</span>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>

                  <ArrowUpRight className="gt-feature-arrow" size={25} />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="gt-process" id="how-it-works">
        <div className="gt-section-inner">
          <div className="gt-process-heading" data-reveal>
            <span className="gt-section-number">03 — THE PROCESS</span>
            <h2>
              SIMPLE TO START.
              <br />
              <span>BUILT TO LAST.</span>
            </h2>
          </div>

          <div className="gt-process-grid">
            <div className="gt-process-step" data-reveal>
              <span className="gt-process-count">01</span>
              <div className="gt-process-line" />
              <h3>SET YOUR BASELINE</h3>
              <p>
                Create your account, complete your profile, and define your
                fitness goals.
              </p>
            </div>

            <div className="gt-process-step" data-reveal>
              <span className="gt-process-count">02</span>
              <div className="gt-process-line" />
              <h3>PUT IN THE WORK</h3>
              <p>
                Log your training sessions, track exercises, and build
                consistent routines.
              </p>
            </div>

            <div className="gt-process-step" data-reveal>
              <span className="gt-process-count">03</span>
              <div className="gt-process-line" />
              <h3>OWN YOUR PROGRESS</h3>
              <p>
                Review your analytics, monitor changes, and keep moving
                towards your goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="gt-final-cta">
        <div className="gt-final-cta-bg" />

        <div className="gt-final-content" data-reveal>
          <span className="gt-section-number">04 — YOUR MOVE</span>

          <h2>
            STOP
            <br />
            <span>GUESSING.</span>
            <br />
            START TRACKING.
          </h2>

          <p>
            Your next workout is another opportunity to get better.
            Make it count.
          </p>

          <Link to="/register" className="gt-primary-cta">
            GET STARTED — IT'S FREE <ArrowRight size={19} />
          </Link>
        </div>

        <div className="gt-cta-decoration">
          <Target size={210} strokeWidth={0.55} />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="gt-footer">
        <div className="gt-section-inner">
          <div className="gt-footer-main">
            <Link to="/" className="gt-brand">
              <span className="gt-brand-mark">
                <Dumbbell size={24} strokeWidth={2.8} />
              </span>
              <span>
                GYM<span>TRACK</span>
              </span>
            </Link>

            <p>TRAIN HARD. TRACK EVERYTHING.</p>

            <Link to="/register" className="gt-footer-link">
              JOIN GYMTRACK <ArrowUpRight size={17} />
            </Link>
          </div>

          <div className="gt-footer-bottom">
            <span>© {new Date().getFullYear()} GYMTRACK</span>
            <span>MADE FOR THE CONSISTENT.</span>
            <a href="#top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              BACK TO TOP ↑
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Landing;
