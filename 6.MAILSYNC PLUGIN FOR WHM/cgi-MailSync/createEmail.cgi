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
use JSON;

# apt-get install libconfig-ini-simple-perl
# on newer ubuntu versions: libconfig-ini-perl
use Config::INI::Reader;
use Config::INI::Writer;

my $CONFIG_FILE = "/tmp/MailSync/MailSync.ini";
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
		my $main_domain = param('main_domain');
		my $usr_domain = param('domain');
		my $email = param('email');
		my $password = param('password');
		my $quota = param('quota');
		my $save = param('save');
		
		my $email_id = $email."@".$usr_domain;
		my $username = qr/[a-z0-9_+]([a-z0-9_+.]*[a-z0-9_+])?/;
		my $domain   = qr/[a-z0-9.-]+/;
		my $regex = $email_id =~ /^$username\@$domain$/;
	 
		if (not $regex) {
			set_error("Not a valid email id ...\n");
			exit;
		}
		if($quota eq "") {
			set_error("Please provide quota for email ...");
			exit;
		} elsif(!($quota =~ /\d+/ )){
			set_error("Quota must be numeric ...");
			exit;
		}
		if($password eq "") {
			set_error("Please provide password ...");
			exit;
		}
		my $domain_user = get_user($main_domain);
		if($domain_user eq "") {
			set_error("Sorry, Unable to find Cpanel user for the selected domain ...");
			exit;
		}
		create_email($domain_user,$email,$usr_domain,$password,$quota,$save);

		exit;
 }
 sub get_user() {
		my $main_domain = shift;
		my $lock = Cpanel::SafeFile::safeopen(\*IN,"<","/etc/trueuserdomains");
		my @local = <IN>;
		Cpanel::SafeFile::safeclose(\*IN,$lock);
		chomp @local;
		my $domain_user = "";
		foreach my $item (@local) {
			my ($domain,$user) = split(/\:\s*/,$item,2);
			if($main_domain eq $domain) {
				$domain_user = $user;
				last;
			}
		}
		return $domain_user;
 }
   sub create_email() {
		my $user = shift;
		my $email = shift;
		my $domain = shift;
		my $password = shift;
		my $quota = shift;
		my $save = shift;
		my ($in, $out);
		my $pid = open3($in, $out, $out, "cpapi2", "--output=jsonpretty", "--user=$user", "Email", "addpop", "domain=$domain", "email=$email", "password=$password", "quota=$quota", "no_validate=0");
		my @res = <$out>;
		waitpid ($pid, 0);
		chomp @res;
		if(@res)
		{
		my $jsondata = join("",@res);
		if($jsondata ne ""){
 
			
			$jsondata =~ /{(.*)}/ms;
			$jsondata = "{".$1."}";

			my $data = decode_json($jsondata);
			
			if($data->{'cpanelresult'}{'data'}[0]->{'result'} eq "1"){
				set_success("$email\@$domain has been created ...");
						if(lc($save) eq "true") {
							save_email($user,$email,$domain,$password,$quota,$save);		
						}
			} else {
				set_error("Failed due to error... " . $data->{'cpanelresult'}{'data'}[0]->{'reason'});
			}

		
		}
		}
 }
    sub save_email() {
		my $user = shift;
		my $email = shift;
		my $domain = shift;
		my $password = shift;
		my $quota = shift;
		my $existingdir = '/tmp/MailSync';
		
		if (! -r $CONFIG_FILE)
		{		
		mkdir $existingdir unless -d $existingdir; # Check if dir exists. If not create it.
		open my $fileHandle, ">>", "$existingdir/MailSync.ini" or die "Can't open '$existingdir/MailSync.ini'\n";
		print $fileHandle "";
		close $fileHandle;
		}
		my $CONFIG = Config::INI::Reader->read_file($CONFIG_FILE);	
		if(defined $CONFIG){
		$CONFIG->{$user}->{$email."@".$domain} = $password;
		my $CONFIG_W = Config::INI::Writer->write_file($CONFIG, $CONFIG_FILE);
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

