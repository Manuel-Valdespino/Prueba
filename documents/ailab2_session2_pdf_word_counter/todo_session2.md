# Session 2 TODO

## Completed
- [x] Created the local project structure in `documents/ailab2_session2_pdf_word_counter/`.
- [x] Built a workflow page with upload, analysis, results, and CSV export.
- [x] Added local browser PDF extraction using vendored PDF.js assets.
- [x] Added status messages for uploaded, processing, complete, and error states.
- [x] Added a sample PDF for validation.
- [x] Added a launch script that selects a free port, starts a Python HTTP server, opens the browser, and prints the URL and PID.
- [x] Validated upload, repeated word counting, results rendering, and CSV download behavior.

## Known limitations
- Text extraction is reliable for text-based PDFs, but not for scanned PDFs without OCR.
- The browser must allow file selection and downloads for the CSV export step.
