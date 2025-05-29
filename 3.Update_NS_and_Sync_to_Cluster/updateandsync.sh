#!/bin/bash

while IFS= read -r domain; do
    zone_file="/var/named/${domain}.db"
    if [ -f "$zone_file" ]; then
        # Update SOA record
        sed -i 's/\(.*[[:space:]]IN[[:space:]]SOA[[:space:]]\)[^[:space:]]*/\1ns1.YOURNSHERE./' "$zone_file"

        # Remove existing NS records
        sed -i '/^'"$domain"'\.[[:space:]]*[0-9]\{1,\}[[:space:]]*IN[[:space:]]*NS/d' "$zone_file"

        # Add new NS records
        echo "$domain. 86400 IN NS ns1.YOURNSHERE." >> "$zone_file"
        echo "$domain. 86400 IN NS ns2.YOURNSHERE." >> "$zone_file"

        # Update serial
        perl -pi -e 'if (/\s+(202\d{7})/i) { my $i = $1+1; s/$1/$i/; }' "$zone_file"

        echo "DNS zone record for $domain updated successfully."
    else
        echo "DNS zone record not found for $domain."
    fi
done < alldomains.txt

# Reload changes and sync zones to cluster
pdns_control reload

while IFS= read -r domain; do
    /scripts/dnscluster synczone "$domain"
done < alldomains.txt
