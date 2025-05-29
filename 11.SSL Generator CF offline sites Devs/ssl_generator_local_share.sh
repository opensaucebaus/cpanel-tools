#!/bin/bash

# Cloudflare API credentials
CF_API_TOKEN="YOUR CF API TOKEN"
CF_ZONE_ID="YOUR DOMAIN ZONE ID"
DOMAIN="test.yourdomain.com"
CERTBOT_DOMAIN="${CERTBOT_DOMAIN:-$DOMAIN}"
CERT_DIR=$(pwd)

# Function to get the Zone ID (if not provided)
get_zone_id() {
    curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=$(echo $CERTBOT_DOMAIN | awk -F '.' '{print $(NF-1)"."$NF}')" \
    -H "Authorization: Bearer $CF_API_TOKEN" \
    -H "Content-Type: application/json" | jq -r '.result[0].id'
}

# Add the DNS TXT record for the challenge
add_txt_record() {
    local record_name="_acme-challenge.$CERTBOT_DOMAIN"
    local record_value=$CERTBOT_VALIDATION

    echo "Creating TXT record for $record_name..."

    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records" \
    -H "Authorization: Bearer $CF_API_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{\"type\":\"TXT\",\"name\":\"$record_name\",\"content\":\"$record_value\",\"ttl\":120}" | jq
}

# Remove the DNS TXT record after verification (optional)
remove_txt_record() {
    local record_name="_acme-challenge.$CERTBOT_DOMAIN"

    record_id=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records?type=TXT&name=$record_name" \
    -H "Authorization: Bearer $CF_API_TOKEN" \
    -H "Content-Type: application/json" | jq -r '.result[0].id')

    if [[ "$record_id" != "null" ]]; then
        echo "Removing TXT record for $record_name..."
        curl -s -X DELETE "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records/$record_id" \
        -H "Authorization: Bearer $CF_API_TOKEN" \
        -H "Content-Type: application/json" | jq
    fi
}

# Deploy the DNS challenge (called by Certbot)
deploy_challenge() {
    add_txt_record
    sleep 30 # Wait for DNS propagation (adjust as needed)
}

# Clean up the DNS challenge (optional)
clean_challenge() {
    remove_txt_record
}

# Issue or renew the SSL certificate using Certbot
issue_certificate() {
    echo "Starting the certificate issuance process..."
    sudo certbot certonly \
        --manual \
        --preferred-challenges=dns \
        --manual-auth-hook "$0 deploy_challenge" \
        --manual-cleanup-hook "$0 clean_challenge" \
        -d $DOMAIN --non-interactive --agree-tos --email your@emailhere.com

    # Copy the entire folder from the domain's directory to the current directory, following symlinks
    DOMAIN_DIR="/etc/letsencrypt/live/$DOMAIN"

    if [ -d "$DOMAIN_DIR" ]; then
        sudo cp -rL "$DOMAIN_DIR" "$CERT_DIR/"
        echo "Directory $DOMAIN_DIR copied to $CERT_DIR"
    else
        echo "Error: Directory $DOMAIN_DIR not found"
    fi
}

# Check if the command-line argument is passed to determine the hook action
if [ "$1" = "deploy_challenge" ]; then
    deploy_challenge
elif [ "$1" = "clean_challenge" ]; then
    clean_challenge
else
    # If no argument is passed, it runs the certificate issuance process
    issue_certificate
fi
