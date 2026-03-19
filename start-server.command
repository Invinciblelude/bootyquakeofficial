#!/bin/bash
cd "$(dirname "$0")"
IP=$(ipconfig getifaddr en0 2>/dev/null || (hostname -I 2>/dev/null | awk '{print $1}'))
echo "BootyQuake: http://localhost:8080"
[ -n "$IP" ] && echo "Mobile (same WiFi): http://$IP:8080"
open "http://localhost:8080" 2>/dev/null &
python3 -m http.server 8080 --bind 0.0.0.0 2>/dev/null || npx serve . -p 8080
