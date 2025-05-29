Specific cPanel Account Under Reseller - Migration Tool

A PHP web UI to trigger backups for selected cPanel accounts under a reseller via the WHM API.

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


## 📋 Installation

1. **Clone or upload to destination host under a live cpanel account** this repo under yourlivesite webroot (e.g. `public_html/`):  

git clone https://github.com/opensaucebaus/cpanel-tools.git

Set permissions:

chmod +x /home/yourlivesite/public_html/1.2Reseller_Migration_Tool_WebUI_Specific_Users_Only/migrations_script.sh
chown -R yourcpuser:yourcpuser /home/yourcpuser/public_html/ - if you cloned as root and not the cpuser

Visit https://yourdomain.com/1.2Reseller_Migration_Tool_WebUI_Specific_Users_Only in your browser.


Use Case

Great for migrating a subset of accounts from a shared environment

Can be used by resellers to gather backups and request root to perform the restore

Avoids password resets and unnecessary account downtime

