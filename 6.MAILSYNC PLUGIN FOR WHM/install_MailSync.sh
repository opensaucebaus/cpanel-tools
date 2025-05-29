#!/bin/bash
set -euo pipefail

RED='\033[0;31m'
LRED='\033[1;31m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

LOGFILE="/tmp/MailSync/install.log"
exec > >(tee -a "$LOGFILE") 2>&1

# Check for root privileges
if [[ $EUID -ne 0 ]]; then
    printf "${RED}This script must be run as root.${NC}\n"
    exit 1
fi

if [ -e "/usr/local/cpanel/version" ]; then
        printf "${CYAN}Starting MailSync plugin installation...${NC}\n"
        mkdir -p /tmp/MailSync/logs /etc/MailSync
        touch /tmp/MailSync/MailSync.ini

        # Install Perl modules
        /scripts/perlinstaller Date::Manip || { echo "Failed to install Date::Manip"; exit 1; }
        /scripts/perlinstaller Email::Simple || { echo "Failed to install Email::Simple"; exit 1; }
        /scripts/perlinstaller Mail::POP3Client || { echo "Failed to install Mail::POP3Client"; exit 1; }
        /scripts/perlinstaller Mail::IMAPClient || { echo "Failed to install Mail::IMAPClient"; exit 1; }
        /scripts/perlinstaller JSON || { echo "Failed to install JSON"; exit 1; }

        # Install system packages
        yum install -y imapsync perl-IO-Socket-SSL || { echo "Failed to install imapsync or perl-IO-Socket-SSL"; exit 1; }
        var="$(rpm -qa | grep -w imapsync || true)"
        if [[ $var == *"imapsync"* ]]; then
                cd "$(dirname "$0")"
                yum install -y libgsasl || { echo "Failed to install libgsasl"; exit 1; }
                mkdir -p /usr/local/cpanel/whostmgr/docroot/cgi/MailSync \
                         /usr/local/cpanel/whostmgr/docroot/addon_plugins/MailSync \
                         /usr/local/cpanel/whostmgr/docroot/templates/MailSync

                # Copy plugin files, check existence first
                if [ -d "addon_plugins-MailSync" ]; then
                    cp -a addon_plugins-MailSync/. /usr/local/cpanel/whostmgr/docroot/addon_plugins/MailSync/
                else
                    echo "Directory addon_plugins-MailSync not found!"
                fi
                if [ -d "cgi-MailSync" ]; then
                    cp -a cgi-MailSync/. /usr/local/cpanel/whostmgr/docroot/cgi/MailSync/
                else
                    echo "Directory cgi-MailSync not found!"
                fi
                if [ -d "templates-MailSync" ]; then
                    cp -a templates-MailSync/. /usr/local/cpanel/whostmgr/docroot/templates/MailSync/
                else
                    echo "Directory templates-MailSync not found!"
                fi

                # Move uninstall script if present
                if [ -f "uninstall_MailSync.sh" ]; then
                    mv uninstall_MailSync.sh /etc/MailSync/uninstall_MailSync.sh
                    chmod 755 /etc/MailSync/uninstall_MailSync.sh
                fi

                chmod -R 755 /usr/local/cpanel/whostmgr/docroot/cgi/MailSync/

                # Register plugin with cPanel
                if [ -f "MailSync.conf" ]; then
                    /usr/local/cpanel/bin/register_appconfig MailSync.conf
                else
                    echo "MailSync.conf not found! Plugin may not register correctly."
                fi

                printf "\n${YELLOW}Performing Clean up ....${NC}\n"

                # Post-installation check for white screen issues
                MISSING=0
                for f in /usr/local/cpanel/whostmgr/docroot/cgi/MailSync /usr/local/cpanel/whostmgr/docroot/addon_plugins/MailSync /usr/local/cpanel/whostmgr/docroot/templates/MailSync; do
                    if [ ! -d "$f" ] || [ -z "$(ls -A "$f")" ]; then
                        printf "${RED}Warning: Directory $f is missing or empty. Plugin may not work properly.${NC}\n"
                        MISSING=1
                    fi
                done
                if [ $MISSING -eq 1 ]; then
                    printf "${RED}Some plugin files are missing. Please check the log at $LOGFILE.${NC}\n"
                else
                    printf "${GREEN}\nThe MailSync plugin is installed successfully.${NC}\n\n"
                fi
        else
                printf "${RED}MailSync plugin is unable to install ${LRED}imapsync. ${RED}Please try to install it manually.${NC}\n"
        fi
 else
        printf "\n${CYAN}Sorry, The MailSync plugin is currently available for cPanel servers only${NC}\n\n"
fi
