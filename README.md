# cpanel-tools
# cPanel Reseller Migration Toolkit

**Overview:**
Migration Tools to generate 4 full cpanel account backups at a time then transfer to your destination host over ftp untill All/Specified account backups are migrated - then run seperate bulk restore script on destination host. (you can increase the limit by editing the script - 4 is just default to avoid overloading the source host - some hosts will flag the script and kill it if you cause too much load on a shared server so rather be safe. 
Full and Specific account only migration tools.
Bulk Restore script
Update DNS Zones script
Suspend Origin cPanel accounts
Change Ownership of migrated or other cPanel accounts
Mailsync Plugin for WHM using imapsync
WSL version of Mailsync script for quick bulk mail migrations
WSL DNS Checker
Wp-admin injector
SSL Generator for offline/dev sites using CloudFlare

## The following Tools have been tested on **cPanel/WHM v126.0.16** (CloudLinux 9.5.0), **PHP 8.2**. ##

**Experimental tools** for automated bulk backups, FTP-transfers, and restoring cPanel reseller accounts using WHM API + bash scripts.**

**Reseller migration tools/scripts - FULL or PARTIAL migrations - cPanel account logins remain in tact.**

Nothing fancy - just some php, bash and whm api thrown together in a simple Ui to help support staff speed up Reseller migrations where no root access is available to the source host.

The backup and transfer tools can run without root access (**if using cloudlinux disable cagefs and php-fpm restrictions on the destination host for the restored reseller cpanel account where the tools will run**) - however - **the restore script on the destination host requires root**.

**Some steps to avoid issues:**

WHITELIST SOURCE HOST IP ON DESTINATION HOST FOR 24 HOURS VIA CSF

ENSURE YOU HAVE ENOUGH FREE DISK SPACE TO STORE ALL THE BACKUPS ON THE DESTINATION HOST AS WELL AS FREE DISK SPACE PER CPANEL ACCOUNT ON SOURCE HOST TO GENERATE FULL BACKUPS - The tools will Move the full backups to the destination host and not store them under the source cPanel accounts - IN SOME CASES YOU MAY ALSO NEED TO CHECK THE BANDWIDTH PER CPANEL ACCOUNT IF ASSIGNED PACKAGES HAVE SUCH LIMITS.

**IMPORTANT: Manually migrate only the reseller cpanel account first using a full backup generated within the cPanel of the Reseller account using the native cPanel full backup function in cPanel.** - this will ensure all reseller packages migrate over to the destination host.

Login to source reseller cPanel account, generate full backup using cpanel native backup function, download the cpanel backup to local then upload and restore on your destination host (or transfer from source to destination directly) this way it will migrate ALL RESELLER PACKAGES where the transfer tool in WHM as root does not in some cases. so it should look kinda like this

| Source Host WHM List Accounts       | Destination Host WHM List Accounts  |
|-------------------------------------|-------------------------------------|
| Reseller.com                        | Reseller.com                        |
| domain1.com                         | Yourlivedomain.com                  |
| domain2.com                         |                                     |
| domain3.com                         |                                     |
| domain4.com                         |                                     |
| domain5.com                         |                                     |


**On the Destination host - Upload the Reseller migration tool for example:**

/home/yourlivedomain/public_html/1.1Reseller_Migration_Tool_WebUI_Full
/home/yourlivedomain/public_html/1.2Reseller_Migration_Tool_WebUI_Specific_Users_Only

**Then create the folder "backups" where the full cpanel account backups will be stored on the destination host:**
/home/yourlivedomain/backups

Modify .htaccess file located where you uploaded the migration tool on the destination host - for example - /home/yourlivedomain/public_html/ - to only allow access to your IP/source host IP - if you do not wish the tool to be publicly accessible

**WHM Reseller Pre-Migration Steps:**

Log into SOURCE HOST WHM; generate full access API Key and save in notepad; UNSUSPEND ALL suspended accounts under the Source Reseller account.

Download CSV from List Accounts on SOURCE HOST; update quotas for accounts with >50% disk usage to ensure full backup generates. You can use formulas in Excel or Google Docs to point out these accounts. For example:
=IF(H2/G2>0.5, "Change Package", "")
Adjust H/G in formula as needed (Disk Space Used/Quota)

Ensure enough bandwidth is available per cpanel account on SOURCE HOST WHM - View Bandwidth Usage to ensure the backup transfer succeeds; adjust packages if needed or modify account b/w and disk limits.

Create and download a Full cPanel backup from Primary Reseller cPanel account from SOURCE HOST. Use Backup Wizard in cPanel. Transfer from Remote cPanel Account in WHM does not restore reseller packages (in some cases) where the full cPanel backup does.

Log into DESTINATION HOST WHM as root; upload and restore Primary Reseller cPanel backup via Transfer or Restore a cPanel Account; update quota if needed.

Create "backups" folder via File Manager on DESTINATION HOST under any live cPanel account in the / dir; for example, **/home/yourlivedomain/backups.**

**Upload the migration tools to yourlivedomain.com for example:**

/home/yourlivedomain/public_html/1.1Reseller_Migration_Tool_WebUI_Full
/home/yourlivedomain/public_html/1.2Reseller_Migration_Tool_WebUI_Specific_Users_Only

Navigate to https://yourlivedomain/1.1Reseller_Migration_Tool_WebUI_Full/index.php to start the migration on the DESTINATION HOST; this will generate and transfer full cPanel backups from the SOURCE HOST to your DESTINATION HOST /backups dir.

Monitor transfer status on DESTINATION HOST by checking the file sizes under **/home/yourlivedomain/backups** - the Ui will print a notice once all backups have been generated and tell you to allow some time for the FTP transfers to complete before restoring the accounts using the bulk restore script.

Upload to non public folder for example the /backups folder under yourlivedomain - updateandsync.sh, susandunsus.sh, changeowner.sh - Edit scripts manually to include source host/whm/api info - use as required
Upload bulkrestore.sh to /backups folder under yourlivedomain/backups

SSH into the DESTINATION HOST as root or access Terminal in WHM as root - IF YOU DO NOT HAVE ROOT ACCESS TO THE DESTINATION YOU WILL HAVE TO ASK YOUT HOST TO RESTORE THE ACCOUNTS:
a. Execute "cd /home/yourlivedomain/backups"
b. Execute "ls > backupslist" then "nano backupslist" and remove any lines that are not cPanel backup files. For example, backup-9.8.2023_08-16-28_cpuser.tar.gz is correct, and susandunsus.sh must be removed from the list and saved. - ALSO REMOVE THE PRIMARY RESELLER CPANEL BACKUP ACCOUNT FROM THE LIST AS IT SHOULD ALREADY BE RESTORED AT THIS POINT
c. Execute "./bulkrestore.sh in /home/yourlivedomain/backups" - this will display the restore progress using /scripts/restorepkg (must be run as root)
d. (OPTIONAL) Update DNS zones - "nano alldomains.txt" then copy all zones from SOURCE HOST WHM / Zone Manager and save. Then run "sed -i 's/[[:space:]]*$//' alldomains.txt" to remove any spaces after the domains. Next, run "nano updateandsync.sh" and edit the NS / SOA sections to reflect your NS, then run "./updateandsync.sh". This is ONLY REQUIRED IF SOURCE HOST NS reflects in restored account DNS zones on DESTINATION HOST, which can be checked via Zone Manager in WHM on DESTINATION HOST.
e. (OPTIONAL) Suspend source accounts to avoid re migrations / while propagation takes place - Execute "nano susandunsus.sh" and edit the following fields to reflect the SOURCE HOST reseller account details and save:
whm_host="https://source.host.net"
whm_user="resellerusername"
api_token="RESELLERAPITOKEN"
f. (OPTIONAL) Execute "./susandunsus.sh suspend" under yourlivedomain/backups to suspend all accounts under the Reseller account on the SOURCE HOST to avoid users making changes while propagation takes place then having to remigrate accounts.

Address any missing or failed accounts with - 1.2Reseller_Migration_Tool_WebUI_Specific_Users_Only - on DESTINATION HOST - works the same as the full migration tool but only for specific cPanel usernames to avoid having to redo the entire reseller account. This tool will backup and transfer specified missing accounts from SOURCE HOST (specified by cPanel usernames).

In some cases the source host NS will reflect under the DNS zones of the restored accounts on the destination host - you can edit the updateandsync.sh script to change the NS records for the restored accounts to your NS and sync to your cluster - comment out the sync to cluster part if you do not have a cluster. If using 3rd party NS for example Cloudflare NS - exclude from the list.

Clean up "backups" folder on DESTINATION HOST once all accounts` integrity confirmed - adjust quota for reseller account as needed based on reseller package.

Migration complete.

I hope these tools make your life easier :) 

## 🙏 Support

If these tools made your life easier, please consider buying me a coffee (or a pizza)!  
Your donation helps me keep improving and maintaining them.  

[Donate via PayPal](https://www.paypal.com/donate/?hosted_button_id=FNQ2RW62BR9HC)
