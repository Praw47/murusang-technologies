import { useEffect, useState } from 'react';
import { BrowserRouter, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ADMIN_EMAIL,
  auth,
  isAdminUser,
  isFirebaseConfigured,
  loginWithEmailPassword,
  savePublishedContent,
  subscribePublishedContent,
  createLead,
  subscribeLeads,
  signOutUser,
  watchAuthState,
} from './firebase';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Services', path: '/services' },
  { label: 'Products', path: '/products' },
  { label: 'Portfolio', path: '/portfolio' },
  { label: 'Contact', path: '/contact' },
  { label: 'Quotation', path: '/quotation' },
];

const defaultContent = {
  companyName: 'MURUSANG TECHNOLOGIES',
  heroTitle: "WE ENGINEER WHAT'S NEXT.",
  heroDescription:
    "Murusang Technologies transforms ambitious ideas into powerful digital products, intelligent software and scalable business solutions.",
  accent: '#B6FF66',
  background: '#101114',
  secondaryBackground: '#17191D',
  card: '#1D2025',
  text: '#FFFFFF',
  mutedText: '#A1A5AD',
  tag: 'Premium digital engineering',
};

const services = [
  'Business websites',
  'Ecommerce websites',
  'Custom web applications',
  'Android applications',
  'iOS applications',
  'Windows desktop applications',
  'Billing software',
  'Inventory management',
  'Business automation',
  'API integrations',
  'Database solutions',
  'Maintenance and support',
];

const productLines = [
  {
    title: 'Strategy and design',
    body: 'Product strategy, digital positioning, UX systems and conversion journeys designed for measurable growth.',
  },
  {
    title: 'Web platforms',
    body: 'Performance-first business websites and workflows that accelerate lead generation, content delivery and operations.',
  },
  {
    title: 'Business intelligence',
    body: 'Automated dashboards, reporting and operational tooling built to support confident decisions at scale.',
  },
  {
    title: 'Custom software',
    body: 'Secure systems for billing, inventory, client management, project tracking, and internal process automation.',
  },
];

const portfolioItems = [
  {
    slug: 'operations-os',
    title: 'Operations OS',
    category: 'Workflow platform',
    summary: 'Unified internal dashboard for service operations, approvals, task monitoring and business reporting.',
    overview: 'A concept for bringing a service team’s day-to-day operations into one clear workspace, from incoming requests through delivery and reporting.',
    challenge: 'Operational details can become fragmented across messages, spreadsheets, and disconnected tools, making ownership and progress hard to follow.',
    approach: 'Use a role-aware dashboard, a consistent task lifecycle, and a shared activity timeline to make current work and next actions visible.',
    capabilities: ['Work queue and task ownership', 'Approval and status workflows', 'Operational overview dashboard', 'Activity and reporting views'],
    deliverables: ['Dashboard information architecture', 'Responsive web application concept', 'Workflow and status model', 'Interface component system'],
  },
  {
    slug: 'commerce-experience',
    title: 'Commerce experience',
    category: 'Ecommerce system',
    summary: 'Clean storefront with real-time inventory controls, pricing logic, onboarding flows and integrated fulfilment.',
    overview: 'A concept ecommerce experience that connects a customer-facing storefront with the essential product and order operations behind it.',
    challenge: 'A storefront needs to make product discovery and purchase straightforward while keeping product, stock, and fulfilment information aligned.',
    approach: 'Build a clear shopping journey and pair it with structured product and order management for the team operating the store.',
    capabilities: ['Product catalogue and search', 'Cart and checkout journey', 'Inventory and order views', 'Fulfilment status communication'],
    deliverables: ['Storefront UX concept', 'Product and category structure', 'Responsive checkout flow', 'Commerce operations dashboard concept'],
  },
  {
    slug: 'client-portal',
    title: 'Client portal',
    category: 'Access experience',
    summary: 'Secure, branded project access that combines OTP verification, milestone visibility and document management.',
    overview: 'A concept portal for giving a client one dependable place to check project progress, updates, milestones, and shared files.',
    challenge: 'Clients may need to search across email threads to find the latest status, approvals, or project documents.',
    approach: 'Present project information in a concise timeline with authenticated access and a clear separation between client-visible updates and internal notes.',
    capabilities: ['Project status and milestone timeline', 'Client-visible progress updates', 'Document library', 'Account and access flow'],
    deliverables: ['Client portal journey', 'Project overview interface', 'Milestone and update components', 'Responsive portal layouts'],
  },
  {
    slug: 'automated-enterprise-stack',
    title: 'Automated enterprise stack',
    category: 'Automation',
    summary: 'Connected app workflows spanning lead capture, validation, pricing, project creation and stakeholder notifications.',
    overview: 'A concept integration layer that connects key business events across enquiry intake, qualification, project setup, and team communication.',
    challenge: 'Repeated manual data entry between business tools can slow down handoffs and leave teams working from inconsistent information.',
    approach: 'Map the events and ownership rules first, then connect systems with explicit validation, status tracking, and failure visibility.',
    capabilities: ['Lead intake and validation', 'Rules-based workflow handoffs', 'Project record creation', 'Stakeholder notifications and logs'],
    deliverables: ['Integration map', 'Workflow and event definitions', 'Exception-handling plan', 'Monitoring dashboard concept'],
  },
];

