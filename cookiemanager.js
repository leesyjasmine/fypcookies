$(function (){
// JASMINE++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//General http: //www.w3schools.com/js/js_cookies.asp
//https://developer.chrome.com/extensions/cookies#method-get
//https://developer.chrome.com/extensions/cookies
//https://developer.chrome.com/extensions/webRequest
//https://www.chromium.org/developers/design-documents/extensions/proposed-changes/apis-under-development/proposal-chrome-extensions-cookies-api
  $( "#tabs" ).tabs();
  onlyNumberInput('#dateByDay'); //add
  $('#autoRemove').addClass('autoRemoveOff');
  
  //REMOVE=============================================
	 $('#submitRemove').click(function(){ 
		var className = ".rInputDetails";
		var okay = allFilledUp(className);
		 if (okay ===true){
			  var cookieName = $('#rCookieName').val();
			  var cookieDomain = $('#rCookieDomain').val();
			  var cookiePath = $('#rCookiePath').val();
			  createCookie(cookieName,"",-1,cookieDomain,cookiePath);
			  displayStatus('#rStatus', "Success Remove", cookieName);
			  reset(className);
			  reset("#removeCookie .inputDetails"); 
		 }
	  });
	  $('#autoRemoveButton').click(function(){
	  //https: //bufferwall.com/petersirka/2015-03-12-tutorial-simple-html-toggle-button/
			var status = $('#autoRemoveButton').val();
			if (status === 'OFF'){
				$('#autoRemoveButton').val('ON');
				$('#autoRemoveButton').text('ON');
				$( "#autoRemove" ).toggleClass( 'autoRemoveOn' );
				//function to turn ON auto remove
				
			}else if (status === 'ON'){
				$('#autoRemoveButton').val('OFF');
				$('#autoRemoveButton').text('OFF');
				$( "#autoRemove" ).toggleClass('autoRemoveOn' );
				
				//function to turn OFF auto remove

			}
	  }); 
    //ADD===============================================

	$('#submitAdd').click(function(){ 
		var className = ".aInputDetails";
		var okay = allFilledUp(className);
		var dateFilledUp = checkDateFilledUp();
		if (okay ===true && dateFilledUp === true){
			  var cookieName = $('#aCookieName').val();
			  var cookieValue = $('#aCookieValue').val();
			  var cookieLifetime;
				if($('#byDate').is(':checked') ){
					cookieLifetime = $('#dateByDate').datepicker( "getDate" );
				}else if($('#byDay').is(':checked') ){
					cookieLifetime = $('#dateByDay').val();
				}
			  var cookieDomain = $('#aCookieDomain').val();
			  var cookiePath = $('#aCookiePath').val();
			  createCookie(cookieName,cookieValue,cookieLifetime,cookieDomain,cookiePath);
			  displayStatus('#aStatus', "Success Add", cookieName);
			  reset(className); 
			  reset("#addCookie .inputDetails"); 
			  resetAddDate();
		 }
	  });  
	  $("input[name=getDate]:radio").click(function() {
			 if($('#byDate').is(':checked') ){
				$('#dateByDate').attr('disabled',false);
				$('#dateByDay').attr('disabled',true);
				$('#dateByDay').val('');
			 }else if($('#byDay').is(':checked') ){
			 	$('#dateByDate').attr('disabled',true);
				$('#dateByDay').attr('disabled',false);
				$('#dateByDate').val('');
			 }
		}); 
		function checkDateFilledUp(){
			var dateFilledUp = true;
			if((($('#byDate').is(':checked'))=== false) && (($('#byDay').is(':checked'))=== false)){
				$('#byDate').toggle( "highlight",function(){$('#byDate').show();});
				$('#byDay').toggle( "highlight",function(){$('#byDay').show();});
				dateFilledUp=false;
			}
			var date1 = $('#dateByDate').datepicker( "getDate" );
			var date2 = $('#dateByDay').val();
			if((date1 === null) && (date2.length === 0)){
				if ($('#byDate').is(':checked')){
					$('#dateByDate').toggle( "highlight",function(){$('#dateByDate').show();});
				}
				else if ($('#byDay').is(':checked')){
					$('#dateByDay').toggle( "highlight",function(){$('#dateByDay').show();});
				}
				else{
					$('#dateByDate').toggle( "highlight",function(){$('#dateByDate').show();});
					$('#dateByDay').toggle( "highlight",function(){$('#dateByDay').show();});
				}
				dateFilledUp=false;
			}
			
			return dateFilledUp;
		}
	
  //UTILITIES*************************************************************
  function createCookie(name,value,lifetime,domain,path){
	//https: //www.sitepoint.com/community/t/trying-to-set-a-cookie-in-chrome/8718/2
		var cookieExpire;
		var lifetimeType = typeof lifetime;
		if ((lifetimeType === "string")||(lifetimeType==="number")){ // by days or set to expire
			var date = new Date();
			date.setTime(date.getTime() + (lifetime * 24 * 60 * 60 * 1000));
			cookieExpire = date.toUTCString();
		}else if (lifetimeType === "object"){ // by date
			cookieExpire = lifetime.toUTCString();
		}
		var freshCookie = name + "=" + value + ";expires=" +cookieExpire;
		if (domain.length !== 0 && domain !== "null"){
			freshCookie += ";domain=" + domain;
		}
		if(path.length !== 0 && path !== "null"){
			freshCookie +=";path=" + path;
		}
		document.cookie = freshCookie;
  }
  function isANumber(strVariable){
	var isNum = (!isNaN(strVariable));
	return isNum;
  }
  function allFilledUp(className){
	var allFilledUp = true;
	$(className).each(function(i) {
		var v = $(this).val();
		if (v.length === 0){
			allFilledUp = false;
			$(this).toggle( "highlight",function(){$(this).show();});
		}
	});
	return allFilledUp;
  }
  function reset(className){
	$(className).each(function() {
		$(this).val("");
	});
  }
  function onlyNumberInput(object){
	$(object).keyup(function () {
		/*
		http:// stackoverflow.com/questions/891696/jquery-what-is-the-best
		-way-to-restrict-number-only-input-for-textboxes-all
		*/
		if (this.value != this.value.replace(/[^0-9\.]/g, '')) {
			this.value = this.value.replace(/[^0-9\.]/g, '');
		}
	});
  }
  function displayStatus(statusVar, successMsg, checksumMsg){
    var statusMsg = successMsg +"\n" +checksumMsg;
    $(statusVar).fadeIn('slow').text(statusMsg).fadeOut(2000);
  }
  //DATE====================================================
		$( ".datepicker" ).datepicker({
		  //http: //api.jqueryui.com/1.8/datepicker/
		  showOn: "button",
		  //http:// www.atergroup.com/immagini/Icone/calendario.gif
		  buttonImage: "calender.gif",
		  buttonImageOnly: true,
		  buttonText: "Select date",
		  changeMonth: true,
		  changeYear: true,
		  minDate: 0,
		  autoSize:true
		});
		function resetAddDate(){
			resetDateElement('#dateByDate','#byDate');
			resetDateElement('#dateByDay','#byDay');
		}
		function resetDateElement(deById, checkById){
			$(deById).val('');
			$(deById).attr('disabled',true);
			$(checkById).prop('checked',false);
		}
// MINGKAI++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ACE++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// GIAN+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

});
