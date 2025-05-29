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
		my $lock = Cpanel::SafeFile::safeopen(\*IN,"<","/etc/trueuserdomains");
		my @local = <IN>;
		Cpanel::SafeFile::safeclose(\*IN,$lock);
		chomp @local;
		print qq{
			<form role="form">
			<div class="alert alert-info alert-dismissable">
			<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
			<span class="glyphicon glyphicon-info-sign"></span>
			<div class="alert-message">
				<strong>Info:</strong>
				Select the main domain for which you need to sync emails for.
			</div>
			</div>
			<div class="form-group">
				<input id="searchinput" class="form-control" type="search" placeholder="Search..." />
			</div>
			<div id="searchlist" class="list-group">
			   
		};
		foreach my $item (@local) {
			my ($domain,$user) = split(/\:\s*/,$item,2);
			print '<a class="list-group-item" ><span>'.$domain.'</span> ('.$user.')</a>';
		}
		
		print qq{
			</div>
		</form>
		<button id="select_domain" type="button" class="btn btn-success">Next</button>
		};
	exit;
 }
