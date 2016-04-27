#!/bin/bash

set -e

DIR=$(mktemp -d -t '')
convert "$1" -resize 240x240 "$DIR"/1.png
convert "$2" -resize 118x118 "$DIR"/2.png
convert "$3" -resize 118x118 "$DIR"/3.png
convert "$DIR"/1.png -size 4x120 xc:white '(' "$DIR"/2.png -size 118x4 xc:white "$DIR"/3.png -append ')' +append -background white $4
