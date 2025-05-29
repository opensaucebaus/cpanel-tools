Running Bulk Restore as Root - If you do not have root send this to your host:

Upload the full .tar.gz cPanel backups to a folder (e.g., ~/backups)

Place the bulkrestore.sh script in the same /backups folder where all the cPanel backups reside

Make it executable:
chmod +x bulkrestore.sh

First restore the Primary Reseller account - as in the owner/reseller of all the cPanel accounts to retain ownership once the bulk restore completes.

Create the list of backups but remove the reseller account user from the list as that has already been restored at this point:
ls *.tar.gz | sed 's/\.tar\.gz$//' > backupslist

nano backupslist (remove the primary reseller account backup from the list and save - only the cpanel account backups should reflect on the list)


Run it:
./bulkrestore.sh

Dry-run mode:
./bulkrestore.sh --dry-run

Monitor progress via process list in WHM - the script shows no output during restores but it will print "All accounts restored successfully." once completed.


Features:

Automatically restores 3 accounts in parallel - you can edit the script manually to run 4 restores at a time - to be safe do not increase this more to avoid overloading the host

Run as root via ssh or via Terminal in WHM if available for root user - use Screen

Retries failed restores once

Handles Ctrl+C interrupts safely

Logs output to restore.log and failures to restore_errors.log

Generates JSON and CSV summary reports: summary.json, summary.csv

Sends optional email notification if configured (edit the script)