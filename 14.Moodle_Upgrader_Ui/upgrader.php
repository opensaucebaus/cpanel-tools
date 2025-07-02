<?php
// Moodle Upgrader UI - v15 (Final with .github permissions)
// This script upgrades Moodle by swapping contents *within* the existing public_html directory.
// It preserves the public_html folder's ownership/permissions and attempts to merge third-party plugins.
// WARNING: This script is DESTRUCTIVE. It moves the contents of your public_html directory.
// It does NOT preserve any manual modifications ("hacks") to core Moodle files.

// --- CONFIGURATION & SAFETY ---
@set_time_limit(0);
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Define core paths
$moodleDir = realpath(__DIR__ . '/..'); // Assumes upgrader is in public_html/upgrader
$baseDir = realpath($moodleDir . '/..'); // The directory containing public_html
$upgraderSubDir = basename(__DIR__); // The name of this upgrader directory

// --- Moodle Bootstrap ---
require_once($moodleDir . '/config.php');
require_once($moodleDir . '/lib/setup.php');

// --- Authentication ---
require_login();
if (!is_siteadmin()) {
    die('Access denied: Must be a site administrator.');
}

// Get current version for display
$versionFile = $moodleDir . '/version.php';
include $versionFile;
$currentVersion = $release ?? 'Unknown';

/**
 * Executes a command and streams its output directly to the browser in real-time.
 */
function run_and_stream_command($label, $command) {
    echo '<h3 style="color:#0f0; margin-bottom:5px;">--- ' . htmlspecialchars($label) . ' ---</h3>';
    echo '<pre style="margin-top:0; border-left: 3px solid #0f0;">';
    if (ob_get_level() > 0) ob_end_flush();
    @flush();
    $handle = popen($command . ' 2>&1', 'r');
    if (!$handle) {
        echo "<span style='color:red;'>ERROR: Could not execute command.</span></pre>";
        return;
    }
    while (!feof($handle)) {
        $line = fgets($handle);
        echo htmlspecialchars($line);
        if (ob_get_level() > 0) ob_end_flush();
        @flush();
    }
    pclose($handle);
    echo '</pre>';
}

