#!/bin/bash
printf "Reseller Password Update Script \n"

# WHM API details
whm_host="https://source.host.com:2087"
whm_user="your_reseller_username"
api_token="your_api_token"

# New password to set for all accounts
new_password="pass12345"

# Get list of all cPanel accounts
accounts=$(curl -sk -H "Authorization: whm $whm_user:$api_token" "$whm_host/json-api/listaccts?api.version=1" | jq '.data.acct[] | .user')
echo "Updating passwords..."

# Loop through each account and update password
echo $accounts | tr ' ' '\n' | tr -d \" | while read account; do
  if [ "$account" != "" ]; then
    # Update password
    update_response=$(curl -sk -H "Authorization: whm $whm_user:$api_token" "$whm_host/json-api/passwd?api.version=1&user=$account&password=$new_password")
    update_status=$(echo $update_response | jq '.metadata.result')

    if [ "$update_status" = "1" ]; then
      echo "Password updated for $account"
    else
      echo "Failed to update password for $account"
    fi
  fi
done

echo "Password update process complete."
