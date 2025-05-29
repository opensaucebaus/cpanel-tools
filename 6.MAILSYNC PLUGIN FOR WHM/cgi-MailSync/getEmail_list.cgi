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
		my $main_domain = param('user');
		my $domain_user = get_user($main_domain);
		if($domain_user eq "") {
			set_error("Sorry, Unable to find Cpanel user for the selected domain ...");
			exit;
		}
		
		print qq{
		
			
			<br>			
			<h4><strong>Email Accounts List</strong></h4>
			<br>
			<table id="email_list" class="table table-striped table-bordered" cellspacing="0" width="100%">
        <thead>
            <tr>
                <th style="text-align: center;"><input id="select_check" type="checkbox" ></th>
                <th>Account\@domain</th>
                <th>Usage/Quota</th>
                <th class="no-sort">Edit</th>
            </tr>
        </thead>

        <tbody>
};
get_email_list($domain_user);		
	print qq{
        </tbody>
    </table>
			
};
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
  sub get_email_list() {
		my $user = shift;
		my ($in, $out, $err);
 		use Symbol 'gensym'; 
		$err = gensym;
		my $pid = open3($in, $out, $err, "cpapi2", "--output=jsonpretty", "--user=$user", "Email", "listpopswithdisk", "nearquotaonly=0", "no_validate=0");
		
		my @res = <$out>;

		waitpid ($pid, 0);
		chomp @res;
		if(@res)
		{
		my $jsondata = join("",@res);
		if($jsondata ne ""){
		my $data = decode_json($jsondata);
		if($data->{'cpanelresult'}{'event'}->{'result'} eq "1"){
		
		if(defined $data->{'cpanelresult'}{'data'})
		{
			 foreach my $item (@{$data->{'cpanelresult'}{'data'}})
			 {
				if($item->{'humandiskused'} eq "None") { $item->{'humandiskused'} = "0";  }
				if($item->{"diskquota"} eq "unlimited") { $item->{'humandiskquota'} = "Unlimited";  }
				print  "<tr><td></td><td>".$item->{'email'}."</td><td>".$item->{'humandiskused'}."/".$item->{'humandiskquota'}.'</td><td><span id="editquota" class="glyphicon glyphicon-edit" value="'.$item->{"diskquota"}.'"> Quota</span> &nbsp; <span id="delete_mail" class="glyphicon glyphicon-trash" value="'.$item->{"email"}.'"> Delete</span> &nbsp; <span id="cp_mail" class="glyphicon glyphicon-pencil" value="'.$item->{"email"}.'"> Password</span></td></tr>';			
			 }
		}
		}
		}
		}
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

