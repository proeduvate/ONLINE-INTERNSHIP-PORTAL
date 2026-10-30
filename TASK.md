# ProEduvate — Agent Execution Task Plan

> **Purpose:** Complete and stabilize the existing ProEduvate Online Internship Portal against `ProEduvate_Feature_Documentation_v2.pdf`.
>
> **Execution environment:** Run this plan inside the existing project workspace in Antigravity. The agent must inspect the repository directly; the user does not need to upload the entire project.
>
> **Primary rule:** Audit first, plan second, implement incrementally, and verify with evidence. Do not blindly rebuild the application.

---

## 1. Mission and Definition of Success

ProEduvate is an AI-powered online internship portal for three roles:

- **Admin** — manages the platform, users, curriculum, monitoring, certificates, and configuration.
- **Mentor** — supports and evaluates assigned interns, reviews submissions, communicates with interns, and hosts meetings.
- **Intern** — follows a structured 30-day learning path, completes assessments and tasks, receives feedback, tracks progress, and accesses approved credentials.

The goal is to bring the **existing application** into alignment with the feature documentation while preserving working functionality and the project's established technology choices where practical.

The project is complete only when:
1. The repository has been audited and the current state of every documented feature is recorded.
2. Required features are implemented or explicitly documented as blocked, deferred, or requiring a product decision.
3. Role-based access is enforced in the backend/API as well as the UI.
4. Relevant automated checks pass, and important workflows are manually or end-to-end verified where possible.
5. Documentation, configuration examples, and setup instructions reflect the implemented behavior.
6. The final report distinguishes verified completion from assumptions and unverified behavior.

## 2. Source of Truth and Requirement Handling

### Required product specification

Use the user's `ProEduvate_Feature_Documentation_v2.pdf` as the source of truth for product requirements. It is a 9-page document organized as follows:

- **Pages 2–5 — Part A: General Features**
  - A1 Authentication & Session Security
  - A2 User Management & Onboarding
  - A3 User Profile
  - A4 Role-Based Access Control
  - A5 Dashboards & KPIs
  - A6 Learning Management
  - A7 Task Management
  - A8 Assessments & Submissions
  - A9 Attendance Tracking
  - A10 Communication & Notifications
  - A11 Support & Help Ticketing
  - A12 Admin Operations
  - A13 Portfolio & Progress Records
- **Pages 6–7 — Part B: Main Features / USPs**
  - B1 AI Code Evaluation Engine
  - B2 Real-World Workplace Simulations
  - B3 Hybrid Scoring & Grading
  - B4 Dynamic Certificate Engine & Admin Clearance Gate
  - B5 Native WebRTC Video Conferencing & Breakout Rooms
  - B6 At-Risk Intern Early Warning System
  - B7 Domain Radar & Zero-Drop Leaderboard
  - B8 Spontaneous Bonus Airdrop Engine
- **Pages 8–9 — Role-Based Feature Matrix** for Admin, Mentor, and Intern.

### Rules for handling ambiguity

- Do not silently invent product requirements that are absent from the PDF.
- Preserve the terminology and intended behavior in the PDF.
- When the PDF does not specify a necessary implementation detail (for example, exact score weights, grade boundaries, attendance rules, or risk thresholds beyond those stated), inspect the current implementation and document the ambiguity.
- Do not silently choose business rules that materially affect scores, access, certificates, or attendance. If no safe existing rule can be found, record a clear decision needed and implement only non-controversial surrounding work.
- Do not claim that an external service, AI model, code runner, WebRTC connection, email delivery, or PDF pipeline works unless it has been configured and verified.
- If the PDF appears internally ambiguous or conflicts with existing behavior, record the conflict and ask for a decision when it cannot be resolved from the source material. Do not quietly rewrite the specification.

## 3. Non-Negotiable Engineering Rules

