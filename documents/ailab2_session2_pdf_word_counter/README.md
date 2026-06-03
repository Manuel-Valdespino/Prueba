# AI Lab 2 Session 2 - PDF Repeated Word Counter

This small local app shows how a repeated manual workflow can become a reusable tool.

## What the app does

1. Upload a PDF in the browser.
2. Extract text from the PDF locally in the browser.
3. Normalize the text by lowercasing it and removing basic punctuation.
4. Exclude common stop words.
5. Count only repeated words.
6. Show the results in a table.
7. Generate and download a CSV with `word,count` columns.

## Project structure

- `app/index.html` - workflow page and UI
- `app/style.css` - simple local styling
- `app/app.js` - PDF extraction, analysis, table rendering, and CSV download
- `app/vendor/` - local PDF.js browser files used for PDF text extraction
- `scripts/launch_app.sh` - starts a local Python HTTP server and opens the app
- `samples/sample_repeated_words.pdf` - sample PDF for quick testing
- `todo_session2.md` - delivery checklist and notes

## Local requirements

- Python 3
- A modern browser with JavaScript enabled

No build step is required.

## How to launch

From the repository root:

```bash
./documents/ailab2_session2_pdf_word_counter/scripts/launch_app.sh
```

The script will:
- choose a free local port
- start a Python HTTP server
- open the app in your default browser
- print the app URL
- print the server PID

## How to use

1. Launch the app.
2. Upload a PDF.
3. Click **Run analysis**.
4. Review the repeated words table.
5. Click **Download CSV** to save the results.

For a quick test, use:

- `samples/sample_repeated_words.pdf`

## Implementation notes

- PDF text extraction runs locally in the browser using a vendored PDF.js build.
- Word counting ignores case.
- Basic punctuation is removed before counting.
- Stop words excluded by default are: `the, and, of, to, a, in, is, it, for, with, on, by`.
- Only words with a count greater than 1 are shown and exported.
- Results are sorted by count descending, then alphabetically.

## Known limitations

- The current extraction flow works best for text-based PDFs.
- Scanned or image-only PDFs will not produce reliable text without OCR, which is intentionally out of scope for this simple local demo.
- Very complex PDF layouts may produce extracted text in an order that is slightly different from the visual reading order.

## Why this is useful for AI Lab 2 Session 2

The app keeps the workflow intentionally simple so the lesson is clear: a manual sequence of steps can be turned into a small reusable app that an agent can build, test, and iterate on locally.
