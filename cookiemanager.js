$(function () {
	/*
	//JQuery UI is 1.11.4 version
	//JQuery is 1.12.3 version
	Resources / References:
	1. AES: Stanford Javascript Crypto Library
	2. JQuery Plugin: 	Datetimepicker
	http: //xdsoft.net/jqplugins/datetimepicker/
	3. JQuery Plugin: 	Multi-Selectable Tree Structure
	http://www.jqueryscript.net/form/jQuery-Plugin-For-Multi-Selectable-Tree-Structure-Tree-Multiselect.html
	4. Cookie free icon: Icon made by Freepik from www.flaticon.com is licensed by CC 3.0
	5. Calendar free icon: Icon made by Zlatko Najdenovski http://pixelbazaar.com from https://www.iconfinder.com/icons/809622/calendar_date_office_icon#size=128
	6. Round help button free icon: Icon made by Freepik from www.flaticon.com is licensed by CC 3.0

	 */
	//INITIALISATION*****************************************************
	$("#tabs").tabs();
	$('.tooltiphelp').tooltip();
	restoreSessionOptions();
	restoreTabOptions();
	profileInitialization();
	//SAVE A SESSION OPTIONS*********************************************
	function saveSessionOptions(option) {
		chrome.storage.sync.set({
			'inSession' : option
		});
	}
	function restoreSessionOptions() { // only use in initialisation
		chrome.storage.sync.get('inSession', function (results) {
			if (!chrome.extension.getBackgroundPage().isundefinednull(results.inSession)) {
				if (results.inSession) {
					setOnSession();
				}
			}
		});
	}
	function saveTabOptions(option) {
		chrome.storage.sync.set({
			'inTab' : option
		});
	}
	function restoreTabOptions() { // only use in initialisation
		chrome.storage.sync.get('inTab', function (results) {
			if (!chrome.extension.getBackgroundPage().isundefinednull(results.inTab)) {
				if (results.inTab) {
					setOnTab();
				}
			}
		});
	}
	//LAST REMOVE OPTIONS***********************************************
	chrome.storage.local.get('lastRemove', function (results) {
		if (chrome.extension.getBackgroundPage().isundefinednull(results.lastRemove)) {
			$('#undoLastRemove').attr('disabled', true);
		}
	});
	//CHECK LOGIN STATUS OF CHROME ACCOUNT******************************
	function profileInitialization() {
		chrome.identity.getProfileUserInfo(function (userInfo) {
			if (!chrome.extension.getBackgroundPage().isundefinednull(userInfo.email)) {
				//enable button and show synchro reminder
				$('.profilestyle').find('p').each(function () {
					var toHide = (($(this).attr('hidden') === 'hidden') ? false : true);
					$(this).attr('hidden', toHide);
				});
				$('.profilestyle').find(':button').each(function () {
					$(this).attr('disabled', false);
				});
			}
		});
	}
	//REMOVE====================================================
	//AUTO REMOVE TOGGLE BUTTONS----------------------
	function setAutoButton(ele, buttonText) {
		$(ele).find('button').text(buttonText);
		$(ele).toggleClass('autoRemoveOn');
	}
	//AUTO REMOVE TAB----------------------------------
	$('#autoTabRemoveButton').click(function () {
		//https: //bufferwall.com/petersirka/2015-03-12-tutorial-simple-html-toggle-button/
		resetManualRemove('');
		var status = $('#autoTabRemoveButton').text();
		if (status === 'ON') {
			setAutoButton('#autoTabRemove', 'OFF');
			chrome.extension.getBackgroundPage().removeTabListener();
			saveTabOptions(false);
		} else if (status === 'OFF') {
			setOnTab();
		}
	});
	function setOnTab() {
		setAutoButton('#autoTabRemove', 'ON');
		chrome.extension.getBackgroundPage().addTabListener();
		saveTabOptions(true);
	}
	//AUTO REMOVE SESSION----------------------------------
	$('#autoRemoveButton').click(function () {
		//https: //bufferwall.com/petersirka/2015-03-12-tutorial-simple-html-toggle-button/
		resetManualRemove('');
		var status = $('#autoRemoveButton').text();
		if (status === 'ON') {
			setAutoButton('#autoRemove', 'OFF');
			chrome.extension.getBackgroundPage().removeSessionListener();
			saveSessionOptions(false);
		} else if (status === 'OFF') {
			setOnSession();
		}
	});
	function setOnSession() {
		saveSessionOptions(true);
		setAutoButton('#autoRemove', 'ON');
		setAllCookiesToSession();
		chrome.extension.getBackgroundPage().addSessionListener();
	}
	function setAllCookiesToSession() {
		chrome.cookies.getAll({}, function (cookieArray) {
			for (var i = 0; i < cookieArray.length; i++) {
				chrome.extension.getBackgroundPage().changeToASessionCookie(cookieArray[i]);
			}
		});
	}
	//MANUAL REMOVE----------------------------------
	//INITIALIZATION
	$('#chooseRemoveCookiesBox').hide();
	$('#submitRemove').hide();
	//Display cookies for selection
	$('#manualRemoveShowCookies').click(function () {
		$('#submitRemove').show();
		chrome.cookies.getAll({}, function (cookieArray) {
			cookieArray = sortByDomain(cookieArray);
			var appendStrArray = [];
			for (var i = 0; i < cookieArray.length; i++) {
				var cookieName = cookieArray[i].name;
				var cookieDomain = cookieArray[i].domain;
				var cookieUrl = 'http' + ((cookieArray[i].secure) ? 's' : '') + '://' + cookieArray[i].domain + cookieArray[i].path;
				var aEntry = "<option value=" + cookieName + " data-section=" + cookieDomain + " data-description=" + cookieUrl + ">" + cookieName + "</option>";
				appendStrArray.push(aEntry);
			}
			setShowCookies('chooseRemoveCookiesBox', 'chooseRemoveCookies', appendStrArray);
		});
	});
	function setShowCookies(chooseCookiesBox, chooseCookies, appendStrArray) {
		$('#' + chooseCookiesBox).empty();
		$('#' + chooseCookiesBox).append("<select id=" + chooseCookies + " multiple='multiple'></select>");
		if (appendStrArray.length <= 0) {
			resetManualRemove("No Cookies Found");
		} else {
			$.each(appendStrArray, function (key, value) {
				$('#' + chooseCookies).append(value);
			});
			setTreeCheckbox('#' + chooseCookies);
			$('#' + chooseCookiesBox).hide();
			$('#' + chooseCookiesBox).show(500);
		}
	}

	//When user submit cookies for removal: either by selection/remove all
	$('#submitRemove').click(function () {
		var selectedLength = $('#chooseRemoveCookies option:selected').length;
		if (selectedLength > 0) {
			$('#chooseRemoveCookies option:selected').each(function () {
				var selectedCookie = {};
				selectedCookie.url = $(this).attr('data-description');
				selectedCookie.name = $(this).val();
				chrome.cookies.get(selectedCookie, function (aCookie) {
					addLastRemoveArray(aCookie, selectedLength);
				});
			});
		}
	});
	$('#submitRemoveAll').click(function () {
		chrome.cookies.getAll({}, function (cookieArray) {
			if (cookieArray.length <= 0) {
				resetManualRemove("No Cookies Found");
			} else {
				saveLastRemove(cookieArray);
			}
		});
	});
	function resetManualRemove(displayMsg) {
		$('#submitRemove').hide();
		$('#chooseRemoveCookiesBox').hide();
		displayStatus('#rStatus', displayMsg, '');
	}
	//Undo last remove
	var lastRemoveArray = [];
	function addLastRemoveArray(aCookie, selectedLength) {
		lastRemoveArray.push(aCookie);
		if (selectedLength === lastRemoveArray.length) {
			saveLastRemove(lastRemoveArray);
		}
	}
	function saveLastRemove(cookieArray) {
		//export
		var lastRemoveString = getCopyText(cookieArray);

		chrome.storage.local.set({
			'lastRemove' : lastRemoveString
		}, function () {
			for (var i = 0; i < cookieArray.length; i++) {
				var remCookie = chrome.extension.getBackgroundPage().copyAsRemoveCookie(cookieArray[i])
					chrome.cookies.remove(remCookie);
			}
			lastRemoveArray.length = 0;
			resetManualRemove("Success Remove");
			$('#undoLastRemove').attr('disabled', false);
		});

	}

	$('#undoLastRemove').click(function () { // restore last remove
		$('#undoLastRemove').attr('disabled', true);
		chrome.storage.local.get('lastRemove', function (results) {
			var lastRemoveString = results.lastRemove;
			if (chrome.extension.getBackgroundPage().isundefinednull(lastRemoveString)) {
				resetManualRemove("No Past Cookies");
			} else {
				//import
				try {
					myImport(lastRemoveString);
					resetManualRemove("Success Undo");
				} catch (err) {
					resetManualRemove(err);
				}
				clearUndo();
			}
		});
	});
	//Clear Archive
	$('#clearRemoveArchive').click(function () {
		chrome.storage.local.get('lastRemove', function (results) {
			var lastRemoveString = results.lastRemove;
			if (chrome.extension.getBackgroundPage().isundefinednull(lastRemoveString)) {
				resetManualRemove('Remove History is Empty');
			} else {
				clearUndo();
				resetManualRemove('Remove History Cleared Successfully');
			}
		});
	});
	function clearUndo() {
		chrome.storage.local.remove('lastRemove', function () {
			$('#undoLastRemove').attr('disabled', true);
			$('#submitRemoveAll').attr('disabled', false);
			$('#manualRemoveShowCookies').attr('disabled', false);
		});
	}
	//ADD===============================================
	$('#submitAdd').click(function () {
		var okay = allFilledUp('#addCookie .compulsory');
		var lifetimeFilledUp = checkLifetimeFilledUp('#addCookie input[name=lifetime]', '#addCookie fieldset');
		if (okay === true && lifetimeFilledUp === true) {
			var newCookie = {};
			newCookie.domain = $('#addCookie').find('input[name=domain]').val();
			newCookie.name = $('#addCookie').find('input[name=name]').val();
			newCookie.value = $('#addCookie').find('textarea[name=value]').val();
			newCookie.path = '/';

			// extract lifetime
			var checkedRadioElement = $('#addCookie').find('input[name=lifetime]:checked');
			var lifetimeElement = checkedRadioElement.parent().find('input[type=text]');
			if (lifetimeElement.attr('class') === 'datetimepicker') {
				//by date
				newCookie.expirationDate = lifetimeElement.datetimepicker('getValue') / 1000;

			} else if (lifetimeElement.attr('class') === 'onlyNumbers') {
				//by days
				var date = new Date();
				date.setTime(date.getTime() + (lifetimeElement.val() * 24 * 60 * 60 * 1000));
				newCookie.expirationDate = date / 1000;
			}
			//---
			newCookie.secure = $('#addCookie').find('input[name=secure]').is(':checked');
			newCookie.httpOnly = $('#addCookie').find('input[name=httpOnly]').is(':checked');
			newCookie.url = 'http' + ((newCookie.secure) ? 's' : '') + '://' + newCookie.domain + newCookie.path;

			chrome.cookies.set(newCookie);

			displayStatus('#aStatus', "Success Add", newCookie.name);
			reset("#addCookie");
			$("#addCookie").find('input[name=path]').val('/');
			resetLifetime('#addCookie');
			updateAutocompleteDomain();
		}
	});
	// input autocomplete for domain attribute
	$("#addCookie").click(function () {
		updateAutocompleteDomain();
	});
	function updateAutocompleteDomain() {
		chrome.cookies.getAll({}, function (cookieArray) {
			cookieArray = sortByDomain(cookieArray);
			var domainArray = [];
			for (var i = 0; i < cookieArray.length; i++) {
				if (domainArray.indexOf(cookieArray[i].domain) === -1)
					domainArray.push(cookieArray[i].domain);
			}
			$("#addCookie input[name=domain]").autocomplete({
				source : domainArray
			});
		});
	}
	//manipulate lifetime
	$("#addCookie input[name=lifetime]:radio").click(function () {
		$('#addCookie input[name=lifetime]:radio').each(function () {
			var radioElement = $(this);
			var inputElement = $(this).parent().find('input[type=text]');
			if (!chrome.extension.getBackgroundPage().isundefinednull(typeof inputElement)) {
				if (radioElement.is(':checked')) {
					inputElement.attr('disabled', false);
				} else {
					inputElement.attr('disabled', true);
					inputElement.val('');
				}
			}
		});
	});

	//UTILITIES*************************************************************
	function sortByDomain(cookieArray) {
		cookieArray.sort(function (a, b) {
			var x = a.domain.toUpperCase();
			var y = b.domain.toUpperCase();
			if (x < y) {
				return -1;
			};
			if (x > y) {
				return 1;
			}
			return 0;
		});
		return cookieArray;
	}
	function isANumber(strVariable) {
		var isNum = (!isNaN(strVariable));
		return isNum;
	}
	function allFilledUp(className) {
		var allFilledUp = true;
		$(className).each(function (i) {
			var v = $(this).val();
			if (v.length === 0) {
				allFilledUp = false;
				$(this).toggle("highlight", function () {
					$(this).show();
				});
			}
		});
		return allFilledUp;
	}
	function reset(functionID) {
		$(functionID + ' input[type=text],textarea').each(function () {
			$(this).val("");
		});
		$(functionID).find('input[type=checkbox]').each(function () {
			$(this).attr('checked', false);
		});
		$(functionID).find('input[type=radio]').each(function () {
			$(this).attr('checked', false);
		});
	}
	$('.onlyNumbers').keyup(function () {
		/*
		http:// stackoverflow.com/questions/891696/jquery-what-is-the-best
		-way-to-restrict-number-only-input-for-textboxes-all
		 */
		if (this.value != this.value.replace(/[^0-9\.]/g, '')) {
			this.value = this.value.replace(/[^0-9\.]/g, '');
		}
	});
	function displayStatus(statusVar, successMsg, checksumMsg) {
		var statusMsg = successMsg + "\n" + checksumMsg;
		$(statusVar).fadeIn('slow').text(statusMsg).fadeOut(2000);
	}
	//REMOVE COOKIES MANUALBOX===========================================
	function setTreeCheckbox(objectid) {
		$(objectid).treeMultiselect({
			//http://www.jqueryscript.net/form/jQuery-Plugin-For-Multi-Selectable-Tree-Structure-Tree-Multiselect.html
			allowBatchSelection : true,
			sortable : false,
			collapsible : true,
			freeze : false,
			hideSidePanel : false,
			onlyBatchSelection : false,
			sectionDelimiter : '/',
			showSectionOnSelected : true,
			startCollapsed : true,
			onChange : null
		});
	}
	//DATE====================================================
	$.datetimepicker.setLocale('en');
	$('.datetimepicker').datetimepicker({
		//http:// xdsoft.net/jqplugins/datetimepicker/
		minDate : 0
	});
	//set session in lifetime container to default
	function resetLifetime(lifetimeContainerName) { //e.g resetLifetime('#addCookie')
		$(lifetimeContainerName).find('input[type=radio]').each(function () {
			if (chrome.extension.getBackgroundPage().isundefinednull(($(this).parent().find('input[type=text]').attr('class')))) // session cookie
				$(this).prop('checked', true);
			else
				$(this).parent().find('input[type=text]').attr('disabled', true);
		});
	}
	function checkLifetimeFilledUp(lifetimeRadioElementName, lifetimeContainerElement) {
		//e.g. to call: checkLifetimeFilledUp('#addCookie input[name=lifetime]','#addCookie fieldset')
		var dateFilledUp = true;
		if (!($(lifetimeRadioElementName + ':checked').length)) {
			$(lifetimeContainerElement).toggle("highlight", function () {
				$(lifetimeContainerElement).show();
			});
			dateFilledUp = false;
		} else {
			var checkedRadioElement = $(lifetimeRadioElementName + ':checked');
			var lifetimeElement = checkedRadioElement.parent().find('input[type=text]');
			if (!chrome.extension.getBackgroundPage().isundefinednull(lifetimeElement.attr('class'))) {
				if ($(lifetimeElement).val().length === 0) {
					$(lifetimeContainerElement).toggle("highlight", function () {
						$(lifetimeContainerElement).show();
					});
					dateFilledUp = false;
				}
			}
		}
		return dateFilledUp;
	}

	//MODIFY===============================================
	window.onload = getCurrentDomain;

	function getCurrentDomain() {
		chrome.tabs.query({
			currentWindow : true,
			active : true
		}, function (tabs) {
			var url = new URL(tabs[0].url);
			var currentDomain = url.hostname;

			//remove www else put prepend with '.', (does not work with forums.domain.com)
			if (currentDomain.substring(0, 3) === "www") {
				currentDomain = currentDomain.substring(3);
			} else {
				currentDomain = "." + currentDomain;
			}
			listCurrentCookies(currentDomain);
		});
	}
	function listCurrentCookies(retrievedDomain) {

		chrome.cookies.getAll({
			domain : retrievedDomain
		}, function (cookieList) {
			//sort domains alphabetically
			cookieList = sortByDomain(cookieList);
			//create accordion based on how many cookies were retrieved
			for (i = 0; i < cookieList.length; i++) {
				document.getElementById("myCounter").innerText = i;
				document.getElementById("myDomain").innerHTML = "Domain: <input type='text' class='compulsory' name='domain' value=" + cookieList[i].domain + " disabled></p>";
				document.getElementById("myPath").innerHTML = "Path: <input type='text' name='path' value=" + cookieList[i].path + " disabled></p>";
				document.getElementById("myName").innerHTML = "Name: <input type='text' class='compulsory' name='name' value=" + cookieList[i].name + " disabled></p>";
				document.getElementById("myValue").innerHTML = "Value: </br><textarea name='value' cols=55 rows=5>" + cookieList[i].value + "</textarea></p>";

				var expDate = new Date(cookieList[i].expirationDate * 1000);
				var expString = "<p>Expiration:" + "<fieldset id='modDateContainer" + i + "'>";

				if (expDate == "Invalid Date") {
					expString += "<p>This is a session cookie.</p>";
				} else {
					expString += "<p>Current expiration:</p>" + expDate;
				}
				expString += "<p name='modDateDate'><input type='radio' name='lifetime2'>Date: <input type='text' class='datetimepicker' disabled/> <img src='calendaricon.png'></p>" +
				"<p name='modDateDay'><input type='radio' name='lifetime2'>Days: <input type='text' size='5' disabled/></p>" +
				"<p name='modDateSession'><input type='radio' name='lifetime2' checked>Session</p>" +
				"</fieldset>" +
				"</p>";
				document.getElementById("myExpiration").innerHTML = expString;

				var myPanel = document.getElementById("outerPanel");
				var element = $("<button id='button" + i + "' class = 'accordion'>" + cookieList[i].domain + " | " + cookieList[i].name + "</button>" + myPanel.innerHTML);

				$("#modifyCookie").append(element);
			}

			//Toggle between adding and removing the "active" and "show" classes when the user clicks on one of the "Section" buttons.
			//The "active" class is used to add a background color to the current button when its belonging panel is open.
			//The "show" class is used to open the specific accordion panel.
			var acc = document.getElementsByClassName("accordion");
			var a;

			for (a = 0; a < acc.length; a++) {
				acc[a].onclick = function () {
					this.classList.toggle("active");
					this.nextElementSibling.classList.toggle("show");
				}
			}

			$("input[name=lifetime2]:radio").click(function () {
				//returns id of the selected element
				checkedElementID = $('input[name=lifetime2]:checked').attr('id');
				var m = $(this).parents(".panel").find("#myCounter").text();
				$("#modDateContainer" + m + " p").each(function () {
					var isChecked = $(this).find("input[name=lifetime2]:radio").is(":checked");
					var textBox = $(this).find("input[type=text]");
					var hasInputID = false;

					if (typeof textBox !== typeof undefined) {
						hasInputID = true;
					}
					if (isChecked) {
						if (hasInputID) {
							$(textBox).attr('disabled', false);
						}
					} else {
						if (hasInputID) {
							$(textBox).attr('disabled', true);
							$(textBox).val('');
						}
					}
				});
			});

			//original submitModify function
			$(".modClass").click(function () {
				var c = $(this).closest("div").find("#myCounter").text();
				var modCookie = {};
				modCookie.domain = cookieList[c].domain;
				modCookie.name = cookieList[c].name;
				modCookie.value = $(this).closest("div").find('textarea[name=value]').val();

				var checkedRadioElement = $("#modDateContainer" + c).find("input[name=lifetime2]:checked");
				var lifetimeElement = checkedRadioElement.parent().find("input[type=text]");

				if (!chrome.extension.getBackgroundPage().isundefinednull(typeof lifetimeElement.val())) {

					if (isANumber(lifetimeElement.val())) {
						var date = new Date();
						date.setTime(date.getTime() + (lifetimeElement.val() * 24 * 60 * 60 * 1000));
						modCookie.expirationDate = date / 1000;
					} else {
						modCookie.expirationDate = lifetimeElement.datetimepicker("getValue") / 1000;
					}
				}

				//extract old value if new value is not present (irrelevant with default value...)
				if (!modCookie.value) {
					modCookie.value = cookieList[c].value;
				}

				modCookie.secure = $($(this).closest("div").find('input[name=secure]')).is(':checked');
				modCookie.httpOnly = $($(this).closest("div").find('input[name=httpOnly]')).is(':checked');
				modCookie.url = "http://" + modCookie.domain;

				try {
					chrome.cookies.set(modCookie);
					$('#modifyDialog p').text("The following cookie has been successfully modified: " + modCookie.name);
				} catch (err) {
					$('#modifyDialog p').text(err);
				}
				$('#modifyDialog').dialog("open");
			});

			//DATE====================================================
			$.datetimepicker.setLocale('en');
			$('.datetimepicker').datetimepicker({
				minDate : 0
			});

			$('#modifyDialog').dialog({
				autoOpen : false,
				modal : true,
				buttons : {

					Ok : function () {
						$(this).dialog("close");
					}
				}
			});
		});
	}
	//IMPORT===============================================
	document.getElementById("fileUpload").onchange = function () {
		$('#jpaste').val('');
		var file = this.files[0];
		var reader = new FileReader();
		if (file.type.match(/text.*/)) {
			reader.onload = function () {
				$('#jpaste').val(this.result);
			}
			reader.readAsText(file);
		} else {
			$("#importDialog p").text("File not supported! Ensure that the file contains cookie data in JSON format.");
			$("#importDialog").open;
		}
	};

	//previously used for input check before enabling button
	/*
	$("#passwordBoxImport").on("keyup", function () {
	var textbox_value = $("#passwordBoxImport").val();
	if (textbox_value != "") {
	$("#importEncrypt").attr("disabled", false);
	} else {
	$("#importEncrypt").attr("disabled", true);
	}
	});
	 */

	$('#importDialog').dialog({
		autoOpen : false,
		modal : true,
		buttons : {
			Ok : function () {
				$(this).dialog("close");
			}
		}
	});
	$("#submitImport").click(function () {
		if ($("#passwordBoxImport").val()) {
			toImport(true);
		} else {
			toImport(false);
		}
	});

	function toImport(toEncrypt) {
		try {
			var z = $('#jpaste').val();
			if (toEncrypt) {
				var passwordValue = document.getElementById("passwordBoxImport").value;
				z = CryptoJS.AES.decrypt(z, passwordValue).toString(CryptoJS.enc.Utf8);
				document.getElementById("passwordBoxImport").value = "";
			}
			myImport(z);
			$('#importDialog p').text('Cookies have been successfully imported.');
		} catch (err) {
			$('#importDialog p').text(err);
		}
		$('#importDialog').dialog("open");
		$('#jpaste').val('');
		$('#fileUpload').val('');
	}
	function myImport(z) {

		try {
			var arr = JSON.parse(z);
			var i;
			var impCookie = {};
			for (i = 0; i < arr.length; i++) {
				impCookie.name = arr[i].name;
				impCookie.domain = arr[i].domain;
				impCookie.value = arr[i].value;
				impCookie.expirationDate = arr[i].expirationDate;
				impCookie.secure = arr[i].secure;
				impCookie.httpOnly = arr[i].httpOnly;
				impCookie.path = arr[i].path;
				impCookie.storeId = arr[i].storeId;
				impCookie.url = arr[i].url;
				chrome.cookies.set(impCookie);
			}
		} catch (err) {
			throw "Import error: Format not recognized";
		}
	}
	$('#importProfile').click(function () {
		chrome.storage.sync.get('lastProfile', function (results) {
			if (results.lastProfile) {
				var lastProfileString = results.lastProfile;
				if (!chrome.extension.getBackgroundPage().isundefinednull(lastProfileString)) {
					try {
						myImport(lastProfileString);
						$('#importDialog p').text('Synced cookies have been successfully imported from Google Account.');
					} catch (err) {
						$('#importDialog p').text(err);
					}
				}
			} else {
				$('#importDialog p').text('Import unsuccessful, did you export to Google Account first?');
			}
			$('#importDialog').dialog("open");
		});
	});
	//EXPORT===============================================
	//http://stackoverflow.com/questions/18436245/how-to-fetch-url-of-current-tab-in-my-chrome-extention-using-javascript

	$("#exportClipboard").click(function () {
		toExport("clipboard");
	});
	$("#exportFile").click(function () {
		if ($("#passwordBoxExport").val()) {
			toExport("encrypted file");
		} else {
			toExport("file");
		}
	});

	$("#exportProfile").click(function () {
		toExport("Google Account");
	});

	//previously used for input check before enabling button
	/*
	$("#passwordBoxExport").on("keyup", function () {
	var textbox_value = $("#passwordBoxExport").val();
	if (textbox_value != "") {
	$("#exportEncrypt").attr("disabled", false);
	} else {
	$("#exportEncrypt").attr("disabled", true);
	}
	});
	 */

	$('#exportDialog').dialog({
		autoOpen : false,
		modal : true,
		buttons : {
			Ok : function () {
				$(this).dialog("close");
			}
		}
	});
	function getCopyText(cookieArray) {
		var text = '';
		text += '[' + '\n';
		for (var i = 0; i < cookieArray.length; i++) {
			try {
				var aText = '';
				var cookieUrl = 'http' + ((cookieArray[i].secure) ? 's' : '') + '://' + cookieArray[i].domain + cookieArray[i].path;
				aText += '{' + '\n';
				//text += '    "url": "' + filter.url + '", \n';
				aText += '    "url": "' + cookieUrl + '", \n';
				aText += '    "domain": "' + cookieArray[i].domain + '", \n';
				if (typeof cookieArray[i].expirationDate !== "undefined") {
					aText += '    "expirationDate": ' + cookieArray[i].expirationDate + ', \n';
				}
				aText += '    "hostOnly": ' + cookieArray[i].hostOnly + ', \n';
				aText += '    "httpOnly": ' + cookieArray[i].httpOnly + ', \n';
				aText += '    "name": "' + cookieArray[i].name + '", \n';
				aText += '    "path": "' + cookieArray[i].path + '", \n';
				aText += '    "sameSite": "' + cookieArray[i].sameSite + '", \n';
				aText += '    "secure": ' + cookieArray[i].secure + ', \n';
				aText += '    "session": ' + cookieArray[i].session + ', \n';
				aText += '    "storeId": "' + cookieArray[i].storeId + '", \n';
				aText += '    "value": "' + cookieArray[i].value + '", \n';
				aText += '    "id": ' + (i + 1) + ' \n';
				aText += '}';
			} catch (err) {
				continue;
			}
			text += aText + ',\n';
		}
		text = text.substring(0, text.length - 2) + '\n]';
		return text;
	}
	function toExport(option) {
		chrome.tabs.query({
			currentWindow : true,
			active : true
		}, function (tabs) {
			var exportFilter = tabs[0].url;
			var filter = {};
			filter.url = exportFilter;
			chrome.cookies.getAll(filter, function (cookieArray) {
				var text = getCopyText(cookieArray);
				try {
					if (option === "clipboard")
						toClipboard(text);
					else if (option === "file")
						toFile(text, 'downloadLink1', exportFilter);
					else if (option === "encrypted file")
						toFile(getEncrypted(text), 'downloadLink2', exportFilter);
					else if (option === "Google Account")
						toProfile(text);
					$("#exportDialog p").text("Cookies from " + cookieArray[0].domain + " successfully exported to " + option + ".");
				} catch (err) {
					$("#exportDialog p").text("Export Error");
				}
				$('#exportDialog').dialog("open");
			});
		});
	}
	function toClipboard(text) {
		var textArea = document.createElement("textarea");
		textArea.value = text;
		document.body.appendChild(textArea);
		textArea.select();
		try {
			var successful = document.execCommand('copy');
		} catch (err) {
			throw '';
		}
		document.body.removeChild(textArea);
	}
	function toFile(text, downloadElementName, url) {
		var textFile = null,
		makeTextFile = function (text2) {
			var data = new Blob([text2], {
					type : 'text/plain'
				});
			// If we are replacing a previously generated file we need to
			// manually revoke the object URL to avoid memory leaks.
			if (textFile !== null) {
				window.URL.revokeObjectURL(textFile);
			}
			textFile = window.URL.createObjectURL(data);
			return textFile;
		};
		if (downloadElementName === "downloadLink2") {
			$("#" + downloadElementName).attr("download", "[ENCRYPTED] " + url + " [ENCRYPTED].txt");
		} else {
			$("#" + downloadElementName).attr("download", url + ".txt");
		}
		var link = document.getElementById(downloadElementName);
		link.href = makeTextFile(text);
		link.style.display = 'block';
	}
	function getEncrypted(text) {
		var passwordValue = document.getElementById("passwordBoxExport").value;
		document.getElementById("passwordBoxExport").value = "";
		var encrypted = CryptoJS.AES.encrypt(text, passwordValue);
		return encrypted;
	}
	function toProfile(text) {
		chrome.storage.sync.set({
			'lastProfile' : text
		});
	}
	//CLEAR PROFILE+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	$('.clearProfile').click(function () {
		/*
		works var dialogElement = $("div[id*='Dialog']").attr('id');
		works var section = $(this).parent().parent().attr('id');
		x work if combined:
		var dialogElement = $(this).parent().parent().find("div[id*='Dialog']").attr('id');
		 */
		var section = $(this).parent().parent().parent().attr('id');
		var dialogElement = '#' + ((section === 'importCookie') ? 'importDialog' : 'exportDialog');
		try {
			chrome.storage.sync.remove('lastProfile');
			$(dialogElement + ' p').text('Synced cookies have been successfully cleared.');
		} catch (err) {
			$(dialogElement + ' p').text(err);
		}
		$(dialogElement).dialog("open");
	});
});
