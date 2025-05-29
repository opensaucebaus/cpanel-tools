#!/bin/bash

# Assuming credentials.txt is a file with IP, username, and password separated by spaces, one set per line
# Format:
# IP username password
# 212.1.210.9 user1 0DIY0A1Q34XWZ52PYHZFK4V0XAFE3BZR
# ...

while IFS=' ' read -r ip user pass || [[ -n "$ip" ]]; do
    wget --retry-connrefused --waitretry=5 --read-timeout=20 --timeout=15 -t inf --user="$user" --password="$pass" ftp://"$ip"/*.tar.gz
done < credentials.txt
