#!/bin/bash

rollback=$1

if [[ $rollback == "rollback" && ! -s /root/aoc_input.json ]]; then
    echo "Recovery file does not exist"
    exit 9
elif [[ $rollback == "rollback" && -s /root/aoc_input.json ]]; then
    # Input file
    file="/root/aoc_input.json"

    # Extract the values of "owner" and "user"
    jq -c '.data.acct[] | select(.owner and .user)' $file | while read line; do
        owner=$(echo $line | jq -r '.owner')
        user=$(echo $line | jq -r '.user')

        # Print the values
        echo "Owner: $owner"
        echo "User: $user"
        echo ""
    done
    exit 100
else
    echo "Make sure you have set the desired user in the script | If not press Ctrl C | sleeping 5 seconds"
    sleep 5s

    whmapi1 --output=jsonpretty listaccts want=user,owner > /root/aoc_input.json

    # full dump
    whmapi1 --output=jsonpretty listaccts > /root/full_acc_dump.info

    # Change the user here ( owner= )
    whmapi1 --output=yaml listaccts want=user | grep user | awk '{print $NF}' | parallel -j 8 --no-notice whmapi1 --output=jsonpretty modifyacct owner=root user={}
fi
