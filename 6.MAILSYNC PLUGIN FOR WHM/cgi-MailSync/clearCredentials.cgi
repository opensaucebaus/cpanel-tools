#!/usr/local/cpanel/3rdparty/bin/perl


use strict;
use Data::Dumper;
use LWP::UserAgent;
use LWP::Protocol::https;
use CGI qw(:standard);
use Cpanel::Template();
use Whostmgr::ACLS          ();
use Whostmgr::HTMLInterface ();

# apt-get install libconfig-ini-simple-perl
# on newer ubuntu versions: libconfig-ini-perl
use Config::INI::Reader;
use Config::INI::Writer;
my $CONFIG_FILE = "/tmp/MailSync/MailSync.ini";
my $user;
my $CONFIG;
$|++;
Whostmgr::ACLS::init_acls();
$CGI::LIST_CONTEXT_WARN = 0;
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
		$user = param('user');
		my $existingdir = '/tmp/MailSync';
		my $CONFIG = Config::INI::Reader->read_file($CONFIG_FILE);	
		if(defined $CONFIG){
			undef $CONFIG->{$user};
			my $CONFIG_W = Config::INI::Writer->write_file($CONFIG, $CONFIG_FILE);
			set_success("Stored credentials has been removed for user ...");
		} else {
			set_error(" Unable to find config file ...");
		}
 }
 sub set_error(){
		my $msg = shift;
		print qq{
					<div id="alert" class="alert alert-danger alert-dismissable">
					<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
					<span class="glyphicon glyphicon-remove-sign"></span>
					<div class="alert-message">
						<strong>Error:</strong> 
		};
		print $msg . "</div></div>";
 }
 sub set_success(){
 		my $msg = shift;
		print qq{	
			<div id="alert_success" class="alert alert-success alert-dismissable">
			<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
			<span class="glyphicon glyphicon-ok-sign"></span>
			<div class="alert-message">
				<strong>Success:</strong>
		};
		print $msg . "</div></div>";
 }


