
Download/Upload the script to the destination host

chmod +x ./updateandsync.sh

Edit/nano/vi the script and change the sections "YOURNSHERE" to reflect your NS and save

Create the file called alldomains.txt in the same directory as updateandsync.sh then copy and paste all domains listed in the origin WHM under DNS Zone Manager to the file - ensure there are no spaces behind the domains then save - quick way to remove spaces is to paste the list of domains in a temp notepad (Windows), highlight the space behind one of the domains then hit ctrl+H and replace the space with nothing then copy and paste the full list of domains to alldomains.txt

Run the Script ./susandunsus.sh

This will update the newly restored accounts` NS to your NS and sync to the cluster should the server be connected to a cluster.

ONLY USE THIS SCRIPT IF YOU SEE THE ORIGIN HOST NS REFLECTING IN THE RESTORED ACCOUNTS` DNS ZONES VIA ZONE MANAGER IN WHM