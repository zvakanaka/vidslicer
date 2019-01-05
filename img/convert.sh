#!/bin/bash
# create smaller versions of favicon_192x192.png
convert -resize 96x96 favicon_192x192.png favicon_96x96.png
convert -resize 64x64 favicon_192x192.png favicon_64x64.png
convert -resize 32x32 favicon_192x192.png favicon_32x32.png
convert -resize 16x16 favicon_192x192.png favicon_16x16.png
