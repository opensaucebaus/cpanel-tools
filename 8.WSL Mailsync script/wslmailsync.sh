#!/bin/bash

# Source and destination mail server setting
SERVER1=imap.gmail.com
SERVER2=imap.gmail.com

# Select appropriate auth mechanism.
#AUTHMECH1="--authmech1 LOGIN"
#AUTHMECH2="--authmech2 LOGIN"

# Uncomment if you want to start test/dryrun only. No emails will be transferred!
#TESTONLY="--dry"

# Path to imapsync
imapsync=/PATH-WHERE-YOU-INSTALLED-IMAPSYNC/imapsync

# Users file
if [ -z "$1" ]; then
    USERS_FILE="./users.txt"  # Default to users.txt in the same directory
else
    USERS_FILE="$1"  # Use the provided file path
fi

if [ ! -f "$USERS_FILE" ]; then
    echo "Given users text file \"$USERS_FILE\" does not exist"email;pass;email;pass
    exit 1
fi

# Start loop - MODIFY THIS SECTION IF NO SSL IS AVAILABLE ON SOURCE/DESTINATION
{ while IFS=';' read u1 p1 u2 p2; do
        $imapsync ${TESTONLY} ${AUTHMECH1} --host1 ${SERVER1} --user1 "$u1" --password1 "$p1" --ssl1 ${AUTHMECH2} --host2 ${SERVER2} --user2 "$u2" --password2 "$p2" --ssl2
done ; } < "$USERS_FILE"
# End loop