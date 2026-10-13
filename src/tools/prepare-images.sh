#!/bin/zsh
# Copies the app's artwork into assets/img in web sizes. Needs ImageMagick and
# cwebp (Homebrew) and the app repo next to this one (../truethings).
# Pixel sprites are scaled with nearest neighbour to 8 × their pixel grid, so
# they stay crisp; screenshots become 720 px wide WebPs.
set -e
cd "${0:A:h}/../.."
APP=../truethings/Design
SPR=$APP/Things/Handoff/Sprites
CAP=$APP/AppStore/Quellcode/captures/iphone
OUT=assets/img

typeset -A MOOD
MOOD=(01-neutral neutral 02-froehlich happy 03-lachend laughing 04-nachdenklich thinking
      05-ueberrascht surprised 06-schmollend sulking 07-zwinkernd winking 08-feiernd celebrating
      09-schlafend sleeping 10-verliebt in-love 11-wuetend angry 12-weinend crying)

mkdir -p $OUT/things $OUT/shots
for src mood in ${(kv)MOOD}; do
  # Singles: 980 px = 49 cells of 20 px. Pairs: 1168 × 768 = 73 × 48 cells of 16 px.
  magick $SPR/Sticker/hannes-$src.png -filter point -resize 392x392 $OUT/things/blue-$mood.png
  magick $SPR/Sticker/mia-$src.png -filter point -resize 392x392 $OUT/things/pink-$mood.png
  magick $SPR/Paar/paar-$src.png -filter point -resize 584x384 $OUT/things/pair-$mood.png
done
for f in $APP/AppStore/Quellcode/assets/things/*.png; do
  magick $f -filter point -resize 392x392 $OUT/things/extra-${f:t}
done

for lang in de en; do
  for f in $CAP/$lang/*.png; do
    name=${f:t:r}
    [[ $name == note-paper ]] && continue
    magick $f -resize 720x -strip PNG24:/tmp/tt-shot.png
    cwebp -quiet -q 82 -m 6 /tmp/tt-shot.png -o $OUT/shots/$lang-$name.webp
  done
  magick $CAP/$lang/note-paper.png -resize 600x -strip PNG24:/tmp/tt-shot.png
  cwebp -quiet -q 86 -m 6 /tmp/tt-shot.png -o $OUT/shots/$lang-note-paper.webp
done
rm -f /tmp/tt-shot.png

ICON=$APP/AppStore/Quellcode/assets/icon.png
for size in 32 180 192 512; do
  magick $ICON -resize ${size}x${size} -strip $OUT/icon-$size.png
done
magick $ICON -resize 96x96 -strip $OUT/icon-96.png
echo "images ok"