const processSteps = [
  { title: 'Discover', text: 'We map your business needs, market position and digital opportunities.' },
  { title: 'Design', text: 'We craft premium interfaces, product flows and decision-ready experiences.' },
  { title: 'Build', text: 'We architect, ship and iterate production-grade software with rigorous QA.' },
  { title: 'Scale', text: 'We optimize growth, automation and ongoing maintenance for long-term performance.' },
];

function App() {
  const [content, setContent] = useState(defaultContent);
  const [authState, setAuthState] = useState({ user: null, loading: true, error: '' });
  const [contentError, setContentError] = useState('');

  useEffect(() => {
    if (!auth) {
      setAuthState({ user: null, loading: false, error: 'Firebase is not configured yet.' });
      return undefined;
    }

    const unsubscribe = watchAuthState((user) => {
      setAuthState({ user, loading: false, error: '' });
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return undefined;
    }

    return subscribePublishedContent(
      (remoteContent) => {
        setContent({ ...defaultContent, ...remoteContent });
        setContentError('');
      },
      (error) => {
        console.error('Unable to load published site content:', error);
        setContentError('Published content could not be loaded from Firebase. The default content is shown.');
      },
    );
  }, []);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <SiteLayout
        content={content}
        setContent={setContent}
        authState={authState}
        setAuthState={setAuthState}
        contentError={contentError}
      />
    </BrowserRouter>
  );
}

function SiteLayout({ content, setContent, authState, setAuthState, contentError }) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="app-shell" style={{ '--accent': content.accent, '--bg': content.background, '--bg-sec': content.secondaryBackground, '--card': content.card, '--text': content.text, '--muted': content.mutedText }}>
      <Header content={content} authState={authState} setAuthState={setAuthState} />
      <main className="page-surface">
        {contentError && <p className="container error-note" role="status">{contentError}</p>}
        <Routes>
          <Route path="/" element={<HomePage content={content} />} />
          <Route path="/about" element={<AboutPage content={content} />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/portfolio/:slug" element={<PortfolioDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/quotation" element={<QuotationPage />} />
          <Route path="/privacy-policy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/payment-refund-policy" element={<RefundPage />} />
          <Route path="/sign-in" element={<SignInPage authState={authState} setAuthState={setAuthState} />} />
          <Route path="/admin" element={<AdminPage content={content} setContent={setContent} authState={authState} setAuthState={setAuthState} />} />
          <Route path="/portal" element={<ClientPortalPage />} />
        </Routes>
      </main>
      <Footer content={content} />
    </div>
  );
}

function Header({ content, authState, setAuthState }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const adminUser = isAdminUser(authState.user);

  const handleLogout = async () => {
    await signOutUser();
    setAuthState({ user: null, loading: false, error: '' });
    setMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <NavLink to="/" className="brand-wrap" onClick={() => setMenuOpen(false)}>
          <div className="brand-mark">M</div>
          <div>
            <div className="brand-name">{content.companyName}</div>
            <div className="brand-sub">Digital engineering studio</div>
          </div>
        </NavLink>

        <nav className={menuOpen ? 'main-nav open' : 'main-nav'} aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
          {adminUser ? (
            <NavLink to="/admin" onClick={() => setMenuOpen(false)} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Admin
            </NavLink>
          ) : !authState.loading ? (
            <NavLink to="/portal" onClick={() => setMenuOpen(false)} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Client Portal
            </NavLink>
          ) : null}
          {!authState.user && !authState.loading && (
            <NavLink to="/sign-in" onClick={() => setMenuOpen(false)} className="nav-link mobile-sign-in">
              Sign in
            </NavLink>
          )}
        </nav>

        <button
          type="button"
          className={menuOpen ? 'menu-toggle active' : 'menu-toggle'}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <div className="header-actions">
          {authState.loading ? null : authState.user ? (
            <>
              <span className="account-pill">{adminUser ? 'Admin' : 'Client'}</span>
              <button type="button" className="btn btn-secondary header-logout" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <NavLink to="/sign-in" className="btn btn-secondary header-signin">
              Sign in
            </NavLink>
          )}
          <NavLink to="/quotation" className="btn btn-primary header-cta">
            Start Your Project
          </NavLink>
        </div>
      </div>
    </header>
  );
}

