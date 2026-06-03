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

const csvFileInput = document.getElementById("csvFile");
const csvSearchInput = document.getElementById("csvSearch");
const csvStatusBadge = document.getElementById("csvStatusBadge");
const csvStatusMessage = document.getElementById("csvStatusMessage");
const csvTotalRows = document.getElementById("csvTotalRows");
const csvTotalColumns = document.getElementById("csvTotalColumns");
const csvColumnNames = document.getElementById("csvColumnNames");
const csvResultsSummary = document.getElementById("csvResultsSummary");
const csvTableHead = document.getElementById("csvTableHead");
const csvTableBody = document.getElementById("csvTableBody");
const downloadFilteredCsvButton = document.getElementById("downloadFilteredCsvButton");

let uploadedFile = null;
let latestResults = [];

const csvState = {
  uploadedFile: null,
  header: [],
  rows: [],
  filteredRows: [],
};

pdfInput.addEventListener("change", () => {
  uploadedFile = pdfInput.files?.[0] ?? null;
  latestResults = [];
  downloadButton.disabled = true;
  renderPdfEmptyState("Results will appear here after analysis.");

  if (!uploadedFile) {
    analyzeButton.disabled = true;
    setStatus(statusBadge, statusMessage, "Waiting for upload", "Upload a text-based PDF to begin.", "default");
    resultsSummary.textContent = "No analysis has been run yet.";
    return;
  }

  if (uploadedFile.type !== "application/pdf") {
    analyzeButton.disabled = true;
    setStatus(
      statusBadge,
      statusMessage,
      "Error",
      "The selected file is not a PDF. Please choose a valid PDF file.",
      "error",
    );
    resultsSummary.textContent = "No analysis has been run yet.";
    return;
  }

  analyzeButton.disabled = false;
  setStatus(statusBadge, statusMessage, "Uploaded", `Ready to analyze ${uploadedFile.name}.`, "success");
  resultsSummary.textContent = "PDF uploaded. Run the workflow to see repeated words.";
});

