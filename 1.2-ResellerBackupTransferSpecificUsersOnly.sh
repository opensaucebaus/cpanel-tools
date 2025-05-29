#!/bin/bash
printf "No Ui Version - Specific Account Migration Script \n"

# Destination FTP host details
ftp_server="test.hostname.net"
ftp_user="ftpusername"
ftp_password="ftpuserpass"


# Source host WHM API details
whm_host="https://source.host.net:2087"
whm_user="reselleruser"
api_token="RESELLERAPIKEY"

# List of specific accounts to backup and transfer
accounts="cpuser1 cpuser2 cpuser3 cpuser4"


# Perform full backup of cPanel accounts and upload to FTP location in parallel
# Number of concurrent backups - ensure jq is installed
parallel_count=3

# Loop through each account and perform backup
echo $accounts | tr ' ' '\n' | parallel -j $parallel_count --no-notice '
# Set variables
whm_user="'"$whm_user"'"
api_token="'"$api_token"'"
whm_host="'"$whm_host"'"
ftp_server="'"$ftp_server"'"
ftp_user="'"$ftp_user"'"
ftp_password="'"$ftp_password"'"
user="'"$user"'"

# Perform full backup of cPanel account
backup_response=$(curl -sk -H "Authorization: whm $whm_user:$api_token" "$whm_host/json-api/cpanel?arg-0=ftp&arg-1=$ftp_server&arg-2=$ftp_user&arg-3=$ftp_password&arg-4=$ftp_user%40$ftp_server&arg-5=21&arg-6=backups/&cpanel_jsonapi_module=Fileman&cpanel_jsonapi_func=fullbackup&cpanel_jsonapi_apiversion=1&user={}")

# Get account from the current parallel instance
account={}

# Replace "{}" with the account name
backup_response=$(echo $backup_response | sed "s/{}/$account/g")
backup_status=$(echo $backup_response | jq '.status')

if [ "$account" != "" ] && [ "$backup_status" = "1" ]; then
  echo "Backup for $account created successfully"
else
  echo "$account: $backup_status ::::::  $(echo $backup_response)"
fi
echo "Sleeping 1 minute per an account to prevent overloading"
sleep 1m
'

echo "All specified cPanel accounts have been backed up successfully."
