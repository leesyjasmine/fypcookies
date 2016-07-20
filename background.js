// badge
chrome.browserAction.setBadgeBackgroundColor({
	color: '#68D2A0'
});
var textBadge = 0;
function setBadge(){
	++textBadge;
	var textBadgeStr='';
	
	if (textBadge > 99)
		textBadgeStr='99+';
	else
		textBadgeStr=textBadge.toString();
	chrome.browserAction.setBadgeText({
		text: textBadgeStr
	});
}
function resetBadge(){
	textBadge = 0;
	chrome.browserAction.setBadgeText({
		text: ''
	});
}
//background listener for auto tab------------
var onTab = false;
function clearByDomain(domain){
	var urlPattern = '*://*' + domain + '/*'; // pattern
	chrome.tabs.query({'url':urlPattern},function(tabArray){
		if(tabArray.length <= 0){ // no other alive domains
			//clear cookies for that domain
			chrome.cookies.getAll({'domain':domain},function(cookieArray){
				if (cookieArray.length > 0){
					showANotification(domain);
					for (var i = 0; i < cookieArray.length; i++){
						var remCookie = copyAsRemoveCookie(cookieArray[i]);
						chrome.cookies.remove(remCookie);	
						removed = true;
					}
				}
			});
		}
	});
}
function getDomain(urlStr){
	var url = new URL(urlStr);
	var domain ='.'+url.hostname.replace('www.','');
	return domain;
}
function setTab(tabId,removeInfo){
	// 1. listener that detects closed tab
	// 2. checks if all tabs of domain across all windows have been closed
	// 3. if all closed, removes cookies for that domain
	if (onTab){
	  if(!removeInfo.isWindowClosing){
		chrome.sessions.getRecentlyClosed(function(lastClosed){				
			clearByDomain(getDomain(lastClosed[0].tab.url));
		});
	  }
	}else{
	  chrome.tabs.onRemoved.removeListener(setTab);
	}
}
function showANotification(domain){
	chrome.notifications.create(null,{
		type:"basic",
		title:"Cookies Removed for",
		message:domain,
		iconUrl:"icon.png",
	},function(notificationId){
		setTimeout(function(){chrome.notifications.clear(notificationId);},1000);
	});
}
function setWindow(windowId){ // to decide and remove cookies after window closes
	//obtain tabs of last closed window
	//compare and remove cookies accordingly
	if(onTab){
		chrome.sessions.getRecentlyClosed(function(lastClosed){
			if (isundefinednull(typeof lastClosed[0].window)){
				//last closed window has only 1 tab on window
				clearByDomain(getDomain(lastClosed[0].tab.url));
			}else{
				//obtain unique domain list of tabs in last closed window
				var domainList = [];
				for (var i = 0; i < lastClosed[0].window.tabs.length ;i++){
					var aDomain = getDomain(lastClosed[0].window.tabs[i].url);
					if (domainList.indexOf(aDomain)=== -1)
						domainList.push(aDomain); 
				}
				//filter each domain and remove cookies of that domain if needed 
				for (var i = 0; i < domainList.length; i++){
					clearByDomain(domainList[i]);
				}
			}
		});	
	}else{
		chrome.windows.onRemoved.removeListener(setWindow);
	}
}

function addTabListener(){
	onTab = true;
	chrome.tabs.onRemoved.addListener(setTab);
	chrome.windows.onRemoved.addListener(setWindow);
}
function removeTabListener(){
	onTab = false;
	setTab('','');
	setWindow('');
}
/*background listener for auto session------------
/*TESTING
	if (chrome.cookies.onChanged.hasListeners()){
	  	chrome.browserAction.setBadgeText({
			text: 'y'
		});
	  }else{
	  	chrome.browserAction.setBadgeText({
			text: 'n'
		});
	}
*/

/*METHOD 1--------

var setAutoSession = function setSession(changeInfo){
	  	// listener that always wait for new cookies added and change them to session
		if (!changeInfo.removed){ 
			if (!changeInfo.cookie.session){
				setBadge();
				changeToASessionCookie(changeInfo.cookie);	
			}		
	  	}	
};
function addSessionListener(){
	chrome.cookies.onChanged.addListener(setAutoSession);
}
function removeSessionListener(){
	chrome.cookies.onChanged.removeListener(setAutoSession);
	resetBadge();
}
---------------------*/

//METHOD 2------- uses variable onSession as condition as well
/*
 method 1 has shown inconsistencies: poss reasons 
 a) slower processing to remove listener; 
 	e.g. removelistener process is on hold till setsession completed
 b) remove listener process interrupted by other onclick processes
 
method 2 uses additional condition onSession var since background.js
runs when application is enabled, will work.
*/
var onSession = false;
function setSession(changeInfo){
	  	// listener that always wait for new cookies added and change them to session
		if (onSession){
			if (!changeInfo.removed && !changeInfo.cookie.session){
				changeToASessionCookie(changeInfo.cookie);	
				setBadge();
			}		
	  	}else{
			chrome.cookies.onChanged.removeListener(setSession);
			resetBadge();
	  	}
}
function addSessionListener(){
	onSession = true;
	chrome.cookies.onChanged.addListener(setSession);
}
function removeSessionListener(){
	onSession = false;
	setSession('');
}
//-------------------------*/

function changeToASessionCookie(currCookie){
	var sessionCookie = copyAsSessionCookie(currCookie);
	var removeCookie = copyAsRemoveCookie(currCookie);
	chrome.cookies.remove(removeCookie);
	chrome.cookies.set(sessionCookie);
}
function copyAsRemoveCookie(currCookie){
  	var removeCookie = {};
    removeCookie.url='http'+((currCookie.secure)?'s':'')+'://' + currCookie.domain + currCookie.path;
	removeCookie.name = currCookie.name;
	if (!isundefinednull(currCookie.storeId))
		removeCookie.storeId = currCookie.storeId;
	return removeCookie;
}
function copyAsSessionCookie(oldCookie){
	var newCookie = {}; // no expirationDate so default as session
	if (!isundefinednull(oldCookie.url))
	   	newCookie.url = oldCookie.url ;
	if (!isundefinednull(oldCookie.name))
	   	newCookie.name = oldCookie.name;
	if (!isundefinednull(oldCookie.value))
	   	newCookie.value = oldCookie.value;
	if (!isundefinednull(oldCookie.domain))
		newCookie.domain = oldCookie.domain;
	if (!isundefinednull(oldCookie.path))
	   	newCookie.path = oldCookie.path;
	if (!isundefinednull(oldCookie.secure))
	   	newCookie.secure = oldCookie.secure;
	if (!isundefinednull(oldCookie.httpOnly))
	   	newCookie.httpOnly = oldCookie.httpOnly;
	if (!isundefinednull(oldCookie.sameSite))
		newCookie.sameSite = oldCookie.sameSite;
	if (!isundefinednull(oldCookie.storeId))
	   	newCookie.storeId = oldCookie.storeId;
	newCookie.url='http'+((newCookie.secure)?'s':'')+'://' + newCookie.domain + newCookie.path;

	return newCookie;
}
function isundefinednull(value){
	  var undefinednull = false;
	  if (value === undefined || value === null || value ==='undefined' || value==='null'||value.length<=0)
	  	undefinednull = true;
	  return undefinednull;
  }