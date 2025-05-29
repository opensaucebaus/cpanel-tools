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
		my $log = param('log');
		if($log eq ""){
		print "-1";
		exit;
		}
			my $logpath = '/tmp/MailSync/logs/'.$log."_Mailsync";
			my ($in, $out);
			my $pid = open3($in, $out, $out, "ps -A -o pid,cmd | grep sync.pl | grep ".quotemeta($log)." | awk {'print \$1'}");
			my @res = <$out>;
			waitpid ($pid, 0);
			chomp @res;
			print $res[0];
			if($res[0] eq "")
			{
			print "-2";
			} else {
			my $cmd = "pstree -p ".$res[0]." | grep -o '([0-9]\\+)' | grep -o '[0-9]\\+' | grep -v ".$res[0]." | xargs kill -9";
			print $cmd;
			my $pid1 = open3($in, $out, $out, $cmd);
			my @res1 = <$out>;
			waitpid ($pid1, 0);
			chomp @res1;
			print @res1;
			}
			system("echo 'Skipped....' >> ".$logpath);
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