1. **Do not start by rewriting the application.** Inspect first and retain working components.
2. **Do not replace the existing stack** or introduce a new framework/database/service without a demonstrated need and a documented rationale.
3. **Do not delete existing features, migrations, data, routes, or configuration** merely to simplify implementation.
4. **Do not perform destructive database operations** or reset user data as part of routine development.
5. **Never expose secrets.** Do not print, commit, or copy `.env` credentials, API keys, tokens, private keys, or production secrets. Use environment variable names and safe example values only.
6. **Do not weaken authentication, authorization, validation, or certificate checks** to make a workflow pass.
7. **Enforce authorization server-side.** Hiding a button or page is not access control.
8. **Validate all untrusted input**, uploaded files, task submissions, and user-controlled identifiers at the appropriate boundaries.
9. **Use safe database access** through the project's existing ORM/query conventions and parameterized queries.
10. **Keep changes small and reviewable.** Implement in phases and avoid unrelated refactors.
11. **Add or update tests** for behavior changed. Do not delete failing tests simply to achieve a green run.
12. **Do not fake integrations.** If a provider or service is unavailable, provide an honest, explicit configuration/error state rather than presenting mock results as real.
13. **Do not claim tests passed** unless the command was actually run and its result checked.
14. **Preserve existing local changes.** Before editing, inspect Git status and avoid overwriting work that may belong to the user.
15. **Keep this file updated.** Mark tasks `DONE` only with verification evidence; use `IN PROGRESS`, `BLOCKED`, or `NEEDS DECISION` honestly.

## 4. Phase 0 — Repository Discovery and Baseline

Complete this phase before feature implementation.

### T0.1 — Inspect repository safely
- [x] Check the repository root, Git status, active branch, and existing uncommitted changes.
- [ ] Identify monorepo/workspace layout and application entry points.
- [ ] Read README files, existing `AGENTS.md`, task plans, architecture docs, and contributor instructions.
- [ ] Identify frontend, backend/API, database, background jobs, file storage, real-time services, and deployment configuration.
- [ ] Identify existing test commands, lint/type-check/build commands, and migrations.
- [ ] Do not print secrets from environment files.

**Acceptance criteria:** A repository map exists; user changes are preserved; no code has been modified solely to conduct discovery.

### T0.2 — Identify actual stack and architecture
- [x] Record languages, frameworks, package managers, database/ORM, authentication mechanism, storage provider, and deployment approach.
- [ ] Map key routes/pages, API endpoints, data models, services, background jobs, and real-time communication paths.
- [ ] Identify existing integrations for AI evaluation/code execution, PDF generation, WebRTC, notifications, and charts.
- [ ] Record environment variables by name and purpose only, without values.
- [ ] Identify duplicated logic, dead code, incomplete stubs, unsafe shortcuts, and inconsistent patterns.

**Acceptance criteria:** Findings reference actual files/modules and distinguish confirmed issues from suspicions.

### T0.3 — Establish a baseline
- [x] Run existing tests, lint, type checks, and production build where feasible.
- [ ] Record commands, outcomes, and known pre-existing failures.
- [ ] Inspect application startup and the main Admin, Mentor, and Intern journeys where feasible.
- [ ] Do not “fix” unrelated baseline failures without recording them and considering impact.

**Acceptance criteria:** A baseline report lists pass/fail/blocked checks and separates pre-existing failures from later regressions.

### T0.4 — Create a feature audit matrix
For each requirement in Sections 5 and 6, assign exactly one initial state:

- `IMPLEMENTED` — code and behavior are present; verification evidence exists.
- `PARTIAL` — some behavior exists but requirements are missing or incorrect.
- `MISSING` — no meaningful implementation exists.
- `BROKEN` — implementation exists but does not work as required.
- `BLOCKED` — cannot proceed due to missing dependency, credentials, infrastructure, or decision.
- `NEEDS DECISION` — the PDF leaves a material business rule ambiguous.

For each item, record:
- Evidence: relevant file paths, routes, API endpoints, model/schema, and tests.
- Gap: difference between actual behavior and required behavior.
- Dependencies and risks.
- Proposed minimal change.
- Verification plan.

**Acceptance criteria:** Every requirement ID in this file has an initial status and evidence or an explicit explanation of why evidence is unavailable.

## 5. Part A — General Feature Requirements

### A1 — Authentication & Session Security
- [x] A1.1 Support authenticated Admin, Mentor, and Intern accounts using the project's existing authentication architecture.
- [x] A1.2 Verify credentials securely and enforce controlled session lifetime and sign-out.
- [x] A1.3 Validate user input and uploads before persistence.
- [x] A1.4 Protect intern data, scores, credentials, and session information.
- [x] A1.5 Reject unauthenticated access to protected pages and APIs.
- [x] A1.6 Test invalid credentials, expired/ended sessions where applicable, sign-out, and unauthorized requests.

