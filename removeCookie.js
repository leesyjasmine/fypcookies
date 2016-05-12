$(function (){
  $('#submitRemove').click(function(){ 
	var className = ".inputDetails";
	var okay = allFilledUp(className);
	 if (okay ===true){
		  var cookieName = $('#cookieName').val();
		  createCookie(cookieName,"",-1);
		  $('#successmsg').fadeIn('slow').text("Success Manual Remove").fadeOut(3000);
		  $('#checksum').fadeIn('slow').text(cookieName).fadeOut(3000);
		  reset(className);
	 }
  });
  //-----------------------------
  function createCookie(name,value,days){
  //https: //www.sitepoint.com/community/t/trying-to-set-a-cookie-in-chrome/8718/2
	var date = new Date();
	date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
	var cookieExpire = date.toUTCString();
	var freshCookie = name + "=" + value + ";expires=" +cookieExpire;
	document.cookie = freshCookie;
  }
  function allFilledUp(className){
	var allFilledUp;
	allFilledUp = true;
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
 
});

