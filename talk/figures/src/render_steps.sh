#!/bin/sh
# Renders translation_step1..4.png from translation_step.tex.
# \stepop{k} in the template is replaced by 1 (current step), 0.28 (earlier), or 0 (later).
cd "$(dirname "$0")"
for k in 1 2 3 4; do
  python3 - "$k" <<'PY'
import sys, re
k = int(sys.argv[1]); s = open('translation_step.tex').read()
s = re.sub(r'\\stepop\{(\d)\}', lambda m: '1' if int(m.group(1)) == k else ('0.28' if int(m.group(1)) < k else '0'), s)
open(f'translation_step{k}.tex', 'w').write(s)
PY
  tectonic "translation_step$k.tex" && pdftoppm -r 300 -png -singlefile "translation_step$k.pdf" "../translation_step$k"
  rm -f "translation_step$k.tex" "translation_step$k.pdf"
done
