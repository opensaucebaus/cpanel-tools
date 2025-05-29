#!/usr/bin/perl


use strict;
use Data::Dumper;
use JSON;
use IPC::Open3;
use URI::Escape;
$|++;

  my $path = $ARGV[0];
  my $logpath = $ARGV[1];
  my $json;
  my $existingdir = "/tmp/MailSync";
  mkdir $existingdir unless -d $existingdir;
  $existingdir = "/tmp/MailSync/logs";
  mkdir $existingdir unless -d $existingdir;
  local $/=undef;
  open FILE, $path or die "Couldn't open file: Process has been terminated ...";
  $json = <FILE>;
  close FILE;
  unlink $path;
  my $lists = decode_json($json);
		my $cmd;
		my $ssl;
		foreach my $item( @$lists ) { 
			$cmd = " ".quotemeta($item->{host})." ".quotemeta($item->{source})." ".quotemeta(uri_unescape($item->{source_password}))." ".quotemeta($item->{email})." ".quotemeta(uri_unescape($item->{password}));
			my $port;
			if($item->{ssl}) {
			$ssl = " true";
			} else {
			$ssl = " false";
			}
			
			if($item->{sourceoptradio} eq "IMAP") {
				$cmd = " IMAP ".$cmd.$ssl;
			} else {
				$cmd = " IMAP ".$cmd.$ssl;
			}
			my ($in, $out);
			my $pid = open3($in, $out, $out, "sh /usr/local/cpanel/whostmgr/docroot/cgi/MailSync/MailSync.sh $cmd 2>&1 | tee $logpath");
			my @res = <$out>;
			waitpid ($pid, 0);
				
		}
	unlink $path;
	system("echo 'Completed....' >> ".$logpath);
