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
		my $token = param('token');
		my $s = param('s');
		my $n = param('n');
		if($token eq ""){
		exit;
		}
		my $existingdir = '/tmp/MailSync/logs';
		if(!(-e "$existingdir/".$token."_Mailsync")) {
			print "Error: Unable to find log file ...";
			exit();
		}
		
		my $cmd = "sed -n '".$s.",".$n."p;' $existingdir/".$token."_Mailsync";
		
		my ($in, $out);
		my $pid = open3($in, $out, $out, $cmd);
		my @res = <$out>;
		waitpid ($pid, 0);
		chomp @res;
		if(@res){
		foreach my $item (@res) {
			$item = encode_entities($item);
			$item =~ s/$/<BR>/mg;
			print $item;
		}
		} else {
		print "-1";
		}
	exit;
 }


