#/bin/bash

rm -f icon-*

sizes='57 72 76 114 120 144 152'

for size in $sizes; do
    convert icon.png -resize "${size}x${size}" icon-$size.png
done
