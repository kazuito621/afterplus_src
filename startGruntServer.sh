#!/bin/sh

cd `dirname $0`
nohup grunt server --force & 

echo "Running grunt server"