function Footer({ content }) {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="brand-wrap brand-wrap-footer">
            <div className="brand-mark">M</div>
            <div>
              <div className="brand-name">{content.companyName}</div>
            </div>
          </div>
          <p className="footer-copy">
            Murusang Technologies transforms ambitious ideas into powerful digital products, intelligent software and scalable business solutions.
          </p>
        </div>

        <div>
          <h4>Explore</h4>
          <ul className="footer-links">
            <li><NavLink to="/about">About</NavLink></li>
            <li><NavLink to="/services">Services</NavLink></li>
            <li><NavLink to="/products">Products</NavLink></li>
            <li><NavLink to="/portfolio">Portfolio</NavLink></li>
          </ul>
        </div>

        <div>
          <h4>Contact</h4>
          <ul className="footer-links">
            <li><a href="mailto:prawkd@gmail.com">prawkd@gmail.com</a></li>
            <li><a href="tel:+918189859089">+91 8189859089</a></li>
            <li><NavLink to="/contact">Contact us</NavLink></li>
            <li><NavLink to="/quotation">Request a quotation</NavLink></li>
          </ul>
        </div>

        <div>
          <h4>Legal</h4>
          <ul className="footer-links">
            <li><NavLink to="/privacy-policy">Privacy Policy</NavLink></li>
            <li><NavLink to="/terms">Terms and Conditions</NavLink></li>
            <li><NavLink to="/payment-refund-policy">Payment and Refund Policy</NavLink></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

function HomePage({ content }) {
  return (
    <>
      <section className="hero section-surface">
        <div className="container hero-grid">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="hero-copy"
          >
            <span className="eyebrow">{content.tag}</span>
            <h1>{content.heroTitle}</h1>
            <p>{content.heroDescription}</p>
            <div className="hero-actions">
              <NavLink to="/quotation" className="btn btn-primary">
                Start Your Project
              </NavLink>
              <NavLink to="/portfolio" className="btn btn-secondary">
                Explore Our Work
              </NavLink>
            </div>
            <div className="metrics-row">
              <div>
                <strong>Strategy</strong>
                <span>Product + Growth</span>
              </div>
              <div>
                <strong>Systems</strong>
                <span>Automation + Ops</span>
              </div>
              <div>
                <strong>Delivery</strong>
                <span>Premium execution</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="hero-visual-wrap"
          >
            <HeroVisual />
          </motion.div>
        </div>
      </section>

      <section className="section-surface logo-bar">
        <div className="container brand-line">
          <span>Business websites</span>
          <span>Ecommerce</span>
          <span>Custom software</span>
          <span>Android</span>
          <span>iOS</span>
          <span>Desktop apps</span>
        </div>
      </section>

      <section className="section-surface">
        <div className="container">
          <SectionHeader
            eyebrow="Our capabilities"
            title="Digital systems built for real business momentum"
            text="From strategy and UX to engineering and support, we create the products and processes that help companies scale with confidence."
          />
          <div className="card-grid service-grid">
            {services.map((service, index) => (
              <motion.article
                key={service}
                className="info-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.04 }}
              >
                <span className="card-index">0{index + 1}</span>
                <h3>{service}</h3>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-surface alt-surface">
        <div className="container process-grid">
          <div className="content-stack">
            <SectionHeader
              eyebrow="Process"
              title="From concept to launch and beyond"
              text="We keep strategy, design, engineering and implementation tightly connected for a frictionless delivery experience."
            />
          </div>
          <div className="step-list">
            {processSteps.map((step, index) => (
              <div key={step.title} className="step-item">
                <span className="step-number">0{index + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-surface">
        <div className="container cta-strip">
          <div>
            <span className="eyebrow">Let’s build your next advantage</span>
            <h2>Ready to turn your next idea into a powerful digital product?</h2>
          </div>
          <NavLink to="/quotation" className="btn btn-primary">
            Request a quotation
          </NavLink>
        </div>
      </section>
    </>
  );
}

function AboutPage({ content }) {
  return (
    <div className="page-content container">
      <SectionHeader
        eyebrow="About us"
        title="We engineer premium digital systems for growing businesses"
        text="Murusang Technologies focuses on digital products that combine business clarity, elegant user experience and reliable engineering."
      />

      <div className="story-grid">
        <div className="glass-panel">
          <h3>Our mission</h3>
          <p>
            We help founders and organizations move from fragmented processes to scalable digital operations. Every product is designed to be credible, measurable and flexible.
          </p>
        </div>
        <div className="glass-panel">
          <h3>Our approach</h3>
          <p>
            We combine strategic discovery, product thinking, interface craft and engineering rigor to deliver systems that perform beautifully in real operating conditions.
          </p>
        </div>
      </div>

      <div className="feature-three">
        <div className="feature-card">
          <h3>Business clarity</h3>
          <p>We shape product decisions around customer value, operational flow and sustainable growth.</p>
        </div>
        <div className="feature-card">
          <h3>Premium design</h3>
          <p>Our experiences are polished, confident and tailored to the distinct personality of your brand.</p>
        </div>
        <div className="feature-card">
          <h3>Production focus</h3>
          <p>We design systems that are robust, maintainable and ready to evolve with your business.</p>
        </div>
      </div>
    </div>
  );
}

function ServicesPage() {
  return (
    <div className="page-content container">
      <SectionHeader
        eyebrow="Services"
        title="Full-spectrum technology partnerships"
        text="We build digital platforms, product experiences and business systems that help organizations operate with more speed, clarity and confidence."
      />
      <div className="card-grid service-grid">
        {services.map((service, index) => (
          <article className="info-card" key={service}>
            <span className="card-index">0{index + 1}</span>
            <h3>{service}</h3>
            <p>Strategy-led delivery for businesses that need a polished, resilient and scalable digital experience.</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function ProductsPage() {
  return (
    <div className="page-content container">
      <SectionHeader
        eyebrow="Products"
        title="Product lines designed for operational excellence"
        text="Our work blends digital product experiences, internal operations tools and automation pathways that support business momentum."
      />
      <div className="card-grid product-grid">
        {productLines.map((product) => (
          <article className="info-card product-card" key={product.title}>
            <h3>{product.title}</h3>
            <p>{product.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function PortfolioPage() {
  return (
    <div className="page-content container">
      <SectionHeader
        eyebrow="Portfolio"
        title="Product stories that balance clarity, performance and practical business impact"
        text="We design and deliver digital work that looks premium and solves real business challenges."
      />
      <div className="card-grid portfolio-grid">
        {portfolioItems.map((item, index) => (
          <article className={`project-card project-card-${index + 1}`} key={item.slug}>
            <div className="project-card-topline">
              <span className="project-category">{item.category}</span>
              <span className="concept-label">Concept</span>
            </div>
            <div className="project-card-art" aria-hidden="true">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div className="project-art-window">
                <i />
                <i />
                <i />
              </div>
            </div>
            <h3>{item.title}</h3>
            <p>{item.summary}</p>
            <NavLink to={`/portfolio/${item.slug}`} className="link-button">
              Explore concept <span aria-hidden="true">↗</span>
            </NavLink>
          </article>
        ))}
      </div>
    </div>
  );
}

function PortfolioDetailPage() {
  const { slug } = useParams();
  const item = portfolioItems.find((project) => project.slug === slug);

  if (!item) {
    return (
      <div className="page-content container">
        <SectionHeader
          eyebrow="Portfolio"
          title="Concept not found"
          text="This portfolio concept may have moved or the link may be incorrect."
        />
        <NavLink to="/portfolio" className="btn btn-secondary">Back to portfolio</NavLink>
      </div>
    );
  }

  return (
    <article className="page-content container portfolio-detail">
      <NavLink to="/portfolio" className="back-link">← All concepts</NavLink>
      <header className="portfolio-detail-hero">
        <div>
          <div className="project-card-topline">
            <span className="project-category">{item.category}</span>
            <span className="concept-label">Concept showcase</span>
          </div>
          <h1>{item.title}</h1>
          <p>{item.overview}</p>
        </div>
        <div className="detail-art" aria-hidden="true">
          <span className="detail-art-orbit orbit-a" />
          <span className="detail-art-orbit orbit-b" />
          <div className="detail-art-panel">
            <span className="detail-art-dot" />
            <span className="detail-art-dot" />
            <span className="detail-art-dot" />
            <div className="detail-art-line line-wide" />
            <div className="detail-art-line" />
            <div className="detail-art-line line-short" />
            <div className="detail-art-block" />
          </div>
        </div>
      </header>

      <div className="portfolio-detail-grid">
        <section className="detail-section">
          <span className="eyebrow">01 / The challenge</span>
          <h2>What this concept addresses</h2>
          <p>{item.challenge}</p>
        </section>
        <section className="detail-section">
          <span className="eyebrow">02 / The approach</span>
          <h2>How we would shape it</h2>
          <p>{item.approach}</p>
        </section>
      </div>

      <section className="detail-section detail-capabilities">
        <span className="eyebrow">03 / Capabilities</span>
        <h2>Designed around the complete workflow</h2>
        <div className="detail-list-grid">
          {item.capabilities.map((capability, index) => (
            <div className="detail-list-item" key={capability}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{capability}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="detail-section detail-deliverables">
        <div>
          <span className="eyebrow">04 / Scope outline</span>
          <h2>What a project could include</h2>
          <p>This is an illustrative concept, not a claim of completed client work. Final scope would be agreed for each engagement.</p>
        </div>
        <ul>
          {item.deliverables.map((deliverable) => <li key={deliverable}>{deliverable}</li>)}
        </ul>
      </section>

      <div className="detail-cta">
        <div>
          <span className="eyebrow">Have a similar challenge?</span>
          <h2>Let’s shape a solution around your business.</h2>
        </div>
        <NavLink to="/quotation" className="btn btn-primary">Discuss your project</NavLink>
      </div>
    </article>
  );
}

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    try {
      await createLead({
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        businessName: formData.get('businessName'),
        serviceCategory: 'General enquiry',
        budget: '',
        projectDescription: formData.get('projectDescription'),
        expectedDeliveryDate: '',
      });
      setSubmitted(true);
      form.reset();
    } catch (error) {
      console.error('Unable to submit contact enquiry:', error);
      setSubmitError('We could not submit your message. Please try again in a moment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-content container contact-layout">
      <SectionHeader
        eyebrow="Contact"
        title="We’d love to hear about your next digital challenge"
        text="Tell us what you are building, what needs attention and where you want to grow next."
      />

      <div className="contact-grid">
        <form className="form-panel" onSubmit={handleSubmit}>
          <div className="field-row">
            <label>
              Name
              <input name="name" type="text" placeholder="Your full name" maxLength="120" required />
            </label>
            <label>
              Email
              <input name="email" type="email" placeholder="name@email.com" maxLength="254" required />
            </label>
          </div>
          <div className="field-row">
            <label>
              Phone
              <input name="phone" type="tel" placeholder="+91 00000 00000" maxLength="40" />
            </label>
            <label>
              Company
              <input name="businessName" type="text" placeholder="Business name" maxLength="160" />
            </label>
          </div>
          <label>
            Message
            <textarea name="projectDescription" rows="6" placeholder="How can we help?" maxLength="5000" required />
          </label>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send enquiry'}
          </button>
          {submitted && <p className="success-note">Your message has been queued for the Murusang team.</p>}
          {submitError && <p className="error-note" role="alert">{submitError}</p>}
        </form>

        <aside className="info-panel glass-panel">
          <h3>Reach us</h3>
          <ul className="contact-list">
            <li>Email: prawkd@gmail.com</li>
            <li>Phone: +91 8189859089</li>
            <li>Location: Coimbatore, Tamilnadu</li>
            <li>Response time: Usually within one business day</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}

function QuotationPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);
    const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);

    try {
      await createLead({
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        businessName: formData.get('businessName'),
        serviceCategory: formData.get('serviceCategory'),
        budget: formData.get('budget'),
        projectDescription: formData.get('projectDescription'),
        expectedDeliveryDate: formData.get('expectedDeliveryDate'),
      });
      setSubmitted(true);
      form.reset();
    } catch (error) {
      console.error('Unable to submit quotation request:', error);
      setSubmitError('We could not submit your quotation request. Please try again in a moment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-content container">
      <SectionHeader
        eyebrow="Request a quotation"
        title="Share your project scope and we’ll shape a tailored proposal"
        text="We’ll review the business problem, technical direction and execution plan before sending a recommendation."
      />

      <form className="form-panel large-form" onSubmit={handleSubmit}>
        <div className="field-row">
          <label>
            Client name
            <input name="name" type="text" placeholder="Full name" maxLength="120" required />
          </label>
          <label>
            Email
            <input name="email" type="email" placeholder="name@email.com" maxLength="254" required />
          </label>
        </div>

        <div className="field-row">
          <label>
            Phone
            <input name="phone" type="tel" placeholder="Contact number" maxLength="40" />
          </label>
          <label>
            Business name
            <input name="businessName" type="text" placeholder="Business / brand" maxLength="160" />
          </label>
        </div>

        <div className="field-row">
          <label>
            Service category
            <select name="serviceCategory" defaultValue="Custom web applications">
              {services.map((service) => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </label>
          <label>
            Budget
            <input name="budget" type="text" placeholder="$5,000 - $30,000" maxLength="120" />
          </label>
        </div>

        <div className="field-row">
          <label>
            Expected delivery date
            <input name="expectedDeliveryDate" type="date" />
          </label>
          <label>
            Project description
            <textarea name="projectDescription" rows="4" placeholder="Briefly describe your project goals and current stage." maxLength="5000" required />
          </label>
        </div>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit quotation request'}
        </button>
        {submitted && <p className="success-note">Your quotation request has been received and is now in the intake queue.</p>}
        {submitError && <p className="error-note" role="alert">{submitError}</p>}
      </form>
    </div>
  );
}

function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      sections={[
        'We respect your privacy and protect the information you share with us through our website, enquiry forms and project-related communications.',
        'We use submission data only for the purpose of responding to enquiries, estimating requirements and managing project communication. We do not sell or rent personal data to third parties.',
        'We may use analytics or operational records to improve the quality of our services, maintain security and monitor compliance with lawful business needs.',
        'You have the right to request access to, correction of, or deletion of your personal information where legally applicable.',
      ]}
    />
  );
}

function TermsPage() {
  return (
    <LegalPage
      title="Terms and Conditions"
      sections={[
        'By using Murusang Technologies services, you agree to the terms and conditions governing service delivery, communication, timelines and project scope.',
        'Project work is subject to an agreed scope, timeline and price. Any changes requested after approval may require an authorized revised estimate and schedule.',
        'Murusang Technologies will act in good faith to deliver the agreed digital product or service, but commercial outcomes depend on client inputs, cooperation and approvals provided during the engagement.',
        'All intellectual property created for the project is governed by a separate written assignment or work agreement, which is typically confirmed during onboarding and contract execution.',
      ]}
    />
  );
}

function RefundPage() {
  return (
    <LegalPage
      title="Payment and Refund Policy"
      sections={[
        'Fees are typically discussed and agreed in writing before work begins. Deposits or milestones may be required based on the project scope and delivery model.',
        'Payments are processed according to the agreed schedule. Services delivered or work completed in good faith are generally non-refundable once the plan is executed.',
        'If a project is cancelled before work begins, any pre-paid amount may be refunded only in accordance with the written agreement for that engagement.',
        'For any disputes, the parties will review the project status, deliverables and payment milestones to resolve issues fairly and in good faith.',
      ]}
    />
  );
}

function LegalPage({ title, sections }) {
  return (
    <div className="page-content container legal-page">
      <SectionHeader eyebrow="Legal" title={title} text="This document is intended to communicate our policy position in a clear and professional manner." />
      <div className="glass-panel legal-body">
        {sections.map((section) => (
          <p key={section}>{section}</p>
        ))}
      </div>
    </div>
  );
}

function SignInPage({ authState, setAuthState }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!isFirebaseConfigured) {
      setFormError('Sign-in is temporarily unavailable because Firebase is not configured.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { user } = await loginWithEmailPassword(form.email.trim(), form.password);
      setAuthState({ user, loading: false, error: '' });

      if (user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() && !user.emailVerified) {
        setFormError('Verify the admin account email before opening the admin dashboard.');
        return;
      }

      navigate(isAdminUser(user) ? '/admin' : '/portal', { replace: true });
    } catch (error) {
      console.error('Sign-in failed:', error);
      setFormError('We could not sign you in. Check your email and password, then try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authState.user) {
    const adminUser = isAdminUser(authState.user);
    return (
      <div className="page-content container">
        <div className="glass-panel sign-in-card">
          <span className="eyebrow">{adminUser ? 'Administrator' : 'Client account'}</span>
          <h2>You’re signed in</h2>
          <p>Signed in as {authState.user.email}.</p>
          <NavLink to={adminUser ? '/admin' : '/portal'} className="btn btn-primary">
            {adminUser ? 'Open admin dashboard' : 'Open client portal'}
          </NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content container">
      <div className="sign-in-shell">
        <div className="sign-in-card glass-panel">
          <div className="sign-in-brand-mark">M</div>
          <span className="eyebrow">Murusang account</span>
          <h2>Welcome back</h2>
          <p>Sign in to continue to your account.</p>
          <form className="form-panel sign-in-form" onSubmit={handleSubmit}>
            <label>
              Email
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="you@example.com"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Your password"
                required
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
            {formError && <p className="error-note" role="alert">{formError}</p>}
          </form>
          <p className="sign-in-help">Need access? Contact the Murusang team.</p>
        </div>
      </div>
    </div>
  );
}

function AdminPage({ content, setContent, authState, setAuthState }) {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [leadError, setLeadError] = useState('');
  const [activityLog, setActivityLog] = useState([
    'Admin dashboard opened.',
  ]);
  const [cmsSaveState, setCmsSaveState] = useState({ saving: false, message: '', error: '' });
  const [form, setForm] = useState({ email: 'kdprawin@gmail.com', password: '' });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAllowed = isAdminUser(authState.user);

  useEffect(() => {
    if (!isAllowed) {
      return undefined;
    }

    return subscribeLeads(
      setLeads,
      (error) => {
        console.error('Unable to load leads from Firebase:', error);
        setLeadError('Leads could not be loaded. Check Firestore access and rules.');
      },
    );
  }, [isAllowed]);

  useEffect(() => {
    if (!authState.loading && !authState.user && !isFirebaseConfigured) {
      setFormError('Firebase is not configured yet. Add your project credentials in the Vite environment variables.');
    }
  }, [authState.loading, authState.user]);

  const handleContentUpdate = (event) => {
    const { name, value } = event.target;
    setContent((current) => ({ ...current, [name]: value }));
    setCmsSaveState({ saving: false, message: 'Unsaved changes', error: '' });
    setActivityLog((current) => [`Updated ${name} in CMS content`, ...current].slice(0, 5));
  };

  const handleSaveContent = async () => {
    setCmsSaveState({ saving: true, message: '', error: '' });
    try {
      await savePublishedContent(content);
      setCmsSaveState({ saving: false, message: 'Published content saved to Firebase.', error: '' });
    } catch (error) {
      console.error('Unable to save published site content:', error);
      setCmsSaveState({
        saving: false,
        message: '',
        error: 'Could not save content to Firebase. Check your connection and Firestore rules.',
      });
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!isFirebaseConfigured) {
      setFormError('Firebase is not configured yet. Add the project credentials to the environment file before authenticating.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const result = await loginWithEmailPassword(form.email, form.password);
      const user = result.user;
      const validAdmin = isAdminUser(user);

      if (!validAdmin) {
        setAuthState({ user, loading: false, error: 'This account does not have admin access.' });
        if (user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
          navigate('/portal', { replace: true });
        } else {
          setFormError('Verify the admin account email before opening the dashboard.');
        }
      } else {
        setAuthState({ user, loading: false, error: '' });
      }
    } catch (error) {
      setFormError(error.message || 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await signOutUser();
    setAuthState({ user: null, loading: false, error: '' });
    setFormError('');
    navigate('/');
  };

  if (authState.loading) {
    return (
      <div className="page-content container">
        <div className="glass-panel">
          <p>Loading admin access...</p>
        </div>
      </div>
    );
  }

  if (!authState.user) {
    return (
      <div className="page-content container">
        <div className="admin-login-wrap">
          <div className="glass-panel admin-login-box">
            <span className="eyebrow">Protected dashboard</span>
            <h2>Admin access</h2>
            <p>Only {ADMIN_EMAIL} can access the admin dashboard. Other accounts remain public visitors.</p>

            <form className="form-panel" onSubmit={handleLogin}>
              <label>
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="admin@email.com"
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="Your password"
                />
              </label>

              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Access admin'}
              </button>

              {formError && <p className="error-note">{formError}</p>}
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="page-content container">
        <div className="glass-panel admin-denied-box">
          <span className="eyebrow">Access denied</span>
          <h2>Admin rights are restricted</h2>
          <p>
            Signed in as {authState.user.email}. Only {ADMIN_EMAIL} can access the admin dashboard.
          </p>
          {!authState.user.emailVerified && (
            <p>Please verify this account’s email address before accessing admin features.</p>
          )}
          <p>You can continue browsing the public site, but this account does not have admin privileges.</p>
          <button type="button" className="btn btn-secondary" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content admin-layout container">
      <aside className="admin-sidebar glass-panel">
        <h3>Admin console</h3>
        <ul>
          <li>Overview</li>
          <li>Content</li>
          <li>Leads</li>
          <li>Projects</li>
          <li>Security</li>
        </ul>
      </aside>

      <div className="admin-main">
        <div className="admin-topbar glass-panel">
          <div>
            <span className="eyebrow">Protected dashboard</span>
            <h2>Welcome back, {authState.user.displayName || 'Super Admin'}</h2>
          </div>
          <div className="admin-actions">
            <button type="button" className="btn btn-primary">Invite team member</button>
            <button type="button" className="btn btn-secondary" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="mini-stat glass-panel">
            <span>Stored enquiries</span>
            <strong>{leads.length}</strong>
          </div>
          <div className="mini-stat glass-panel">
            <span>Admin account</span>
            <strong>Verified</strong>
          </div>
          <div className="mini-stat glass-panel">
            <span>Content source</span>
            <strong>Firestore</strong>
          </div>
          <div className="mini-stat glass-panel">
            <span>Project records</span>
            <strong>Not connected</strong>
          </div>
        </div>

        <div className="admin-panels">
          <section className="panel glass-panel">
            <h3>CMS controls</h3>
            <div className="field-grid">
              <label>
                Company name
                <input name="companyName" value={content.companyName} onChange={handleContentUpdate} />
              </label>
              <label>
                Hero headline
                <input name="heroTitle" value={content.heroTitle} onChange={handleContentUpdate} />
              </label>
              <label>
                Tagline
                <input name="tag" value={content.tag} onChange={handleContentUpdate} />
              </label>
              <label>
                Accent color
                <input name="accent" type="color" value={content.accent} onChange={handleContentUpdate} />
              </label>
            </div>
            <div className="cms-save-row">
              <button type="button" className="btn btn-primary" onClick={handleSaveContent} disabled={cmsSaveState.saving}>
                {cmsSaveState.saving ? 'Saving...' : 'Save published content'}
              </button>
              {cmsSaveState.message && <p className="success-note" role="status">{cmsSaveState.message}</p>}
              {cmsSaveState.error && <p className="error-note" role="alert">{cmsSaveState.error}</p>}
            </div>
          </section>

          <section className="panel glass-panel">
            <h3>Activity log</h3>
            <ul className="activity-list">
              {activityLog.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="panel glass-panel table-panel">
          <h3>Leads and enquiries</h3>
          {leadError && <p className="error-note" role="alert">{leadError}</p>}
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Service</th>
                <th>Email</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.name}</td>
                  <td>{lead.businessName || '—'}</td>
                  <td>{lead.serviceCategory || '—'}</td>
                  <td>{lead.email}</td>
                  <td>{lead.createdAt?.toDate ? lead.createdAt.toDate().toLocaleDateString() : 'Just now'}</td>
                </tr>
              ))}
              {leads.length === 0 && !leadError && (
                <tr>
                  <td colSpan="5">No enquiries have been submitted yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="panel glass-panel table-panel">
          <h3>Project management</h3>
          <p>Project records will appear here after the project collection is connected to Firestore.</p>
        </section>
      </div>
    </div>
  );
}

function ClientPortalPage() {
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [verified, setVerified] = useState(false);
  const [step, setStep] = useState('request');

  const requestOtp = () => {
    if (!email.includes('@gmail.com')) {
      return;
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    setOtpCode(code);
    setStep('verify');
  };

  const verifyOtp = (value) => {
    if (value === otpCode) {
      setVerified(true);
    }
  };

  return (
    <div className="page-content container portal-layout">
      <SectionHeader
        eyebrow="Client portal"
        title="Secure project access with Gmail verification"
        text="Enter a registered Gmail address to request a six-digit OTP and verify access to project updates."
      />

      <div className="portal-box glass-panel">
        {step === 'request' && (
          <>
            <label>
              Project Gmail address
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="client@gmail.com" />
            </label>
            <button type="button" className="btn btn-primary" onClick={requestOtp}>Request OTP</button>
          </>
        )}

        {step === 'verify' && !verified && (
          <>
            <p className="otp-note">OTP sent to {email}. Use the six-digit code from the secure verification request.</p>
            <label>
              Enter 6-digit OTP
              <input type="text" maxLength="6" placeholder="123456" onChange={(event) => verifyOtp(event.target.value)} />
            </label>
            <p className="small-copy">Demo OTP: {otpCode}</p>
          </>
        )}

        {verified && (
          <div className="portal-success">
            <h3>Access verified</h3>
            <p>You have successfully accessed the secure project portal.</p>
            <div className="portal-roadmap">
              <div className="mini-stat glass-panel">
                <span>Project ID</span>
                <strong>PRJ-41</strong>
              </div>
              <div className="mini-stat glass-panel">
                <span>Status</span>
                <strong>In Progress</strong>
              </div>
              <div className="mini-stat glass-panel">
                <span>Next update</span>
                <strong>7 days</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, text }) {
  return (
    <div className="section-header">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

function HeroVisual() {
  const techStack = [
    { name: 'HTML', className: 'html' },
    { name: 'CSS', className: 'css' },
    { name: 'React', className: 'react' },
    { name: 'Android', className: 'android' },
    { name: 'Apple', className: 'apple' },
    { name: 'Firebase', className: 'firebase' },
  ];

  return (
    <div className="hero-visual tech-scene" aria-label="Technology stack showcase">
      <div className="tech-ring ring-one" />
      <div className="tech-ring ring-two" />
      <div className="tech-core">
        <span>Digital stack</span>
        <strong>Modern product engineering</strong>
      </div>

      {techStack.map((item, index) => (
        <div
          key={item.name}
          className={`tech-badge ${item.className}`}
          style={{ '--i': index }}
        >
          {item.name}
        </div>
      ))}
    </div>
  );
}

export default App;
