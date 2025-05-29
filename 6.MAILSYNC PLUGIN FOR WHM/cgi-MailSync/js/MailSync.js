var ApiURL;
$( document ).ready(function() {
$(".disabledTab").on("click", function(e) {
  if ($(this).hasClass("disabled")) {
    e.preventDefault();
    return false;
  }
});
$("body").on("click","#shell_close", function(){ 
	$('#shell_div').hide();
	$('#shell_out').hide();
});
$("body").on("click","#goto_domains", function(){ 
	$('#myTabs a[href="#1"]').tab('show');
});	
$("body").on("click","#goto_domains_s", function(){ 
	$('#myTabs a[href="#1"]').tab('show');
});
$("body").on("click","#select_back", function(){ 
	$('#myTabs a[href="'+$('#select_back').val()+'"]').tab('show');
});	
$("body").on("click","#goto_emails", function(){ 
	$('#myTabs a[href="#2"]').tab('show');
});
$("body").on("click","#goto_confirmlist", function(){ 
	$('#myTabs a[href="#3"]').tab('show');
});
$("body").on("click","#do_sync", function(){ 
	$('#shell_div').show();
	$('#shell_out').show();
	$('#alert_sync').hide();
	$('#goto_domains_s').addClass('disabled');
	$('#goto_confirmlist').addClass('disabled');
	$('#shell_out').html("starting ......");
	var f = Date.now()+"_"+domain_user;
	$('#do_skip').removeClass('disabled');
	$('#do_stop').removeClass('disabled');
	$('#do_skip').val(f);
	$('#do_stop').val(f);
	$('#shell_close').hide();
	$('#main_li').addClass('disabled');
	$("body,html").animate({ scrollTop: $('body').prop("scrollHeight")}, 500);
	tailme(f,1,25);
});
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
function getTailf(f,s,n,i=0) {
			var request = $.ajax({
			  url: "getTail.cgi",
			  type: "POST",
			  data: {token : f,s : s,n: n},
			  dataType: "html"
			});
			
			request.done(function(msg) {
				if(msg=="Error: Unable to find log file ...")
				{
					$('#shell_out').append(msg);
					return false;
				}
				if(msg!="-1"){
					var count = (msg.match(/<BR>/g) || []).length;
					s = s + count;
					n = s + 25;	
					msg = msg.replace("Skipped....", "<font color=orange><strong>Current sync process has been Skipped....</strong></font>");
					var co = (msg.match(/Completed..../g) || []).length;
					if(co > 0)
					{
						msg = msg.replace("Completed....", "<font color=blue><strong>All sync process has been Completed....</strong></font>");
						$('#shell_out').append(msg);
						$("#shell_out").animate({ scrollTop: $('#shell_out').prop("scrollHeight")}, 500);
						$('#goto_domains_s').removeClass('disabled');
						$('#goto_confirmlist').removeClass('disabled');
						$('#do_skip').addClass('disabled');
						$('#do_stop').addClass('disabled');
						$('#shell_close').show();
						$('#main_li').removeClass('disabled');
						return false;
					}
					var cs = (msg.match(/Stop..../g) || []).length;
					if(cs > 0)
					{
						msg = msg.replace("Stop....", "<font color=red><strong>All sync process has been Stopped....</strong></font>");
						$('#shell_out').append(msg);
						$("#shell_out").animate({ scrollTop: $('#shell_out').prop("scrollHeight")}, 500);
						$('#goto_domains_s').removeClass('disabled');
						$('#goto_confirmlist').removeClass('disabled');
						$('#do_skip').addClass('disabled');
						$('#do_stop').addClass('disabled');
						$('#shell_close').show();
						$('#main_li').removeClass('disabled');
						return false;
					}
					$('#shell_out').append(msg);
					$("#shell_out").animate({ scrollTop: $('#shell_out').prop("scrollHeight")}, 500);
					getTailf(f,s,n);
				} else {
					i=i+1;
					if(i<=5000) {
					//sleep(5000);
					getTailf(f,s,n,i);
					}
				}
			});
			request.fail(function(jqXHR, textStatus) {
			
			});
}
function tailme(f,s,n) {
	var data = $('#js_data').val();
	if(data == "") {
		$('#alert_sync').show();
		$('#alert_sync .alert-message').html('<strong>Error:</strong>Sorry, unable to process information ...');
		return false;
	}
	var request = $.ajax({
		  url: "getShell.cgi",
		  type: "POST",
		  data: {token : f, data: data},
		  dataType: "html"
		});
		
		request.done(function(msg) {
			if(msg != "-1") {
			 getTailf(f,s,n);
			}
		});
		request.fail(function(jqXHR, textStatus) {
		$('#alert_sync').show();
		$('#alert_sync .alert-message').html('<strong>Error:</strong>Sorry, Request failed');
		
		$('#shell_out').html("");
		});
}
function validate_host(value)
{
    if (value.length === 0 || value.length > 511)
        {   return false;
        }

        var regExpIp = new RegExp("^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$");
        var regResultIp = regExpIp.exec(value);
        var regExpHostname = new RegExp(/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/); // RFC 1123
        var regResultHostname = regExpHostname.exec(value);
        if (regResultIp === null && regResultHostname === null)
        {  return false;
        }
		return true;
}
$("body").on("click","#select_sync", function(){ 
	$('#alert_email_confirm').hide();
	$('#alert_email_confirm .alert-message').html('');
	var table = $('#email_confirm_list').DataTable();
	var items=[];
	var j = 0,f = 0;
	table.rows('.selected').each(function(k){
			if(f!=0)
					return false;
			 $(this)[0].forEach(function(item) {
				
				if(f!=0)
					return false;

				if($("input[name=row-"+item+"-password]").val() == "")
				{
					$('#alert_email_confirm').show();
					$('#alert_email_confirm .alert-message').html('<strong>Error:</strong>Please enter the password for '+table.row(k[j]).data()[1]);
					$('body').scrollTop(0);
					f++;
					return false;
				}
				if($("input[name=row-"+item+"-source_password]").val() == "")
				{
					$('#alert_email_confirm').show();
					$('#alert_email_confirm .alert-message').html('<strong>Error:</strong>Please enter the source email password for '+table.row(k[j]).data()[1]);
					$('body').scrollTop(0);
					f++;
					return false;
				} 
				if($("input[name=row-"+item+"-source]").val() == "")
				{
					$('#alert_email_confirm').show();
					$('#alert_email_confirm .alert-message').html('<strong>Error:</strong>Please enter the source email for '+table.row(k[j]).data()[1]);
					$('body').scrollTop(0);
					f++;
					return false;
				} else {
					/*
					if(!isEmail($("input[name=row-"+item+"-source]").val()))
					{
						$('#alert_email_confirm').show();
						$('#alert_email_confirm .alert-message').html('<strong>Error:</strong>Invalid source email id for '+table.row(k[j]).data()[1]);
						$('body').scrollTop(0);
						f++;
						return false;
					}
					*/
				}
				if($("input[name=row-"+item+"-host]").val() == "")
				{
					$('#alert_email_confirm').show();
					$('#alert_email_confirm .alert-message').html('<strong>Error:</strong>Please enter the Host name/IP Address for '+table.row(k[j]).data()[1]);
					$('body').scrollTop(0);
					f++;
					return false;
				} else {
					if(!validate_host($("input[name=row-"+item+"-host]").val()))
					{
						$('#alert_email_confirm').show();
						$('#alert_email_confirm .alert-message').html('<strong>Error:</strong>Invalid Host name/IP Address for '+table.row(k[j]).data()[1]);
						$('body').scrollTop(0);
						f++;
						return false;
					}
				}
				 j++;
			});
			});
			if(f!=0)
					return false;
	j = 0;
	table.rows('.selected').each(function(k){
			 $(this)[0].forEach(function(item) {
				items.push({
				'email' : table.row(k[j++]).data()[1],
				'source' : $("input[name=row-"+item+"-source]").val(),
				'password' : $("input[name=row-"+item+"-password]").val(),
				'source_password' : $("input[name=row-"+item+"-source_password]").val(),
				'host' : $("input[name=row-"+item+"-host]").val(),
				'sourceoptradio' : $("input[name=row-"+item+"-sourceoptradio]:checked").val(),
				'ssl' : $('#row-'+item+'-ssl').is(":checked")
				});
			});
			});
	if(items.length > 0) {
		$('#myTabs a[href="#4"]').tab('show');
		$('#show_sync_confirm').html('<div id="show_confirm"><center>Please wait while loading .... <img src=images/progress.gif /></center></div>');
		var request = $.ajax({
		  url: "getSyncList.cgi",
		  type: "POST",
		  data: {data : JSON.stringify(items, null, 2)},
		  dataType: "html"
		});
		request.done(function(msg) {
		  $('#show_sync_confirm').html(msg);
		  
		  	$('#email_sync_list').DataTable( {

				columnDefs: [ {
					orderable: false,
					className: 'no-sort',
					targets:   1
				},{
					orderable: false,
					className: 'no-sort',
					targets:   2
				},{
					orderable: false,
					className: 'no-sort',
					targets:   3
				} ],
				order: [[ 0, 'asc' ]]
			} );
		});
		request.fail(function(jqXHR, textStatus) {
		$('#alert_sync').show();
		$('#alert_sync .alert-message').html('<strong>Error:</strong>Sorry, Request failed');
		$('#show_sync_confirm').html("");
		});
	} else {
		$('#alert_email_confirm').show();
		$('#alert_email_confirm .alert-message').html('<strong>Error:</strong>Sorry, Please select atleast one email account to proceed ...');
		$('body').scrollTop(0);
	}		
});	
$("body").on("click","#select_emails", function(){ 
	var table = $('#email_list').DataTable();
	var ids = $.map(table.rows('.selected').data(), function (item) {
        return item[1]
    });
	if(ids.length > 0) {
	$('#show_mail_confirm').html('<div id="show_confirm"><center>Please wait while loading .... <img src=images/progress.gif /></center></div>');
		var request = $.ajax({
		  url: "getConfirmList.cgi",
		  type: "POST",
		  data: {list : ids, user : domain_user},
		  dataType: "html"
		});
		$('#myTabs a[href="#3"]').tab('show');
		request.done(function(msg) {
		  $('#show_mail_confirm').html(msg);
		  
		  	$('#email_confirm_list').DataTable( {

				columnDefs: [ {
					visible: false,
					targets: -1
				},{
					orderable: false,
					className: 'select-checkbox',
					targets:   0
				},{
					orderable: false,
					className: 'no-sort',
					targets:   2
				},{
					orderable: false,
					className: 'no-sort',
					targets:   3
				},{
					orderable: false,
					className: 'no-sort',
					targets:   4
				},{
					orderable: false,
					className: 'no-sort',
					targets:   5
				},{
					orderable: false,
					className: 'no-sort',
					targets:   6
				},{
					orderable: false,
					className: 'no-sort',
					targets:   7
				} ,{
					orderable: false,
					className: 'no-sort',
					targets:   8
				} ],
				select: {
					style:    'multi',
					selector: 'td:first-child'
				},
				order: [[ 1, 'asc' ]]
			} );
			
			var table2 = $('#email_confirm_list').DataTable();
				table2.rows().select();
			table2.on( 'deselect', function ( e, dt, type, indexes ) {
				$('#select_check_confirm').prop('checked',false);
			});
			$('#alert_email_confirm').hide();
			$('#alert_email_confirm .alert-message').html('');
		});
		request.fail(function(jqXHR, textStatus) {
		$('#alert_me').show();
		$('#alert_me .alert-message').html('<strong>Error:</strong>Sorry, Request failed');
		$('#show_mail_confirm').html("");
		});
	} else {
	$('#alert_email').show();
	$('#alert_email .alert-message').html('<strong>Error:</strong>Please select atleast one email account to proceed ...');
	$('body').scrollTop(0);
	}
});	
$("body").on("click","#select_domain", function(){  	
		if($('.list-group .active span').text()==""){
		$('#alert').show();
		return;
		} else {
		$('#alert').hide();	
		}
		 $('#show_mail').html('<div id="show_domains"><center>Please wait while loading .... <img src=images/progress.gif /></center></div>');
		var request = $.ajax({
		  url: "getEmail.cgi",
		  type: "POST",
		  data: {id : $('.list-group .active span').text()},
		  dataType: "html"
		});
		$('#myTabs a[href="#2"]').tab('show');
		request.done(function(msg) {
		  $('#show_mail').html(msg);
		});
		request.fail(function(jqXHR, textStatus) {
		$('#alert_email').show();
		$('#alert_email .alert-message').html('<strong>Error:</strong>Sorry, Request failed');
		$('#show_mail').html("");
		});
		getEmail_list($('.list-group .active span').text());
		
    }); 

});
$("body").on("click","#delete_confirm", function(){
	var arry = $('#delete_confirm').attr("value").split("@");
				
		var request = $.ajax({
		  url: ApiURL+"/json-api/cpanel",
		  type: "POST",
		  data: {cpanel_jsonapi_user : domain_user,cpanel_jsonapi_apiversion : 2,cpanel_jsonapi_module : "Email",cpanel_jsonapi_func : "delpop",domain : arry[1],email : arry[0]},
		  dataType: "html"
		});
		
		request.done(function(msg) {
			var obj = JSON.parse(msg);
			if(obj.cpanelresult.data[0].result=="1"){
				  $('#alert_success').show();
				  $('#alert_success .alert-message').html("Email has been successfully deleted ...");
				  getEmail_list(main_domain);
			} else {
				$('#alert_email').show();
				$('#alert_email .alert-message').html('<strong>Error:</strong>Sorry, error occured ... '+obj.cpanelresult.data[0].reason);
			}
		});
		request.fail(function(jqXHR, textStatus) {
		$('#alert_email').show();
		$('#alert_email .alert-message').html('<strong>Error:</strong>Sorry, error occured ... ');
		});
		$('body').scrollTop(0);
});
$("body").on("click","#change_quota", function(){ 
		$('#alert_success').hide();
		$('#alert_success .alert-message').html("");
		$('#alert_email').hide();
		var f=0;
		if($('input[name=optradio_editquota]:checked').val() != "unlimited"){
		if($('#size_editquota').val()==""){
		$('#alert_email').show();
		$('#alert_email .alert-message').html('<strong>Error:</strong>Please enter the size');
		$('body').scrollTop(0);
		f++;
		return;
		} else {
		if(!$.isNumeric($('#size_editquota').val())){
		$('#alert_email').show();
		$('#alert_email .alert-message').html('<strong>Error:</strong>Please enter the size in digits');
		$('body').scrollTop(0);
		f++;
		return;
		}
		}
		}
		var size=0;
		if($('input[name=optradio_editquota]:checked').val() != "unlimited"){
		size = Math.round($('#size_editquota').val());
		}
		var arry = $('#change_quota').attr("value").split("@");
				
		var request = $.ajax({
		  url: ApiURL+"/json-api/cpanel",
		  type: "POST",
		  data: {cpanel_jsonapi_user : domain_user,cpanel_jsonapi_apiversion : 2,cpanel_jsonapi_module : "Email",cpanel_jsonapi_func : "editquota",domain : arry[1],email : arry[0],quota : size},
		  dataType: "html"
		});
		
		request.done(function(msg) {
			var obj = JSON.parse(msg);
			if(obj.cpanelresult.data[0].result=="1"){
				  $('#alert_success').show();
				  $('#alert_success .alert-message').html("Quota has been changed successfully ...");
				  getEmail_list(main_domain);
			} else {
				$('#alert_email').show();
				$('#alert_email .alert-message').html('<strong>Error:</strong>Sorry, error occured ... '+obj.cpanelresult.data[0].reason);
			}
		});
		request.fail(function(jqXHR, textStatus) {
		$('#alert_email').show();
		$('#alert_email .alert-message').html('<strong>Error:</strong>Sorry, error occured ... ');
		});
		$('body').scrollTop(0);
		
});	
$("body").on("click","#change_pass", function(){ 
		var f =0;
		
		$('#alert_email').hide();
		$('#alert_me').hide();

		if($('#pass_c').val()==""){
		$('#alert_email').show();
		$('#alert_email .alert-message').html('<strong>Error:</strong>Please enter the password');
		f++;
		$('body').scrollTop(0);
		return;
		}
		if($('#confirm_pass_c').val()==""){
		$('#alert_email').show();
		$('#alert_email .alert-message').html('<strong>Error:</strong>Please enter the confirm password');
		f++;
		$('body').scrollTop(0);
		return;
		}
		if($('#pass_c').val()!=$('#confirm_pass_c').val()){
		$('#alert_email').show();
		$('#alert_email .alert-message').html('<strong>Error:</strong>Confirm password and password does not match');
		f++;
		$('body').scrollTop(0);
		return;
		}
		
		var current_query = $('#pass_c').val();
		if (current_query !== "") {
			current_query = encodeURI(current_query);
			var request = $.ajax({
			  url: "../passwordstrength.cgi",
			  type: "POST",
			  data: {password : current_query},
			  dataType: "html"
			});
			request.done(function(msg) {
				var obj = JSON.parse(msg);
				if(obj.strength<=required_strength)
				{
							$('#alert_email').show();
							$('#alert_email .alert-message').html('<strong>Error:</strong>Password strength must be at least '+required_strength);
							f++;
							$('body').scrollTop(0);
							return;
				}
			});

			request.fail(function(jqXHR, textStatus) {
				$('#alert_email').show();
				$('#alert_email .alert-message').html('<strong>Error:</strong>Sorry, Request failed');
				f++;
				$('body').scrollTop(0);
				return;
			});
		}
		if(f==0){
		$('#alert_email').hide();	
		}	
		
			$('#alert_me').show();
			$('#alert_me').html('<center>Please wait while loading .... <img src=images/progress.gif /></center>');
			var request = $.ajax({
			  url: "changeEmail.cgi",
			  type: "POST",
			  data: {user : domain_user, email : $('#change_pass').attr("value"),password : current_query,save : $('#remote_host_c').is(":checked")},
			  dataType: "html"
			});
			request.done(function(msg) {
					$('#alert_me').show();
					$('#alert_me').html(msg);
					if(msg.indexOf("Success:") !== -1) {
						var table = $('#email_list').DataTable();				
						table.rows().eq(0).each( function ( idx ) {
						  var row_c = table.row( idx );
						 
						  if ( row_c.child.isShown() ) {
							row_c.child.hide();
						  }
						} );
					}
			});

			request.fail(function(jqXHR, textStatus) {
				$('#alert_me').show();
				$('#alert_me .alert-message').html('<strong>Error:</strong>Sorry, Request failed');		
			});
		$('body').scrollTop(0);
});	

