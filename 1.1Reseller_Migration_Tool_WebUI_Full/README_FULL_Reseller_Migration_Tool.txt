# Full Reseller Migration Tool

> **🚧 Experimental** — use at your own risk.

A PHP-powered web UI + Bash backend to generate and FTP full cPanel backups for _every_ account under a reseller user.

---

##⚙️ Tested Environment

- **cPanel & WHM** v126.0.16  
- **CloudLinux** v9.5.0 STANDARD  
- **PHP** 8.2  
- **Server Configuration**  
  - Run on your **destination** host (where you have root or high‐privilege access)  
  - **Disable CageFS** & **PHP-FPM restrictions** on the cPanel account hosting the web UI  
  - Whitelist the **source** host’s IP in **CSF** on the destination (and vice-versa if possible)  

---

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

---

## 📋 Installation

1. **Clone or upload to destination host under a live cpanel account** this repo under yourlivesite webroot (e.g. `public_html/migration/`):  
   ```bash
   git clone https://github.com/opensaucebaus/cpanel-tools.git /home/yourlivesite/public_html/migration


Secure with HTTP Basic Auth (optional but recommended):

htpasswd -c /home/yourcpuser/public_html/migration/.htpasswd admin


Set permissions:

chmod +x /home/yourlivesite/public_html/migration/1.1Reseller_Migration_Tool_WebUI_Full/migrations_script.sh
chown -R yourcpuser:yourcpuser /home/yourcpuser/public_html/migration - if you cloned as root and not the cpuser


Visit https://yourdomain.com/migration/1.1Reseller_Migration_Tool_WebUI_Full in your browser.


🚀 Usage
Enter Source WHM host, Reseller username, and API token.

Enter FTP server, user, and password (destination for backups).

Click Start Migration.

Monitor the live log area for progress (up to 4 parallel backups).

After completion, verify backup files in your FTP backups/ folder before running any restore.
⚙️ How It Works
index.php: Web form and JavaScript poller.

migrate.php: Validates input, exports env vars, launches migrations_script.sh in background.

fetch_output.php: Streams output.log to the browser, preserving line breaks.

migrations_script.sh:

Truncates old logs, logs to output.log/error.log.

Fetches reseller’s account list via WHM API.

Runs 4 simultaneous fullbackup_to_ftp calls (via WHM API) in background, throttling to max 4.

Logs each step with timestamps.

📋 Requirements Summary
Component	Version / Notes
PHP	8.2
cPanel/WHM	≥ v126.0.16
CloudLinux	v9.5.0 STANDARD
Bash + utilities	curl, jq
Server config	CageFS & PHP-FPM disabled
Firewall	Source IP ↔ Destination IP whitelisted in CSF
Reseller API	Token with listaccts & backup permissions
cPanel accounts	Backup feature enabled

🛑 Disclaimer
These tools are experimental. Use at your own risk. The author will not be responsible for any data loss, downtime, or other issues arising from use of these scripts.


License
This project is open source under the MIT License. Feel free to use and contribute



🚀 Usage
Enter Source WHM host, Reseller username, and API token.

Enter FTP server, user, and password.

In Accounts field, enter a comma-separated list of cPanel usernames to migrate.

Click Start Migration.

Monitor the live log (up to 4 concurrent backups) in the browser.

After completion, verify backup files in your FTP backups/ folder.
⚙️ How It Works
index.php: Web form + JS poller.

migrate.php: Validates inputs, exports env vars, kicks off migrations_script.sh.

fetch_output.php: Streams output.log to the browser.

migrations_script.sh:

Truncates old logs.

Reads ACCOUNTS_LIST and runs ≤4 simultaneous fullbackup_to_ftp API calls.

Logs each event with timestamps.

📋 Requirements Summary
Component	Version / Notes
PHP	8.2
cPanel/WHM	≥ v126.0.16
CloudLinux	v9.5.0 STANDARD
Bash + utilities	curl, jq
Server config	CageFS & PHP-FPM disabled
Firewall	Source IP ↔ Destination IP whitelisted in CSF
Reseller API	Token with listaccts & backup permissions
cPanel accounts	Backup feature enabled
