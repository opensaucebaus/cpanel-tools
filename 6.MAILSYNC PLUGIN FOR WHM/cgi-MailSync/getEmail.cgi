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
		my $main_domain = param('id');
		my $domain_user = get_user($main_domain);
		if($domain_user eq "") {
			set_error("Sorry, Unable to find Cpanel user for the selected domain ...");
			exit;
		}
		my @domain_list = get_domin_list($domain_user);	
		if(!@domain_list) {
			set_error("Sorry, Unable to find domains under the selected domain ...");
			exit;
		}
		
		print qq{
			<form role="form">
			<div class="alert alert-info alert-dismissable">
			<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
			<span class="glyphicon glyphicon-info-sign"></span>
			<div class="alert-message">
				<strong>Info:</strong>
				You can create email accounts from this section, if you haven't already created them from account&rsquo;s cpanel. It is recommended to create email accounts with same password as that of remote mail server, so you don't have to update passwords in email client configuration.
			</div>
			</div>
			<div id="alert_success" class="alert alert-success alert-dismissable" style="display: none;">
			<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
			<span class="glyphicon glyphicon-ok-sign"></span>
			<div class="alert-message">
				<strong>Success:</strong>
				It's recommended to create email accounts with same password ...
			</div>
			</div>
			<div id="alert_me" style="display: none;" >
			</div>
			<div id="create_mail">
			<h4><strong>Create Email Accounts</strong></h4>
		    <div class="form-group col-xs-6">
			<div class="input-group col-xs-12">
					<span class="input-group-addon"><span class="glyphicon glyphicon-envelope"></span></span>
					<input class="form-control " placeholder="email" title="email" id="emailusernmae" name="emailusernmae" type="text">
					<span class="input-group-addon">@</span>
					<select class="form-control" id="domain_select">	
		};
		foreach my $item (@domain_list) {      
			print "<option>$item</option>";
		}
	  
		print qq{
			</select>			
			</div></div>
            <div class="form-group col-xs-3">
                <input id="pass" class="form-control input-group-lg reg_name" type="password" name="pas" title="Enter password" placeholder="Enter password">
            </div><div class="form-group col-xs-3">
                <input id="confirm_pass" class="form-control input-group-lg reg_name" type="password" name="confirm_pass" title="Enter confirm password" placeholder="Enter confirm password">
            </div>
			<div class="form-group col-xs-9 pull-right">
			<div class="form-group col-xs-3">
				<label class="checkbox-inline"><input id="remote_host" type="checkbox" value="true" checked>Same as remote host</label>
			</div>
			<div class="form-group col-xs-6">
			<div class="progress">
			  <div id="email_progress" class="progress-bar progress-bar-danger" role="progressbar" aria-valuenow="0"
			  aria-valuemin="0" aria-valuemax="100" style="width:0%">
				0%
			  </div>
			  </div>
			  <label style="font-size: 12px;" for="progress">Password Strength</label>
			  </div>
			<div class="form-group col-xs-3">
				<button id="generate" type="button" class="btn btn-warning" data-toggle="modal" data-target="#myModal" value="0">Generate Password</button>
			</div>
			</div>
			
			</div>
			<br><br><br><br>
			<div id="size_mail" class="form-group col-xs-2">
			<label for="size_mail">Mail Box Quota</label>
				<div class="radio">
				  <label><input type="radio" name="optradio" value="250" checked="">
				  <div class="input-group">
						<input class="form-control" placeholder="Size" title="size" id="size" name="size" type="number" value="250"> 
						<span class="input-group-addon">MB</span>
				  </div>
				  </label>
				</div>
				<div class="radio">
				  <label><input type="radio" name="optradio" value="unlimited">Unlimited</label>
				</div>	
			</div>
			<br>
			<div class="form-group col-xs-12">
				<button id="create_account" type="button" class="btn btn-primary">Create Account</button>
			</div>
			</div><!--create_mail-->

			<!-- Email Account List -->
			<div id="Emaillist" class="form-group col-xs-12">
			</div>

			<div class="form-group col-xs-12">
			<button id="goto_domains" type="button" class="btn btn-primary">Previous</button>
			<button id="select_emails" type="button" class="btn btn-success">Next</button>
			</div>
			
			<!-- Modal -->
			  <div class="modal fade" id="myModal" role="dialog">
				<div class="modal-dialog modal-xm">
				  <div class="modal-content">
					<div class="modal-header">
					  <button type="button" class="close" data-dismiss="modal">&times;</button>
					  <h4 class="modal-title">Password Generator</h4>
					</div>
					<div class="modal-body">
					  <input class="form-control" id="generated_password" type="text" value=""><br>
					  <button id="generate" type="button" class="btn btn-primary">Generate Password</button><br><br>
					  <p>
					  <label class="checkbox-inline"><input id="generate_password_confirm" type="checkbox" >I have copied this password in a safe place.</label>
					  </p>
					</div>
					<div class="modal-footer">
					  <button id="use_password" type="button" class="btn btn-primary" disabled>Use Password</button>
					  <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
					</div>
				  </div>
				</div>
			  </div>
		</form>
		};
	print '<script>var domain_user="'.$domain_user.'";</script>';
	print '<script>var main_domain="'.$main_domain.'";</script>';
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
 sub get_domin_list {
		my $lock = Cpanel::SafeFile::safeopen(\*IN,"<","/etc/userdomains");
		my @local = <IN>;
		Cpanel::SafeFile::safeclose(\*IN,$lock);
		chomp @local; 
		my @domain_list;
		my $domain_user = shift;
		foreach my $item (@local) {
			my ($domain,$user) = split(/\:\s*/,$item,2);
			if($domain_user eq $user) {
				push (@domain_list, $domain);
			}
		}
		return @domain_list;
 }
