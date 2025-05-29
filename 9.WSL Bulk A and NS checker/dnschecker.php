<?php
set_time_limit(7200);

// Read the list of domains from the file
$file = fopen("list.txt", "r") or die("Unable to open file!");
$domains = array();
while (!feof($file)) {
    $line = fgets($file);
    $line = trim($line);
    if (!empty($line)) {
        $domains[] = $line;
    }
}
fclose($file);

// Open file to write the results
$csv = fopen("DNSdata.csv", "w");

// Write headers to CSV
fputcsv($csv, array("Domain", "IP", "Host", "MX IP", "MX", "NS1", "NS2"));

// Number of processes
$processes = 100;

// Divide the domains into chunks
$chunks = array_chunk($domains, ceil(count($domains) / $processes));

// Create an array to store the child processes
$processes_array = array();

// Perform lookup for each chunk of domains
foreach ($chunks as $chunk) {
    $pid = pcntl_fork();
    if ($pid == -1) {
        die('could not fork');
    } else if ($pid) {
        // parent process
        $processes_array[] = $pid;
    } else {
        // child process
        foreach ($chunk as $domain) {
            $resultMX = dns_get_record($domain, DNS_MX);
            $resultA = dns_get_record($domain, DNS_A);
            $resultNS = dns_get_record($domain, DNS_NS);
            if (!empty($resultMX) || !empty($resultA) || !empty($resultNS)) {
                $nameservers = array();
                $ipAddress = array();
                $hostnames = array();
                $mxRecord = "";
                $mxIp = "";

                foreach ($resultMX as $record) {
                    $mxRecord = $record['target'];
                    $resultMX_A = dns_get_record($mxRecord, DNS_A);
                    foreach ($resultMX_A as $mx_a_record) {
                        $mxIp = $mx_a_record['ip'];
                    }
                }

                foreach ($resultA as $record) {
                    $ipAddress[] = $record['ip'];
                    $hostnames[] = gethostbyaddr($record['ip']);
                }

                foreach ($resultNS as $record) {
                    $nameservers[] = $record['target'];
                }

                if (count($ipAddress) > 0) {
                    $singleIpAddress = $ipAddress[0];
                    $singleHostname = $hostnames[0];
                    fputcsv($csv, array($domain, $singleIpAddress, $singleHostname, $mxIp, $mxRecord, $nameservers[0] ?? "", $nameservers[1] ?? ""));
                } else {
                    fputcsv($csv, array($domain, "Error: No A records found"));
                }
            } else {
                fputcsv($csv, array($domain, "Error: No records found"));
            }
        }
        exit();
    }
}

// Wait for all the child processes to complete
foreach ($processes_array as $pid) {
    pcntl_waitpid($pid, $status);
}

// Close the csv file
fclose($csv);

echo "MX, NS, and A records data lookup completed successfully and results have been written to DNSdata.csv";
?>