// --- Dynamic Branch List ---
$branches = [];
shell_exec("cd " . escapeshellarg($moodleDir) . " && git fetch --all --prune 2>&1");
$listOutput = shell_exec("cd " . escapeshellarg($moodleDir) . " && git branch -r 2>&1");
$matches = [];
preg_match_all('#origin/(MOODLE_([0-9]+)_STABLE)#', $listOutput, $matches);
if (!empty($matches[1])) {
    $branches = array_unique($matches[1]);
    usort($branches, function($a, $b) {
        return (int)str_replace('MOODLE_', '', $b) <=> (int)str_replace('MOODLE_', '', $a);
    });
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Moodle Upgrader (In-Place Method)</title>
    <style>
        body { background:#222;color:#eee;font-family:monospace;padding:20px; }
        .box { background:#333;padding:20px;border-radius:6px;max-width:900px;margin:auto; }
        h1, h2 { margin-top:0; border-bottom: 1px solid #555; padding-bottom: 10px; }
        pre { background:#000;color:#ccc;padding:10px;overflow-x:auto;white-space:pre-wrap; word-wrap:break-word;}
        .warning { background: #4d4d00; color: #ffff00; padding: 15px; border: 1px solid #ffff00; border-radius: 5px; }
    </style>
</head>
<body>
<div class="box">
    <h1>Moodle Upgrader (In-Place Method)</h1>
    <p><strong>Current Version:</strong> <?php echo htmlspecialchars($currentVersion); ?></p>
    <div class="warning">
        <strong>WARNING:</strong> This tool will move all contents out of `public_html` (except this upgrader and .git), deploy a fresh version, and migrate plugins back. It **preserves the `public_html` folder itself** and its permissions, but does **NOT** preserve core file hacks.
    </div>
    
    <?php if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['upgrade']) && !empty($_POST['branch'])): ?>
        
        <h2>Upgrade Output</h2>
        <?php
        $branch = $_POST['branch'];
        if (!in_array($branch, $branches, true)) {
            die("<p style='color:red;'>Error: Invalid branch selected.</p>");
        }

        // --- DEFINE PATHS & COMMANDS ---
        $backupDir = $baseDir . '/moodle_content_backup_' . date('Y-m-d_H-i-s');
        $phpCli = '/usr/bin/php';
        $gitDirCmd = 'cd ' . escapeshellarg($moodleDir) . ' && ';

        // 1. Create backup dir and move current contents, EXCLUDING the upgrader and .git directories
        run_and_stream_command('Step 1.1: Creating backup directory', 'mkdir ' . escapeshellarg($backupDir));
        $moveCmd = 'find ' . escapeshellarg($moodleDir) . ' -mindepth 1 -maxdepth 1 ! -name ' . escapeshellarg($upgraderSubDir) . ' ! -name ".git" -exec mv -t ' . escapeshellarg($backupDir) . ' {} +';
        run_and_stream_command('Step 1.2: Moving current site contents to backup', $moveCmd);
        
        // 2. Upgrade in-place using Git checkout --force
        run_and_stream_command('Step 2: Forcefully checking out new Moodle version: ' . $branch, $gitDirCmd . 'git checkout -f ' . escapeshellarg($branch));
        run_and_stream_command('Step 2.1: Pulling latest updates for the branch', $gitDirCmd . 'git pull origin ' . escapeshellarg($branch));

        // 3. Migrate essential data & plugins from the backup back into public_html
        echo '<h3 style="color:#0f0;">--- Step 3: Merging custom plugins and config ---</h3>';
        echo '<pre style="margin-top:0; border-left: 3px solid #0f0;">';
        copy($backupDir . '/config.php', $moodleDir . '/config.php');
        echo "Copied config.php...\n";
        
        $pluginPaths = [
            'theme', 'local', 'blocks', 'mod', 'report', 'auth', 'filter', 'plagiarism',
            'availability/condition', 'admin/tool', 'customfield/field', 'course/format',
            'lib/editor/atto/plugins', 'lib/editor/tiny/plugins'
        ];
        
        foreach ($pluginPaths as $path) {
            $sourceDir = $backupDir . '/' . $path;
            $destDir = $moodleDir . '/' . $path;
            if (is_dir($sourceDir)) {
                shell_exec('rsync -a --ignore-existing ' . escapeshellarg($sourceDir . '/') . ' ' . escapeshellarg($destDir . '/'));
                echo "Merged contents from: $path/ ...\n";
            }
        }
        echo '</pre>';

        // 4. Run Moodle CLI upgrade
        run_and_stream_command('Step 4.1: Enabling Maintenance Mode', $phpCli . ' ' . escapeshellarg($moodleDir . '/admin/cli/maintenance.php') . ' --enable');
        run_and_stream_command('Step 4.2: Running Database Upgrade', $phpCli . ' ' . escapeshellarg($moodleDir . '/admin/cli/upgrade.php') . ' --non-interactive');
        run_and_stream_command('Step 4.3: Disabling Maintenance Mode', $phpCli . ' ' . escapeshellarg($moodleDir . '/admin/cli/maintenance.php') . ' --disable');

        // 5. Set correct permissions for the NEW contents, leaving public_html itself alone
        run_and_stream_command('Step 5.1: Setting directory permissions for site contents', 'find ' . escapeshellarg($moodleDir) . ' -mindepth 1 -type d -exec chmod 755 {} \;');
        run_and_stream_command('Step 5.2: Setting file permissions for site contents', 'find ' . escapeshellarg($moodleDir) . ' -mindepth 1 -type f -exec chmod 644 {} \;');

        // 6. Secure the .git and .github directories specifically
        // --- THIS IS THE CORRECTED SECTION ---
        $secureDirs = ['.git', '.github'];
        foreach ($secureDirs as $dirName) {
            $dirPath = $moodleDir . '/' . $dirName;
            if (is_dir($dirPath)) {
                run_and_stream_command("Step 6: Securing $dirName directory", 'chmod 750 ' . escapeshellarg($dirPath));
                run_and_stream_command("Step 6: Securing $dirName subdirectories", 'find ' . escapeshellarg($dirPath) . ' -type d -exec chmod 750 {} \;');
                run_and_stream_command("Step 6: Securing $dirName files", 'find ' . escapeshellarg($dirPath) . ' -type f -exec chmod 640 {} \;');
            }
        }
        // --- END OF CORRECTION ---

        echo '<h2>Upgrade Complete! The `public_html` directory itself was not modified.</h2>';
        ?>
    <?php else: ?>
        <form method="post" style="margin-top:20px;" onsubmit="return confirm('Are you sure you want to run the upgrade? This action is irreversible and will move the contents of public_html to a backup.');">
            <select name="branch" style="padding:8px;" required>
                <option value="">-- Select Target Moodle Version --</option>
                <?php foreach ($branches as $b): ?>
                    <option value="<?php echo htmlspecialchars($b); ?>"><?php echo htmlspecialchars($b); ?></option>
                <?php endforeach; ?>
            </select>
            <button type="submit" name="upgrade" style="padding:8px; background: #c00; color: #fff; border:0; cursor: pointer;">Run Upgrade</button>
        </form>
    <?php endif; ?>
</div>
</body>
</html>