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

$|++;
Whostmgr::ACLS::init_acls();

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
		
		my $user = param('user');

		my $pattern = "*";
		if($user ne ""){
			$pattern = "*$user*";
		}
		my $dirname = "/tmp/MailSync/logs";
		my @files =  sort { -M $b <=> -M $a } 
			  grep { -f } 
			  glob("$dirname/$pattern");
		
		
		if(@files){
		foreach my $item( @files ) { 
			unlink $item;
		}
		} else {
		print "No Logs Found ...";
		}
	exit;
 }