analyzeButton.addEventListener("click", async () => {
  if (!uploadedFile) {
    setStatus(statusBadge, statusMessage, "Error", "Upload a PDF before running the analysis.", "error");
    return;
  }

  try {
    analyzeButton.disabled = true;
    downloadButton.disabled = true;
    setStatus(
      statusBadge,
      statusMessage,
      "Processing",
      "Extracting PDF text and counting repeated words...",
      "processing",
    );
    resultsSummary.textContent = "Processing PDF...";

    const extractedText = await extractPdfText(uploadedFile);
    const repeatedWords = countRepeatedWords(extractedText);
    latestResults = repeatedWords;

    if (!repeatedWords.length) {
      renderPdfEmptyState("No repeated words were found after filtering stop words.");
      resultsSummary.textContent = "Analysis complete. No repeated words matched the rules.";
      setStatus(
        statusBadge,
        statusMessage,
        "Complete",
        "Analysis finished. No repeated words were found.",
        "success",
      );
      return;
    }

    renderPdfResults(repeatedWords);
    resultsSummary.textContent = `${repeatedWords.length} repeated words found in ${uploadedFile.name}.`;
    setStatus(
      statusBadge,
      statusMessage,
      "Complete",
      "Analysis complete. The table and CSV are ready.",
      "success",
    );
    downloadButton.disabled = false;
  } catch (error) {
    console.error(error);
    renderPdfEmptyState("Results could not be generated.");
    resultsSummary.textContent = "The analysis failed.";
    setStatus(
      statusBadge,
      statusMessage,
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
    setStatus(
      statusBadge,
      statusMessage,
      "Error",
      "Run analysis successfully before downloading the CSV.",
      "error",
    );
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

  setStatus(statusBadge, statusMessage, "Complete", "CSV download started.", "success");
});

csvFileInput.addEventListener("change", async () => {
  resetCsvViewer();
  csvState.uploadedFile = csvFileInput.files?.[0] ?? null;

  if (!csvState.uploadedFile) {
    setStatus(
      csvStatusBadge,
      csvStatusMessage,
      "Waiting for CSV upload",
      "Upload a CSV file to preview it in the browser.",
      "default",
    );
    return;
  }

  if (!isCsvFile(csvState.uploadedFile)) {
    setCsvError("The selected file is not recognized as a CSV file.");
    return;
  }

  try {
    setStatus(
      csvStatusBadge,
      csvStatusMessage,
      "Processing",
      `Parsing ${csvState.uploadedFile.name} in the browser...`,
      "processing",
    );

    const csvText = await csvState.uploadedFile.text();
    const parsedCsv = parseCsvText(csvText);

    csvState.header = parsedCsv.header;
    csvState.rows = parsedCsv.rows;
    csvState.filteredRows = [...parsedCsv.rows];

    csvSearchInput.disabled = false;
    csvSearchInput.value = "";
    downloadFilteredCsvButton.disabled = csvState.filteredRows.length === 0;

    updateCsvSummary();
    renderCsvTable();

    setStatus(
      csvStatusBadge,
      csvStatusMessage,
      "Complete",
      `Loaded ${csvState.uploadedFile.name} successfully.`,
      "success",
    );
  } catch (error) {
    console.error(error);
    setCsvError(error instanceof Error ? error.message : "An unexpected CSV parsing error occurred.");
  }
});

csvSearchInput.addEventListener("input", () => {
  const query = csvSearchInput.value.trim().toLowerCase();

  csvState.filteredRows = csvState.rows.filter((row) => {
    if (!query) {
      return true;
    }

    return row.some((cell) => cell.toLowerCase().includes(query));
  });

  renderCsvTable();
  updateCsvSummary(query);
  downloadFilteredCsvButton.disabled = csvState.filteredRows.length === 0;

  if (csvState.header.length) {
    setStatus(
      csvStatusBadge,
      csvStatusMessage,
      "Complete",
      query
        ? `Showing ${csvState.filteredRows.length} visible rows after filtering.`
        : `Loaded ${csvState.uploadedFile?.name || "CSV"} successfully.`,
      "success",
    );
  }
});

downloadFilteredCsvButton.addEventListener("click", () => {
  if (!csvState.header.length) {
    setCsvError("Load a CSV file before downloading filtered rows.");
    return;
  }

  if (!csvState.filteredRows.length) {
    setCsvError("No visible rows are available to export.");
    return;
  }

  const lines = [serializeCsvRow(csvState.header), ...csvState.filteredRows.map((row) => serializeCsvRow(row))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const baseName = csvState.uploadedFile?.name.replace(/\.csv$/i, "") || "filtered_rows";

  link.href = downloadUrl;
  link.download = `${baseName}_filtered.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(downloadUrl);

  setStatus(csvStatusBadge, csvStatusMessage, "Complete", "Filtered CSV download started.", "success");
});

function resetCsvViewer() {
  csvState.header = [];
  csvState.rows = [];
  csvState.filteredRows = [];
  csvTotalRows.textContent = "0";
  csvTotalColumns.textContent = "0";
  csvColumnNames.textContent = "No CSV loaded";
  csvResultsSummary.textContent = "Upload a CSV file to preview it here.";
  csvSearchInput.disabled = true;
  csvSearchInput.value = "";
  downloadFilteredCsvButton.disabled = true;
  renderCsvEmptyState("Upload a CSV file to begin.", 1);
}

function updateCsvSummary(activeQuery = "") {
  const totalRows = csvState.rows.length;
  const totalColumns = csvState.header.length;
  const visibleRows = csvState.filteredRows.length;
  const joinedColumns = csvState.header.join(", ");

  csvTotalRows.textContent = String(totalRows);
  csvTotalColumns.textContent = String(totalColumns);
  csvColumnNames.textContent = joinedColumns || "No columns available";

  if (activeQuery) {
    csvResultsSummary.textContent = `${visibleRows} of ${totalRows} rows visible across ${totalColumns} columns.`;
  } else {
    csvResultsSummary.textContent = `${totalRows} rows loaded across ${totalColumns} columns.`;
  }
}

function renderCsvTable() {
  if (!csvState.header.length) {
    renderCsvEmptyState("Upload a CSV file to begin.", 1);
    return;
  }

  renderCsvHead(csvState.header);

  if (!csvState.filteredRows.length) {
    csvTableBody.innerHTML = `
      <tr>
        <td colspan="${csvState.header.length}" class="empty-state">${escapeHtml("No rows match the current search.")}</td>
      </tr>
    `;
    return;
  }

  csvTableBody.innerHTML = csvState.filteredRows
    .map(
      (row) => `
        <tr>
          ${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}
        </tr>
      `,
    )
    .join("");
}

function renderCsvEmptyState(message, columnCount) {
  renderCsvHead([]);
  csvTableBody.innerHTML = `
    <tr>
      <td colspan="${columnCount}" class="empty-state">${escapeHtml(message)}</td>
    </tr>
  `;
}

function renderCsvHead(headerLabels) {
  if (!headerLabels.length) {
    csvTableHead.innerHTML = `
      <tr>
        <th scope="col">CSV preview</th>
      </tr>
    `;
    return;
  }

  csvTableHead.innerHTML = `
    <tr>
      ${headerLabels.map((columnName) => `<th scope="col">${escapeHtml(columnName)}</th>`).join("")}
    </tr>
  `;
}

function setCsvError(message) {
  resetCsvViewer();
  setStatus(csvStatusBadge, csvStatusMessage, "Error", message, "error");
  csvResultsSummary.textContent = "The CSV viewer could not load the file.";
  renderCsvEmptyState(message, 1);
}

function isCsvFile(file) {
  const lowerName = file.name.toLowerCase();
  return lowerName.endsWith(".csv") || file.type === "text/csv" || file.type === "application/vnd.ms-excel";
}

function parseCsvText(text) {
  if (!text.trim()) {
    throw new Error("The CSV file is empty.");
  }

  const rows = [];
  let currentRow = [];
  let currentValue = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (inQuotes) {
      if (character === '"') {
        if (nextCharacter === '"') {
          currentValue += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        currentValue += character;
      }
      continue;
    }

    if (character === '"') {
      if (currentValue.length > 0) {
        throw new Error("Malformed CSV: unexpected quote inside an unquoted field.");
      }
      inQuotes = true;
      continue;
    }

    if (character === ",") {
      currentRow.push(currentValue);
      currentValue = "";
      continue;
    }

    if (character === "\n" || character === "\r") {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }
      currentRow.push(currentValue);
      rows.push(currentRow);
      currentRow = [];
      currentValue = "";
      continue;
    }

    currentValue += character;
  }

  if (inQuotes) {
    throw new Error("Malformed CSV: unmatched quote detected.");
  }

  currentRow.push(currentValue);
  rows.push(currentRow);

  const nonEmptyRows = rows
    .map((row) => row.map((cell) => cell.trim()))
    .filter((row) => row.some((cell) => cell.length > 0));

  if (!nonEmptyRows.length) {
    throw new Error("The CSV file does not contain any rows.");
  }

  const header = nonEmptyRows[0].map((cell, index) => cell || `Column ${index + 1}`);
  const expectedColumnCount = header.length;

  if (expectedColumnCount === 0) {
    throw new Error("The CSV file does not contain any columns.");
  }

  const dataRows = nonEmptyRows.slice(1);
  dataRows.forEach((row, index) => {
    if (row.length !== expectedColumnCount) {
      throw new Error(
        `Malformed CSV: row ${index + 2} has ${row.length} columns, expected ${expectedColumnCount}.`,
      );
    }
  });

  return {
    header,
    rows: dataRows,
  };
}

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

function renderPdfResults(results) {
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

function renderPdfEmptyState(message) {
  resultsTableBody.innerHTML = `
    <tr>
      <td colspan="2" class="empty-state">${escapeHtml(message)}</td>
    </tr>
  `;
}

function setStatus(badgeElement, messageElement, label, message, tone) {
  badgeElement.textContent = label;
  badgeElement.className = "status-pill";

  if (tone === "success") {
    badgeElement.classList.add("success");
  } else if (tone === "error") {
    badgeElement.classList.add("error");
  } else if (tone === "processing") {
    badgeElement.classList.add("processing");
  }

  messageElement.textContent = message;
}

function serializeCsvRow(values) {
  return values.map((value) => escapeCsvValue(value)).join(",");
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