$("body").on("click","#create_account", function(){ 
		var f =0;
		var size_email;
		$('#alert_email').hide();
		$('#alert_me').hide();
		if($('#emailusernmae').val()==""){
		$('#alert_email').show();
		$('#alert_email .alert-message').html('<strong>Error:</strong>Please enter the email username');
		f++;
		return;
		} 
		if(!isEmail($('#emailusernmae').val()+"@"+$('#domain_select').val())){
		$('#alert_email').show();
		$('#alert_email .alert-message').html('<strong>Error:</strong>Invalid Email Address...');
		f++;
		return;
		}
		if($('#pass').val()==""){
		$('#alert_email').show();
		$('#alert_email .alert-message').html('<strong>Error:</strong>Please enter the password');
		f++;
		return;
		}
		if($('#confirm_pass').val()==""){
		$('#alert_email').show();
		$('#alert_email .alert-message').html('<strong>Error:</strong>Please enter the confirm password');
		f++;
		return;
		}
		if($('#pass').val()!=$('#confirm_pass').val()){
		$('#alert_email').show();
		$('#alert_email .alert-message').html('<strong>Error:</strong>Confirm password and password does not match');
		f++;
		return;
		}
		if($('input[name=optradio]:checked').val() != "unlimited"){
		if($('#size').val()==""){
		$('#alert_email').show();
		$('#alert_email .alert-message').html('<strong>Error:</strong>Please enter the size');
		f++;
		return;
		} else {
		if(!$.isNumeric($('#size').val())){
		$('#alert_email').show();
		$('#alert_email .alert-message').html('<strong>Error:</strong>Please enter the size in digits');
		f++;
		return;
		}
		}
		size_email = $('#size').val();
		} else {
		size_email = 0;
		}
		var current_query = $('#pass').val();
		if (current_query !== "") {
			current_query = encodeURI(current_query);
			var request = $.ajax({
			  url: "../passwordstrength.cgi",
			  type: "POST",
			  data: {password : current_query},
			  dataType: "html"
			});
			request.done(function(msg) {
				var obj = JSON.parse(msg);
				if(obj.strength<=required_strength)
				{
							$('#alert_email').show();
							$('#alert_email .alert-message').html('<strong>Error:</strong>Password strength must be at least '+required_strength);
							f++;
							return;
				}
			});

			request.fail(function(jqXHR, textStatus) {
				$('#alert_email').show();
				$('#alert_email .alert-message').html('<strong>Error:</strong>Sorry, Request failed');
				f++;
				return;
			});
		}
		if(f==0){
		$('#alert_email').hide();	
		}	
		
			$('#alert_me').show();
			$('#alert_me').html('<center>Please wait while loading .... <img src=images/progress.gif /></center>');
			var request = $.ajax({
			  url: "createEmail.cgi",
			  type: "POST",
			  data: {main_domain : main_domain, domain : $('#domain_select').val(),email : $('#emailusernmae').val(),password : current_query,quota : size_email,save : $('#remote_host').is(":checked")},
			  dataType: "html"
			});
			request.done(function(msg) {
					$('#alert_me').show();
					$('#alert_me').html(msg);
					if(msg.indexOf("Success:") !== -1) {
					$('#emailusernmae').val("");
					$('#pass').val("");
					$('#confirm_pass').val("");
					$('#size').val("250");
					$('input:radio[name=optradio][value=250]').prop('checked', true);
					getEmail_list(main_domain);
					$('.progress-bar').html("0%");
					$('.progress-bar').css('width', '0%').attr('aria-valuenow', 0);
					$("#email_progress").addClass("progress-bar-danger");
					$("#email_progress").removeClass("progress-bar-success");
					$("#email_progress").removeClass("progress-bar-warning");
					}
			});

			request.fail(function(jqXHR, textStatus) {
				$('#alert_me').show();
				$('#alert_me .alert-message').html('<strong>Error:</strong>Sorry, Request failed');		
			});
		$('body').scrollTop(0);
});	
function isEmail(email) {
  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}
