from pathlib import Path

task_file = Path("TASK.md")
content = task_file.read_text(encoding="utf-8")

# Phase 0 items
content = content.replace("- [ ] Check the repository root, Git status", "- [x] Check the repository root, Git status")
content = content.replace("- [ ] Record languages, frameworks, package managers", "- [x] Record languages, frameworks, package managers")
content = content.replace("- [ ] Run existing tests, lint, type checks", "- [x] Run existing tests, lint, type checks")
content = content.replace("- [ ] Create a feature audit matrix", "- [x] Create a feature audit matrix")

# Phase 1 items
content = content.replace("- [ ] P1.1 Fix baseline build/startup blockers that prevent safe testing.", "- [x] P1.1 Fix baseline build/startup blockers that prevent safe testing.")
content = content.replace("- [ ] P1.2 Resolve critical authentication, authorization, data-integrity, and security defects.", "- [x] P1.2 Resolve critical authentication, authorization, data-integrity, and security defects.")
content = content.replace("- [ ] P1.3 Ensure schema/migrations and core entities for users, roles, domains, assignments, curriculum, tasks, submissions, and sessions are consistent.", "- [x] P1.3 Ensure schema/migrations and core entities for users, roles, domains, assignments, curriculum, tasks, submissions, and sessions are consistent.")
content = content.replace("- [ ] P1.4 Add/repair shared validation and error-handling patterns.", "- [x] P1.4 Add/repair shared validation and error-handling patterns.")

# B4 Dynamic Certificate Engine
content = content.replace("- [ ] B4.1 Generate high-resolution landscape A4 PDF certificates", "- [x] B4.1 Generate high-resolution landscape A4 PDF certificates")
content = content.replace("- [ ] B4.2 Use an auto-scaling font/layout method so names and track titles do not clip or shift.", "- [x] B4.2 Use an auto-scaling font/layout method so names and track titles do not clip or shift.")
content = content.replace("- [ ] B4.4 Implement the two-stage Admin clearance gate: certificates remain locked for the intern until Admin approves them in the Credentials interface.", "- [x] B4.4 Implement the two-stage Admin clearance gate: certificates remain locked for the intern until Admin approves them in the Credentials interface.")
content = content.replace("- [ ] B4.5 Enforce the gate on the server: unapproved credentials requested directly by URL/API return HTTP `403 Forbidden`.", "- [x] B4.5 Enforce the gate on the server: unapproved credentials requested directly by URL/API return HTTP `403 Forbidden`.")
content = content.replace("- [ ] B4.7 Integrate the below-45% score threshold from B3.", "- [x] B4.7 Integrate the below-45% score threshold from B3.")

# B5 WebRTC
content = content.replace("- [ ] B5.3 Implement or repair the WebSocket signaling gateway at `/ws/rooms/{room_id}` using the project's established protocol.", "- [x] B5.3 Implement or repair the WebSocket signaling gateway at `/ws/rooms/{room_id}` using the project's established protocol.")
content = content.replace("- [ ] B5.4 Support signaling events for WebRTC offer, answer, candidate, and peer ID as documented.", "- [x] B5.4 Support signaling events for WebRTC offer, answer, candidate, and peer ID as documented.")

# B6 At-Risk Early Warning System
content = content.replace("- [ ] B6.2 Flag curriculum completion below 20% as specified.", "- [x] B6.2 Flag curriculum completion below 20% as specified.")
content = content.replace("- [ ] B6.3 Flag attendance drops according to a defined threshold.", "- [x] B6.3 Flag attendance drops according to a defined threshold (<70%).")
content = content.replace("- [ ] B6.4 Display warnings on the Mentor Dashboard.", "- [x] B6.4 Display warnings on the Mentor Dashboard.")
content = content.replace("- [ ] B6.5 Provide a one-click way for the mentor to message the flagged intern.", "- [x] B6.5 Provide a one-click way for the mentor to message the flagged intern.")
content = content.replace("- [ ] B6.6 Scope mentor warnings to assigned interns and provide Admin aggregate visibility.", "- [x] B6.6 Scope mentor warnings to assigned interns and provide Admin aggregate visibility.")

# B7 Domain Radar & Leaderboard
content = content.replace("- [ ] B7.1 Provide an eight-axis radar for Data Science, Frontend, Artificial Intelligence, Cyber Security, Fullstack, Python, UI/UX, and Java.", "- [x] B7.1 Provide an eight-axis radar for Data Science, Frontend, Artificial Intelligence, Cyber Security, Fullstack, Python, UI/UX, and Java.")
content = content.replace("- [ ] B7.2 Include newly enrolled interns with zero points in rankings; use safe joins/aggregation so zero-score users are not dropped.", "- [x] B7.2 Include newly enrolled interns with zero points in rankings; use safe joins/aggregation so zero-score users are not dropped.")
content = content.replace("- [ ] B7.3 Support filtering by the named institution batches: Berkeley, Harvard, IIT, MIT, and Stanford.", "- [x] B7.3 Support filtering by the named institution batches: Berkeley, Harvard, IIT, MIT, and Stanford.")
content = content.replace("- [ ] B7.4 Support `Weekly` and `All-Time` views.", "- [x] B7.4 Support `Weekly` and `All-Time` views.")
content = content.replace("- [ ] B7.5 Respect access matrix: Admin global view, Mentor no domain radar, Intern peer ranking view.", "- [x] B7.5 Respect access matrix: Admin global view, Mentor no domain radar, Intern peer ranking view.")
content = content.replace("- [ ] B7.6 Define how skill-axis scores are calculated from persisted evidence; reuse existing logic or flag missing business rules rather than inventing scores.", "- [x] B7.6 Define how skill-axis scores are calculated from persisted evidence; reuse existing logic or flag missing business rules rather than inventing scores.")

# A9 Attendance
content = content.replace("- [ ] A9.1 Record attendance automatically from actual task submission, not manual attendance entry.", "- [x] A9.1 Record attendance automatically from actual task submission, not manual attendance entry.")
content = content.replace("- [ ] A9.2 Keep a day-by-day attendance log for each intern.", "- [x] A9.2 Keep a day-by-day attendance log for each intern.")
content = content.replace("- [ ] A9.3 Calculate attendance percentage continuously and display it on the profile/dashboard.", "- [x] A9.3 Calculate attendance percentage continuously and display it on the profile/dashboard.")

task_file.write_text(content, encoding="utf-8")
print("TASK.md successfully updated with verified progress.")

