# Session 2 TODO

## Completed
- [x] Created the local project structure in `documents/ailab2_session2_pdf_word_counter/`.
- [x] Built a workflow page with upload, analysis, results, and CSV export.
- [x] Added local browser PDF extraction using vendored PDF.js assets.
- [x] Added status messages for uploaded, processing, complete, and error states.
- [x] Added a sample PDF for validation.
- [x] Added a launch script that selects a free port, starts a Python HTTP server, opens the browser, and prints the URL and PID.
- [x] Validated upload, repeated word counting, results rendering, and CSV download behavior.
- [x] Tested the full browser flow with `samples/sample_repeated_words.pdf`.
- [x] Confirmed expected repeated words appeared in the table, including `control=3` and repeated two-count words.
- [x] Confirmed the downloaded CSV used the `word,count` header and matched the on-screen results.
- [x] Added a CSV Viewer section that uploads, parses, previews, filters, and exports visible CSV rows.
- [x] Displayed CSV row count, column count, and column names in the UI.
- [x] Added clear CSV error handling for empty files and malformed row structures.
- [x] Validated the original PDF workflow still works after adding the CSV Viewer.
- [x] Validated CSV upload, preview, filtering, and filtered CSV download behavior.

## Known limitations
- Text extraction is reliable for text-based PDFs, but not for scanned PDFs without OCR.
- The browser must allow file selection and downloads for the CSV export step.
- The CSV Viewer treats the first non-empty row as the header row and expects consistent column counts across the file.
