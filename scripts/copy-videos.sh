#!/bin/bash
# Copy youtube_dl videos from Downloads into BootyQuake videos folder.
# Usage: ./scripts/copy-videos.sh [SOURCE_DIR]
# Example: ./scripts/copy-videos.sh ~/Downloads

SOURCE="${1:-$HOME/Downloads}"
DEST="$(dirname "$0")/../videos"

# Map source folder names to destination
copy_folder() {
  local src_name="$1"
  local dest_name="$2"
  if [ -d "$SOURCE/$src_name" ]; then
    mkdir -p "$DEST/$dest_name"
    for f in "$SOURCE/$src_name"/*.mp4 "$SOURCE/$src_name"/*.webm "$SOURCE/$src_name"/*.mkv; do
      [ -f "$f" ] && cp -n "$f" "$DEST/$dest_name/" 2>/dev/null
    done
    echo "Copied from $src_name -> videos/$dest_name"
  fi
}

copy_folder "dance" "dance"
copy_folder "ig dancers" "ig-dancers"
copy_folder "twerk" "twerk"
copy_folder "youtube music videos" "youtube-music-videos"

echo "Done. Edit videos.json to add titles and credit links."
