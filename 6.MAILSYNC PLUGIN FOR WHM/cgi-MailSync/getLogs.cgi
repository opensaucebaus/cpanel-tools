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
use File::stat;
use Time::localtime;
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
		my $from = param('from');
		my $user = param('user');
		print qq{
			<form role="form">
			<div id="logs_list" class="list-group col-xs-6">
			 <table id="log_table" class="table table-striped">
				<thead>
					<tr>
						<th>Review logs</th>
					</tr>
				</thead>
				<tbody>    
		};
		my $pattern = "*";
		if($user ne ""){
			$pattern = "*$user*";
		}
		my $dirname = "/tmp/MailSync/logs";
		my @files =  sort { -M $b <=> -M $a } 
			  grep { -f } 
			  glob("$dirname/$pattern");
		
		@files = reverse @files;
		if(@files){
		foreach my $item( @files ) { 
			my ($ta,$b) = split(/\/([^\/]+)$/, $item);
			my @temp = split '_', $b; 
			print "<tr style='cursor: pointer;'><td onClick=\"show_log_me('$b');\">".ctime(stat($item)->mtime)." - <strong>".$temp[1]."</strong></td></tr>";
		}
		} else {
		print "<tr><td>No Logs Found</td></tr>";
		}
		print qq{
					 </tbody>
			</table>
			</div>
			<div class="list-group col-xs-6" style="border: 1px solid #ddd; background-color: #ddd;padding-right: 0px;margin-left: 10px;width: 48%;">
			<div style="text-align: center;background-color: #ddd;width:100%;padding: 10px;">
			<strong>Result</strong>
			</div>
			<div  id="cat_log" style="background-color: #f9f9f9; min-height: 100px;">
			
			</div>
			</div>
		</form>
		<div class="form-group col-xs-12">
		<button id="select_back" type="button" class="btn btn-primary" value="$from">Back</button>
		<button id="clear_all_logs" type="button" class="btn btn-danger" >Clear all Logs</button>
		</div>
		};
	exit;
 }