**Acceptance criteria:** Authentication behavior is verified; protected APIs cannot be accessed without valid authentication; secrets and credentials are not exposed.

### A2 — User Management & Onboarding
- [x] A2.1 Support Admin onboarding of interns after interview selection.
- [x] A2.2 Assign each intern to a learning domain.
- [x] A2.3 Assign each intern a mentor.
- [x] A2.4 Generate a unique intern ID and prevent collisions.
- [x] A2.5 Track start date, end date, and internship duration.
- [x] A2.6 Support Admin management of interns, mentors, and domains as specified.

**Acceptance criteria:** Valid onboarding data is persisted consistently; duplicate/invalid assignments are rejected or handled clearly; the assigned mentor/domain and duration appear in the correct views.

### A3 — User Profile
- [x] A3.1 Provide the intern's name and unique intern ID.
- [x] A3.2 Show college, allocated domain, internship start/end dates, and assigned mentor.
- [x] A3.3 Show curriculum progress percentage and completed task count.
- [x] A3.4 Show attendance percentage derived from the application's defined task-submission attendance rule.
- [x] A3.5 Ensure progress figures are derived from reliable records rather than manually inconsistent UI values.

**Acceptance criteria:** Profile values match the underlying data and calculation rules; users cannot view or edit other users' private profile data beyond their role permissions.

### A4 — Role-Based Access Control
- [x] A4.1 Admin: full platform administration, user/domain management, task and material creation, cohort oversight, analytics, certificate and meeting management, and platform configuration.
- [x] A4.2 Mentor: access only assigned interns; review submissions; provide feedback and mentor scores; manage permitted meetings/breakout rooms; message assigned interns; track their performance and attendance.
- [x] A4.3 Intern: access own profile, daily content, MCQs, coding tasks, evaluations, scores, progress, attendance, mentor chat, meetings, and approved certificate.
- [x] A4.4 Prevent mentors from creating domains, adding interns, changing platform settings, or accessing interns outside their assigned group.
- [x] A4.5 Prevent interns from modifying tasks, viewing/messaging other interns, changing scores, or manually unlocking future tasks.
- [x] A4.6 Enforce permissions in server-side routes/services and test direct API calls as well as UI navigation.
- [x] A4.7 Follow the detailed role matrix in Section 7.

**Acceptance criteria:** Permission tests cover allowed and denied operations for all three roles. Direct URL/API access cannot bypass role or ownership checks.

### A5 — Dashboards & KPIs
- [ ] A5.1 Admin Executive Summary: total interns with active breakdown, total mentors across domains, active learning domains, and overall cohort average performance.
- [ ] A5.2 Mentor Command Center: assigned interns, pending review backlog, meetings scheduled today, and assigned cohort average performance.
- [x] A5.3 Intern Progression Bar: tasks completed out of 30, assessments completed out of 30, overall attendance, and aggregate overall score on the journey banner.
- [x] A5.4 Apply role-appropriate data scoping and sensible empty/loading/error states.
- [x] A5.5 Ensure KPI calculations are consistent with the source records and scoring rules.

**Acceptance criteria:** Dashboard values reconcile with source data and respect role boundaries; empty cohorts do not cause errors or misleading figures.

### A6 — Learning Management
- [x] A6.1 Deliver domain-specific curriculum day by day.
- [x] A6.2 Implement a sequential 30-day path with `CURRENT`, `LOCKED`, and `COMPLETED` states.
- [x] A6.3 Prevent skipping foundations or accessing locked future-day content through direct API/URL requests.
- [x] A6.4 Support learning materials including videos, documents, notes, PDF lecture notes, and Word practice files, consistent with existing infrastructure.
- [x] A6.5 Display clear learning outcomes for each daily module.
- [x] A6.6 Display mentor tips and milestone countdowns, including the Day 15 midterm milestone.
- [ ] A6.7 Admin can publish/manage curriculum content; Mentor and Admin have the documented view-only curriculum access unless another explicit permission applies.

**Acceptance criteria:** Day state is derived from persisted progress and validated completion; locked material cannot be retrieved by bypassing the UI.

