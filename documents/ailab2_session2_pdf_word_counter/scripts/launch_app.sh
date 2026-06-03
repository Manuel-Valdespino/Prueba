#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
HOST="127.0.0.1"
PORT="$(python3 - <<'PY'
import socket
with socket.socket() as sock:
    sock.bind(("127.0.0.1", 0))
    print(sock.getsockname()[1])
PY
)"
URL="http://${HOST}:${PORT}/app/index.html"
LOG_FILE="$(mktemp -t pdf_word_counter_server.XXXXXX.log)"

cd "${PROJECT_ROOT}"
nohup python3 -m http.server "${PORT}" --bind "${HOST}" >"${LOG_FILE}" 2>&1 &
SERVER_PID=$!

sleep 1
if ! kill -0 "${SERVER_PID}" 2>/dev/null; then
  echo "Failed to start the local Python HTTP server." >&2
  exit 1
fi

if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "${URL}" >/dev/null 2>&1 || true
elif command -v open >/dev/null 2>&1; then
  open "${URL}" >/dev/null 2>&1 || true
fi

echo "App URL: ${URL}"
echo "Server PID: ${SERVER_PID}"
echo "Server log: ${LOG_FILE}"