function getEmail_list(domain){
		if($('.list-group .active span').text()==""){
		$('#alert_email').show();
		$('#alert_email .alert-message').html('<strong>Error:</strong>Sorry, Unable to fetch email list');
		$('#Emaillist').html("");
		return;
		} else {
		$('#alert_email').hide();	
		}		
	var request = $.ajax({
	  url: "getEmail_list.cgi",
	  type: "POST",
	  data: {user : domain},
	  dataType: "html"
	});

	request.done(function(msg) {
	  $('#Emaillist').html(msg);
	});

	request.fail(function(jqXHR, textStatus) {
		$('#alert_email').show();
		$('#alert_email .alert-message').html('<strong>Error:</strong>Sorry, Unable to fetch email list');
		$('#Emaillist').html("");
	});
	
			request.done(function(msg) {
		  $('#Emaillist').html(msg);
		  
		  		$('#email_list').DataTable( {
				
				columnDefs: [ {
					orderable: false,
					className: 'select-checkbox',
					targets:   0
				},{
					orderable: false,
					className: 'no-sort',
					targets:   3
				} ],
				select: {
					style:    'multi',
					selector: 'td:first-child'
				},
				order: [[ 1, 'asc' ]]
			} );
			var table = $('#email_list').DataTable();
			table.on( 'deselect', function ( e, dt, type, indexes ) {
				$('#select_check').prop('checked',false);
			});
			});
}
/* Formatting function for row details - modify as you need */
function format ( d,s ) {
    var str = '<div id="size_mail" class="form-group col-xs-3"><label for="editquota_size_mail">Mail Box Quota</label><div class="radio"><br><label>';
		if(s!="unlimited"){
			str+='<input type="radio" name="optradio_editquota" checked="" style="float: left;margin-right: 10px;"><div class="input-group"><input class="form-control " placeholder="Size" title="size" id="size_editquota" name="size_editquota" type="number" value="'+s+'">'; 
		} else {
			str+='<input type="radio" name="optradio_editquota" style="float: left;margin-right: 10px;"><div class="input-group"><input class="form-control " placeholder="Size" title="size" id="size_editquota" name="size_editquota" type="number" value="250">'; 
		}
		str+='<span class="input-group-addon">MB</span></div></label></div><div class="radio">';
		if(s!="unlimited"){
			str+='<label><input type="radio" name="optradio_editquota" value="unlimited" style="float: left;margin-right: 10px;">Unlimited</label>'; 
		} else {
			str+='<label><input type="radio" name="optradio_editquota" value="unlimited" checked style="float: left;margin-right: 10px;">Unlimited</label>'; 
		}
		str+='</div></div><div class="form-group col-xs-12"><br><button id="change_quota" type="button" class="btn btn-primary" value="'+d[1]+'">Save</button></div>';
		return str;
}
function format_d (d) {
    var str = '<div id="del_mail" class="form-group col-xs-12"><label>Do you want delete mail id '+d[1]+'?</label>';
		str+='<br><button id="delete_confirm" type="button" class="btn btn-primary" value="'+d[1]+'">Delete</button></div>';
		return str;
}
function format_c (d) {
    var str = '<div id="del_mail" class="form-group col-xs-12"><div class="form-group col-xs-3"> <input style="width: 100%;" id="pass_c" class="form-control input-group-lg reg_name" type="password" name="pas" title="Enter password" placeholder="Enter password"> </div> <div class="form-group col-xs-3"> <input style="width: 100%;" id="confirm_pass_c" class="form-control input-group-lg reg_name" type="password" name="confirm_pass" title="Enter confirm password" placeholder="Enter confirm password"> </div> <br><br> <div class="form-group col-xs-9"> <div class="form-group col-xs-3"> <label class="checkbox-inline"><input id="remote_host_c" type="checkbox" value="true" checked>Same as remote host</label> </div> <div class="form-group col-xs-6"> <div class="progress"> <div id="email_progress_c" class="progress-bar progress-bar-danger" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width:0%"> 0% </div> </div> <label style="font-size: 12px;" for="progress">Password Strength</label> </div> <div class="form-group col-xs-6"> <button id="generate_c" type="button" class="btn btn-warning" data-toggle="modal" data-target="#myModal" value="1">Generate Password</button> ';
		str+='<button id="change_pass" type="button" class="btn btn-primary" value="'+d[1]+'">Change Password</button></div></div>';
		return str;
}
$(window).load(function(){
	ApiURL = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '')+window.COMMON.securityToken;
	var menuId = $("ul.nav").first().attr("id");
	var request = $.ajax({
	  url: "getDomain.cgi",
	  type: "POST",
	  data: {id : menuId},
	  dataType: "html"
	});

	request.done(function(msg) {
	  $('#show_domains').html(msg);
	});

	request.fail(function(jqXHR, textStatus) {
	$('#alert').show();
	$('#alert .alert-message').html('<strong>Error:</strong>Sorry, Request failed ...');
	 alert( "Request failed: ");
	});

});
$("body").on("keyup","#searchinput", function(){  
 		var current_query = $('#searchinput').val();
		if (current_query !== "") {
			$(".list-group-item").hide();
			$(".list-group-item").each(function(){
				var current_keyword = $(this).text();
				if (current_keyword.indexOf(current_query) >=0) {
					$(this).show();    	 	
				};
			});    	
		} else {
			$(".list-group-item").show();
		};
});
$('body').on('click','.list-group-item', function () {
    $('.list-group .list-group-item').removeClass('active');
    $(this).addClass('active');
});
$("body").on("keydown keypress change","#pass_c", function(){
	
	if ($('#pass_c').val() == "") {
		$("#email_progress_c").addClass("progress-bar-danger");
		$("#email_progress_c").removeClass("progress-bar-success");
		$("#email_progress_c").removeClass("progress-bar-warning");
		$('#email_progress_c.progress-bar').css('width', '0%').attr('aria-valuenow', 0);
		$('#email_progress_c.progress-bar').html("0%");
	}
});
$("body").on("keydown keypress change","#pass", function(){ 
	if ($('#pass').val() == "") {
		$("#email_progress").addClass("progress-bar-danger");
		$("#email_progress").removeClass("progress-bar-success");
		$("#email_progress").removeClass("progress-bar-warning");
		$('#email_progress.progress-bar').css('width', '0%').attr('aria-valuenow', 0);
		$('#email_progress.progress-bar').html("0%");
	}
});
$("body").on("keyup","#pass_c", function(){  
 		var current_query = $('#pass_c').val();
		if (current_query !== "") {
			current_query = encodeURI(current_query);
			var request = $.ajax({
			  url: "../passwordstrength.cgi",
			  type: "POST",
			  data: {password : current_query},
			  dataType: "html"
			});

			request.done(function(msg) {
				var obj = JSON.parse(msg);
				if(obj.strength<=required_strength)
				{
					$("#email_progress_c").addClass("progress-bar-danger");
					$("#email_progress_c").removeClass("progress-bar-success");
					$("#email_progress_c").removeClass("progress-bar-warning");
				} else {
					if(obj.strength>=70 && obj.strength<=85) {
					$("#email_progress_c").addClass("progress-bar-warning");
					$("#email_progress_c").removeClass("progress-bar-danger");
					$("#email_progress_c").removeClass("progress-bar-success");
					} else if(obj.strength>85) {
					$("#email_progress_c").addClass("progress-bar-success");
					$("#email_progress_c").removeClass("progress-bar-warning");
					$("#email_progress_c").removeClass("progress-bar-danger");
					}
				}
				$('#email_progress_c.progress-bar').css('width', obj.strength +'%').attr('aria-valuenow', obj.strength);
				$('#email_progress_c.progress-bar').html(obj.strength+"%");
			});

			request.fail(function(jqXHR, textStatus) {
				$('#alert_email').show();
				$('#alert_email .alert-message').html('<strong>Error:</strong>Sorry, Request failed'+textStatus);
			});
		} else {
			$('#email_progress_c.progress-bar').html("0%");
			$('#email_progress_c.progress-bar').css('width', '0%').attr('aria-valuenow', 0);
			$("#email_progress_c").addClass("progress-bar-danger");
			$("#email_progress_c").removeClass("progress-bar-success");
			$("#email_progress_c").removeClass("progress-bar-warning");
		}
});
$("body").on("keyup","#pass", function(){  
 		var current_query = $('#pass').val();
		if (current_query !== "") {
			current_query = encodeURI(current_query);
			var request = $.ajax({
			  url: "../passwordstrength.cgi",
			  type: "POST",
			  data: {password : current_query},
			  dataType: "html"
			});

			request.done(function(msg) {
				var obj = JSON.parse(msg);
				if(obj.strength<=required_strength)
				{
					$("#email_progress").addClass("progress-bar-danger");
					$("#email_progress").removeClass("progress-bar-success");
					$("#email_progress").removeClass("progress-bar-warning");
				} else {
					if(obj.strength>=70 && obj.strength<=85) {
					$("#email_progress").addClass("progress-bar-warning");
					$("#email_progress").removeClass("progress-bar-danger");
					$("#email_progress").removeClass("progress-bar-success");
					} else if(obj.strength>85) {
					$("#email_progress").addClass("progress-bar-success");
					$("#email_progress").removeClass("progress-bar-warning");
					$("#email_progress").removeClass("progress-bar-danger");
					}
				}
				$('#email_progress.progress-bar').css('width', obj.strength +'%').attr('aria-valuenow', obj.strength);
				$('#email_progress.progress-bar').html(obj.strength+"%");
			});

			request.fail(function(jqXHR, textStatus) {
				$('#alert_email').show();
				$('#alert_email .alert-message').html('<strong>Error:</strong>Sorry, Request failed'+textStatus);
			});
		} else {
			$('#email_progress.progress-bar').html("0%");
			$('#email_progress.progress-bar').css('width', '0%').attr('aria-valuenow', 0);
			$("#email_progress").addClass("progress-bar-danger");
			$("#email_progress").removeClass("progress-bar-success");
			$("#email_progress").removeClass("progress-bar-warning");
		}
});
function create_password(options) {
            var length = options.length;
            var uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXTZ";
            var lowercase = "abcdefghiklmnopqrstuvwxyz";
            var numbers = "0123456789";
            var symbols = "!@#$%^&*()-_=+{}[];,.?~";
            var chars = "";
            if (options.uppercase == true)
                chars += uppercase;
            if (options.lowercase == true)
                chars += lowercase;
            if (options.numbers == true)
                chars += numbers;
            if (options.symbols == true)
                chars += symbols;
            var password = "";
            for (var i = 0; i < length; i++) {
                var rnum = Math.floor(Math.random() * chars.length);
                password += chars.substring(rnum, rnum + 1)
            }
            return password;
}
$('body').on('click','#use_password', function () {
if($('#generate_password_confirm').is(':checked')){
			if($('#use_password').val() == "0") {
				$('#pass').val($('#generated_password').val());
				$('#confirm_pass').val($('#generated_password').val());
				$('#pass').keyup();
			} else {
				$('#pass_c').val($('#generated_password').val());
				$('#confirm_pass_c').val($('#generated_password').val());
				$('#pass_c').keyup();
			}
				$('#myModal').modal('toggle');				
}
});
$('body').on('change','#generate_password_confirm', function () {
        if(this.checked) {
				$('#use_password').prop('disabled', false);
		} else {
			$('#use_password').prop('disabled', true);
		}
});
$('body').on('click','#generate', function () {
			var default_options = {
			length: 12,
			uppercase: true,
			lowercase: true,
			numbers: true,
			symbols: true
            };
            $('#generated_password').val(create_password(default_options));
});
$('body').on('change','#select_check', function () {
        
		var table = $('#email_list').DataTable();
		if(this.checked) {
			table.rows().select();
		} else {
			table.rows().deselect();
		}
});

