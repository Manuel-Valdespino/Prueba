# AI Lab 2 Session 2 - PDF Repeated Word Counter

This small local app shows how a repeated manual workflow can become a reusable tool.

## What the app does

### PDF repeated-word workflow

1. Upload a PDF in the browser.
2. Extract text from the PDF locally in the browser.
3. Normalize the text by lowercasing it and removing basic punctuation.
4. Exclude common stop words.
5. Count only repeated words.
6. Show the results in a table.
7. Generate and download a CSV with `word,count` columns.

### CSV Viewer workflow

1. Upload a CSV in the browser.
2. Parse the CSV locally in the browser.
3. Show the CSV in a clean table.
4. Display total rows, total columns, and column names.
5. Search across all visible rows.
6. Download the currently visible filtered rows as a new CSV.

## Project structure

- `app/index.html` - workflow page and UI for both PDF analysis and CSV viewing
- `app/style.css` - shared styling for both workflows
- `app/app.js` - PDF extraction, repeated-word analysis, CSV parsing, filtering, and downloads
- `app/vendor/` - local PDF.js browser files used for PDF text extraction
- `scripts/launch_app.sh` - starts a local Python HTTP server and opens the app
- `samples/sample_repeated_words.pdf` - sample PDF for quick PDF workflow testing
- `samples/sample_viewer.csv` - sample CSV for quick CSV viewer testing
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

### PDF workflow

1. Launch the app.
2. Upload a PDF.
3. Click **Run analysis**.
4. Review the repeated words table.
5. Click **Download CSV** to save the results.

### CSV Viewer

1. Launch the app.
2. Scroll to the **CSV Viewer** section.
3. Upload a CSV file.
4. Review the row count, column count, column names, and preview table.
5. Use the search box to filter visible rows.
6. Click **Download visible CSV** to export only the rows currently shown.

For quick tests, use:

- `samples/sample_repeated_words.pdf`
- `samples/sample_viewer.csv`

## Implementation notes

- PDF text extraction runs locally in the browser using a vendored PDF.js build.
- Word counting ignores case.
- Basic punctuation is removed before counting.
- Stop words excluded by default are: `the, and, of, to, a, in, is, it, for, with, on, by`.
- Only words with a count greater than 1 are shown and exported.
- Results are sorted by count descending, then alphabetically.
- The CSV Viewer uses a simple custom parser implemented in browser JavaScript, so no extra CSV library was needed.

## CSV parser behavior and limitations

The custom CSV parser supports:
- comma-separated values
- quoted fields
- escaped double quotes inside quoted fields
- line-by-line parsing in the browser

Known CSV limitations:
- the first non-empty row is treated as the header row
- every data row must have the same number of columns as the header row
- blank rows are ignored
- malformed quoting or inconsistent column counts will show a clear error message
- this intentionally simple parser is designed for local demo workflows rather than every edge case found in spreadsheet exports

## Known limitations

- The PDF extraction flow works best for text-based PDFs.
- Scanned or image-only PDFs will not produce reliable text without OCR, which is intentionally out of scope for this simple local demo.
- Very complex PDF layouts may produce extracted text in an order that is slightly different from the visual reading order.
- The CSV Viewer assumes a standard header row and consistent column counts across the file.

## Why this is useful for AI Lab 2 Session 2

The app keeps the workflows intentionally simple so the lesson is clear: a manual sequence of steps can be turned into a small reusable app that an agent can build, test, and iterate on locally.
