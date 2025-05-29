#!/usr/bin/env bash
set -euo pipefail

# --- Logging setup: initialize log file ---
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
log_file="$script_dir/output.log"
: > "$log_file"  # truncate log at start of each run
exec >>"$log_file" 2>&1

# --- Required environment variables (must be set by caller) ---
: "${FTP_SERVER:?FTP_SERVER not set}"
: "${FTP_USER:?FTP_USER not set}"
: "${FTP_PASSWORD:?FTP_PASSWORD not set}"
: "${WHM_HOST:?WHM_HOST not set}"
: "${WHM_USER:?WHM_USER not set}"
: "${API_TOKEN:?API_TOKEN not set}"

# --- Optional overrides with defaults ---
FTP_PORT="${FTP_PORT:-21}"
FTP_DIR="${FTP_DIR:-backups/}"
FTP_EMAIL="${FTP_EMAIL:-}"

# --- Helper function for timestamped logging ---
log() {
    local ts; ts="$(date '+%Y-%m-%d %H:%M:%S')"
    echo "[$ts] $*"
}

# Start message
log "Starting full-reseller migration for WHM user '$WHM_USER'"

# 1) Fetch account list via WHM API (listaccts) for the given reseller owner
account_json="$script_dir/accounts_raw.json"
if ! curl -sSk --connect-timeout 10 --max-time 60 \
     -H "Authorization: whm $WHM_USER:$API_TOKEN" \
     "https://$WHM_HOST:2087/json-api/listaccts?api.version=1&searchtype=owner&search=$WHM_USER" \
     -o "$account_json"; then
    log "ERROR: Failed to fetch account list from $WHM_HOST"
    exit 1
fi

# 2) Parse JSON to extract account usernames
accounts_file="$script_dir/accounts.txt"
if command -v jq >/dev/null 2>&1; then
    # Use jq to parse the JSON for account usernames
    if ! jq -r '.data.acct[].user' "$account_json" > "$accounts_file"; then
        log "ERROR: Failed to parse account list JSON"
        exit 1
    fi
else
    # Fallback to grep/sed if jq is not available
    grep -oE '"user"\s*:\s*"[^"]*"' "$account_json" \
      | sed -E 's/.*"user"\s*:\s*"([^"]+)".*/\1/' > "$accounts_file" || {
        log "ERROR: Failed to parse account list (grep/sed error)"
        exit 1
      }
fi

if [ ! -s "$accounts_file" ]; then
    log "ERROR: No accounts found for reseller '$WHM_USER'"
    exit 1
fi

mapfile -t accounts < "$accounts_file"
log "Found ${#accounts[@]} account(s) to migrate: ${accounts[*]}"

# 3) Set up concurrency limit (max 4 concurrent backups)
cores=$(getconf _NPROCESSORS_ONLN || echo 1)
max_parallel=$(( cores / 2 ))
(( max_parallel < 1 )) && max_parallel=1
(( max_parallel > 4 )) && max_parallel=4
log "Using up to $max_parallel concurrent backup processes"

# 4) Loop through each account and initiate full FTP backup via WHM API (UAPI call)
for acct in "${accounts[@]}"; do
    (
        log "Starting backup for cPanel account '$acct'"

        # Call cPanel's Backup::fullbackup_to_ftp API via WHM (as reseller)
        backup_response=$(curl -sSk --connect-timeout 10 --max-time 300 \
          -H "Authorization: whm $WHM_USER:$API_TOKEN" \
          --data "cpanel_jsonapi_user=$acct" \
          --data "cpanel_jsonapi_module=Backup" \
          --data "cpanel_jsonapi_func=fullbackup_to_ftp" \
          --data "cpanel_jsonapi_apiversion=3" \
          --data "host=$FTP_SERVER" \
          --data "username=$FTP_USER" \
          --data "password=$FTP_PASSWORD" \
          --data "port=$FTP_PORT" \
          --data "directory=$FTP_DIR" \
          --data "email=$FTP_EMAIL" \
          "https://$WHM_HOST:2087/json-api/cpanel")
        curl_exit=$?

        if [ $curl_exit -ne 0 ]; then
            log "ERROR: cURL request failed for account '$acct' (exit code $curl_exit)"
        elif echo "$backup_response" | grep -q '"status":[[:space:]]*1'; then
            # Backup API returned status 1 (successfully initiated)
            log "Backup for '$acct' initiated successfully (FTP transfer in progress)"
        else
            # Backup API returned an error or status 0
            log "ERROR: Backup API response for '$acct' indicates failure: $backup_response"
        fi

        # Throttle: wait a bit before ending this job to limit how quickly new backups start
        sleep 60
    ) &  # run in background

    # Wait if we have hit the max parallel jobs
    while (( $(jobs -rp | wc -l) >= max_parallel )); do
        sleep 1
    done
done

# 5) Wait for all background backup jobs to finish
wait

log "Full reseller migration for '$WHM_USER' completed - ALLOW SOME TIME FOR FTP TRANSFERS TO COMPLETE - CHECK BACKUP FILE SIZES under /backups to ensure full account backups migrated - Alternatively check process list on Source WHM host for any active transfers before running bulk restore script!!!"