### A7 — Task Management
- [x] A7.1 Support daily task assignment/release for the 30-day programme.
- [x] A7.2 Unlock the next task only after the previous day has been completed and validated.
- [x] A7.3 Store a due date for each task and display it.
- [x] A7.4 Support the documented status progression: `Not started` → `In progress` → `Submitted` → `Approved`.
- [ ] A7.5 Admin creates/publishes tasks; interns cannot modify task definitions or manually unlock future tasks.
- [ ] A7.6 Handle retries, duplicate submissions, and out-of-order state transitions safely according to existing business rules.

**Acceptance criteria:** Server-side transition and unlock rules are tested; status cannot be advanced by an unauthorized or invalid request.

### A8 — Assessments & Submissions
- [x] A8.1 Provide daily MCQ knowledge checks tied to the day's module.
- [x] A8.2 Support coding assignment submissions through the portal.
- [x] A8.3 Support domain-based practical evaluation tasks.
- [ ] A8.4 Support weekly mentor reviews and recording of assessment/feedback.
- [x] A8.5 Validate submission payloads and uploaded files; persist submission history.
- [ ] A8.6 Ensure mentors can review only submissions belonging to their assigned interns.

**Acceptance criteria:** Assessment attempts and submissions are persisted; validation failures are safe and understandable; review permissions are tested.

### A9 — Attendance Tracking
- [x] A9.1 Record attendance automatically from actual task submission, not manual attendance entry.
- [x] A9.2 Keep a day-by-day attendance log for each intern.
- [x] A9.3 Calculate attendance percentage continuously and display it on the profile/dashboard.
- [ ] A9.4 Identify missed days automatically.
- [ ] A9.5 Make the attendance calculation rule explicit and consistent across the app. If the PDF does not define edge cases (late submissions, weekends, extensions, or waived tasks), inspect existing behavior and flag unresolved decisions.

**Acceptance criteria:** Attendance records are reproducible from source events and do not double-count retries or duplicate submissions; calculation edge cases are documented.

### A10 — Communication & Notifications
- [x] A10.1 Support real-time one-to-one Mentor–Intern messaging.
- [x] A10.2 Show online status where supported by the architecture.
- [x] A10.3 Support file sharing with validation and safe access controls.
- [x] A10.4 Support platform announcements and event alerts.
- [x] A10.5 Support mentor scheduling of review and doubt-clearing sessions.
- [x] A10.6 Prevent interns from messaging other interns.
- [x] A10.7 Ensure only authorized participants can read a conversation or download its attachments.

**Acceptance criteria:** Messaging and attachment permissions are tested; realtime failure/reconnect behavior is handled gracefully where applicable.

### A11 — Support & Help Ticketing
- [x] A11.1 Allow interns to raise tickets for curriculum issues, platform bugs, and environment blockers.
- [x] A11.2 Provide `All`, `Active`, and `Resolved` history views.
- [x] A11.3 Display ticket IDs, timestamps, and response threads.
- [x] A11.4 Provide a shared inbox for Admin and Mentor panels without requiring a third-party email tool.
- [x] A11.5 Apply documented role access: Admin full management, Mentor cohort tickets, Intern create/view own tickets and threads.

**Acceptance criteria:** Ticket lifecycle and visibility rules are tested; users cannot read or modify tickets outside their authorization.

### A12 — Admin Operations
- [ ] A12.1 Support Admin create/edit/allocate/remove operations for interns, mentors, and domains.
- [ ] A12.2 Support task creation and curriculum/material uploads.
- [ ] A12.3 Provide reports and monitoring for platform users.
- [ ] A12.4 Provide certificate controls in accordance with B4.
- [ ] A12.5 Validate administrative changes and prevent accidental destructive operations.

**Acceptance criteria:** Admin workflows persist correctly, unauthorized roles are denied, and destructive actions have appropriate safeguards.

### A13 — Portfolio & Progress Records
- [ ] A13.1 Store task history and submission archives.
- [ ] A13.2 Generate a portfolio from the intern's work.
- [ ] A13.3 Provide a skill showcase and performance record summarizing skills and internship results.
- [ ] A13.4 Apply role visibility: Admin/Mentor can view as permitted; Intern sees their own portfolio.

**Acceptance criteria:** Portfolio records reflect persisted work and scores, handle empty histories, and obey ownership/role access rules.

## 6. Part B — Main Features / USPs

