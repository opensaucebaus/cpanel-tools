#!/bin/bash

# Gitify existing Moodle site and set correct permissions

# Define paths
dir=$(pwd)
old_dir="${dir}/public_html"
backup_dir="${dir}/public_html_old"
git_dir="${dir}/moodle_from_git"

# Moodle Git repository URL
GIT_REPO="https://github.com/moodle/moodle.git"

# Ensure backup directory does not exist
echo "Checking backup directory..."
if [ -d "$backup_dir" ]; then
  echo "Error: Backup directory $backup_dir already exists. Remove it and retry."
  exit 1
fi

# Move existing site to backup
echo "Backing up current site..."
if [ -d "$old_dir" ]; then
  mv "$old_dir" "$backup_dir"
  echo "Moved $old_dir to $backup_dir"
else
  echo "Error: $old_dir not found."
  exit 1
fi

# Prompt for version
read -p "Enter Moodle branch (e.g., MOODLE_500_STABLE): " moodle_version

# Clone repo
echo "Cloning Moodle repository..."
git clone "$GIT_REPO" "$git_dir"
if [ $? -ne 0 ]; then
  echo "Error: git clone failed."
  exit 1
fi

# Checkout version
echo "Checking out branch $moodle_version..."
cd "$git_dir"
git fetch --all --tags
if ! git checkout -B "$moodle_version" "origin/$moodle_version"; then
  echo "Error: Could not checkout $moodle_version"
  exit 1
fi

# Copy config.php
cp "${backup_dir}/config.php" "$git_dir/"


# Move new code into place
echo "Deploying new Moodle code..."
rsync -av --ignore-existing --no-owner --no-group "$git_dir/" "$old_dir/"

# Run maintenance and upgrade
echo "Enabling maintenance mode..."
/usr/bin/php "$old_dir/admin/cli/maintenance.php" --enable

echo "Running upgrade..."
/usr/bin/php "$old_dir/admin/cli/upgrade.php" --non-interactive

echo "Disabling maintenance mode..."
/usr/bin/php "$old_dir/admin/cli/maintenance.php" --disable

# Set correct permissions
echo "Setting directory permissions to 0755 and file permissions to 0644..."
cd "$old_dir"
find . -type d -exec chmod 0755 {} \;
find . -type f -exec chmod 0644 {} \;

# Secure .git directory if present
echo "Securing .git directory..."
if [ -d ".git" ]; then
  chmod 750 ".git"
  find .git -type d -exec chmod 0750 {} \;
  find .git -type f -exec chmod 0640 {} \;
fi

# Finally, set public_html (site root) to 750
echo "Setting site root folder permissions to 750..."
chmod 750 "$old_dir"

# Done
echo "Gitify complete. Backup at $backup_dir."
