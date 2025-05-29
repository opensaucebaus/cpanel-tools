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
		
		my @list = param('list[]');
		$user = param('user');
		if(!@list) {
			set_error("Sorry, didn't recived proper data ...");
			exit;
		}
		$CONFIG = Config::INI::Reader->read_file($CONFIG_FILE);	
		
		print qq{
			
			<div class="alert alert-info alert-dismissable">
			<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
			<span class="glyphicon glyphicon-info-sign"></span>
			<div class="alert-message">
				<strong>Info:</strong>
				The remote email account&rsquo;s password will be auto filled if &lsquo;Same as remote host&rsquo; option was ticked in previous page. You can also modify the remote email account details, if needed.
			</div>
			</div>
			<div id="alert_me" style="display: none;" >
			</div>
			<br>			
			<h4><strong>Email Accounts List for Mail Sync</strong></h4>
			<br>
			<table id="email_confirm_list" class="table table-striped table-bordered" cellspacing="0" width="100%">
			<thead>
				<tr>
					<th></th>
					<th colspan="2">Local Server Details</th>
					<th></th>
					<th colspan="5">Remote Server Details</th>
					
				</tr>
				<tr>
					<th style="text-align: center;"><input id="select_check_confirm" type="checkbox" checked ></th>
					<th>Email Account</th>
					<th class="no-sort">Password</th>
					<th class="no-sort"></th>					
					<th class="no-sort">Source</th>
					<th class="no-sort">Password</th>
					<th class="no-sort">Host name/IP Address</th>
					<th class="no-sort"></th>
					<th class="no-sort"></th>
					<th class="no-sort"></th>
				</tr>
			</thead>

        <tbody>
};
get_email_list(\@list);		
	print qq{
        </tbody>
    </table>
			<div class="form-group col-xs-12">
			<button id="goto_emails" type="button" class="btn btn-primary">Previous</button>
			<button id="select_sync" type="button" class="btn btn-success">Next</button>
			<button id="goto_domains" type="button" class="btn btn-danger">Cancel</button>
			</div>		
};
 }

  sub get_email_list() {
		my $pass = "";
		my @list = @{$_[0]};
		for(my $index=0;$index<=$#list;$index++){
				if(defined $CONFIG){
				$pass = $CONFIG->{$user}->{$list[$index]}
				}
				print  "<tr><td></td><td>".$list[$index].'</td><td><input class="form-control" type="password" id="row-'.$index.'-password" name="row-'.$index.'-password" value="'.$pass.'" placeholder="Enter Password"></td><td></td><td><input class="form-control" type="text" id="row-'.$index.'-source" name="row-'.$index.'-source" value="'.$list[$index].'" placeholder="Enter source email"></td><td><input class="form-control" type="password" id="row-'.$index.'-source_password" name="row-'.$index.'-source_password" value="'.$pass.'" placeholder="Enter Password"></td><td><input class="form-control" type="text" id="row-'.$index.'-host" name="row-'.$index.'-host" value="" placeholder="Host name/IP Address"></td>';
				print '<td><label><input type="radio" name="row-'.$index.'-sourceoptradio" id="row-'.$index.'-sourceoptradio" value="IMAP" checked>IMAP</label></td><td><label class="checkbox-inline"><input id="row-'.$index.'-ssl" name="row-'.$index.'-ssl" type="checkbox" value="ssl" checked>SSL</label></td><td></td></tr>';			
				$pass = "";
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

