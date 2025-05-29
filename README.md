# cpanel-tools
# cPanel Reseller Migration Toolkit

![Full_Ui](https://github.com/user-attachments/assets/98b3a0e2-8cfa-414f-9a5e-ab7ec48a5179)
![Partial_Ui](https://github.com/user-attachments/assets/7a1f8527-9b10-429e-8527-8103c821e335)


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

Standalone Migration scripts (No Ui)


## The following Tools have been tested on **cPanel/WHM v126.0.16** (CloudLinux 9.5.0), **PHP 8.2**. ##

**Experimental tools** for automated bulk backups, FTP-transfers, and restoring cPanel reseller accounts using WHM API + bash scripts.**

**Reseller migration tools/scripts - FULL or PARTIAL migrations - cPanel account logins remain in tact.**

Nothing fancy - just some php, bash and whm api thrown together in a simple Ui to help support staff speed up Reseller migrations where no root access is available to the source host.

The backup and transfer tools can run without root access (**if using cloudlinux disable cagefs and php-fpm restrictions on the destination host for the restored reseller cpanel account where the tools will run**) - however - **the restore script on the destination host requires root**.

**Some steps to avoid issues:**

WHITELIST SOURCE HOST IP ON DESTINATION HOST FOR 24 HOURS VIA CSF

ENSURE YOU HAVE ENOUGH FREE DISK SPACE TO STORE ALL THE BACKUPS ON THE DESTINATION HOST AS WELL AS FREE DISK SPACE PER CPANEL ACCOUNT ON SOURCE HOST TO GENERATE FULL BACKUPS - The tools will Move the full backups to the destination host and not store them under the source cPanel accounts - IN SOME CASES YOU MAY ALSO NEED TO CHECK THE BANDWIDTH PER CPANEL ACCOUNT IF ASSIGNED PACKAGES HAVE SUCH LIMITS.

**IMPORTANT: Manually migrate only the reseller cpanel account first using a full backup generated within the cPanel of the Reseller account using the native cPanel full backup function in cPanel.** - this will ensure all reseller packages migrate over to the destination host.

Login to source reseller cPanel account, generate full backup using cpanel native backup function, download the cpanel backup to local then upload and restore on your destination host (or transfer from source to destination directly) this way it will migrate ALL RESELLER PACKAGES where the transfer tool in WHM as root does not in some cases. so it should look kinda like this as an example:

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

Navigate to https://yourlivedomain/1.1Reseller_Migration_Tool_WebUI_Full/ to start the migration on the DESTINATION HOST; this will generate and transfer full cPanel backups from the SOURCE HOST to your DESTINATION HOST /backups dir.

Monitor transfer status on DESTINATION HOST by checking the file sizes under **/home/yourlivedomain/backups** - the Ui will print a notice once all backups have been generated and tell you to allow some time for the FTP transfers to complete before restoring the accounts using the bulk restore script.

Upload to non public folder for example the /backups folder under yourlivedomain - updateandsync.sh, susandunsus.sh, changeowner.sh - Edit scripts manually to include source host/whm/api info - use as required
Upload bulkrestore.sh to /backups folder under yourlivedomain/backups

**SSH into the DESTINATION HOST** as root (or open the Terminal in WHM as root).  
_If you don’t have root access, ask your host to restore the accounts for you._

---

**a. Change into the backups directory**  
    cd /home/yourlivedomain/backups

---

**b. Build and clean your backup list**  
1. Generate the list:  
    ls > backupslist  
2. Edit and remove unwanted entries:  
    nano backupslist  
   - Delete any lines that aren’t cPanel backup files (e.g. susandunsus.sh).  
   - Also remove the primary reseller cPanel backup (it should already be restored).

---

**c. Run the bulk-restore script**  
    ./bulkrestore.sh  
This will invoke /scripts/restorepkg and display restore progress. (Must be run as root.)

![whm_terminal](https://github.com/user-attachments/assets/ec18574a-9bc6-46ed-8e9e-ab4f15229434)

---

**d. (OPTIONAL) Update DNS zones**  
1. Open the domains list:  
    nano alldomains.txt  
2. Paste in all domains from the Source WHM “Zone Manager,” then save.  
3. Strip trailing spaces:  
    sed -i 's/[[:space:]]*$//' alldomains.txt  
4. Edit and apply your nameserver changes:  
    nano updateandsync.sh  
    ./updateandsync.sh  
_Only required if the source NS appears in restored DNS zones._

---

**e. (OPTIONAL) Prepare to suspend source accounts**  
1. Open the suspend script:  
    nano susandunsus.sh  
2. Set your source-Reseller details:  
    whm_host="https://source.host.net"  
    whm_user="resellerusername"  
    api_token="RESELLERAPITOKEN"  
3. Save and exit.

---

**f. (OPTIONAL) Suspend source accounts during DNS cut-over**  
    ./susandunsus.sh suspend  
This prevents users from making changes on the source host while DNS propagates.

Address any missing or failed accounts with - 1.2Reseller_Migration_Tool_WebUI_Specific_Users_Only - on DESTINATION HOST - works the same as the full migration tool but only for specific cPanel usernames to avoid having to redo the entire reseller account. This tool will backup and transfer specified missing accounts from SOURCE HOST (specified by cPanel usernames).

In some cases the source host NS will reflect under the DNS zones of the restored accounts on the destination host - you can edit the updateandsync.sh script to change the NS records for the restored accounts to your NS and sync to your cluster - comment out the sync to cluster part if you do not have a cluster. If using 3rd party NS for example Cloudflare NS - exclude from the list.

Clean up "backups" folder on DESTINATION HOST once all accounts` integrity confirmed - adjust quota for reseller account as needed based on reseller package.

Migration complete.



**I hope these tools make your life easier :) **

## 🙏 Support

If these tools made your life easier, please consider buying me a coffee (or a pizza)!  
Your donation helps me keep improving and maintaining them.  

[Donate via PayPal](https://www.paypal.com/donate/?hosted_button_id=FNQ2RW62BR9HC)
