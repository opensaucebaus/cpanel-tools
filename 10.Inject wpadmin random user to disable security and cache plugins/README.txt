This is not intended for malicious use - it is intended for those scenarios where you urgently require wp-admin access to purge cache, disable certain plugins, create plugin lvl backups for example updraft etc before migrating a wordpress site - or when you urgently need to fix an issue for a client but you don`t have wp-admin access - the list of use cases goes on and on.

Simply upload to public_html then navigate to https://yourdomain/injectwpadmin.php and the script will create a random admin user and email and log you into wp-admin - the script self deletes once you are in wp-admin but check the public_html folder to be sure - NOTE - it does not delete the random user - you will need to do that from another admin user account.
 
