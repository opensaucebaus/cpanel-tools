# MailSync WHM Plugin Installer

A simple script to install the MailSync cPanel/WHM plugin. Run as **root** over SSH or in the WHM Terminal.

---

## 🔧 Prerequisites

- A **cPanel/WHM** server
- **Root** access via SSH or WHM Terminal
- Internet connectivity to fetch Perl modules and system packages

---

## 🚀 Installation

1. **Upload** the installer script and plugin folders to your WHM server, for example to `/root/MailSync/`:

Log in as root via SSH or open Terminal in WHM.

2. Make the installer executable:

cd /root/MailSync
chmod +x install.sh

3. Run the installer:
./install.sh



The script will:

Verify you’re root.

Install required Perl modules (Date::Manip, Email::Simple, etc.).

Install imapsync and its dependencies.

Copy plugin files into /usr/local/cpanel/whostmgr/docroot/....

Register the plugin with WHM.

Check for missing files and report success or errors.

Logs are saved to:

/tmp/MailSync/install.log


✅ Post-Install
##Visit WHM → Plugins → MailSync to confirm the plugin appears.## - you may need to hard refresh the page after installing it before it appears

Tail the log for errors:

tail -n 50 /tmp/MailSync/install.log
🛠️ Uninstall
If provided, run the bundled uninstaller:

/etc/MailSync/uninstall_MailSync.sh
Remove any leftover files or directories:

rm -rf /usr/local/cpanel/whostmgr/docroot/{cgi,addon_plugins,templates}/MailSync \
       /etc/MailSync \
       /tmp/MailSync
🔒 Security
Only root can install or remove this plugin.

Keep your WHM and system packages up to date.
