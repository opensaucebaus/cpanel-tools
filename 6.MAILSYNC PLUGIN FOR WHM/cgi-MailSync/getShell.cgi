#!/usr/local/cpanel/3rdparty/bin/perl

use strict;
use Data::Dumper;
use LWP::UserAgent;
use LWP::Protocol::https;
use CGI qw(:standard);
use Cpanel::Template();
use Whostmgr::ACLS          ();
use Whostmgr::HTMLInterface ();
use Cpanel::SafeFile();
use IPC::Open3;
use IO::Handle;
Whostmgr::ACLS::init_acls();
$|++;
print "Content-Type: text/html; charset=iso-8859-1\n\n";

if ( !Whostmgr::ACLS::hasroot() ) {
    print qq{
<br />
<br />
<div><h1>Permission denied</h1></div>
</body>
</html>
    };
    exit;
}
# Make the script into a modulino, to facilitate testing.
 run() unless caller();
 
 sub run {
		my $token = param('token');
		my $data = param('data');
		if($token eq ""){
		print "-1";
		exit;
		}
		if($data eq ""){
		print "-1";
		exit;
		}
		my $existingdir = '/tmp/MailSync';
		my $json_path = $existingdir.'/'.$token.'_json';
		if (! -r $json_path)
		{		
		mkdir $existingdir unless -d $existingdir; # Check if dir exists. If not create it.
		open my $fileHandle, ">>", $json_path or die "Can't open '$json_path'\n";
		print $fileHandle $data;
		close $fileHandle;
		} else {
		print "0";
		}

			system("/usr/bin/perl /usr/local/cpanel/whostmgr/docroot/cgi/MailSync/sync.pl $json_path $existingdir/logs/".$token."_Mailsync > /dev/null &");
			


	exit;
 }

 sub set_error(){
		my $msg = shift;
		print qq{
					<div id="alert" class="alert alert-danger">
					<span class="glyphicon glyphicon-remove-sign"></span>
					<div class="alert-message">
						<strong>Error:</strong> 
		};
		print $msg . "</div></div>";
 }