$('body').on('change','#select_check_confirm', function () {
        
		var table = $('#email_confirm_list').DataTable();
		if(this.checked) {
			table.rows().select();
		} else {
			table.rows().deselect();
		}
});
$('body').on('shown.bs.modal','#myModal', function (e) {
  			var default_options = {
			length: 12,
			uppercase: true,
			lowercase: true,
			numbers: true,
			symbols: true
            };
            $('#generated_password').val(create_password(default_options));
			$('#use_password').prop('disabled', true);
			$('#generate_password_confirm').attr('checked', false);
			var $trigger = $(e.relatedTarget);
			$('#use_password').val($trigger.val());
});
 // Add event listener for opening and closing details
				$('body').on('click', '#editquota', function () {
					var table = $('#email_list').DataTable();
					var tr = $(this).closest('tr');
					var row = table.row( tr );
					
					if ( row.child.isShown() ) {
						// This row is already open - close it
						row.child.hide();
						tr.removeClass('shown');
					}
					else {
						table.rows().eq(0).each( function ( idx ) {
						  var row_c = table.row( idx );
						 
						  if ( row_c.child.isShown() ) {
							row_c.child.hide();
						  }
						} );
						// Open this row
						row.child( format(row.data(),$(this).attr('value')) ).show();
						tr.addClass('shown');
					}
				} );
				$('body').on('click', '#delete_mail', function () {
					var table = $('#email_list').DataTable();
					var tr = $(this).closest('tr');
					var row = table.row( tr );
					
					if ( row.child.isShown() ) {
						// This row is already open - close it
						row.child.hide();
						tr.removeClass('shown');
					}
					else {
						table.rows().eq(0).each( function ( idx ) {
						  var row_c = table.row( idx );
						 
						  if ( row_c.child.isShown() ) {
							row_c.child.hide();
						  }
						} );
						// Open this row
						row.child(format_d(row.data())).show();
						tr.addClass('shown');
					}
				} );
				$('body').on('click', '#cp_mail', function () {
					var table = $('#email_list').DataTable();
					var tr = $(this).closest('tr');
					var row = table.row( tr );
					
					if ( row.child.isShown() ) {
						// This row is already open - close it
						row.child.hide();
						tr.removeClass('shown');
					}
					else {
						table.rows().eq(0).each( function ( idx ) {
						  var row_c = table.row( idx );
						 
						  if ( row_c.child.isShown() ) {
							row_c.child.hide();
						  }
						} );
						// Open this row
						row.child(format_c(row.data())).show();
						tr.addClass('shown');
					}
				} );
