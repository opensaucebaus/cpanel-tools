# Moodle In-Place Git Upgrader

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful, single-file PHP web interface for upgrading a Moodle installation that is managed with Git. This script is specifically designed for controlled hosting environments where the web root directory (`public_html`) has specific ownership and permissions that cannot be altered by the web user performing the upgrade.

It performs a clean, safe upgrade by swapping the contents *within* the existing Moodle directory, preserving the directory itself and its critical permissions while intelligently migrating your custom plugins.

<!-- It's highly recommended to replace this with a real screenshot of the tool in action! -->
![Screenshot of the Moodle Upgrader UI](https://raw.githubusercontent.com/path/to/your/image.png)

---

## Key Features

*   **In-Place Operation**: Never moves, deletes, or re-creates the web root folder. All operations happen *inside* it, preserving its ownership and permissions.
*   **Clean Git Checkout**: Pulls a pristine copy of the target Moodle version from the official repository, ensuring no old or conflicting files are left behind.
*   **Smart Plugin Migration**: Intelligently copies `config.php` and all third-party plugins (themes, blocks, modules, etc.) from your old installation into the new one without overwriting core Moodle code.
*   **Real-Time Output**: Streams all shell command output directly to the browser, so you can monitor the entire process live and be confident it isn't stuck.
*   **Secure by Default**: Automatically sets secure, recommended permissions on all files and directories post-upgrade, including stricter permissions for the `.git` and `.github` folders.
*   **Automated Moodle CLI**: Runs the required Moodle database upgrade steps (`maintenance.php`, `upgrade.php`) for you.

---

> ## :warning: WARNING: PLEASE READ BEFORE USE
>
> *   **DESTRUCTIVE ACTION:** This script is designed to be destructive. It will **move all of your Moodle application files** to a backup directory before deploying the new version.
> *   **BACKUP REQUIRED:** You MUST perform a **full site backup** (database, `moodledata` directory, and the web root directory) before running this tool. This is your only safety net.
> *   **NO CORE HACK PRESERVATION:** This script performs a **clean** upgrade. It will **NOT** merge, preserve, or warn about any manual edits (hacks) you have made to Moodle core files. Customizations should only exist in third-party plugins or themes.
> *   **USE AT YOUR OWN RISK:** This is a powerful tool. Ensure you fully understand what it does before executing it on a live server. The author is not responsible for any data loss.

---

## The Problem This Solves

Standard Moodle upgrades often require shell access to move directories around (e.g., `mv public_html public_html_old`). On some managed hosting platforms, the `public_html` directory is owned by a specific user (e.g., `myuser:www-data`) and the PHP/web user (`www-data`) does not have permission to alter it.

This tool solves that problem by working *inside* the `public_html` directory, never needing to modify the directory itself.

## How It Works: The In-Place Swap

The script's core logic is to treat the `public_html` folder as a permanent container while swapping the Moodle files within it.

**1. Initial State:**

/path/to/
└── public_html/ (fixed permissions)
├── .git/
├── admin/
├── theme/
├── config.php
└── upgrader/ <-- You are here
└── index.php


**2. Backup Step:** All contents (except `.git` and `upgrader/`) are moved out.```
/path/to/
├── moodle_content_backup_YYYY-MM-DD/  <-- Old files are moved here
│   ├── admin/
│   └── theme/
└── public_html/ (empty, except for...)
    ├── .git/
    └── upgrader/

3. Checkout & Migration: A clean Moodle version is checked out, and your custom plugins are copied back.

/path/to/
└── public_html/
    ├── .git/
    ├── admin/      (new)
    ├── theme/      (new core themes + your custom themes)
    ├── config.php  (copied from backup)
    └── upgrader/


Prerequisites
Environment

    Git-Managed Moodle: Your Moodle site must have been installed by cloning the official repository from git://github.com/moodle/moodle.git. The .git directory must be present in the web root.

    User Ownership: The Moodle files inside the web root must be owned by the user that the web server runs as, allowing PHP to move and write files.

    PHP Shell Access: The PHP process must be able to execute shell commands. The shell_exec() and popen() functions must not be disabled.

Required Shell Commands

The script requires the following command-line tools to be available in the system's PATH:

    git

    rsync

    find

    mv

    mkdir

    chmod

Installation

    Create a directory inside your Moodle web root (e.g., public_html/upgrader).

    Place the index.php script inside that new directory.

    Security: It is highly recommended to protect this directory (e.g., with an .htaccess file) or to delete it after the upgrade is complete.

How to Use

    Log in to your Moodle site as a user with full site administrator privileges.

    Navigate to the upgrader URL in your browser (e.g., https://yourmoodlesite.com/upgrader/).

    The script will automatically fetch the latest MOODLE_XXX_STABLE branches from Git and populate the dropdown menu.

    Select your desired target version from the list.

    Click the "Run Upgrade" button. A browser confirmation dialog will appear.

    Confirm the action and watch the live output as the script performs the upgrade.

The Upgrade Workflow Steps

The script performs the following sequence of actions, which you will see in the live output:

    Create Backup Directory: A new directory named moodle_content_backup_[date] is created in the folder above the web root.

    Move Old Contents: All files and folders inside the web root are moved to the backup directory, except for the .git folder and the upgrader folder itself.

    Checkout New Version: The script runs git checkout -f [branch] to populate the web root with the clean files from the selected Moodle version.

    Migrate Customizations:

        config.php is copied back from the backup.

        rsync --ignore-existing is used to safely copy all third-party plugin directories from the backup into the new site structure. This command will not overwrite any core Moodle plugins that were updated in the new version.

    Run Moodle Upgrade: The script executes the standard Moodle CLI upgrade commands (maintenance.php and upgrade.php) non-interactively.

    Set Core Permissions: It sets standard, secure permissions (755 for directories, 644 for files) on all the contents of the web root.

    Secure Git Folders: It applies stricter permissions (750 for directories, 640 for files) to the .git and .github directories for added security against web access.



