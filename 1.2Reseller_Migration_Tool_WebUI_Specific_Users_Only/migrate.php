<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=UTF-8');

function clean(string $s): string {
    return htmlspecialchars(trim($s), ENT_QUOTES|ENT_SUBSTITUTE, 'UTF-8');
}

$whm_host     = clean($_POST['whm_host']     ?? '');
$whm_user     = clean($_POST['whm_user']     ?? '');
$api_token    = clean($_POST['api_token']    ?? '');
$ftp_server   = clean($_POST['ftp_server']   ?? '');
$ftp_user     = clean($_POST['ftp_user']     ?? '');
$ftp_password = $_POST['ftp_password']       ?? '';
$accounts     = clean($_POST['accounts_list']?? '');

if (!$whm_host||!$whm_user||!$api_token||!$ftp_server||!$ftp_user||!$ftp_password||!$accounts) {
    http_response_code(400);
    echo json_encode(['status'=>'error','message'=>'Missing required fields']);
    exit;
}

// build environment
$env = [
  'WHM_HOST'      => $whm_host,
  'WHM_USER'      => $whm_user,
  'API_TOKEN'     => $api_token,
  'FTP_SERVER'    => $ftp_server,
  'FTP_USER'      => $ftp_user,
  'FTP_PASSWORD'  => $ftp_password,
  'ACCOUNTS_LIST' => $accounts,
];
$env_str = '';
foreach($env as $k=>$v){
  $env_str .= sprintf('%s=%s ',$k,escapeshellarg($v));
}

$script = escapeshellcmd(__DIR__.'/migrations_script.sh');
$outLog = escapeshellarg(__DIR__.'/output.log');
$errLog = escapeshellarg(__DIR__.'/error.log');

// start background
$cmd = "{$env_str}bash {$script} > {$outLog} 2> {$errLog} & echo \$!";
exec($cmd,$o,$r);

if($r!==0||!isset($o[0])){
  http_response_code(500);
  echo json_encode(['status'=>'error','message'=>'Failed to start migration']);
  exit;
}
echo json_encode(['status'=>'ok','message'=>'Migration started','pid'=> (int)$o[0]]);
