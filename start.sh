#!/usr/bin/env bash
# Launch the Mantis Cockpit on http://localhost:7137
# Zero dependencies — only requires Node.js.
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
exec node "$DIR/server.js" "$@"
