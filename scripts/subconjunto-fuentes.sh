#!/usr/bin/env bash
# Subconjunto latino de las fuentes Geist (presupuesto de rendimiento del shell, ADR-0008 V8-6 a):
# cada woff2 completo pesa ~40 KB y la puerta usa cuatro pesos. El subconjunto (~20 KB) cubre español,
# comillas, rayas y flechas; tokens.css lo declara con unicode-range después del completo, así que el
# navegador solo baja el completo si la página usa un carácter fuera del rango. Requiere fonttools
# (`pip install fonttools brotli`). Reejecutar si cambian las fuentes.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../packages/ui/fuentes"
RANGO="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2190-2199,U+2212,U+2215,U+FEFF,U+FFFD"
for f in Geist-Regular Geist-Medium Geist-SemiBold Geist-Bold GeistMono-Regular GeistMono-Medium; do
  python3 -m fontTools.subset "$f.woff2" --unicodes="$RANGO" --flavor=woff2 --layout-features='*' \
    --output-file="$f-latin.woff2"
done
echo "unicode-range: $RANGO"
