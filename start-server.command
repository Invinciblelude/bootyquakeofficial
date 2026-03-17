#!/bin/bash
cd "$(dirname "$0")"
echo "Starting BootyQuake at http://localhost:8080"
open "http://localhost:8080" 2>/dev/null &
python3 -m http.server 8080 || npx serve . -p 8080
