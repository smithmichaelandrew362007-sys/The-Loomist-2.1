import React, { useState, useEffect, useRef } from 'react';
import '../styles/style.css';
import { useTheme, ThemePickerModal, ThemeToggleButton } from '../components/ThemeManager';
import ColorMatcher from '../components/ColorMatcher';
// Helper component for Video Card with 3D Tilt effect
function VideoCard({ video, index }) {
  const [transform, setTransform] = useState('');
  
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  };
  
  const handleMouseLeave = () => {
    setTransform(`perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`);
  };

  const categoryLabels = {
    history: 'Fashion History',
    men: "Men's Fashion",
    women: "Women's Fashion"
  };

  const formattedDate = new Date(video.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <article 
      className={`video-card reveal stagger-${(index % 6) + 1}`} 
      onClick={() => window.open(video.videoUrl, '_blank')}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform, transition: 'transform 0.15s ease-out' }}
    >
      <div className="video-card-image">
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          onError={(e) => {
            e.target.src = `data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 250%22%3E%3Crect fill=%22%231a1a1a%22 width=%22400%22 height=%22250%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 fill=%22%23c9a96e%22 font-family=%22serif%22 font-size=%2224%22 text-anchor=%22middle%22 dy=%22.3em%22%3EThe Loomist%3C/text%3E%3C/svg%3E`;
          }}
        />
        <div className="video-card-overlay">
          <div className="video-play-btn"></div>
        </div>
        {video.featured && <span className="video-card-badge">Featured</span>}
        <span className="video-card-duration">{video.duration}</span>
      </div>
      <div className="video-card-body">
        <span className="video-card-category">{categoryLabels[video.category] || video.category}</span>
        <h3 className="video-card-title">{video.title}</h3>
        <p className="video-card-desc">{video.description}</p>
        <div className="video-card-meta">
          <span className="video-card-date">{formattedDate}</span>
          <div className="video-card-tags">
            {video.tags && video.tags.slice(0, 2).map((tag, idx) => (
              <span key={idx} className="video-card-tag">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function MainSite() {
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [videos, setVideos] = useState([]);
  const [posts, setPosts] = useState([]);
  
  // Parallax and glow state
  const [heroBgY, setHeroBgY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: '0px', y: '0px' });
  const [activeSection, setActiveSection] = useState('');
  
  // Portrait tilt state
  const [portraitTransform, setPortraitTransform] = useState('');

  const handlePortraitMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    
    setPortraitTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  };
  
  const handlePortraitMouseLeave = () => {
    setPortraitTransform(`perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`);
  };

  
  // Toast notifications state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Theme hook
  const { showThemePicker, applyTheme, toggleTheme } = useTheme();

  // Form states
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  
  // Lightbox state
  const [lightboxImage, setLightboxImage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const openSocialLink = (e, platform) => {
    e.preventDefault();
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    const igWeb = 'https://www.instagram.com/the.loomist_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==';
    const ytWeb = 'https://www.youtube.com/@The.loomist';
    const xWeb = 'https://x.com/Theloomist_';
    
    if (platform === 'instagram') {
      if (isIOS) {
        window.location.href = 'instagram://user?username=the.loomist_';
        setTimeout(() => { if (!document.hidden) window.location.href = igWeb; }, 2000);
      } else if (isAndroid) {
        window.location.href = `intent://instagram.com/_u/the.loomist_/#Intent;package=com.instagram.android;scheme=https;S.browser_fallback_url=${encodeURIComponent(igWeb)};end`;
      } else {
        window.open(igWeb, '_blank');
      }
    } else if (platform === 'youtube') {
      if (isIOS) {
        window.location.href = 'vnd.youtube://www.youtube.com/@The.loomist';
        setTimeout(() => { if (!document.hidden) window.location.href = ytWeb; }, 2000);
      } else if (isAndroid) {
        window.location.href = `intent://www.youtube.com/@The.loomist#Intent;package=com.google.android.youtube;scheme=https;S.browser_fallback_url=${encodeURIComponent(ytWeb)};end`;
      } else {
        window.open(ytWeb, '_blank');
      }
    } else if (platform === 'x') {
      window.open(xWeb, '_blank');
    }
  };

  // Close lightbox on scroll
  useEffect(() => {
    if (!lightboxImage) return;
    const handleScroll = () => setLightboxImage(null);
    window.addEventListener('wheel', handleScroll);
    window.addEventListener('touchmove', handleScroll);
    return () => {
      window.removeEventListener('wheel', handleScroll);
      window.removeEventListener('touchmove', handleScroll);
    };
  }, [lightboxImage]);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Theme shortcut key (Ctrl+T)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setShowThemePicker(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch data
  const fetchData = async () => {
    try {
      const [videosRes, postsRes] = await Promise.all([
        fetch('/api/videos'),
        fetch('/api/posts')
      ]);

      const videosData = await videosRes.json();
      const postsData = await postsRes.json();

      if (videosData.success) {
        setVideos(videosData.data);
      }
      if (postsData.success) {
        setPosts(postsData.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      // Add small timeout to make loader aesthetic
      setTimeout(() => {
        setLoading(false);
      }, 3800);
    }
  };

  useEffect(() => {
    fetchData();

    // Scroll handlers
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;
      setScrolled(currentScroll > 60);

      // Hero parallax
      if (currentScroll < window.innerHeight) {
        setHeroBgY(currentScroll * 0.3);
      }

      // Highlight active nav link
      const sections = document.querySelectorAll('section[id]');
      const scrollPos = currentScroll + 100;
      sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        if (scrollPos >= top && scrollPos < top + height) {
          setActiveSection(id);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Scroll Reveal Animations hook
  useEffect(() => {
    if (loading) return;

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    revealElements.forEach(el => revealObserver.observe(el));

    return () => {
      revealObserver.disconnect();
    };
  }, [loading, videos, posts]);

  const handleHeroMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x: `${x}px`, y: `${y}px` });
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail })
      });
      const data = await res.json();

      if (data.success) {
        showToast(' Welcome to The Thread! You\'re now subscribed.', 'success');
        setNewsletterEmail('');
      } else {
        showToast(data.message || 'Something went wrong', 'error');
      }
    } catch (err) {
      showToast('Failed to subscribe. Please try again.', 'error');
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          subject: contactSubject,
          message: contactMessage
        })
      });
      const data = await res.json();

      if (data.success) {
        showToast(' Message sent! Varun will get back to you soon.', 'success');
        setContactName('');
        setContactEmail('');
        setContactSubject('');
        setContactMessage('');
      } else {
        showToast(data.message || 'Something went wrong', 'error');
      }
    } catch (err) {
      showToast('Failed to send message. Please try again.', 'error');
    }
  };

  const handleImageError = (e) => {
    e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%231a1a1a' width='400' height='300'/%3E%3Crect fill='%23111' x='10' y='10' width='380' height='280' rx='8'/%3E%3Ctext x='50%25' y='45%25' fill='%23c9a96e' font-family='Georgia,serif' font-size='22' text-anchor='middle' font-weight='bold'%3EThe Loomist%3C/text%3E%3Ctext x='50%25' y='60%25' fill='%23555' font-family='sans-serif' font-size='12' text-anchor='middle'%3EImage Coming Soon%3C/text%3E%3C/svg%3E`;
  };

  const handleLinkClick = (e, targetId) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const target = document.getElementById(targetId);
    if (target) {
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const renderPostMedia = (post) => {
    if (post.imageUrl.includes('instagram.com')) {
      let embedUrl = post.imageUrl.split('?')[0];
      if (!embedUrl.endsWith('/')) embedUrl += '/';
      if (!embedUrl.endsWith('embed/')) embedUrl += 'embed';
      return (
        <iframe 
          src={embedUrl} 
          className="post-image" 
          style={{ border: 'none', overflow: 'hidden', backgroundColor: 'white' }} 
          frameBorder="0" 
          scrolling="no" 
          allowTransparency="true"
        ></iframe>
      );
    } else {
      return (
        <img 
          src={post.imageUrl} 
          alt={post.title} 
          className="post-image" 
          onError={(e) => {
            e.target.src = '/images/hero-bg.jpg';
          }}
        />
      );
    }
  };

  return (
    <>
      {/* Loading Screen */}
      <div className={`loading-screen ${!loading ? 'loaded' : ''}`} id="loadingScreen">
        <div className="loading-container">
          <div className="thug-portrait-container">
            <img src="/images/varun-portrait.jpg" alt="Varun.K — The Loomist" className="thug-portrait" onError={handleImageError} />

            <div className="thug-text">THE LOOMIST</div>
          </div>
          <div className="loading-bar">
            <div className="loading-bar-inner"></div>
          </div>
        </div>
      </div>

      {/* Theme Picker Modal */}
      {showThemePicker && <ThemePickerModal applyTheme={applyTheme} />}

      {/* Navigation */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
        <a href="#" className="nav-brand" onClick={(e) => handleLinkClick(e, 'hero')}>
          <div className="nav-brand-icon">L</div>
          <div className="nav-brand-text">The <span>Loomist</span></div>
        </a>

        <div className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`} id="navLinks">
          <a href="#about" className={`nav-link ${activeSection === 'about' ? 'active-link' : ''}`} style={{ color: activeSection === 'about' ? 'var(--color-gold)' : '' }} onClick={(e) => handleLinkClick(e, 'about')}>About</a>
          <a href="#history" className={`nav-link ${activeSection === 'history' ? 'active-link' : ''}`} style={{ color: activeSection === 'history' ? 'var(--color-gold)' : '' }} onClick={(e) => handleLinkClick(e, 'history')}>History</a>
          <a href="#men" className={`nav-link ${activeSection === 'men' ? 'active-link' : ''}`} style={{ color: activeSection === 'men' ? 'var(--color-gold)' : '' }} onClick={(e) => handleLinkClick(e, 'men')}>Men</a>
          <a href="#women" className={`nav-link ${activeSection === 'women' ? 'active-link' : ''}`} style={{ color: activeSection === 'women' ? 'var(--color-gold)' : '' }} onClick={(e) => handleLinkClick(e, 'women')}>Women</a>
          <a href="#color-match" className={`nav-link ${activeSection === 'color-match' ? 'active-link' : ''}`} style={{ color: activeSection === 'color-match' ? 'var(--color-gold)' : '' }} onClick={(e) => handleLinkClick(e, 'color-match')}>Color Match</a>
          <a href="#posts" className={`nav-link ${activeSection === 'posts' ? 'active-link' : ''}`} style={{ color: activeSection === 'posts' ? 'var(--color-gold)' : '' }} onClick={(e) => handleLinkClick(e, 'posts')}>Posts</a>
          <a href="#gallery" className={`nav-link ${activeSection === 'gallery' ? 'active-link' : ''}`} style={{ color: activeSection === 'gallery' ? 'var(--color-gold)' : '' }} onClick={(e) => handleLinkClick(e, 'gallery')}>Gallery</a>
          <a href="#contact" className={`nav-link ${activeSection === 'contact' ? 'active-link' : ''}`} style={{ color: activeSection === 'contact' ? 'var(--color-gold)' : '' }} onClick={(e) => handleLinkClick(e, 'contact')}>Contact</a>

        </div>

        {/* Theme Toggle Button */}
        <ThemeToggleButton toggleTheme={toggleTheme} />

        <div className={`nav-toggle ${isMobileMenuOpen ? 'active' : ''}`} id="navToggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        className="hero" 
        id="hero" 
        onMouseMove={handleHeroMouseMove}
        style={{
          '--mouse-x': mousePos.x,
          '--mouse-y': mousePos.y
        }}
      >
        <div className="hero-bg">
          {/* User will replace this src with their desired blurry image */}
          <img src="/images/hero-background.jpg" alt="Hero Background" />
        </div>
        <div className="hero-overlay"></div>
        <div className="hero-grain"></div>

        <div className="hero-particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>

        <div className="hero-content">
          <span className="hero-label">Fashion • History • Style</span>
          <h1 className="hero-title hero-title-clash">
            <span className="hero-word-the">THE</span>
            <span className="hero-word-loomist highlight">LOOMIST</span>
          </h1>
          <p className="hero-subtitle">
            "Every thread has a story. Every garment, a legacy."
            <br />— Curated by Varun.K
          </p>
          <div className="hero-actions">
            <a href="#history" className="btn btn-primary" onClick={(e) => handleLinkClick(e, 'history')}>
              Explore Stories
              <span className="btn-icon">→</span>
            </a>
            <a href="https://www.instagram.com/the.loomist_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noreferrer" className="btn btn-outline" onClick={(e) => openSocialLink(e, 'instagram')}>
              <span className="btn-icon"></span>
              Follow on Instagram
            </a>
            <a href="https://www.youtube.com/@The.loomist" target="_blank" rel="noreferrer" className="btn btn-outline" onClick={(e) => openSocialLink(e, 'youtube')}>
              <span className="btn-icon"></span>
              Subscribe on YouTube
            </a>
            <a href="https://x.com/Theloomist_" target="_blank" rel="noreferrer" className="btn btn-outline" onClick={(e) => openSocialLink(e, 'x')}>
              <span className="btn-icon"></span>
              Follow on 𝕏
            </a>
          </div>
        </div>

        <div className="hero-scroll" onClick={(e) => handleLinkClick(e, 'about')}>
          <span className="hero-scroll-text">Scroll</span>
          <div className="hero-scroll-line"></div>
        </div>
      </section>

      {/* About Section */}
      <section className="section about" id="about">
        <div className="section-inner">
          <div className="about-grid">
            <div className="about-image reveal-left">
              <div 
                className="about-image-frame thug-portrait-hover-container"
                onMouseMove={handlePortraitMouseMove}
                onMouseLeave={handlePortraitMouseLeave}
                style={{ transform: portraitTransform, transition: 'transform 0.15s ease-out' }}
              >
                <img src="/images/varun-portrait.jpg" alt="Varun.K — The Loomist" id="aboutImage" onError={handleImageError} />
                <div className="thug-text-hover">THE LOOMIST</div>
              </div>
              <div className="about-image-accent"></div>
            </div>

            <div className="about-text reveal-right">
              <span className="section-label">The Story Behind The Loom</span>
              <h2 className="section-title">
                Meet <span class="accent">Varun.K</span>
              </h2>
              <div className="section-divider"></div>
              <p className="about-description">
                Fashion isn't just about what you wear — it's a living chronicle of culture, rebellion, and identity. 
                I'm <strong>Varun.K</strong>, the creator of <strong>The Loomist</strong>, and I believe every garment carries centuries of history in its stitches.
              </p>
              <p className="about-description">
                Through cinematic videos on Instagram, I unravel the fascinating stories behind the clothes we wear — from the evolution of the three-piece suit to the 5,000-year journey of the saree. Whether you're exploring men's fashion or women's style, The Loomist is your gateway to dressing with intention and understanding.
              </p>
              <div className="about-stats">
                <div className="about-stat">
                  <div className="about-stat-number">50+</div>
                  <div className="about-stat-label">Videos</div>
                </div>
                <div className="about-stat">
                  <div className="about-stat-number">25K+</div>
                  <div className="about-stat-label">Followers</div>
                </div>
                <div className="about-stat">
                  <div className="about-stat-number">100+</div>
                  <div className="about-stat-label">Fashion Eras</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fashion History Section */}
      <section className="section" id="history">
        <div className="section-inner">
          <div className="section-header reveal">
            <span className="section-label">Through the Ages</span>
            <h2 className="section-title">Fashion <span className="accent">History</span></h2>
            <div className="section-divider"></div>
            <p className="section-desc">Unraveling centuries of style — from corsets to couture, workwear to high fashion.</p>
          </div>

          <div className="videos-grid" id="historyGrid">
            {videos.filter(v => v.category === 'history').length > 0 ? (
              videos.filter(v => v.category === 'history').map((v, i) => (
                <VideoCard key={v.id} video={v} index={i} />
              ))
            ) : (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', gridColumn: '1/-1' }}>No videos in this category yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* Featured Banner */}
      <section className="featured-banner" id="featuredBanner">
        <div className="hero-overlay"></div>
        <div className="featured-content">
          <div className="featured-text reveal-left">
            <span className="section-label">Why Fashion History Matters</span>
            <h2>Fashion Is <span className="accent">Culture</span> You Can Wear</h2>
            <p>
              Understanding the past empowers you to make intentional choices today. 
              Every trend has roots — in revolution, art, technology, and human expression. 
              At The Loomist, we don't just follow trends. We trace their origins and decode their meaning.
            </p>
            <a href="#history" className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={(e) => handleLinkClick(e, 'history')}>
              Watch the Series
              <span className="btn-icon">→</span>
            </a>
          </div>
          <div className="featured-stats reveal-right">
            <div className="featured-stat">
              <div className="featured-stat-value">5000+</div>
              <div className="featured-stat-label">Years of Fashion</div>
            </div>
            <div className="featured-stat">
              <div className="featured-stat-value">200+</div>
              <div className="featured-stat-label">Style Icons</div>
            </div>
            <div className="featured-stat">
              <div className="featured-stat-value">∞</div>
              <div className="featured-stat-label">Stories to Tell</div>
            </div>
          </div>
        </div>
      </section>

      {/* Men's Fashion Section */}
      <section className="section" id="men">
        <div className="section-inner">
          <div className="section-header reveal">
            <span className="section-label">Gentleman's Guide</span>
            <h2 className="section-title">Men's <span className="accent">Fashion</span></h2>
            <div className="section-divider"></div>
            <p className="section-desc">From power dressing to casual elegance — master the art of men's style.</p>
          </div>

          <div className="videos-grid" id="menGrid">
            {videos.filter(v => v.category === 'men').length > 0 ? (
              videos.filter(v => v.category === 'men').map((v, i) => (
                <VideoCard key={v.id} video={v} index={i} />
              ))
            ) : (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', gridColumn: '1/-1' }}>No videos in this category yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* Women's Fashion Section */}
      <section className="section" id="women">
        <div className="section-inner">
          <div className="section-header reveal">
            <span className="section-label">Style & Substance</span>
            <h2 className="section-title">Women's <span className="accent">Fashion</span></h2>
            <div className="section-divider"></div>
            <p className="section-desc">Bold, beautiful, and boundary-breaking — celebrating women's style through the ages.</p>
          </div>

          <div className="videos-grid" id="womenGrid">
            {videos.filter(v => v.category === 'women').length > 0 ? (
              videos.filter(v => v.category === 'women').map((v, i) => (
                <VideoCard key={v.id} video={v} index={i} />
              ))
            ) : (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', gridColumn: '1/-1' }}>No videos in this category yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* Color Matcher Section */}
      <section className="section" id="color-match">
        <div className="section-inner">
          <div className="section-header reveal">
            <span className="section-label">Style Assistant</span>
            <h2 className="section-title">Color <span className="accent">Match</span></h2>
            <div className="section-divider"></div>
          </div>
          <ColorMatcher />
        </div>
      </section>

      {/* Posts & Photos */}
      <section className="posts section" id="posts">
        <div className="section-inner">
          <div className="section-header reveal">
            <span className="section-label">Journal</span>
            <h2 className="section-title">Latest <span className="accent">Posts & Photos</span></h2>
            <div className="section-divider"></div>
            <p className="section-desc">Behind the scenes, quick updates, and visual inspiration.</p>
          </div>

          <div className="posts-grid" id="postsGrid">
            {posts.length > 0 ? (
              posts.map((post, i) => (
                <article key={post.id} className={`post-card reveal stagger-${(i % 4) + 1}`}>
                  {renderPostMedia(post)}
                  <div className="post-content">
                    <h3 className="post-title">{post.title}</h3>
                    {post.content && <p className="post-caption">{post.content}</p>}
                    <div className="post-meta">
                      <span>{post.category}</span>
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p style={{ color: 'var(--color-text-muted)', gridColumn: '1/-1', textAlign: 'center' }}>No posts yet. Check back soon!</p>
            )}
          </div>
        </div>
      </section>

      {/* Instagram Gallery */}
      <section className="section insta-section" id="gallery">
        <div className="section-header reveal">
          <span className="section-label">@theloomist</span>
          <h2 className="section-title">From the <span className="accent">Gram</span></h2>
          <div className="section-divider"></div>
        </div>

        <div className="insta-grid" id="instaGrid">
          {[
            { id: 1, src: '/images/insta/insta-1.jpg', alt: 'Fashion post 1' },
            { id: 2, src: '/images/insta/insta-2.jpg', alt: 'Fashion post 2' },
            { id: 3, src: '/images/insta/insta-3.jpg', alt: 'Fashion post 3' },
            { id: 4, src: '/images/insta/insta-4.jpg', alt: 'Fashion post 4' },
            { id: 5, src: '/images/insta/insta-5.jpg', alt: 'Fashion post 5' },
            { id: 6, src: '/images/insta/insta-6.jpg', alt: 'Fashion post 6' },
            { id: 7, src: '/images/insta/my-new-photo.jpg', alt: 'My awesome new post' },
            // To add a new image, just add a new line here! Example:
            // { id: 8, src: '/images/insta/another-photo.jpg', alt: 'Another Photo' },
          ].map((img, index) => (
            <div 
              key={img.id} 
              className={`insta-item reveal-scale stagger-${(index % 6) + 1}`} 
              onClick={() => setLightboxImage(img.src)}
              style={{ cursor: 'pointer' }}
            >
              <img src={img.src} alt={img.alt} onError={handleImageError} />
              <div className="insta-item-overlay"><span className="insta-item-icon"></span></div>
            </div>
          ))}
        </div>

        <div className="insta-cta reveal" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://www.instagram.com/the.loomist_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noreferrer" onClick={(e) => openSocialLink(e, 'instagram')}>
            Follow @the.loomist_ on Instagram <span>→</span>
          </a>
          <a href="https://www.youtube.com/@The.loomist" target="_blank" rel="noreferrer" onClick={(e) => openSocialLink(e, 'youtube')}>
            Subscribe @The.loomist on YouTube <span>→</span>
          </a>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="section newsletter" id="newsletter">
        <div className="newsletter-bg"></div>
        <div className="newsletter-inner reveal">
          <span className="section-label">Stay in Style</span>
          <h2 className="section-title">Join the <span className="accent">Thread</span></h2>
          <div className="section-divider"></div>
          <p className="section-desc">Get weekly fashion stories, styling tips, and exclusive content delivered to your inbox.</p>

          <form className="newsletter-form" id="newsletterForm" onSubmit={handleNewsletterSubmit}>
            <input 
              type="email" 
              className="newsletter-input" 
              id="newsletterEmail" 
              placeholder="Enter your email address" 
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required 
            />
            <button type="submit" className="newsletter-btn">Subscribe</button>
          </form>
          <p className="newsletter-note">No spam. Only beautifully crafted fashion stories. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section contact" id="contact">
        <div className="section-inner">
          <div className="section-header reveal">
            <span className="section-label">Get in Touch</span>
            <h2 className="section-title">Let's <span className="accent">Connect</span></h2>
            <div className="section-divider"></div>
          </div>

          <div className="contact-grid">
            <div className="contact-info reveal-left">
              <h3>Collaborate with <span style={{ color: 'var(--color-gold)' }}>The Loomist</span></h3>
              <p>
                Whether you're a brand looking for creative storytelling, a fellow fashion enthusiast, 
                or just want to share your favourite style era — I'd love to hear from you.
              </p>

              <div className="contact-details">
                <div className="contact-detail">
                  <div className="contact-detail-icon">
                    <img src="/images/email-icon.png" alt="Email" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
                  </div>
                  <div className="contact-detail-text">
                    <strong>Email</strong>
                    theloomist@gmail.com
                  </div>
                </div>

                <div className="contact-detail">
                  <div className="contact-detail-icon">
                    <img src="/images/instagram-icon.png" alt="Instagram" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
                  </div>
                  <div className="contact-detail-text">
                    <strong>Instagram</strong>
                    @theloomist
                  </div>
                </div>
                <div className="contact-detail">
                  <div className="contact-detail-icon">
                    <img src="/images/youtube-icon.png" alt="YouTube" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
                  </div>
                  <div className="contact-detail-text">
                    <strong>YouTube</strong>
                    @The.loomist
                  </div>
                </div>
                <div className="contact-detail">
                  <div className="contact-detail-icon">𝕏</div>
                  <div className="contact-detail-text">
                    <strong>X (Twitter)</strong>
                    @Theloomist_
                  </div>
                </div>
              </div>

              <div className="contact-social">
                <a href="https://www.instagram.com/the.loomist_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noreferrer" className="contact-social-link" title="Instagram" onClick={(e) => openSocialLink(e, 'instagram')}></a>
                <a href="https://www.youtube.com/@The.loomist" target="_blank" rel="noreferrer" className="contact-social-link" title="YouTube" onClick={(e) => openSocialLink(e, 'youtube')}></a>
                <a href="https://x.com/Theloomist_" target="_blank" rel="noreferrer" className="contact-social-link" title="Twitter/X" onClick={(e) => openSocialLink(e, 'x')}>𝕏</a>
                <a href="#" className="contact-social-link" title="Pinterest"></a>
              </div>
            </div>

            <form className="contact-form reveal-right" id="contactForm" onSubmit={handleContactSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="contactName">Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    id="contactName" 
                    placeholder="Your name" 
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="contactEmail">Email</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    id="contactEmail" 
                    placeholder="Your email" 
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="contactSubject">Subject</label>
                <input 
                  type="text" 
                  className="form-input" 
                  id="contactSubject" 
                  placeholder="What's this about?" 
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="contactMessage">Message</label>
                <textarea 
                  className="form-textarea" 
                  id="contactMessage" 
                  placeholder="Tell me your story..." 
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Send Message
                <span className="btn-icon">→</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-brand-name">The <span>Loomist</span></div>
              <p>Unraveling the threads of fashion history. Every garment tells a story — we're here to tell it beautifully.</p>
            </div>

            <div className="footer-col">
              <h4>Explore</h4>
              <ul>
                <li><a href="#history" onClick={(e) => handleLinkClick(e, 'history')}>Fashion History</a></li>
                <li><a href="#men" onClick={(e) => handleLinkClick(e, 'men')}>Men's Fashion</a></li>
                <li><a href="#women" onClick={(e) => handleLinkClick(e, 'women')}>Women's Fashion</a></li>
                <li><a href="#gallery" onClick={(e) => handleLinkClick(e, 'gallery')}>Gallery</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Connect</h4>
              <ul>
                <li><a href="https://www.instagram.com/the.loomist_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noreferrer" onClick={(e) => openSocialLink(e, 'instagram')}>Instagram</a></li>
                <li><a href="https://www.youtube.com/@The.loomist" target="_blank" rel="noreferrer" onClick={(e) => openSocialLink(e, 'youtube')}>YouTube</a></li>
                <li><a href="https://x.com/Theloomist_" target="_blank" rel="noreferrer" onClick={(e) => openSocialLink(e, 'x')}>Twitter / 𝕏</a></li>
                <li><a href="#" title="Pinterest">Pinterest</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>More</h4>
              <ul>
                <li><a href="#about" onClick={(e) => handleLinkClick(e, 'about')}>About Varun.K</a></li>
                <li><a href="#contact" onClick={(e) => handleLinkClick(e, 'contact')}>Contact</a></li>
                <li><a href="#newsletter" onClick={(e) => handleLinkClick(e, 'newsletter')}>Newsletter</a></li>
                <li><a href="/admin">Admin</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copyright">
              © 2026 <a href="#" onClick={(e) => e.preventDefault()}>The Loomist</a>. Crafted with  by Varun.K
            </p>
            <div className="footer-bottom-links">
              <a href="#" onClick={(e) => e.preventDefault()}>Privacy</a>
              <a href="#" onClick={(e) => e.preventDefault()}>Terms</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      <div className={`toast ${toast.show ? 'show' : ''} ${toast.type}`} id="toast">
        {toast.message}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div className="lightbox-overlay" onClick={() => setLightboxImage(null)}>
          <button className="lightbox-close" onClick={() => setLightboxImage(null)}></button>
          <img src={lightboxImage} alt="Fullscreen view" className="lightbox-image" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}
