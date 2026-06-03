import * as pdfjsLib from "./vendor/pdf.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = "./vendor/pdf.worker.min.mjs";

const stopWords = new Set([
  "the",
  "and",
  "of",
  "to",
  "a",
  "in",
  "is",
  "it",
  "for",
  "with",
  "on",
  "by",
]);

const pdfInput = document.getElementById("pdfFile");
const analyzeButton = document.getElementById("analyzeButton");
const downloadButton = document.getElementById("downloadButton");
const statusBadge = document.getElementById("statusBadge");
const statusMessage = document.getElementById("statusMessage");
const resultsSummary = document.getElementById("resultsSummary");
const resultsTableBody = document.getElementById("resultsTableBody");

let uploadedFile = null;
let latestResults = [];

pdfInput.addEventListener("change", () => {
  uploadedFile = pdfInput.files?.[0] ?? null;
  latestResults = [];
  downloadButton.disabled = true;
  renderEmptyState("Results will appear here after analysis.");

  if (!uploadedFile) {
    analyzeButton.disabled = true;
    setStatus("Waiting for upload", "Upload a text-based PDF to begin.", "default");
    resultsSummary.textContent = "No analysis has been run yet.";
    return;
  }

  if (uploadedFile.type !== "application/pdf") {
    analyzeButton.disabled = true;
    setStatus("Error", "The selected file is not a PDF. Please choose a valid PDF file.", "error");
    resultsSummary.textContent = "No analysis has been run yet.";
    return;
  }

  analyzeButton.disabled = false;
  setStatus("Uploaded", `Ready to analyze ${uploadedFile.name}.`, "success");
  resultsSummary.textContent = "PDF uploaded. Run the workflow to see repeated words.";
});

analyzeButton.addEventListener("click", async () => {
  if (!uploadedFile) {
    setStatus("Error", "Upload a PDF before running the analysis.", "error");
    return;
  }

  try {
    analyzeButton.disabled = true;
    downloadButton.disabled = true;
    setStatus("Processing", "Extracting PDF text and counting repeated words...", "processing");
    resultsSummary.textContent = "Processing PDF...";

    const extractedText = await extractPdfText(uploadedFile);
    const repeatedWords = countRepeatedWords(extractedText);
    latestResults = repeatedWords;

    if (!repeatedWords.length) {
      renderEmptyState("No repeated words were found after filtering stop words.");
      resultsSummary.textContent = "Analysis complete. No repeated words matched the rules.";
      setStatus("Complete", "Analysis finished. No repeated words were found.", "success");
      return;
    }

    renderResults(repeatedWords);
    resultsSummary.textContent = `${repeatedWords.length} repeated words found in ${uploadedFile.name}.`;
    setStatus("Complete", "Analysis complete. The table and CSV are ready.", "success");
    downloadButton.disabled = false;
  } catch (error) {
    console.error(error);
    renderEmptyState("Results could not be generated.");
    resultsSummary.textContent = "The analysis failed.";
    setStatus(
      "Error",
      error instanceof Error ? error.message : "An unexpected error occurred while processing the PDF.",
      "error",
    );
  } finally {
    analyzeButton.disabled = uploadedFile === null;
  }
});

downloadButton.addEventListener("click", () => {
  if (!latestResults.length) {
    setStatus("Error", "Run analysis successfully before downloading the CSV.", "error");
    return;
  }

  const csvLines = ["word,count", ...latestResults.map(({ word, count }) => `${escapeCsvValue(word)},${count}`)];
  const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8" });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const baseName = uploadedFile?.name.replace(/\.pdf$/i, "") || "repeated_words";

  link.href = downloadUrl;
  link.download = `${baseName}_repeated_words.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(downloadUrl);

  setStatus("Complete", "CSV download started.", "success");
});

async function extractPdfText(file) {
  const buffer = await file.arrayBuffer();
  const pdfDocument = await pdfjsLib.getDocument({ data: buffer }).promise;
  const segments = [];

  for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
    const page = await pdfDocument.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");

    if (pageText.trim()) {
      segments.push(pageText.trim());
    }
  }

  const combinedText = segments.join(" ").trim();

  if (!combinedText) {
    throw new Error(
      "No extractable text was found. Try a text-based PDF instead of a scanned image PDF.",
    );
  }

  return combinedText;
}

function countRepeatedWords(text) {
  const normalizedWords = text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()\[\]"'?<>@+|\\]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word && !stopWords.has(word));

  const counts = new Map();

  for (const word of normalizedWords) {
    counts.set(word, (counts.get(word) || 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([word, count]) => ({ word, count }))
    .sort((left, right) => right.count - left.count || left.word.localeCompare(right.word));
}

function renderResults(results) {
  resultsTableBody.innerHTML = results
    .map(
      ({ word, count }) => `
        <tr>
          <td>${escapeHtml(word)}</td>
          <td>${count}</td>
        </tr>
      `,
    )
    .join("");
}

function renderEmptyState(message) {
  resultsTableBody.innerHTML = `
    <tr>
      <td colspan="2" class="empty-state">${escapeHtml(message)}</td>
    </tr>
  `;
}

function setStatus(label, message, tone) {
  statusBadge.textContent = label;
  statusBadge.className = "status-pill";

  if (tone === "success") {
    statusBadge.classList.add("success");
  } else if (tone === "error") {
    statusBadge.classList.add("error");
  } else if (tone === "processing") {
    statusBadge.classList.add("processing");
  }

  statusMessage.textContent = message;
}

function escapeCsvValue(value) {
  if (/[",\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  return value;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
