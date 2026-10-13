#!/bin/zsh
# Renders the 1200 × 630 preview images listed in src/og/jobs.json (written by
# build.py) to assets/img/og/<key>.jpg with headless Chrome and ImageMagick.
#   src/tools/render-og.sh            # only images that don't exist yet
#   src/tools/render-og.sh --all      # all of them
set -e
cd "${0:A:h}/../.."
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT=assets/img/og
TMP=$(mktemp -d)
mkdir -p $OUT
python3 -c '
import json, sys, urllib.parse
for key, job in json.load(open("src/og/jobs.json")).items():
    q = urllib.parse.urlencode({"kicker": job["kicker"], "title": job["title"], "art": job["art"], "lang": job["lang"]})
    print(key + "\t" + q)
' | while IFS=$'\t' read -r key query; do
  if [[ "$1" != "--all" && -f $OUT/$key.jpg ]]; then continue; fi
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=1200,630 \
    --allow-file-access-from-files --virtual-time-budget=2500 --screenshot=$TMP/$key.png \
    "file://$PWD/src/og/og.html?$query" >/dev/null 2>&1
  magick $TMP/$key.png -crop 1200x630+0+0 +repage -strip -quality 86 -sampling-factor 4:2:0 $OUT/$key.jpg
  echo "og: $key"
done
rm -rf $TMP
