#!/bin/bash

filename="2020.txt"

# Check if the file exists
if [ ! -f "$filename" ]; then
  echo "Error: File '$filename' not found."
  exit 1
fi

# Read the file line by line
while IFS= read -r line; do
  # Use wget to download the content of each line
  if [ -n "$line" ] && [ ! -f $(basename ${line}) ]; then # Skip empty lines and files that exist
    wget "$line"
  fi
done < "$filename"

# Convert each file to COG
