$(function (){
// JASMINE++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//General http: //www.w3schools.com/js/js_cookies.asp
//https://developer.chrome.com/extensions/cookies#method-get
//https://developer.chrome.com/extensions/cookies
//https://developer.chrome.com/extensions/webRequest
//https://www.chromium.org/developers/design-documents/extensions/proposed-changes/apis-under-development/proposal-chrome-extensions-cookies-api
  $( "#tabs" ).tabs();
  $('#autoRemove').addClass('autoRemoveOff'); // remove 
  onlyNumberInput('#dateByDay'); // add
 
  //REMOVE=============================================

	 $('#submitRemove').click(function(){ 
		var okay = allFilledUp('#removeCookieManual .compulsary');
		 if (okay ===true){
			var remCookie={};
			remCookie.url = $('#removeCookieManual').find('input[name=url]').val();
			remCookie.name = $('#removeCookieManual').find('input[name=name]').val();
			storeId = $('#removeCookieManual').find('input[name=storeId]').val();
			if (storeId.length!==0)
				remCookie.storeId=storeId;
			chrome.cookies.remove(remCookie);
			displayStatus('#rStatus', successMsg + ' Remove', remCookie.name);
			reset('#removeCookieManual');
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
			  newCookie.url ='http'+((newCookie.securee)?'s':'')+'://' + newCookie.domain + newCookie.path;
			  

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
  /*
  function createCookie(url,name,value,lifetime,path){
	//https: //www.sitepoint.com/community/t/trying-to-set-a-cookie-in-chrome/8718/2
		var newCookie={};
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
		var cookiePath= path;
  }*/
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
  //DATE====================================================
		$.datetimepicker.setLocale('en');
		$('.datetimepicker').datetimepicker();
		$('.datetimepicker').datetimepicker({
		//http:// xdsoft.net/jqplugins/datetimepicker/
			minDate:0
		});
		
		function resetDateContainer(dateContainerID){
			dateName=$(dateContainerID +" :input[type=radio]").attr('name');
			($('input[name='+dateName+']:checked')).prop('checked',false);	
			$(dateContainerID +" :input[type=text]").each(function(){
				$(this).val('');
				$(this).attr('disabled',true);
			});
			$(dateContainerID).find('input[id*=rSession]').prop('checked',true);
		}
		function checkDateFilledUp(dateContainerID){
			dateName = $(dateContainerID).find('input[type=radio]').attr('name');
			var dateFilledUp = true;
			if (!($('input[name='+dateName+']:checked').length)) {
				$(dateContainerID).toggle( "highlight",function(){$(dateContainerID).show();});
				dateFilledUp=false;
			}else{
			  	checkedElementID=$('input[name='+dateName+']:checked').attr('id');
				parentCheckedID = $('#'+checkedElementID).parent().attr('id');
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
// GIAN+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

});
