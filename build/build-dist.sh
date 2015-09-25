#!/bin/bash

# Quick'n'dirty bash script for building installable Backloader extension distributions.
# Usage: ./build-dist.sh

rm -rf ../dist
mkdir ../dist

# Build chrome/opera/vivaldi extension
echo "Building signed CRX distributable file."
./crxmake.sh ../src ./Backloader.pem ../dist/Backloader.crx
echo "Built signed CRX distributable file."

echo ""

# Build firefox .xpi
echo "Building unsigned XPI (Mozilla) distributable file."
cd ../src;
zip -r ../dist/Backloader.xpi *
echo "Built unsigned XPI (Mozilla) distributable file."

echo ""

echo "Build complete."
