#!/bin/bash

# === CONFIG ===
MAX_JOBS=3
INPUT_FILE="backupslist"
LOGFILE="restore.log"
ERRORLOG="restore_errors.log"
RETRYLOG="restore_retry.log"
DRY_RUN=false

# === Parse args ===
if [[ "$1" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "[DRY-RUN MODE] No commands will be executed."
fi

# === Trap CTRL+C ===
trap 'echo -e "\n[!] Interrupt received. Waiting for running restores to finish..."; wait; echo "Aborted."; exit 130' INT

# === Setup logs ===
: > "$LOGFILE"
: > "$ERRORLOG"
: > "$RETRYLOG"

echo "Bulk restore started at $(date)" >> "$LOGFILE"

# === Function: restore an account ===
restore_account() {
  local account="$1"

  echo "Starting restore for $account" >> "$LOGFILE"
  if $DRY_RUN; then
    echo "[DRY-RUN] Would run: /usr/local/cpanel/scripts/restorepkg $account"
    return 0
  fi

  if /usr/local/cpanel/scripts/restorepkg "$account" >> "$LOGFILE" 2>> "$ERRORLOG"; then
    echo "Restore succeeded for $account" >> "$LOGFILE"
    return 0
  else
    echo "Restore failed for $account" >> "$ERRORLOG"
    echo "$account" >> "$RETRYLOG"
    return 1
  fi
}

# === Read and launch jobs ===
run_restores() {
  local file="$1"

  job_count=0
  while IFS= read -r account || [[ -n "$account" ]]; do
    [[ -z "$account" ]] && continue

    restore_account "$account" &

    ((job_count++))
    if (( job_count >= MAX_JOBS )); then
      wait
      job_count=0
    fi
  done < "$file"
  wait
}

# === First run ===
run_restores "$INPUT_FILE"

# === Retry failed restores once ===
if [[ -s "$RETRYLOG" ]]; then
  echo "Retrying failed accounts..." | tee -a "$LOGFILE"
  cp "$RETRYLOG" retry_pass_1.txt
  : > "$RETRYLOG"
  run_restores retry_pass_1.txt
  rm -f retry_pass_1.txt
fi

# === Final status ===
if [[ -s "$RETRYLOG" ]]; then
  echo "Some restores still failed. Review $RETRYLOG and $ERRORLOG for details."
else
  echo "All accounts restored successfully."
fi

echo "Finished at $(date)" >> "$LOGFILE"
