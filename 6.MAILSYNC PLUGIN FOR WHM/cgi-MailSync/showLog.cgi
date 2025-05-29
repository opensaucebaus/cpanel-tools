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
use HTML::Entities;
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
		my $path = param('fname');
		my $lock = Cpanel::SafeFile::safeopen(\*IN,"<","/tmp/MailSync/logs/$path");
		my @local = <IN>;
		Cpanel::SafeFile::safeclose(\*IN,$lock);
		chomp @local;
		if(@local){
		foreach my $item (@local) {
			$item = encode_entities($item);
			$item =~ s/$/<BR>/mg;
			print $item;
		}
		}
	exit;
 }
