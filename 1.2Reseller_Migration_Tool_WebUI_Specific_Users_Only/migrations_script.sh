#!/usr/bin/env bash
set -eu

# ─── Logging setup ─────────────────────────────────────────────────────────────
dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mkdir -p "$dir"
touch "$dir/output.log" "$dir/error.log"
exec >>"$dir/output.log" 2>>"$dir/error.log"

# ─── Required environment variables ───────────────────────────────────────────
: "${ACCOUNTS_LIST:?ACCOUNTS_LIST not set}"
: "${FTP_SERVER:?FTP_SERVER not set}"
: "${FTP_USER:?FTP_USER not set}"
: "${FTP_PASSWORD:?FTP_PASSWORD not set}"
: "${WHM_HOST:?WHM_HOST not set}"
: "${WHM_USER:?WHM_USER not set}"
: "${API_TOKEN:?API_TOKEN not set}"

# Optional overrides with sensible defaults
FTP_PORT="${FTP_PORT:-21}"
FTP_DIR="${FTP_DIR:-backups/}"
FTP_EMAIL="${FTP_EMAIL:-}"

export FTP_SERVER FTP_USER FTP_PASSWORD FTP_PORT FTP_DIR FTP_EMAIL
export WHM_HOST WHM_USER API_TOKEN

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting selective account migration for WHM user '$WHM_USER'"

# ─── 1) Parse ACCOUNTS_LIST into an array of usernames ─────────────────────────
IFS=',' read -ra raw_accounts <<< "$ACCOUNTS_LIST"
accounts=()
for acct in "${raw_accounts[@]}"; do
  # Trim whitespace and ignore empty entries
  acct="${acct//[[:space:]]/}"
  if [[ -n "$acct" ]]; then
    accounts+=("$acct")
  fi
done

if [[ ${#accounts[@]} -eq 0 ]]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: No accounts to migrate (ACCOUNTS_LIST is empty)" >&2
  exit 1
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Found ${#accounts[@]} account(s): ${accounts[*]}"

# ─── 2) Determine concurrency (max 4 parallel jobs) ───────────────────────────
maxjobs=4
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Running up to $maxjobs concurrent backup/transfer operations"

# ─── 3) Loop through accounts and initiate backups via WHM API ────────────────
for acct in "${accounts[@]}"; do
  (
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting backup for cPanel account '$acct'"
    resp=$(curl -sk -H "Authorization: whm $WHM_USER:$API_TOKEN" \
               -d "cpanel_jsonapi_user=$acct" \
               -d "cpanel_jsonapi_module=Backup" \
               -d "cpanel_jsonapi_func=fullbackup_to_ftp" \
               -d "cpanel_jsonapi_apiversion=3" \
               -d "host=$FTP_SERVER" \
               -d "username=$FTP_USER" \
               -d "password=$FTP_PASSWORD" \
               -d "port=$FTP_PORT" \
               -d "directory=$FTP_DIR" \
               -d "email=$FTP_EMAIL" \
               "https://$WHM_HOST:2087/json-api/cpanel")
    if [[ $? -ne 0 ]]; then
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Failed to initiate backup for $acct (curl error)" >&2
    elif echo "$resp" | grep -q '"status"[[:space:]]*:[[:space:]]*1'; then
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup for $acct created successfully"
    else
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Backup error for $acct: $resp" >&2
    fi
    # Throttle to avoid overwhelming the source server
    sleep 60
  ) &

  # Wait if maximum concurrent jobs are running
  while (( $(jobs -rp | wc -l) >= maxjobs )); do
    sleep 1
  done
done

# Wait for all background processes to finish
wait

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Selective account migration completed - ALLOW SOME TIME FOR FTP TRANSFERS TO COMPLETE - CHECK BACKUP FILE SIZES under /backups to ensure full account backups migrated - Alternatively check process list on Source WHM host for any active transfers before running bulk restore script!!!"
