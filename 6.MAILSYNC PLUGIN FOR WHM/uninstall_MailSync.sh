#!/bin/bash
set -euo pipefail
RED='\033[0;31m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check for root privileges
if [[ $EUID -ne 0 ]]; then
    printf "${RED}This script must be run as root.${NC}\n"
    exit 1
fi

printf "Do you wish to uninstall the MailSync Plugin (y/n) "
read -r confirm
if [[ $confirm == "y" || $confirm == "Y" ]]; then
    printf "\n${YELLOW}Performing Uninstallation ...${NC}\n"
    /usr/local/cpanel/bin/unregister_appconfig MailSync || true

    # Remove plugin files/directories if they exist
    rm -rf /var/cpanel/apps/MailSync.conf
    rm -rf /usr/local/cpanel/whostmgr/docroot/cgi/MailSync
    rm -rf /usr/local/cpanel/whostmgr/docroot/addon_plugins/MailSync
    rm -rf /usr/local/cpanel/whostmgr/docroot/templates/MailSync
    rm -rf /etc/MailSync

    printf "\n${RED}Uninstallation Complete!${NC}\n\n"
else
    printf "\n${CYAN}The uninstallation process is cancelled${NC}\n\n"
    exit 0
fi