### B1 — AI Code Evaluation Engine
- [x] B1.1 Analyze coding submissions automatically to reduce manual first-pass marking.
- [x] B1.2 Run submissions against configured test cases for correctness, using the project's existing code-execution integration or a safe supported runner.
- [x] B1.3 Evaluate code structure, logic, and quality—not output alone.
- [x] B1.4 Analyze performance/efficiency where technically supported.
- [x] B1.5 Persist and display AI feedback and an AI score for each submission.
- [x] B1.6 Keep optional plagiarism detection explicitly optional unless already configured and supported.
- [x] B1.7 Apply strict time/resource limits, validate language/runtime selection, and isolate untrusted code. Never execute arbitrary submissions directly on the web application host without a safe sandbox.
- [x] B1.8 Handle model/provider errors, timeouts, malformed responses, and unavailable code runners without fabricating scores.

**Acceptance criteria:** Correct and incorrect test-case examples are verified; results and feedback are traceable to a submission; untrusted code is isolated; provider failures are visible and do not create false success.

### B2 — Real-World Workplace Simulation Engine
- [x] B2.1 Present contextual engineering dilemmas that mirror workplace situations, rather than only simple quizzes.
- [x] B2.2 Allow interns to weigh/choose trade-off options before writing code where the scenario requires it.
- [x] B2.3 After a decision is submitted, reveal engineering rationale and industry-practice feedback.
- [x] B2.4 Release one new scenario each midnight, as specified by the product document, and track active streaks.
- [x] B2.5 Make release timing timezone-aware and deterministic; inspect existing product timezone conventions before implementation.
- [x] B2.6 Prevent direct access to unreleased scenarios or duplicate point awards.

**Acceptance criteria:** Scenario release, answer persistence, feedback unlock, streak behavior, and duplicate-submission handling are tested. Unspecified streak/late-answer rules are documented for decision if necessary.

### B3 — Hybrid Scoring & Grading
- [x] B3.1 Represent MCQ score, AI evaluation score, and mentor score as separate components.
- [x] B3.2 Combine components into a final score using a single, documented calculation.
- [x] B3.3 Assign grades `A+`, `A`, `B+`, `B`, and `C` with a performance classification.
- [x] B3.4 Block credential compilation for interns scoring below 45%.
- [x] B3.5 Display score components and final result transparently to authorized users.
- [x] B3.6 Do not invent component weights or grade boundaries if the existing system/documentation does not define them. Find existing rules; otherwise mark `NEEDS DECISION` and ask the product owner before finalizing those business rules.
- [x] B3.7 Validate score ranges, missing components, recalculation, and rounding behavior.

**Acceptance criteria:** Calculation is centralized and tested with representative inputs, boundary values, missing scores, and the below-45% certificate restriction. Weighting and grade thresholds have documented sources or explicit approval.

### B4 — Dynamic Certificate Engine & Admin Clearance Gate
- [x] B4.1 Generate high-resolution landscape A4 PDF certificates from database records; the PDF names ReportLab and Pillow as the intended tools for the certificate pipeline.
- [x] B4.2 Use an auto-scaling font/layout method so names and track titles do not clip or shift.
- [x] B4.3 Generate a unique certificate ID and provide completion verification.
- [x] B4.4 Implement the two-stage Admin clearance gate: certificates remain locked for the intern until Admin approves them in the Credentials interface.
- [x] B4.5 Enforce the gate on the server: unapproved credentials requested directly by URL/API return HTTP `403 Forbidden`.
- [x] B4.6 Approved credentials can provide a direct LinkedIn URL for adding the accomplishment.
- [x] B4.7 Integrate the below-45% score threshold from B3.
- [x] B4.8 Prevent ID collisions, unauthorized approval/revocation, and access to another intern's certificate.

**Acceptance criteria:** Generated PDFs are visually checked with long names/titles; certificate IDs are unique; unapproved direct download attempts return 403; approved downloads and verification behave correctly; the score gate is enforced server-side.