var pindex = "#1";

$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
	var usr = "";
 if (typeof domain_user !== 'undefined') {
    usr = domain_user;
}
  var target = $(e.target).attr("href") // activated tab
  if(target == "#5") {
	$('#alert_log').hide();
	$('#alert_log .alert-message').html('');
	
	var request = $.ajax({
		  url: "getLogs.cgi",
		  type: "POST",
		  data: {from : pindex, user: usr},
		  dataType: "html"
		});
		
		request.done(function(msg) {
			$('#show_log').html(msg);
		});
		request.fail(function(jqXHR, textStatus) {
		$('#alert_log').show();
		$('#alert_log .alert-message').html('<strong>Error:</strong>Sorry, Unable to get the log information ...');
		$('#show_log').html("");
		});
  }
  pindex = $('.nav-tabs .active a[data-toggle="tab"]').attr("href");
});
function show_log_me(fname){
	$('#alert_log').hide();
	$('#alert_log .alert-message').html('');
	$('#cat_log').html("<center>Please wait while loading .... <img src=images/progress.gif /></center>");
	var request = $.ajax({
		  url: "showLog.cgi",
		  type: "POST",
		  data: {fname : fname},
		  dataType: "html"
		});
		
		request.done(function(msg) {
			$('#cat_log').html(msg);
		});
		request.fail(function(jqXHR, textStatus) {
		$('#alert_log').show();
		$('#alert_log .alert-message').html('<strong>Error:</strong>Sorry, Unable to get the log information ...');
		$('#show_log').html("");
		});
}
$("body").on("click","#clear_all_logs", function(){ 
	var usr;
	if (typeof domain_user !== 'undefined') {
		usr = domain_user;
	}
	$('#alert_log').hide();
	$('#alert_log .alert-message').html('');
	$('#cat_log').html("");
	$('#logs_list').html("<center>Please wait while loading .... <img src=images/progress.gif /></center>");
	var request = $.ajax({
		  url: "clearLogs.cgi",
		  type: "POST",
		  data: {user : usr},
		  dataType: "html"
		});
		
		request.done(function(msg) {
			$('#logs_list').html(" <table id='log_table' class='table table-striped'> <thead> <tr> <th>List of logs</th> </tr> </thead> <tbody> <tr><td>No Logs Found</td></tr> </tbody> </table> ");
		});
		request.fail(function(jqXHR, textStatus) {
		$('#alert_log').show();
		$('#alert_log .alert-message').html('<strong>Error:</strong>Sorry, Unable to process request ...');
		});
});	
$("body").on("click","#do_clear", function(){ 
	var usr;
	if (typeof domain_user !== 'undefined') {
		usr = domain_user;
	}
	$('#custom_alert').hide();
	$('#alert_sync .alert-message').html('');
	$('#custom_alert').html("");
	$('#custom_alert').html("<center>Please wait while loading .... <img src=images/progress.gif /></center>");
	var request = $.ajax({
		  url: "clearCredentials.cgi",
		  type: "POST",
		  data: {user : usr},
		  dataType: "html"
		});
		
		request.done(function(msg) {
			$('#custom_alert').show();
			$('#custom_alert').html(msg);
		});
		request.fail(function(jqXHR, textStatus) {
		$('#alert_sync').show();
		$('#alert_sync .alert-message').html('<strong>Error:</strong>Sorry, Unable to process request ...');
		});
});
$("body").on("click","#do_skip", function(){ 
	$('#custom_alert').hide();
	$('#alert_sync .alert-message').html('');
	$('#custom_alert').html("");
	$('#custom_alert').html("<center>Please wait while loading .... <img src=images/progress.gif /></center>");
	alert("It will take few seconds to skip current sync .Please be patient !");
	var request = $.ajax({
		  url: "doSkip.cgi",
		  type: "POST",
		  data: {log : $('#do_skip').val()},
		  dataType: "html"
		});
		
		request.done(function(msg) {
			if(msg != "-1") {
				
			} else {
				$('#alert_sync').show();
				$('#alert_sync .alert-message').html('<strong>Error:</strong>Sorry, Unable to process request ...');
			}
		});
		request.fail(function(jqXHR, textStatus) {
		$('#alert_sync').show();
		$('#alert_sync .alert-message').html('<strong>Error:</strong>Sorry, Unable to process request ...');
		});
});
$("body").on("click","#do_stop", function(){ 
	$('#do_skip').addClass('disabled');
	
	$('#custom_alert').hide();
	$('#alert_sync .alert-message').html('');
	$('#custom_alert').html("");
	$('#custom_alert').html("<center>Please wait while loading .... <img src=images/progress.gif /></center>");
	alert("It will take few seconds to stop current sync .Please be patient !");
	var request = $.ajax({
		  url: "doStop.cgi",
		  type: "POST",
		  data: {log : $('#do_stop').val()},
		  dataType: "html"
		});
	$('#do_stop').addClass('disabled');	
		request.done(function(msg) {
			if(msg != "-1") {
			$('#goto_domains_s').removeClass('disabled');
			$('#goto_confirmlist').removeClass('disabled');
			$('#shell_close').show();
			$('#main_li').removeClass('disabled');
			} else {
				$('#alert_sync').show();
				$('#alert_sync .alert-message').html('<strong>Error:</strong>Sorry, Unable to process request ...');
			}
		});
		request.fail(function(jqXHR, textStatus) {
		$('#alert_sync').show();
		$('#alert_sync .alert-message').html('<strong>Error:</strong>Sorry, Unable to process request ...');
		});
});
$("body").on("click","#log_table tbody tr", function(){
    $(this).addClass('active').siblings().removeClass("active");
});
