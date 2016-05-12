$(function (){


	  onlyNumberInput('#cookieLife');
	  $('#submitAdd').click(function(){ 
		var className = ".inputDetails";
		var okay = allFilledUp(className);
		if (okay ===true){
			var isNum= isANumber($('#cookieLife').val());
			if(isNum === false){
				$('#cookieLife').val("Number Only");
			}else{
			  var cookieName = $('#cookieName').val();
			  var cookieValue = $('#cookieValue').val();
			  var lifetime = $('#cookieLife').val();
			  createCookie(cookieName,cookieValue,lifetime);
			  $('#successmsg').fadeIn('slow').text("Success Add").fadeOut(3000);
			  $('#checksum').fadeIn('slow').text(cookieName + " " + cookieValue + " " + lifetime).fadeOut(3000);
			  reset(className); 
			}
		 }
	  });  
 
  //-------------------------------------------
  function createCookie(name,value,days){
	//https: //www.sitepoint.com/community/t/trying-to-set-a-cookie-in-chrome/8718/2
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		var cookieExpire = date.toUTCString();
		var freshCookie = name + "=" + value + ";expires=" +cookieExpire;
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
			$(this).addClass('errorMsg');
			$(this).val("Fill this up...");
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
});
