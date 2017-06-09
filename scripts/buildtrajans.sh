#!/bin/bash 
# Build script for trajans
export NODE_ENV=production
git pull origin master
grunt build && forever stop trajans.js && forever start trajans.js
tput setaf 2
echo "Build Complete!"
tput sgr0

