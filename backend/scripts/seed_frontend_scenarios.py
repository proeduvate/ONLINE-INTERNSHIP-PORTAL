import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.db.session import SessionLocal
from models import DailyScenario

# Frontend Intern curriculum data
days = [
    {
        "day": 1,
        "scenario": "You have joined the frontend team of an e-commerce company.\n\nThe company is rebuilding its customer shopping website. Your mentor gives you the initial task:\n\n\"Start working on the new product-listing page. It must work on desktop, tablet and mobile.\"\n\nBefore writing code, you need to decide how you will begin.",
        "question": "What would you do first?",
        "choice_a": "Understand the requirements, review the design, identify responsive breakpoints and clarify unclear requirements with the mentor.",
        "choice_b": "Start building the page based on the desktop design and plan to handle mobile later.",
        "choice_c": "Immediately start coding the page without reviewing the requirements.",
        "why": "A responsive application should be planned for different screen sizes from the beginning.",
        "a_feedback": "Excellent decision!\n\nYou understood the requirements before implementation.\n\nDay 2 situation: Your mentor gives you the approved desktop, tablet and mobile designs.",
        "b_feedback": "Good decision, but there is a risk.\n\nYou started development, but mobile requirements were not considered early.\n\nDay 2 situation: While reviewing the mobile design, you discover that the layout requires a different product-card structure.",
        "c_feedback": "Needs Improvement.\n\nYou started coding without understanding the complete requirement.\n\nDay 2 situation: The mentor points out that the mobile layout is completely different from what you implemented."
    },
    {
        "day": 2,
        "scenario": "The product page is now being developed.\n\nThe design contains:\n- Product image\n- Product name\n- Price\n- Rating\n- Add-to-cart button",
        "question": "You need to create the product card component. What approach would you take?",
        "choice_a": "Create a reusable product-card component that receives product information through props.",
        "choice_b": "Create the card directly inside the product page and reuse it later if needed.",
        "choice_c": "Copy and paste the same card code wherever a product appears.",
        "why": "A reusable component reduces duplication and makes future UI changes easier.",
        "a_feedback": "Excellent!\n\nYou built a reusable component that receives product information through props.\n\nNext day: Your team can easily modify the product design in one place.",
        "b_feedback": "Good, but it limits reusability.\n\nCreating it inside the page means you'll have to refactor it later when another page needs it.\n\nNext day: The team asks you to reuse the card on the homepage.",
        "c_feedback": "Needs improvement.\n\nCopy-pasting causes maintenance issues.\n\nNext day: A design change requires you to update the code in 5 different places."
    },
    {
        "day": 3,
        "scenario": "The backend team provides an API for product information.\n\nThe response contains:\n- id\n- name\n- price\n- image\n- rating\n- stock",
        "question": "How should you integrate it?",
        "choice_a": "Understand the API response, handle loading/error states and map the data into the reusable product component.",
        "choice_b": "Fetch the API and display the available data without adding detailed error handling yet.",
        "choice_c": "Assume the API structure and hard-code the field names without checking the contract.",
        "why": "Handling loading/error states and mapping data ensures robust integration.",
        "a_feedback": "Excellent!\n\nYou successfully connect the frontend with the backend. The product listing is now working.\n\nNext day: The integration is robust and users have a smooth experience.",
        "b_feedback": "Good, but lacking error handling can lead to bad UX on failure.\n\nNext day: The API fails occasionally and users are confused.",
        "c_feedback": "Needs improvement.\n\nHardcoding leads to bugs when the API changes.\n\nNext day: The backend renames a field and your page crashes."
    },
    {
        "day": 4,
        "scenario": "The next morning, the product API occasionally returns an error.",
        "question": "What should the user see when the API fails?",
        "choice_a": "Show a meaningful error state with a retry option.",
        "choice_b": "Show a generic \"Something went wrong\" message.",
        "choice_c": "Leave the page blank.",
        "why": "Users need to understand what happened and what action they can take.",
        "a_feedback": "Excellent!\n\nUsers can retry when the API fails, which improves the experience.\n\nNext day: Customer support receives fewer complaints.",
        "b_feedback": "Good, but users don't know what to do next.\n\nNext day: Users refresh the page continuously, causing more load.",
        "c_feedback": "Needs improvement.\n\nA blank page is confusing and users think the app is broken.\n\nNext day: Users leave the site entirely."
    },
    {
        "day": 5,
        "scenario": "The product manager asks you to add search.\n\nUsers should be able to search hundreds of products.",
        "question": "What should you consider first?",
        "choice_a": "Understand whether search should be performed client-side or through the backend API based on dataset size and requirements.",
        "choice_b": "Filter the currently loaded products in the browser.",
        "choice_c": "Load every possible product into the browser regardless of size.",
        "why": "Search approach depends on data size. Server-side is better for large datasets.",
        "a_feedback": "Excellent!\n\nYou correctly analyzed the requirements before implementing search.\n\nNext day: The search feature handles thousands of products efficiently.",
        "b_feedback": "Good, but client-side filtering might not work if the dataset grows.\n\nNext day: The app slows down as more products are added.",
        "c_feedback": "Needs improvement.\n\nLoading everything causes severe performance issues.\n\nNext day: Users complain that the app takes 10 seconds to load."
    },
    {
        "day": 6,
        "scenario": "The product manager now requests:\n- Category filter\n- Price filter\n- Rating filter",
        "question": "How should you approach this?",
        "choice_a": "Clarify filter behaviour and design a maintainable filter state/API interaction.",
        "choice_b": "Add each filter independently without considering how they interact.",
        "choice_c": "Create separate duplicated logic for every filter combination.",
        "why": "Filters often interact with each other and need a cohesive state management approach.",
        "a_feedback": "Excellent!\n\nYour filter state management is robust and handles combinations perfectly.\n\nNext day: Users easily find what they are looking for.",
        "b_feedback": "Good, but independent filters might cause conflicts when used together.\n\nNext day: Users get confusing results when applying multiple filters.",
        "c_feedback": "Needs improvement.\n\nDuplicated logic is unmaintainable and full of bugs.\n\nNext day: Adding a new 'Color' filter requires rewriting hundreds of lines of code."
    },
    {
        "day": 7,
        "scenario": "The team now asks you to implement the login page.",
        "question": "What should you do?",
        "choice_a": "Integrate the authentication API and correctly manage authenticated state without exposing sensitive credentials.",
        "choice_b": "Store authentication information using a quick client-side approach without reviewing security requirements.",
        "choice_c": "Store the user's password in frontend storage.",
        "why": "Authentication must be secure and state properly managed.",
        "a_feedback": "Excellent!\n\nYou implemented secure authentication that protects user data.\n\nNext day: The security team approves your implementation.",
        "b_feedback": "Good, but security should always be reviewed rigorously.\n\nNext day: A minor vulnerability is found in your token storage.",
        "c_feedback": "Needs improvement.\n\nStoring passwords in frontend storage is a critical security risk.\n\nNext day: A security audit flags your code as highly vulnerable."
    },
    {
        "day": 8,
        "scenario": "After login, customers should access:\n- Profile\n- Orders\n- Cart\n- Checkout\n\nUnauthenticated users should not access these pages.",
        "question": "What should you implement?",
        "choice_a": "Create protected routes based on authentication state while relying on backend authorization for actual access control.",
        "choice_b": "Redirect users from pages they shouldn't see.",
        "choice_c": "Assume hiding the links is sufficient security.",
        "why": "Frontend route protection improves UX, but real security comes from backend authorization.",
        "a_feedback": "Excellent!\n\nYou implemented proper frontend route protection and understand backend authorization.\n\nNext day: The app securely handles user sessions.",
        "b_feedback": "Good, but ensure backend authorization is also in place, not just redirects.\n\nNext day: A tech-savvy user bypasses your redirect.",
        "c_feedback": "Needs improvement.\n\nHiding links is not security; users can still access routes directly via URL.\n\nNext day: Unauthenticated users access profile pages."
    },
    {
        "day": 9,
        "scenario": "The product manager asks for an Add to Cart feature.",
        "question": "How should you design it?",
        "choice_a": "Create clear cart state management that handles adding, removing, quantity changes and synchronization with the backend where required.",
        "choice_b": "Keep cart state only in the current product page.",
        "choice_c": "Duplicate cart logic across every product component.",
        "why": "Cart state needs to be accessible across multiple components (e.g., product page, navbar cart icon).",
        "a_feedback": "Excellent!\n\nYour cart state management is well-designed and accessible globally.\n\nNext day: The cart icon in the header updates instantly when items are added.",
        "b_feedback": "Good, but keeping state local makes it hard to update the cart icon in the header.\n\nNext day: You have to lift state up, causing a refactor.",
        "c_feedback": "Needs improvement.\n\nDuplicated logic is error-prone and hard to maintain.\n\nNext day: The cart logic breaks on the related-products component."
    },
    {
        "day": 10,
        "scenario": "A customer increases a product quantity from 1 to 5.\n\nThe UI updates incorrectly.",
        "question": "What should you investigate?",
        "choice_a": "Trace the cart state update and identify whether the issue comes from state mutation, synchronization or rendering.",
        "choice_b": "Reload the page after every quantity change.",
        "choice_c": "Create another separate cart state.",
        "why": "Debugging state requires tracing the update cycle without mutating state directly.",
        "a_feedback": "Excellent!\n\nYou found the state mutation bug and fixed it correctly.\n\nNext day: Cart updates are smooth and instant.",
        "b_feedback": "Good, but reloading the page is a bad user experience.\n\nNext day: Users complain about the jarring cart experience.",
        "c_feedback": "Needs improvement.\n\nMultiple states lead to out-of-sync data.\n\nNext day: The header cart says 5, but the checkout page says 1."
    },
    {
        "day": 11,
        "scenario": "The backend tells you that only 2 units remain, but the customer tries to purchase 5.",
        "question": "What should the frontend do?",
        "choice_a": "Clearly communicate the available quantity while relying on the backend as the final authority.",
        "choice_b": "Allow 5 and let the backend reject it later.",
        "choice_c": "Show that 5 units are available even though the API says otherwise.",
        "why": "Frontend should validate and inform users early, but backend is the final source of truth.",
        "a_feedback": "Excellent!\n\nThe user is informed about stock limits clearly before checkout.\n\nNext day: Customers appreciate the transparent stock warnings.",
        "b_feedback": "Good, but rejecting it only at checkout causes frustration.\n\nNext day: A customer gets angry when their order is cancelled at the last step.",
        "c_feedback": "Needs improvement.\n\nShowing incorrect stock leads to failed orders and lost trust.\n\nNext day: Customer support deals with angry customers who paid for out-of-stock items."
    },
    {
        "day": 12,
        "scenario": "The checkout page is now being created.\n\nIt contains:\n- Address\n- Delivery option\n- Order summary\n- Payment option",
        "question": "How should you build it?",
        "choice_a": "Break the page into maintainable components and clearly manage each stage of the checkout state.",
        "choice_b": "Build the entire checkout as one large component.",
        "choice_c": "Duplicate the order data across every section.",
        "why": "Complex pages should be broken down into manageable, modular components.",
        "a_feedback": "Excellent!\n\nThe checkout components are maintainable, clean, and easily testable.\n\nNext day: Another team member easily adds a 'Gift Wrap' component to checkout.",
        "b_feedback": "Good, but a massive component will be very hard to maintain later.\n\nNext day: The checkout file is 1,500 lines long and confusing.",
        "c_feedback": "Needs improvement.\n\nDuplicated data causes synchronization issues across sections.\n\nNext day: The total price doesn't update when the shipping method changes."
    },
    {
        "day": 13,
        "scenario": "Customers can submit checkout information with an invalid phone number and incomplete address.",
        "question": "What should you do?",
        "choice_a": "Provide clear client-side validation while keeping backend validation as the final authority.",
        "choice_b": "Only show errors after submission.",
        "choice_c": "Allow any input because the backend can handle everything.",
        "why": "Client-side validation improves UX by catching errors early and guiding the user.",
        "a_feedback": "Excellent!\n\nUsers get immediate, helpful feedback on invalid inputs.\n\nNext day: Checkout conversion rates improve.",
        "b_feedback": "Good, but waiting until submission is frustrating for users.\n\nNext day: Users drop off because they have to scroll back up to find their errors.",
        "c_feedback": "Needs improvement.\n\nRelying only on backend causes unnecessary API calls and bad UX.\n\nNext day: The backend rejects 30% of orders due to bad data."
    },
    {
        "day": 14,
        "scenario": "Customers are clicking the payment button multiple times.",
        "question": "What should you implement?",
        "choice_a": "Add a processing state and prevent duplicate submissions while the payment request is in progress.",
        "choice_b": "Add a loading spinner but leave the button clickable.",
        "choice_c": "Allow repeated clicks without feedback.",
        "why": "Preventing duplicate submissions is critical to avoid multiple charges.",
        "a_feedback": "Excellent!\n\nYou prevented duplicate payment submissions and provided visual feedback.\n\nNext day: No customers are accidentally double-charged.",
        "b_feedback": "Good, but a spinner doesn't prevent multiple clicks.\n\nNext day: A user double-clicks and creates two orders.",
        "c_feedback": "Needs improvement.\n\nRepeated clicks caused duplicate orders and angry customers.\n\nNext day: Customer support has to issue dozens of refunds."
    },
    {
        "day": 15,
        "scenario": "Some customers experience payment failure.",
        "question": "What should the frontend display?",
        "choice_a": "Show a clear failure state, preserve appropriate order information and provide a safe retry path.",
        "choice_b": "Show \"Payment failed.\" and clear the form.",
        "choice_c": "Show \"Payment successful\" until the user checks their bank account.",
        "why": "Payment failures need clear communication and a frictionless way to recover.",
        "a_feedback": "Excellent!\n\nUsers can safely retry their payment without re-entering all their details.\n\nNext day: 80% of failed payments are successfully retried.",
        "b_feedback": "Good, but users are frustrated having to re-enter their address.\n\nNext day: Users abandon the cart after a single payment failure.",
        "c_feedback": "Needs improvement.\n\nMisleading users about payment success is a critical failure.\n\nNext day: Users think they bought the item and complain when it never arrives."
    },
    {
        "day": 16,
        "scenario": "Successful payments now reach the order-confirmation page.",
        "question": "What information should be displayed?",
        "choice_a": "Show confirmation status, order reference, purchased items and relevant next steps.",
        "choice_b": "Show only \"Order Successful.\"",
        "choice_c": "Show internal payment gateway diagnostic information.",
        "why": "Order confirmation needs to provide reassurance, reference details, and clarity on what happens next.",
        "a_feedback": "Excellent!\n\nCustomers have all the details they need and feel secure.\n\nNext day: Customers save their order numbers for tracking.",
        "b_feedback": "Good, but customers might want their order reference number or a summary.\n\nNext day: Customer support gets calls asking for order confirmations.",
        "c_feedback": "Needs improvement.\n\nInternal payment info is confusing and potentially insecure.\n\nNext day: Users are confused by API JSON displayed on the screen."
    },
    {
        "day": 17,
        "scenario": "QA reports that checkout is difficult to use on mobile.",
        "question": "What should you do?",
        "choice_a": "Reproduce the issue on different mobile sizes and fix the responsive layout based on evidence.",
        "choice_b": "Increase all font sizes blindly.",
        "choice_c": "Tell customers to use desktop.",
        "why": "Responsive design requires testing and fixing specific viewport issues using tools.",
        "a_feedback": "Excellent!\n\nThe checkout is now mobile-friendly and usable on all devices.\n\nNext day: Mobile sales increase by 15%.",
        "b_feedback": "Good, but font sizes might not fix layout overlap issues.\n\nNext day: The buttons are now too big for small screens.",
        "c_feedback": "Needs improvement.\n\nIgnoring mobile users loses a massive amount of sales.\n\nNext day: The product manager is furious about the drop in revenue."
    },
    {
        "day": 18,
        "scenario": "A QA engineer discovers that keyboard users cannot properly navigate the checkout.",
        "question": "What should you investigate?",
        "choice_a": "Check semantic HTML, keyboard navigation, focus management and accessible labels.",
        "choice_b": "Add larger buttons.",
        "choice_c": "Ignore it because mouse users can complete checkout.",
        "why": "Accessibility is essential for all users to navigate the app and often required by law.",
        "a_feedback": "Excellent!\n\nThe checkout is now accessible to keyboard and screen-reader users.\n\nNext day: The app passes the accessibility audit.",
        "b_feedback": "Good, but larger buttons don't fix keyboard focus order.\n\nNext day: Keyboard users are still stuck on the address field.",
        "c_feedback": "Needs improvement.\n\nIgnoring accessibility excludes users and can have legal implications.\n\nNext day: A major client threatens a lawsuit over accessibility compliance."
    },
    {
        "day": 19,
        "scenario": "The product page now contains hundreds of products and loads slowly.",
        "question": "What should you investigate?",
        "choice_a": "Measure the bottleneck and optimize rendering, network usage and asset loading based on evidence.",
        "choice_b": "Display fewer products.",
        "choice_c": "Rewrite the entire frontend from scratch.",
        "why": "Performance issues should be measured with profiling tools before optimizing.",
        "a_feedback": "Excellent!\n\nYou identified the bottleneck and improved load times systematically.\n\nNext day: The page loads in under 2 seconds.",
        "b_feedback": "Good, but displaying fewer products is a band-aid, not a solution for the root cause.\n\nNext day: The pagination component now loads slowly.",
        "c_feedback": "Needs improvement.\n\nRewriting without measuring is a massive waste of time.\n\nNext day: You spent weeks rewriting and it's still slow."
    },
    {
        "day": 20,
        "scenario": "Performance testing shows that large product images are responsible for significant loading time.",
        "question": "What should you do?",
        "choice_a": "Use appropriately sized/optimized images and suitable loading strategies (like lazy loading).",
        "choice_b": "Load fewer images.",
        "choice_c": "Remove product images completely.",
        "why": "Image optimization (sizing, formats, lazy loading) drastically improves performance without sacrificing UX.",
        "a_feedback": "Excellent!\n\nImages load quickly and efficiently using modern formats and lazy loading.\n\nNext day: The total page weight drops by 70%.",
        "b_feedback": "Good, but lazy loading or optimized formats would be a much better solution.\n\nNext day: The first few images still take too long to load.",
        "c_feedback": "Needs improvement.\n\nRemoving images ruins the e-commerce shopping experience.\n\nNext day: Sales drop to zero because nobody buys products they can't see."
    },
    {
        "day": 21,
        "scenario": "The product list now becomes slow when users interact with filters.",
        "question": "What should you investigate?",
        "choice_a": "Profile rendering and identify unnecessary component updates.",
        "choice_b": "Add a delay to filtering.",
        "choice_c": "Refresh the entire page after every filter.",
        "why": "UI rendering performance in SPAs is often hindered by unnecessary re-renders.",
        "a_feedback": "Excellent!\n\nYou optimized component rendering (using memoization) and fixed the lag.\n\nNext day: Filtering feels instant and snappy.",
        "b_feedback": "Good, but a delay (debounce) just masks the underlying rendering issue.\n\nNext day: The app still freezes for a second when the delay finishes.",
        "c_feedback": "Needs improvement.\n\nFull page reloads destroy the Single Page Application experience.\n\nNext day: Users complain the site feels like it's from 2005."
    },
    {
        "day": 22,
        "scenario": "The team wants automated tests before release.",
        "question": "What should you test?",
        "choice_a": "Test important user flows such as login, product interaction, cart and checkout states.",
        "choice_b": "Test only the homepage rendering.",
        "choice_c": "Skip tests because manual testing was completed.",
        "why": "Automated testing of critical user flows prevents regressions on core business features.",
        "a_feedback": "Excellent!\n\nCritical flows are now covered by robust end-to-end and integration tests.\n\nNext day: A bug is caught by the test suite before it hits production.",
        "b_feedback": "Good, but the most important flows (like checkout) remain untested and vulnerable.\n\nNext day: A minor update breaks the checkout button.",
        "c_feedback": "Needs improvement.\n\nManual testing doesn't scale for regression and is prone to human error.\n\nNext day: A critical bug slips into production."
    },
    {
        "day": 23,
        "scenario": "QA reports that the checkout works in Chrome but has a problem in Safari.",
        "question": "What should you do?",
        "choice_a": "Reproduce the issue in Safari and identify the browser-specific cause.",
        "choice_b": "Tell Safari users to use Chrome.",
        "choice_c": "Ignore the issue because it works on your machine.",
        "why": "Cross-browser compatibility is important for a web application serving diverse users.",
        "a_feedback": "Excellent!\n\nYou identified a CSS property unsupported in older Safari and fixed it.\n\nNext day: QA confirms the fix works across all major browsers.",
        "b_feedback": "Good, but forcing users to switch browsers is a terrible user experience.\n\nNext day: 20% of your user base leaves the site.",
        "c_feedback": "Needs improvement.\n\nSafari represents a massive user base (especially on mobile).\n\nNext day: You lose a significant portion of potential revenue."
    },
    {
        "day": 24,
        "scenario": "The product owner requests a final UI review.\n\nYou discover inconsistent spacing, button behaviour and error messages.",
        "question": "What should you do?",
        "choice_a": "Document the inconsistencies and fix them systematically before release.",
        "choice_b": "Fix only the most visible issues.",
        "choice_c": "Ignore them because the functionality works technically.",
        "why": "UI consistency creates a polished, trustworthy product that users feel confident using.",
        "a_feedback": "Excellent!\n\nThe UI is consistent, professional, and builds trust with users.\n\nNext day: The product owner is thrilled with the polish.",
        "b_feedback": "Good, but minor inconsistencies still affect the overall feel of the product.\n\nNext day: Users notice the disjointed design.",
        "c_feedback": "Needs improvement.\n\nA messy UI reduces user trust, especially when asking for payment details.\n\nNext day: Conversion rates are low due to lack of trust."
    },
    {
        "day": 25,
        "scenario": "The frontend is ready for deployment.",
        "question": "What should you verify?",
        "choice_a": "Check environment configuration, API endpoints, build process, authentication flow and production settings.",
        "choice_b": "Build the application and deploy immediately without a checklist.",
        "choice_c": "Use development API settings in production.",
        "why": "Pre-deployment checks prevent critical configuration errors in production.",
        "a_feedback": "Excellent!\n\nYou verified all settings and ensured a smooth deployment path.\n\nNext day: The deployment process goes flawlessly.",
        "b_feedback": "Good, but skipping checks increases deployment risk significantly.\n\nNext day: You realize a feature flag was left on.",
        "c_feedback": "Needs improvement.\n\nUsing dev APIs in prod exposes internal systems and breaks functionality.\n\nNext day: Real users are creating test orders in your dev database."
    },
    {
        "day": 26,
        "scenario": "The application has been deployed.\n\nUsers report that some API requests still point to the development environment.",
        "question": "What should you investigate?",
        "choice_a": "Check environment variables/build configuration and verify the production API configuration.",
        "choice_b": "Change the API URL manually in the browser console for users who complain.",
        "choice_c": "Tell users to wait until it magically fixes itself.",
        "why": "Environment variables ensure the built app connects to the correct backend services.",
        "a_feedback": "Excellent!\n\nYou found a hardcoded fallback URL and fixed the environment variables.\n\nNext day: All traffic routes correctly to production APIs.",
        "b_feedback": "Good, but manual changes for a few users don't fix the app for everyone else.\n\nNext day: Thousands of users are still broken.",
        "c_feedback": "Needs improvement.\n\nUsers cannot continue with broken APIs; the app is functionally dead.\n\nNext day: A severe incident is declared."
    },
    {
        "day": 27,
        "scenario": "The production website is now receiving real customers.\n\nSuddenly, some users report that the cart becomes empty after refreshing the page.",
        "question": "What should you do first?",
        "choice_a": "Reproduce the issue, inspect persisted cart state and recent deployment changes.",
        "choice_b": "Ask users to add their products again.",
        "choice_c": "Clear everyone's browser storage remotely.",
        "why": "Production incidents require immediate investigation, reproduction, and evidence gathering.",
        "a_feedback": "Excellent!\n\nYou quickly reproduced the cart state issue locally by simulating a refresh.\n\nNext day: You are ready to develop a fix.",
        "b_feedback": "Good, but you need to find the root cause, not just offer a frustrating workaround.\n\nNext day: The issue keeps happening to new users.",
        "c_feedback": "Needs improvement.\n\nClearing storage affects all users negatively and destroys active sessions.\n\nNext day: Everyone gets logged out unexpectedly."
    },
    {
        "day": 28,
        "scenario": "Your investigation shows that a recent frontend change broke cart-state persistence.",
        "question": "What should you do?",
        "choice_a": "Identify the exact change, prepare a focused fix and test the cart flow before deployment.",
        "choice_b": "Roll back the entire application immediately.",
        "choice_c": "Modify production code directly via FTP without testing.",
        "why": "A focused fix is often better than a full rollback if the issue is isolated, but it must be tested thoroughly.",
        "a_feedback": "Excellent!\n\nYou prepared a safe, focused fix that restores cart persistence.\n\nNext day: The fix is ready for validation.",
        "b_feedback": "Good, a rollback is safe, but it removes other valid features deployed recently.\n\nNext day: The marketing team is upset their new banner was rolled back.",
        "c_feedback": "Needs improvement.\n\nModifying production code directly is incredibly dangerous.\n\nNext day: You introduce a syntax error and take down the entire site."
    },
    {
        "day": 29,
        "scenario": "The team has prepared a fix.\n\nBefore deploying, what should you do?",
        "choice_a": "Test the affected cart flow, related checkout flows and the important regression cases.",
        "choice_b": "Test only adding a product to the cart.",
        "choice_c": "Deploy immediately because customers are waiting.",
        "question": "What should you do?",
        "why": "Fixes must be validated to ensure they solve the issue and don't break related parts of the app.",
        "a_feedback": "Excellent!\n\nYou verified the fix safely without introducing regressions.\n\nNext day: The hotfix is deployed smoothly.",
        "b_feedback": "Good, but you missed regression testing for checkout, which relies on the cart.\n\nNext day: The cart works, but checkout is broken.",
        "c_feedback": "Needs improvement.\n\nUnvalidated fixes often cause new, worse production incidents.\n\nNext day: The hotfix breaks the payment gateway."
    },
    {
        "day": 30,
        "scenario": "The cart issue has been fixed.\n\nThe team has now verified:\n- Responsive UI\n- API integration\n- Authentication\n- Cart\n- Checkout\n- Payment flow\n- Accessibility\n- Browser compatibility\n- Performance\n- Automated tests\n- Production configuration\n- Incident fix\n\nThe project manager asks:\n\n\"Are we ready to approve the final frontend release?\"",
        "question": "Would you approve this release?",
        "choice_a": "Verify the release checklist, confirm critical flows and approve the release when all required criteria are satisfied.",
        "choice_b": "Approve the release while monitoring production closely.",
        "choice_c": "Approve immediately because the project deadline has arrived.",
        "why": "Final release approval requires confirming that all readiness criteria are met to ensure a safe launch.",
        "a_feedback": "🎉 Excellent!\n\nYou demonstrated strong frontend engineering behaviour across the entire 30-day project — requirements understanding, component design, API integration, UX, accessibility, performance, testing, deployment and production debugging.",
        "b_feedback": "👍 Good!\n\nYou were able to complete the project, but several decisions created additional work or risk. You should improve your planning, testing and production decision-making.",
        "c_feedback": "⚠️ Needs Improvement.\n\nYour decisions repeatedly increased technical risk and created additional problems for the team. More attention is needed to debugging, testing, maintainability and production safety."
    }
]

