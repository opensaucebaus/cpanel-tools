
Please note - bulkbackup.sh - requires jq to work.

Login to source reseller cPanel account, generate full backup, download to local then upload and restore on destination host as it will migrate all reseller packages where the transfer tool does not - in any case this script is meant for hosts that block outgoing ftp and ssh so transfer tool will not work not will the web ui reseller migration tools.


1. Login to source host and generate full access API and save on your local temporarily

2. changepass.sh - Edit the host ; user ; api ; password fields with the source host details and set a new password that will be used for all cPanel accounts then run the changepass.sh on your local or on the destination server

3. bulkbackup.sh - Edit the host ; user ; api fields then run On the Destination server or on your local - ensure you give it enough time to complete - login to the largest cPanel account to check if it`s backup is done then proceed

4. Login to destination server via SSH and clone the migration script - wget_ftp_download_loop.sh and credentials.txt - to a temporary backup folder - /home/reselleruser/backups for example 

5. Make sure the credentials.txt has the correct info in it (see example below) then run the wget_ftp_download_loop.sh script under a subfolder under the destination reseller account for example - /home/reselleruser/backups

6. In the backup destination run ls > backupslist

7. Upload the bulkrestore.sh and run it via SSH - this will restore all backups under the current dir - /home/reselleruser/backups

All of the above must be done from the same directory for example /home/reselleruser/backups





Example of credentials.txt format:

IP cpuser newpassword

12.1.210.9 groupltdco 0DIY0A1Q34XWZ52PYHZFK4V0XAFE3BZR



you can quickly format the data mentioned above by downloading the reseller list accounts csv in whm then just add the password (the one you set in changepass.sh) next to each cpuser and delete the other columns then copy and paste to credentials.txt