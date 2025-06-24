#!/bin/bash

# make sure `./node_modules` is in the repo

if [ -d "./node_modules" ]; then
  echo "node_modules exists, removing..."
  rm -rf ./node_modules
  echo "node_modules removed"
else
  echo "node_modules does not exist, skipping..."
fi

echo "installing dependencies..."
bun i
echo "dependencies installed"