def seed_scenarios():
    db = SessionLocal()

    # Build the DAG backwards for Frontend
    next_max_id = None
    next_neutral_id = None
    next_negative_id = None

    domain_name = "Frontend"

    try:
        # Loop backwards from 29 (Day 30) down to 0 (Day 1)
        for i in range(29, -1, -1):
            day_data = days[i]
            day_number = i + 1
            
            nodes_to_create = []
            
            if day_number == 1:
                # Root node
                nodes_to_create.append({
                    "path": "root",
                    "prefix": ""
                })
            else:
                # Day > 1, create 3 variants based on previous day's feedback
                prev_day_data = days[i - 1]
                nodes_to_create.append({
                    "path": "max",
                    "prefix": prev_day_data["a_feedback"]
                })
                nodes_to_create.append({
                    "path": "neutral",
                    "prefix": prev_day_data["b_feedback"]
                })
                nodes_to_create.append({
                    "path": "negative",
                    "prefix": prev_day_data["c_feedback"]
                })

            current_day_ids = {}

            for node in nodes_to_create:
                raw_prefix = node["prefix"]
                prefix = ""
                if raw_prefix:
                    import re
                    prefix = re.sub(r'^(EXCELLENT DECISION|GOOD DECISION|RISKY DECISION)\s*', '', raw_prefix, flags=re.IGNORECASE)
                    prefix = re.sub(r'^Excellent!?\s*', '', prefix, flags=re.IGNORECASE)
                    prefix = re.sub(r'^Good[^\n]*\n', '', prefix, flags=re.IGNORECASE)
                    prefix = re.sub(r'^Good[^\.]*\.\s*', '', prefix, flags=re.IGNORECASE)
                    prefix = re.sub(r'^Needs Improvement\.?\s*', '', prefix, flags=re.IGNORECASE)
                    prefix = re.sub(r'^🎉 Excellent!\s*', '', prefix, flags=re.IGNORECASE)
                    prefix = re.sub(r'^👍 Good!\s*', '', prefix, flags=re.IGNORECASE)
                    prefix = re.sub(r'^⚠️ Needs Improvement\.\s*', '', prefix, flags=re.IGNORECASE)
                    prefix = prefix.strip()
                    
                scenario_text = f"{prefix}\n\n{day_data['scenario']}".strip() if prefix else day_data['scenario']
                
                db_scenario = DailyScenario(
                    domain=domain_name,
                    day_number=day_number,
                    step_number=1,
                    scenario_text=scenario_text,
                    question_text=day_data["question"],
                    
                    choice_a_text=day_data["choice_a"],
                    choice_a_feedback_type="Excellent",
                    choice_a_reason=f"{day_data['why']}\n\n{day_data['a_feedback']}",
                    choice_a_next_scenario_id=next_max_id,
                    
                    choice_b_text=day_data["choice_b"],
                    choice_b_feedback_type="Good",
                    choice_b_reason=f"{day_data['why']}\n\n{day_data['b_feedback']}",
                    choice_b_next_scenario_id=next_neutral_id,
                    
                    choice_c_text=day_data["choice_c"],
                    choice_c_feedback_type="Needs Improvement",
                    choice_c_reason=f"{day_data['why']}\n\n{day_data['c_feedback']}",
                    choice_c_next_scenario_id=next_negative_id,
                    
                    is_active=True
                )
                db.add(db_scenario)
                db.flush() 
                
                current_day_ids[node["path"]] = db_scenario.id
            
            if day_number > 1:
                next_max_id = current_day_ids["max"]
                next_neutral_id = current_day_ids["neutral"]
                next_negative_id = current_day_ids["negative"]

        db.commit()
        print("Successfully seeded the 30-day Frontend Intern DAG!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding frontend scenarios: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_scenarios()
