#!/bin/sh
ps ax|awk '{if ($5 == "grunt") print $1}'|xargs kill

