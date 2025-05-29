#!/bin/sh
export SERVER_SOFTWARE=""
cmd="--host1 $2 --user1 $3 --password1 $4 --host2 localhost --user2 $5 --password2 $6"

if [ $7 == "true" ]
then
    ssl=" --ssl1"
else
    ssl="--no-ssl1 --no-ssl2 --no-tls1 --no-tls2"
fi

if [ $1 == "IMAP" ]
then
    imapsync $ssl $cmd
else
    echo "Error: POP3 sync is not supported. Please use IMAP sync instead."
    exit 1
fi