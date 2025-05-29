#!/bin/bash

counter=0

while IFS='' read -r line || [[ -n "$line" ]]; do

  if [ $counter -lt 4 ] ; then
    echo  "$counter : $line"
    if /usr/local/cpanel/scripts/restorepkg "$line" & then
      ((counter++))
    else
      echo "Restore failed for $line"
    fi
  fi

  if [ $counter -eq 4 ] ; then
    wait # Wait for all background processes to finish.
    counter=0
  fi

done < "backupslist"

wait # Wait for all background processes to finish.

echo "All backups were restored successfully."