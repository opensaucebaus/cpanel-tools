Specific cPanel Account Under Reseller - Migration Tool

A PHP web UI to trigger backups for selected cPanel accounts under a reseller via the WHM API, running from a middle-man server.

README.md

# Specific Reseller Migration Tool

## Overview

This script allows you to generate and transfer full cPanel backups for selected accounts belonging to a reseller. It is especially useful when migrating only a portion of accounts from a larger reseller set, while preserving credentials and minimizing end-user disruption.

## Key Features
- Select specific accounts under a Reseller user
- Secure environment-variable based credential passing
- WHM API integration
- Parallelized backup execution
- Live terminal-style output logging

## Requirements
- Reseller must have adequate permissions (not restricted by cageFS or jailed shell)
- Bulk restore still requires root access
- Recommended to run on destination server as root for full automation

## 🔧 Prerequisites

1. **Source WHM Reseller**  
   - Must have **Reseller** API token with _listaccts_ & _cpanel backup_ privileges  
   - cPanel Backup feature enabled for each account  
2. **Destination Server**  
   - PHP 8.2 + modules: `curl`, `xml`, `mbstring`  
   - Bash, `curl`, `jq` installed  
3. **FTP Destination**  
   - FTP account on destination host with write permissions to `backups/`  
   - Port 21 open and reachable from source host  
4. **Security**  
   - Disable CageFS & PHP-FPM in the cPanel account running this app  
   - Whitelist source IP in CSF on destination  


Deployment Steps

Upload/extract Reseller_Migration_Tool_WebUI_Specific_Users_Only.zip to your server:

Preferably under /public_html/specific_users/ of a live or temporary cPanel account

Files to deploy:

index.php

migrate.php

fetch_output.php

migrations_script.sh

.htaccess

README.md

Create Basic Auth credentials:
sudo htpasswd -c /home/YOURCPUSER/public_html/specific_users/.htpasswd admin

Set permissions:
sudo chmod +x /home/YOURCPUSER/public_html/specific_users/migrations_script.sh
sudo chown -R YOURCPUSER:YOURCPUSER /home/YOURCPUSER/public_html/specific_users/

Open in browser:
https://yourdomain/specific_users/

Enter your destination FTP and WHM Reseller credentials along with the list of accounts to migrate.

Important Note

If running on a shared hosting account, you must explicitly edit the path in migrate.php to reflect your environment (only necessary for older versions):
$cmd = "/home/YOURCPUSER/public_html/specific_users/migrations_script.sh ...";

Replace YOURCPUSER with the actual cPanel user name.

Use Case

Great for migrating a subset of accounts from a shared environment

Can be used by resellers to gather backups and request root to perform the restore

Avoids password resets and unnecessary account downtime

Files Summary

index.php: Form interface to enter credentials and account list

migrate.php: Sanitizes inputs, exports credentials, launches script

fetch_output.php: Displays migration log in browser

migrations_script.sh: Uses WHM API to generate backups

.htaccess: Basic Auth and HTTPS enforcement

README.md: This guide
