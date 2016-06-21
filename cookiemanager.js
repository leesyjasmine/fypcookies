$(function (){
// JASMINE++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//General http: //www.w3schools.com/js/js_cookies.asp
//https://developer.chrome.com/extensions/cookies#method-get
//https://developer.chrome.com/extensions/cookies
//https://developer.chrome.com/extensions/webRequest
//https://www.chromium.org/developers/design-documents/extensions/proposed-changes/apis-under-development/proposal-chrome-extensions-cookies-api
  
   //INITIALISATION*******************************************************
    $( "#tabs" ).tabs();
  	onlyNumberInput('#dateByDay'); // add
	$( "#autoRemove" ).addClass('autoRemoveOff' ); // remove //default
    restoreSessionOptions();
  //SAVE A SESSION OPTIONS************************************************
	  function saveSessionOptions(option){
		chrome.storage.sync.clear();
		chrome.storage.sync.set({'inSession':option});	  
	  }
	  function restoreSessionOptions(){ // only use in initialisation
	  	chrome.storage.sync.get('inSession',function(results){
	  		if (!isundefinednull(results.inSession)){
				if(results.inSession){
				 	setAddSession();
				}
			}
		});
	  }
  //REMOVE====================================================
	  $('#autoRemoveButton').click(function(){
	  //https: //bufferwall.com/petersirka/2015-03-12-tutorial-simple-html-toggle-button/
			resetManualRemove('');
			var status = $('#autoRemoveButton').val();
			if (status === 'ON'){
				setRemoveSession();				
				saveSessionOptions(false);
			}else if (status === 'OFF'){
				$('#autoRemoveConfirm').dialog('open');
			}
	  }); 
	  $('#autoRemoveConfirm').dialog({
	  	autoOpen: false,
	  	resizable:false,
	  	height:178,
	  	modal: true,
	  	buttons: {
	  		'YES' : function(){
	  			$( this ).dialog( "close" );
	  			saveSessionOptions(true);
	  			setAddSession();
	  		},
	  		'NO': function(){
	  			$( this ).dialog( "close" );
	  		}
	  	}
	  });
	  function setAddSession(){
	  	$('#autoRemoveButton').val('ON');
		$('#autoRemoveButton').text('ON');
		$( "#autoRemove" ).toggleClass('autoRemoveOn');
		setAllCookiesToSession();
		chrome.extension.getBackgroundPage().addSessionListener();
	  }
	  function setRemoveSession(){
	    $('#autoRemoveButton').val('OFF');
		$('#autoRemoveButton').text('OFF');
		$( "#autoRemove" ).toggleClass('autoRemoveOn' );
		chrome.extension.getBackgroundPage().removeSessionListener();
	  }
	  function setAllCookiesToSession(){
	  	chrome.cookies.getAll({},function(cookieArray){
	  		for (var i=0;i<cookieArray.length;i++){
	  			chrome.extension.getBackgroundPage().changeToASessionCookie(cookieArray[i]);
	  		}
	  	});
	  }	
		//MANUAL REMOVE-------
	  $('#chooseRemoveCookiesBox').hide();
	  
	  $('#manualRemoveShowCookies').click(function(){
	  	$('#submitRemove').attr('disabled',false);
	  	$('#submitRemoveAll').attr('disabled',false);
	  	chrome.cookies.getAll({},function(cookieArray){
			var appendStrArray = [];
			for (var i = 0; i < cookieArray.length; i++){
				var cookieName = cookieArray[i].name;
				var cookieDomain = cookieArray[i].domain;
				var cookieUrl = 'http'+((cookieArray[i].secure)?'s':'')+'://' + cookieArray[i].domain + cookieArray[i].path;
				var aEntry = "<option value="+cookieName+" data-section="+cookieDomain+" data-description="+cookieUrl+">"+cookieName+"</option>";
				appendStrArray.push(aEntry);
			}
			setShowCookies('chooseRemoveCookiesBox','chooseRemoveCookies',appendStrArray);
		});
	  });
	  function setShowCookies(chooseCookiesBox,chooseCookies,appendStrArray){
	  	$('#'+ chooseCookiesBox).empty();
	  	$('#'+ chooseCookiesBox).append("<select id="+chooseCookies+" multiple='multiple'></select>");
	  	if (appendStrArray.length <= 0){
	  	resetManualRemove("No Cookies Found");
	  	}else{
	  		$.each( appendStrArray, function( key, value ) {
	  			$('#'+ chooseCookies).append(value);
			});
			setTreeCheckbox('#'+chooseCookies);
	  		$('#'+chooseCookiesBox).hide();
	  		$('#'+chooseCookiesBox).show(500);
		}
	  }
	  $('#submitRemove').click(function(){ 
		$('#chooseRemoveCookies option:selected').each(function() {
    		var remCookie={};
			remCookie.url = $(this).attr('data-description');
    		remCookie.name = $(this).val();
    		chrome.cookies.remove(remCookie);
		});
	  	resetManualRemove("Success Remove");
	  });
	  $('#submitRemoveAll').click(function(){ 
	  	chrome.cookies.getAll({},function(cookieArray){
	  		for (var i = 0; i < cookieArray.length;i++){
	  			var remCookie = chrome.extension.getBackgroundPage().copyAsRemoveCookie(cookieArray[i])
	  			chrome.cookies.remove(remCookie);
	  		}
	  	});
	  	resetManualRemove("Success Remove");
	  });
	  function resetManualRemove(displayMsg){
	  	$('#submitRemove').attr('disabled',true);
		$('#submitRemoveAll').attr('disabled',true);
	  	$('#chooseRemoveCookiesBox').hide();
		displayStatus('#rStatus', displayMsg,'');
	  }
    //ADD===============================================
	$('#submitAdd').click(function(){ 
		var okay = allFilledUp('#addCookie .compulsary');
		var dateFilledUp = checkDateFilledUp('#addDateContainer');
		if (okay ===true && dateFilledUp === true){
			  var newCookie = {};
			  newCookie.domain = $('#addCookie').find('input[name=domain]').val();
			  newCookie.name = $('#addCookie').find('input[name=name]').val();
			  newCookie.value = $('#addCookie').find('textarea[name=value]').val();
			  newCookie.path = $('#addCookie').find('input[name=path]').val();
			  newCookie.storeId = $('#addCookie').find('input[name=storeId]').val();
			 
			  var lifetimeId = $('#addCookie').find('input[name=lifetime]:checked').attr('id');
			  if (lifetimeId !== 'arSession'){
			    var lifetimeValueId = $('#'+lifetimeId).parent().find('input[type=text]').attr('id');
				lifetimeValueId='#'+lifetimeValueId;
			    if (lifetimeId === 'arDate'){
					var lifetimeValue = $(lifetimeValueId).datetimepicker('getValue');
			   		newCookie.expirationDate =lifetimeValue/1000;
			    }else if (lifetimeId === 'arDay'){
				    var lifetimeValue = $(lifetimeValueId).val();
			    	var date = new Date();
					date.setTime(date.getTime() + (lifetimeValue * 24 * 60 * 60 * 1000));
					newCookie.expirationDate = date/1000;
				}
			  }
			  newCookie.secure=$('#addCookie').find('input[name=secure]').is(':checked');
			  newCookie.httpOnly=$('#addCookie').find('input[name=httpOnly]').is(':checked');
			  /*
			  sameSite=$('#addCookie').find('select[name=sameSite] option:selected').val();
			  if (sameSite!=='no_restriction')
			  		newCookie.sameSite = sameSite;
			 */
			  newCookie.url ='http'+((newCookie.secure)?'s':'')+'://' + newCookie.domain + newCookie.path;

			  chrome.cookies.set(newCookie);
			  
			  displayStatus('#aStatus', "Success Add", newCookie.name);
			  reset("#addCookie"); 
			  resetDateContainer('#addDateContainer');
			  $("#addCookie").find('input[name=path]').val('/');
		 }
	  });  
	  $("input[name=lifetime]:radio").click(function() {
	  		checkedElementID=$('input[name=lifetime]:checked').attr('id');
			$('#addDateContainer p').each(function(){
				var pid = '#' + $(this).attr('id');
	  		 	var checkID = $(pid +' input[name=lifetime]').attr('id');
				var inputID = $(pid + ' input[type=text]').attr('id');
				
	  		 	var hasInputID = false;
				if (typeof inputID !== typeof undefined && inputID !== false){
					hasInputID = true;
	  		 	}
	  		 	inputID='#'+ inputID;
	  		 	if (checkID === checkedElementID){
	  		 		if (hasInputID){
						$(inputID).attr('disabled',false);
					}
	  		 	}else{
					if (hasInputID){
						$(inputID).attr('disabled',true);
						$(inputID).val('');
					}
				}
			});
		}); 
	
  //UTILITIES*************************************************************
  function isundefinednull(value){
	  var undefinednull = false;
	  if (value === undefined || value === null || value ==='undefined' || value==='null')
	  	undefinednull = true;
	  return undefinednull;
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
  function reset(functionID){
	$(functionID+' input[type=text],textarea').each(function() {
		$(this).val("");
	});
	$(functionID).find('input[type=checkbox]').each(function(){
		$(this).attr('checked',false);
	});
	$(functionID).find('select option:contains("default")').prop('selected',true);
	$(functionID).find('input[type=radio]').each(function(){
		$(this).attr('checked',false);
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
  //REMOVE COOKIES MANUALBOX===========================================
  function setTreeCheckbox(objectid){
  	$(objectid).treeMultiselect({
  	//http://www.jqueryscript.net/form/jQuery-Plugin-For-Multi-Selectable-Tree-Structure-Tree-Multiselect.html
  	  	allowBatchSelection: true,
 		sortable: false,
 		collapsible:true,
 		freeze: false,
 		hideSidePanel:false,
 		onlyBatchSelection:false,
 		sectionDelimiter:'/',
 		showSectionOnSelected:true,
 		startCollapsed:true,
 		onChange:null
  	});
  }
  //DATE====================================================
		$.datetimepicker.setLocale('en');
		$('.datetimepicker').datetimepicker();
		$('.datetimepicker').datetimepicker({
		//http:// xdsoft.net/jqplugins/datetimepicker/
			minDate:0
		});
		
		function resetDateContainer(dateContainerID){
			var dateName=$(dateContainerID +" :input[type=radio]").attr('name');
			($('input[name='+dateName+']:checked')).prop('checked',false);	
			$(dateContainerID +" :input[type=text]").each(function(){
				$(this).val('');
				$(this).attr('disabled',true);
			});
			$(dateContainerID).find('input[id*=rSession]').prop('checked',true);
		}
		function checkDateFilledUp(dateContainerID){
			var dateName = $(dateContainerID).find('input[type=radio]').attr('name');
			var dateFilledUp = true;
			if (!($('input[name='+dateName+']:checked').length)) {
				$(dateContainerID).toggle( "highlight",function(){$(dateContainerID).show();});
				dateFilledUp=false;
			}else{
			  	checkedElementID=$('input[name='+dateName+']:checked').attr('id');
				var parentCheckedID = $('#'+checkedElementID).parent().attr('id');
				var inputID = $('#'+parentCheckedID + ' input[type=text]').attr('id');
				if (typeof inputID !== typeof undefined && inputID !== false){
					inputID = '#'+inputID;
					if ($(inputID).val().length === 0){
						$(inputID).toggle( "highlight",function(){$(inputID).show();});
						dateFilledUp = false;
					}
				}
			}
			return dateFilledUp;
		}
// MINGKAI++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ACE++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
$("#submitImport").click(function() {
	 myFunction();

}); 
function myFunction(){
	/*
    var x = document.getElementById("frm1").find('input[name=fname').val();
    var displayTxt = "";
    var i;
    for (i = 0; i < x.length ;i++) {
        displayTxt += x.elements[i].value + "/";
    }
    */
   //var x = $('#frm1').find('input[name="fname"]').val();
   //var y = $('#frm1').find('input[name="lname"]').val();
   var z = $('#jpaste').val();
   //displayStatus("#importstatus",x,y,z);
   //$("#importstatus").text(x+" "+y +" "+ z);
   //here goes parsing function
   var arr = JSON.parse(z);
   var i;
   var out = "<table>";
   for (i=0;i<arr.length;i++){
       out += "<tr><td>" +
       arr[i].domain + "</td><td>" +
       arr[i].expirationDate + "</td><td>" +
       arr[i].hostOnly + "</td><td>" +
       arr[i].httpOnly + "</td><td>" +
       arr[i].name + "</td><td>" +
       arr[i].path + "</td><td>" +
       arr[i].storeId + "</td><td>" +
       arr[i].id + "</td></tr>";
   }
   out += "</table>";
   $("#importstatus").html(out);

}
// GIAN+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

});
