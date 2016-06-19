chrome.browserAction.setBadgeBackgroundColor({
	color : '#68D2A0'
});
var textBadge = 0;
function setBadge() {
	++textBadge;
	var textBadgeStr = '';

	if (textBadge > 99)
		textBadgeStr = '99+';
	else
		textBadgeStr = textBadge.toString();
	chrome.browserAction.setBadgeText({
		text : textBadgeStr
	});
}
function resetBadge() {
	textBadge = 0;
	chrome.browserAction.setBadgeText({
		text : ''
	});
}
function setSession(changeInfo) {
	// listener that always wait for new cookies added and change them to session
	if (!changeInfo.removed) {
		if (!changeInfo.cookie.session) {
			setBadge();
			changeToASessionCookie(changeInfo.cookie);
		}
	}
}
function addSessionListener() {
	chrome.cookies.onChanged.addListener(setSession);
}
function removeSessionListener() {
	resetBadge();
	chrome.cookies.onChanged.removeListener(setSession);
}

function changeToASessionCookie(currCookie) {
	var sessionCookie = copyAsSessionCookie(currCookie);
	var removeCookie = copyAsRemoveCookie(currCookie);
	chrome.cookies.remove(removeCookie);
	chrome.cookies.set(sessionCookie);
}
function copyAsRemoveCookie(currCookie) {
	var removeCookie = {};
	removeCookie.url = 'http' + ((currCookie.secure) ? 's' : '') + '://' + currCookie.domain + currCookie.path;
	removeCookie.name = currCookie.name;
	if (!isundefinednull(currCookie.storeId))
		removeCookie.storeId = currCookie.storeId;
	return removeCookie;
}
function copyAsSessionCookie(oldCookie) {
	var newCookie = {}; // no expirationDate so default as session
	if (!isundefinednull(oldCookie.url))
		newCookie.url = oldCookie.url;
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
	newCookie.url = 'http' + ((newCookie.secure) ? 's' : '') + '://' + newCookie.domain + newCookie.path;

	return newCookie;
}
function isundefinednull(value) {
	var undefinednull = false;
	if (value === undefined || value === null || value === 'undefined' || value === 'null')
		undefinednull = true;
	return undefinednull;
}