### B5 — Native WebRTC Video Conferencing & Breakout Rooms
- [x] B5.1 Support in-platform standups, mentor reviews, and doubt-clearing sessions without requiring Zoom or Google Meet.
- [x] B5.2 Support video, audio, screen sharing, and in-meeting chat where the current stack/browser permissions allow.
- [x] B5.3 Implement or repair the WebSocket signaling gateway at `/ws/rooms/{room_id}` using the project's established protocol.
- [x] B5.4 Support signaling events for WebRTC offer, answer, candidate, and peer ID as documented.
- [x] B5.5 Support dynamic isolated breakout sub-rooms for pair programming/group problem solving.
- [x] B5.6 Support weekly review and doubt-clarification sessions.
- [x] B5.7 Enforce room membership and role permissions server-side; prevent cross-room event leakage.
- [x] B5.8 Inspect existing STUN/TURN and deployment configuration. Do not claim production readiness without testing across realistic network conditions; document required infrastructure.

**Acceptance criteria:** Authorized participants can join and communicate in a test environment; signaling events are validated; breakout isolation and unauthorized access are tested; external network/TURN limitations are documented.

### B6 — At-Risk Intern Early Warning System
- [x] B6.1 Continuously or periodically evaluate intern velocity against engagement thresholds, using the project's existing job/scheduler pattern.
- [x] B6.2 Flag curriculum completion below 20% as specified.
- [x] B6.3 Flag attendance drops according to a defined threshold (<70%). The PDF does not give the numeric attendance threshold; locate an existing rule or mark `NEEDS DECISION`.
- [x] B6.4 Display warnings on the Mentor Dashboard.
- [x] B6.5 Provide a one-click way for the mentor to message the flagged intern.
- [x] B6.6 Scope mentor warnings to assigned interns and provide Admin aggregate visibility.
- [x] B6.7 Avoid duplicate/stale alerts and document the evaluation cadence.

**Acceptance criteria:** Test data below/above thresholds produces expected risk states; mentor ownership is enforced; intervention links target the correct intern.

### B7 — Domain Radar & Zero-Drop Leaderboard
- [x] B7.1 Provide an eight-axis radar for Data Science, Frontend, Artificial Intelligence, Cyber Security, Fullstack, Python, UI/UX, and Java.
- [x] B7.2 Include newly enrolled interns with zero points in rankings; use safe joins/aggregation so zero-score users are not dropped.
- [x] B7.3 Support filtering by the named institution batches: Berkeley, Harvard, IIT, MIT, and Stanford.
- [x] B7.4 Support `Weekly` and `All-Time` views.
- [x] B7.5 Respect access matrix: Admin global view, Mentor no domain radar, Intern peer ranking view.
- [x] B7.6 Define how skill-axis scores are calculated from persisted evidence; reuse existing logic or flag missing business rules rather than inventing scores.

**Acceptance criteria:** Tests cover zero-score/new users, empty cohorts, ties, date windows, batch filters, and role visibility. Radar labels match the eight domains.

### B8 — Spontaneous Bonus Airdrop Engine
- [x] B8.1 Support surprise bonus technical challenges outside the routine curriculum.
- [x] B8.2 Feed earned bonus points into standings and skill radar ratings in a consistent way.
- [x] B8.3 Provide filterable active/completed airdrop history in all three role views, respecting role-specific permissions.
- [x] B8.4 Support Admin release/provision, Mentor monitoring, and Intern execution/claiming.
- [x] B8.5 Prevent duplicate claims and duplicate point awards; validate eligibility and challenge state.
- [x] B8.6 Keep bonus point effects consistent with leaderboard, radar, and scoring rules; document any ambiguity.

**Acceptance criteria:** A challenge can be released, claimed/completed under valid conditions, and reflected once in relevant score/ranking views; unauthorized or duplicate claims are rejected.

## 7. Role-Based Feature Matrix — Required Authorization Summary

Use this as a minimum authorization checklist. More restrictive access is acceptable only when it does not contradict the documented product behavior; do not silently grant broader access.

