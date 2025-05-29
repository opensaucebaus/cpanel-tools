#!/bin/bash

printf "Version: Testing \nConcurrent api calls=${parallel_count} \n\n"

option=$1

# Number of concurrent api calls
parallel_count=5

# WHM API details
whm_host="https://origin.host.net"
whm_user="resellerusername"
api_token="RESELLERAPITOKEN"


if [[ ! "$option" =~ ^(suspend|unsuspend)$ ]] ; then
        printf "Error: You need to specify suspend or unsuspend \n\nExample: ./susandunsus suspend \nExample: ./susandunsus unsuspend"
        set -e
        exit 9
fi

if [[ $whm_host == "https://example.net:2087" || $whm_user == "exampleTest" || $api_token == "exampleTest" ]]; then
        printf "Error: You need to change the three[3] variables at the top of the script \nwhm_host \nwhm_user \napi_token "
        set -e 
        exit 10
fi

accounts=$(curl -sk -H "Authorization: whm $whm_user:$api_token" "$whm_host/json-api/listaccts?api.version=1" | jq '.data.acct[] | .user' | sed "s/\"$whm_user\"//g" | sed "/^$/d" )
if [[ $option == "suspend" ]]; then

# Get list of all cPanel accounts
echo "$accounts" | tr ' ' '\n' | tr -d \"
# Perform account suspension of cPanel accounts excluding the reseller account

# Loop through each account and perform api call to suspend
echo "$accounts" | tr ' ' '\n' | tr -d \" | while read -r account
do
        curl -sk -H "Authorization: whm $whm_user:$api_token" "$whm_host/json-api/suspendacct?api.version=1&user=$account"
	printf "\n"
done

elif [[ $option == "unsuspend" ]]; then


# Get list of all cPanel accounts
echo "$accounts" | tr ' ' '\n' | tr -d \"
# Perform account suspension of cPanel accounts excluding the reseller account

# Loop through each account and perform api call to unsuspend
echo "$accounts" | tr ' ' '\n' | tr -d \" | while read -r account
do
        curl -sk -H "Authorization: whm $whm_user:$api_token" "$whm_host/json-api/unsuspendacct?api.version=1&user=$account"
	printf "\n"
done

fi
