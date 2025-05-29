#!/usr/local/cpanel/3rdparty/bin/perl

use strict;
use Data::Dumper;
use LWP::UserAgent;
use LWP::Protocol::https;
use CGI qw(:standard);
use Cpanel::Template();
use Whostmgr::ACLS          ();
use Whostmgr::HTMLInterface ();
use JSON;
use HTML::Entities;
my $user;

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
		
		my $data = param('data');

		if(!defined $data) {
			set_error("Sorry, didn't recived proper data ...");
			exit;
		}

		
		print qq{
			<br>
			<div class="alert alert-info alert-dismissable">
			<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
			<span class="glyphicon glyphicon-info-sign"></span>
			<div class="alert-message">
				<strong>Info:</strong>
				The selected mailboxes will be synced from remote server, and you can review the logs from &lsquo;Logs&rsquo; section.. 
				<br><br><b>Note</b>: The mailsync process runs as a background task. DO NOT refresh the page.  In case, the page is accidently closed, please check the &lsquo;Logs&rsquo; section to review the status of mailsync.
			</div>
			</div>
			<div id="custom_alert" style="display: none;"></div>
			<div id="alert_sync" style="display: none;" class="alert alert-danger alert-dismissable">
			<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
			<span class="glyphicon glyphicon-remove-sign"></span>
					<div class="alert-message">
						<strong>Error:</strong>
					</div>
			</div>
			
			<br>			
			<h4><strong>List Email Accounts for Mail Sync</strong></h4>
			<br>
			<table id="email_sync_list" class="table table-striped table-bordered" cellspacing="0" width="100%">
			<thead>

				<tr>					
					<th>Local Email Account</th>	
					<th class="no-sort"></th>
					<th class="no-sort">Remote Source</th>
					<th class="no-sort">Host name/IP Address</th>
					<th>Protocol</th>
					<th>SSL</th>
				</tr>
			</thead>

        <tbody>
};
get_email_list($data);		
	print qq{
        </tbody>
    </table>};
		
		#$data =~ s/"/\\"/g;
		print '<input type="hidden" id="js_data" name="js_data" value="'.encode_entities($data).'" />';
	print qq{	
			<div class="form-group col-xs-12">
			<button id="goto_confirmlist" type="button" class="btn btn-primary">Previous</button>
			<button id="do_sync" type="button" class="btn btn-success">Sync</button>
			<button id="goto_domains_s" type="button" class="btn btn-danger">Cancel</button>
			<button id="do_clear" type="button" class="btn btn-warning">Clear credentials</button>
			</div>
			<div id="shell_div" style="display: none;" class="form-group col-xs-12">
			<div id="shell_head" class="form-group col-xs-12">
			<button id="shell_close" type="button" class="close" aria-label="Close"  style="display: none;">
			  <span aria-hidden="true">&times;</span>
			</button>
			</div>
			<div id="shell_out" class="shellme"></div>
			<div class="form-group col-xs-12">
			<button id="do_skip" type="button" class="btn btn-warning" value="">Skip</button>
			<button id="do_stop" type="button" class="btn btn-danger" value="">Stop</button>
			</div>	
			</div>	
};
 }

  sub get_email_list() {
		my $json = shift;
		my $lists = decode_json($json);
		
		foreach my $item( @$lists ) { 
			print  '<tr><td>'.$item->{email}.'</td><td style="text-align: center;"><span class="glyphicon glyphicon-arrow-left"></span><td>'.$item->{source}.'</td><td>'.$item->{host}.'</td><td>'.$item->{sourceoptradio}.'</td><td>';
			if($item->{ssl}) { print "SSL"; } else { print "Non-SSL";}
			print '</td></tr>';
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

