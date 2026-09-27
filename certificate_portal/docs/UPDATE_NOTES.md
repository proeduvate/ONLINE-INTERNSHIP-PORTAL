# Certificate Portal Update

## Fixed
1. Certificate rendering now uses the supplied master certificate image as the exact background.
2. Dynamic text is placed only in the blank certificate fields, preventing text overlays.
3. The original certificate wording/layout is preserved.
4. Static QR code remains part of the master template; no new QR is generated.
5. CEO signature and official seal are applied only after Admin approval.
6. Viewing a generated certificate now shows the signed/sealed final PDF.
7. Draft preview intentionally excludes signature and seal.
8. Grade and score are displayed cleanly without overlapping the certificate elements.
9. Certificate ID is kept in database/audit/PDF metadata rather than printed over the visual template.
10. `bcrypt==4.0.1` is pinned to avoid the Passlib/bcrypt compatibility error encountered during startup.
11. CORS includes common Vite development ports 5173–5175.

A sample approved certificate is included in `docs/sample_approved_certificate.pdf`.
