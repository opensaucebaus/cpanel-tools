# Quick SSL Generator for Local Dev (WSL Ubuntu 22)

A simple Bash wrapper around Certbot and the Cloudflare API to issue or renew DNS-validated SSL certificates for offline development domains on WSL Ubuntu 22.

---

## Requirements

- **WSL Ubuntu 22** (tested on 22.04 LTS)  
- **Bash** (≥ 4.x)  
- **curl**  
- **jq** (for parsing Cloudflare JSON responses)  
- **Certbot** (with DNS “manual” support)  
- A **Cloudflare API token** with DNS edit permissions  
- Your **Cloudflare Zone ID** for the parent domain  

---

## Installation

1. **Clone or copy** this repo into your WSL home (e.g. `~/ssl-generator`).  
2. **Make the script executable**:  
   ```bash
   chmod +x ssl.sh
Install dependencies (if you haven’t already):


sudo apt update
sudo apt install -y curl jq certbot
Configuration
Open ssl.sh in your editor.

Fill in your Cloudflare credentials at the top of the file:


CF_API_TOKEN="YOUR_CF_API_TOKEN"
CF_ZONE_ID="YOUR_CF_ZONE_ID"
Set your target domain and email address:


DOMAIN="test.yourdomain.com"
# Change this to the address Certbot will use for expiration notices:
EMAIL="you@example.com"
(Optional) Adjust the DNS propagation wait time:


sleep 30  # Seconds to wait for Cloudflare to publish the TXT record
Usage
All steps are automated via Certbot’s hooks—just run the script without arguments:


./ssl.sh
This will:

Deploy _acme-challenge.<your-domain> TXT record via Cloudflare API

Wait (default 30 s) for DNS to propagate

Invoke Certbot in manual-DNS mode to obtain/renew your certificate

Remove the TXT record after validation

Copy the resulting cert and key into your current directory

Hooks Explained
./ssl.sh deploy_challenge
– Called by Certbot to create the DNS TXT record.

./ssl.sh clean_challenge
– Called by Certbot to delete the DNS TXT record.

You normally don’t call these directly—Certbot does.

Step-by-Step Example
Configure credentials & domain in ssl.sh.

Run the script:


cd ~/ssl-generator
./ssl.sh
Watch Certbot output.

After success, your .pem files will live in the current folder.

Troubleshooting
Invalid API token/zone
– Ensure CF_API_TOKEN has DNS edit rights for your Zone.
– Double-check CF_ZONE_ID matches your root domain in Cloudflare.

DNS propagation failures
– Increase the sleep time before Certbot runs.

Permission errors copying certs
– You may need to run with sudo or adjust /etc/letsencrypt ACLs.





