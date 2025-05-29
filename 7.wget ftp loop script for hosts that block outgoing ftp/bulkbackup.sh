#!/bin/bash
printf "Version 2.0 \n"

# WHM API details
whm_host="https://source.host.com:2087"
whm_user="RESELLERUSERNAME"
api_token="RESELLERAPITOKEN"

# Get list of all cPanel accounts
accounts=$(curl -sk -H "Authorization: whm $whm_user:$api_token" "$whm_host/json-api/listaccts?api.version=1" | jq '.data.acct[] | .user')
echo $accounts | tr ' ' '\n' | tr -d \"

# Number of concurrent backups
parallel_count=3

# Loop through each account and perform backup
echo $accounts | tr ' ' '\n' | tr -d \" | parallel -j $parallel_count --no-notice '
# Set variables
whm_user="'"$whm_user"'"
api_token="'"$api_token"'"
whm_host="'"$whm_host"'"

# Get account from the current parallel instance
account={}

# Perform full backup of cPanel account without FTP details
backup_response=$(curl -sk -H "Authorization: whm $whm_user:$api_token" "$whm_host/json-api/cpanel?cpanel_jsonapi_module=Fileman&cpanel_jsonapi_func=fullbackup&cpanel_jsonapi_apiversion=1&user=$account&dest=home")

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

echo "All cPanel accounts have been backed up successfully."
