<?php
declare(strict_types=1);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Full Reseller Migration Tool</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;600&display=swap" rel="stylesheet" />
  <style>
    *{box-sizing:border-box} html,body{margin:0;padding:0;font-family:'Poppins',sans-serif}
    .background{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;
      padding:2rem;background:linear-gradient(to bottom,#ffffff,#ff6c2c)}
    form{background:#fff;border-radius:8px;padding:2rem;width:100%;max-width:520px;box-shadow:0 0 15px rgba(0,0,0,0.1)}
    h2{text-align:center;color:#ff6c2c;margin-bottom:1.5rem}
    label{display:block;margin-bottom:1rem;font-weight:600}
    input,textarea{width:100%;padding:.75rem;margin-top:.5rem;border:1px solid #ddd;border-radius:4px;font-size:1rem}
    button{display:block;margin:1.5rem auto 0;background:#ff6c2c;color:#fff;border:none;
      padding:.75rem 1.5rem;border-radius:4px;font-size:1rem;cursor:pointer}
    button:hover{background:#e55b1e}
    #output-container{width:100%;max-width:520px;margin-top:2rem;padding:1rem;
      background:#f7f7f7;border-radius:4px;white-space:pre-wrap;overflow-wrap:break-word;
      font-family:monospace;line-height:1.4}
  </style>
  <script>
    function startMigration(){
      const out=document.getElementById('output-container');
      out.textContent='⏳ Starting full-reseller migration…\n';
      fetch('migrate.php',{method:'POST',body:new FormData(document.getElementById('migrationForm')),credentials:'same-origin'})
        .then(r=>r.json()).then(json=>{
          if(json.status!=='ok') out.textContent+= '❌ '+json.message+'\n'; else pollOutput();
        }).catch(err=>out.textContent+='Request failed: '+err+'\n');
    }
    function pollOutput(){
      fetch('fetch_output.php',{credentials:'same-origin'})
        .then(r=>r.text()).then(txt=>{
          document.getElementById('output-container').textContent=txt;
          setTimeout(pollOutput,1000);
        }).catch(console.error);
    }
  </script>
</head>
<body>
  <div class="background">
    <form id="migrationForm" onsubmit="event.preventDefault(); startMigration();">
      <h2>Full Reseller Migration Tool</h2>
      <label>Source WHM Host:
        <input name="whm_host" type="text" required placeholder="whm.example.com">
      </label>
      <label>Source WHM User:
        <input name="whm_user" type="text" required placeholder="reselleruser">
      </label>
      <label>Source API Token:
        <input name="api_token" type="text" required placeholder="API Token">
      </label>
      <label>Destination FTP Server:
        <input name="ftp_server" type="text" required placeholder="ftp.example.com">
      </label>
      <label>Destination FTP User:
        <input name="ftp_user" type="text" required placeholder="ftp_user">
      </label>
      <label>Destination FTP Password:
        <input name="ftp_password" type="password" required>
      </label>
      <button type="submit">Start Migration</button>
    </form>
    <pre id="output-container">Waiting to start…</pre>
  </div>
</body>
</html>
