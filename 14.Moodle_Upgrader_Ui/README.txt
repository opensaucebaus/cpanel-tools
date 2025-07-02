# Moodle In-Place Git Upgrader UI

A powerful PHP-based web interface for upgrading a Moodle installation that is managed with Git. This script is specifically designed for controlled hosting environments where the web root directory (`public_html`) has specific ownership and permissions that cannot be altered by the web user.

It performs a clean, safe upgrade by swapping the contents *within* the existing Moodle directory, preserving the directory itself and its permissions.

---

> ## :warning: WARNING: PLEASE READ BEFORE USE
>
> *   **DESTRUCTIVE ACTION:** This script is designed to be destructive. It will move all of your Moodle application files to a backup directory before deploying the new version.
> *   **BACKUP REQUIRED:** Always perform a full site backup (database, `moodledata` directory, and `public_html` directory) before running this tool.
> *   **DOES NOT PRESERVE CORE EDITS:** This script performs a **clean** upgrade. It will **NOT** merge or preserve any manual edits (hacks) you have made to Moodle core files. Customizations should exist only in third-party plugins or themes.
> *   **USE AT YOUR OWN RISK:** This is a powerful tool. Ensure you understand what it does before executing it on a live server.

---

## Core Philosophy & Design

This upgrader was built to solve a specific problem: upgrading Moodle on servers where the `public_html` directory is owned by a user/group combination (e.g., `myuser:www-data`) that the script itself cannot replicate. It achieves this with the following principles:

1.  **In-Place Operation:** The `public_html` directory is never moved, deleted, or re-created. All operations happen *inside* it, preserving its critical ownership and permissions.
2.  **Clean Upgrade:** The script checks out a pristine, clean copy of the official Moodle branch from Git. This ensures no old or conflicting files are left behind.
3.  **Third-Party Plugin Migration:** The script intelligently copies all your custom and third-party plugins from your old installation into the new one. It will not overwrite any core plugins that are updated in the new version.
4.  **Real-Time Feedback:** All command output is streamed directly to the web browser, so you can monitor the entire process in real-time and know it isn't stuck.
5.  **Secure by Default:** After the upgrade, it automatically sets secure permissions on the `.git` and `.github` directories to prevent them from being accessed from the web.

## Prerequisites

Before using this script, ensure your environment meets the following requirements:

1.  **Git Installation:** Your Moodle site must have been installed by cloning the official Moodle repository from `git://github.com/moodle/moodle.git`. The `.git` directory must be present in `public_html`.
2.  **User Ownership:** The Moodle files inside `public_html` must be owned by the user that the web server runs as (e.g., `myuser:myuser`).
3.  **Shell Access:** The PHP process must be able to execute shell commands via `shell_exec()` and `popen()`. The following command-line tools must be available: `git`, `rsync`, `find`, `mv`, `mkdir`, and `chmod`.

## Installation

1.  Create a directory inside your `public_html` folder named `upgrader` (or any other name).
2.  Place this `index.php` script inside that directory.
3.  That's it! You can now access the upgrader via your browser at `https://yourmoodlesite.com/upgrader/`.

## How to Use

1.  Log in to your Moodle site as a full site administrator.
2.  Navigate to the upgrader URL (e.g., `https://yourmoodlesite.com/upgrader/`).
3.  The script will automatically detect the latest available Moodle versions from Git and populate the dropdown menu.
4.  Select your desired target version from the list.
5.  Click the **"Run Upgrade"** button. A confirmation dialog will appear.
6.  Confirm the action and watch the live output as the script performs the upgrade.

## The Upgrade Workflow

The script performs the following steps in order:

1.  **Create Backup Directory:** A new directory named `moodle_content_backup_[date]` is created in the folder *above* `public_html`.
2.  **Move Old Contents:** All files and folders inside `public_html` are moved to the backup directory, **except for the `.git` folder and the `upgrader` folder itself.**
3.  **Checkout New Version:** Using the now-empty Git repository, the script runs `git checkout -f [branch]` to populate `public_html` with the clean files from the selected Moodle version.
4.  **Migrate Plugins:** The script uses `rsync --ignore-existing` to safely copy your `config.php` and all third-party plugin directories from the backup into the new site structure. This will not overwrite any core Moodle plugins.
5.  **Run Moodle Upgrade:** The script executes the standard Moodle CLI upgrade commands (`maintenance.php`, `upgrade.php`).
6.  **Set Permissions:** It sets standard, secure permissions (`755` for directories, `644` for files) on all the **contents** of `public_html`, leaving the parent folder's permissions untouched.
7.  **Secure Git Folders:** It applies stricter permissions (`750`/`640`) to the `.git` and `.github` directories for added security.

## License

This script is released under the MIT License. See the [LICENSE.md](LICENSE.md) file for details.