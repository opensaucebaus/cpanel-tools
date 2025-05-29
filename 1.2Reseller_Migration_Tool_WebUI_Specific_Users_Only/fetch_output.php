<?php
declare(strict_types=1);
header('Content-Type: text/plain; charset=UTF-8');

$log = __DIR__.'/output.log';
if (!is_readable($log)) {
  echo "No output yet…";
  exit;
}
$raw = file_get_contents($log);
// strip control chars except LF (0A) and CR (0D)
$clean = preg_replace('/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/u','',$raw);
echo $clean;
