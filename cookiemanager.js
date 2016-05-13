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
			  var cookieURL = $('#rcookieURL').val();
			  var cookieName = $('#rCookieName').val();
			  var cookiePath = $('#rCookiePath').val();
			  createCookie(cookieURL,cookieName,"",-1,cookiePath);
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
			  var cookieURL = $('#aCookieURL').val();
			  var cookieName = $('#aCookieName').val();
			  var cookieValue = $('#aCookieValue').val();
			  var cookieLifetime;
				if($('#byDate').is(':checked') ){
					cookieLifetime = $('#dateByDate').datepicker( "getDate" );
				}else if($('#byDay').is(':checked') ){
					cookieLifetime = $('#dateByDay').val();
				}else if ($('#bySession').is(':checked')){
					//do nothing
				}
			  var cookiePath = $('#aCookiePath').val();
			  createCookie(cookieURL,cookieName,cookieValue,cookieLifetime,cookiePath);
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
			 }else if($('#bySession').is(':checked') ){
				$('#dateByDate').attr('disabled',true);
				$('#dateByDay').attr('disabled',true);
				$('#dateByDate').val('');
				$('#dateByDay').val('');
			  }
		}); 
		function checkDateFilledUp(){
			var dateFilledUp = true;
			if (!($('input[name=getDate]:checked').length)) {
				$('#getDateContainer').toggle( "highlight",function(){$('#getDateContainer').show();});
				dateFilledUp=false;
			}else{
				if (!($('#bySession').is(':checked'))){
					if (($('#byDate').is(':checked'))&&($('#dateByDate').datepicker( "getDate" ) === null)){
						$('#dateByDate').toggle( "highlight",function(){$('#dateByDate').show();});
						dateFilledUp=false;
					}
					else if (($('#byDay').is(':checked'))&& ($('#dateByDay').val().length === 0)){
						$('#dateByDay').toggle( "highlight",function(){$('#dateByDay').show();});
						dateFilledUp=false;
					}
				}
			}
			return dateFilledUp;
		}
	
  //UTILITIES*************************************************************
  function createCookie(url,name,value,lifetime,path){
	//https: //www.sitepoint.com/community/t/trying-to-set-a-cookie-in-chrome/8718/2
		var cookieExpire;
		var session = false;
		var lifetimeType = typeof lifetime;	
		if (lifetimeType === "undefined"){
			session = true;
			cookieExpire="";
		}else if ((lifetimeType === "string")||(lifetimeType==="number")){ 
			var date = new Date();
			date.setTime(date.getTime() + (lifetime * 24 * 60 * 60 * 1000));
			cookieExpire = date.toUTCString();
		}else if (lifetimeType === "object"){ // by date
			cookieExpire = lifetime.toUTCString();
		}
		var cookiePath= "\\";
		if(path.length !== 0 && path !== "null"){
			cookiePath = path;
		}
chrome.cookies.set({
				url: "doubleclick.net", 
				domain: "doubleclick.net", 

				name: "Hello", 
				//expirationDate: cookieExpire, 
				value: "hello",
				path: "/",
			});/*
			chrome.cookies.set({
				url: url, 
				name: name, 
				expirationDate: cookieExpire, 
				value: value,
				path: cookiePath,
			});*/

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
			($('input[name=getDate]:checked')).prop('checked',false);	
			resetDateElement('#dateByDate','#byDate');
			resetDateElement('#dateByDay','#byDay');
		}
		function resetDateElement(deById){
			$(deById).val('');
			$(deById).attr('disabled',true);
		}
// MINGKAI++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ACE++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// GIAN+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

});