| Capability | Admin | Mentor | Intern |
|---|---|---|---|
| Login/authentication | Yes | Yes | Yes |
| User profile | Manage all | Assigned interns | Own profile |
| Intern/mentor/domain management | Full control | No | No |
| Task creation/curriculum upload | Yes | No | No |
| Executive KPI dashboard | Yes | Yes | Yes |
| 30-day curriculum | View only | View only | Access and complete |
| Download notes/practice files | View only | View only | Yes |
| Daily MCQs/coding submissions | Monitor | Review | Attempt/submit |
| Attendance | All interns | Assigned interns | Own record |
| 1-on-1 chat | Audit | Yes | Mentor only |
| Support/help ticketing | Full management | Cohort tickets | File/view own tickets |
| Batch progress trends | Yes | No | No |
| Review backlog tracker | No | Yes | No |
| Portfolio/progress records | View | View as permitted | Own portfolio |
| AI code evaluation | Monitor | Review and add mentor score | View AI score/feedback |
| Workplace simulations | Audit | Audit | Interactive decisions |
| Hybrid scoring | Oversee | Mentor score input | View scores |
| Certificate compilation | System/admin oversight | Grade input | Download when approved |
| Certificate clearance | Approve/revoke | View status | View status/locked |
| Native WebRTC breakout rooms | Monitor | Host/create | Participant |
| At-risk early warning | Aggregate view | Direct action panel | No |
| Eight-axis domain radar | Yes | No | Not specified as a radar view |
| Zero-drop leaderboard | Global view | Cohort view | Peer ranking view |
| Bonus airdrop engine | Release/provision | Monitor | Execute/claim |

**Important:** Where Part A and Part B describe a role differently or incompletely, record the interpretation and test it explicitly. Do not infer broad permissions from a frontend view.

## 8. Cross-Cutting Quality Requirements

### Security and privacy
- [ ] Authentication and role/ownership checks on every protected server-side operation.
- [ ] Input validation and safe error handling.
- [ ] Safe file upload/download validation and access control.
- [ ] No secrets in source control, logs, browser bundles, or generated reports.
- [ ] Rate limiting or abuse controls for sensitive endpoints where appropriate to the existing stack.
- [ ] Safe handling of user-generated content and AI output.
- [ ] Secure sandboxing of code execution; never run untrusted submissions with unrestricted host privileges.
- [ ] Audit important administrative actions such as role changes and certificate approval/revocation when the current architecture supports audit logging.

### Data integrity
- [ ] Define a reliable source of truth for task states, submission records, scores, attendance, certificates, leaderboard points, and airdrop claims.
- [ ] Use transactions/constraints or equivalent protections for multi-step updates and unique identifiers.
- [ ] Make repeated requests safe where duplicate actions could double-award points, double-count attendance, or generate duplicate certificates.
- [ ] Add migrations using the existing migration mechanism; do not reset production data.
- [ ] Keep calculated values consistent across dashboards, profiles, leaderboards, and certificate output.

### Reliability and UX
- [ ] Loading, empty, success, and error states for important views.
- [ ] Clear validation messages without leaking internals.
- [ ] Responsive layouts and accessible form/control behavior where the current UI supports it.
- [ ] Avoid unnecessary polling and expensive repeated calculations.
- [ ] Use the existing logging/observability patterns and avoid logging sensitive information.

### Testing
- [ ] Unit tests for score, grade, attendance, risk, unlock, leaderboard, and certificate eligibility rules.
- [ ] API/integration tests for authentication, authorization, onboarding, submissions, ticketing, messaging, and certificate gates.
- [ ] UI or end-to-end tests for high-value journeys where supported.
- [ ] Regression tests for each bug fixed.
- [ ] Build, lint, and type checks according to the existing stack.

## 9. Suggested Implementation Order

Do not follow this order blindly if the repository reveals a safer dependency order. Update it with evidence after Phase 0.

### Phase 1 — Stabilization and core foundations
- [x] P1.1 Fix baseline build/startup blockers that prevent safe testing.
- [x] P1.2 Resolve critical authentication, authorization, data-integrity, and security defects.
- [x] P1.3 Ensure schema/migrations and core entities for users, roles, domains, assignments, curriculum, tasks, submissions, and sessions are consistent.
- [x] P1.4 Add/repair shared validation and error-handling patterns.

### Phase 2 — Core internship lifecycle
- [x] P2.1 Admin user/domain onboarding and mentor assignment.
- [x] P2.2 Profiles and role-specific dashboards.
- [x] P2.3 30-day curriculum and task locking/unlocking.
- [x] P2.4 MCQs, coding/practical submissions, mentor reviews, and submission history.
- [x] P2.5 Attendance and progress calculations.
- [x] P2.6 Portfolio and performance records.

### Phase 3 — Collaboration and operations
- [x] P3.1 Mentor–Intern messaging, announcements, notifications, and file sharing.
- [x] P3.2 Meeting scheduling and support ticket lifecycle.
- [x] P3.3 Admin reports, monitoring, and operational workflows.

### Phase 4 — Evaluation, scoring, and credentials
- [x] P4.1 Safe test-case execution and AI code feedback.
- [x] P4.2 Hybrid score calculation, grade assignment, and score visibility.
- [x] P4.3 Certificate PDF generation, verification, Admin approval/revocation, and server-side download gate.
- [x] P4.4 Tests for all scoring boundaries and certificate eligibility.

### Phase 5 — Differentiating features
- [x] P5.1 Workplace simulation scenarios and daily release.
- [x] P5.2 At-risk early warning and mentor intervention.
- [x] P5.3 Domain radar and zero-drop leaderboard.
- [x] P5.4 Bonus airdrop lifecycle and point integration.
- [x] P5.5 Native WebRTC rooms, signaling, and breakout isolation.

### Phase 6 — Final verification
- [x] P6.1 Run all available automated checks.
- [x] P6.2 Run role-based workflow tests.
- [ ] P6.3 Reconcile all feature audit items against the PDF.
- [x] P6.4 Review security-sensitive routes and direct API access.
- [ ] P6.5 Update setup/configuration/documentation and prepare final report.

## 10. Required Workflow for the Agent

For every implementation task:

1. **Read:** inspect the relevant code, tests, data model, and existing conventions.
2. **Compare:** state the observed behavior and the exact requirement gap.
3. **Plan:** identify the smallest safe set of changes and dependencies.
4. **Implement:** make focused changes; avoid unrelated refactoring.
5. **Test:** run targeted tests and add regression coverage.
6. **Inspect:** review the diff for security, data integrity, role access, accidental scope changes, and secrets.
7. **Record:** update task status with file references and actual verification results.
8. **Continue:** move to the next dependency-ready task only when the current one is verified or explicitly blocked.

If a task is blocked:
- Record the blocker and evidence.
- Continue independent tasks where safe.
- Do not fabricate credentials, services, data, test outcomes, or integrations.
- Do not silently skip the requirement.

If a product decision is needed:
- Explain the exact ambiguity, the affected behavior, and the options.
- Avoid implementing a consequential guessed business rule.
- Continue non-dependent work.

## 11. Completion Checklist

- [ ] Every A1–A13 requirement has a final status.
- [ ] Every B1–B8 requirement has a final status.
- [ ] The role-based feature matrix has been checked against actual API/server permissions.
- [ ] All high-severity security issues found during the audit are fixed or explicitly blocked with mitigation.
- [ ] Relevant tests exist and have been run; outcomes are recorded accurately.
- [ ] Build, lint, and type-check results are recorded where available.
- [ ] No known regression is hidden or ignored.
- [ ] Database migrations and environment configuration instructions are documented.
- [ ] No secrets or user data were added to source control or reports.
- [ ] All blocked items and product decisions are listed in the final report.

A task is **not** complete merely because code was written. It is complete when its acceptance criteria are satisfied and the evidence is recorded.

## 12. Final Report Format

At the end of the work, produce a concise but evidence-based report containing:

1. **Summary:** overall result and major changes.
2. **Feature audit:** table of each A1–A13 and B1–B8 item with final status.
3. **Files changed:** key paths and reason for each significant change.
4. **Verification:** exact commands run and pass/fail results.
5. **Security/access control:** critical findings and verification performed.
6. **Database/configuration:** migrations, new environment variable names, and setup steps (never values of secrets).
7. **Known limitations:** blocked items, external services not configured, and unverified workflows.
8. **Decisions needed:** business rules requiring product-owner input.
9. **Recommended next steps:** only items genuinely remaining.

Use these final status labels: `DONE`, `PARTIAL`, `BLOCKED`, `NEEDS DECISION`, `NOT STARTED`.

---

## 13. Start Here

**First action:** perform Phase 0 only. Do not start a broad rewrite or implement all features in one unreviewed batch.

After the audit, summarize:
- repository architecture,
- baseline test/build status,
- current status of every feature group,
- highest-risk issues,
- dependencies and ambiguous business rules,
- proposed implementation sequence.

Then proceed in small, dependency-ordered batches, updating this file and validating each batch before moving on.

**Product reference:** `ProEduvate_Feature_Documentation_v2.pdf` — October 2026, 9 pages.
