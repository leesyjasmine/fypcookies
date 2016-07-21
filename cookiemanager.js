$(function () {
	// JASMINE++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	//General http: //www.w3schools.com/js/js_cookies.asp
	//https://developer.chrome.com/extensions/cookies#method-get
	//https://developer.chrome.com/extensions/cookies
	//https://developer.chrome.com/extensions/webRequest
	//https://www.chromium.org/developers/design-documents/extensions/proposed-changes/apis-under-development/proposal-chrome-extensions-cookies-api

	//INITIALISATION*******************************************************
	$("#tabs").tabs();
	restoreSessionOptions();
	restoreTabOptions();
	//SAVE A SESSION OPTIONS************************************************
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
	//LAST REMOVE OPTIONS************************************************
	chrome.storage.local.get('lastRemove', function (results) {
		if (chrome.extension.getBackgroundPage().isundefinednull(results.lastRemove)) {
			$('#undoLastRemove').attr('disabled', true);
		}
	});
	//REMOVE====================================================
	$('.autoRemoveHelp').tooltip();
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
			$('#autoRemoveConfirm').dialog('open');
		}
	});
	$('#autoRemoveConfirm').dialog({
		autoOpen : false,
		resizable : false,
		height : 178,
		modal : true,
		buttons : {
			'YES' : function () {
				$(this).dialog("close");
				setOnSession();
			},
			'NO' : function () {
				$(this).dialog("close");
			}
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
				resetManualRemove('Archive Is Empty');
			} else {
				clearUndo();
				resetManualRemove('Archive Cleared Successfully');
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
			var x = a.domain;
			var y = b.domain;
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

	// MINGKAI++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

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
			cookieList.sort(function (a, b) {
				var nameA = a.domain.toUpperCase();
				var nameB = b.domain.toUpperCase();

				if (nameA < nameB) {
					return -1;
				}
				if (nameA > nameB) {
					return 1;
				}
			});

			//create accordion based on how many cookies were retrieved
			for (i = 0; i < cookieList.length; i++) {

				document.getElementById("myCounter").innerText = i;
				document.getElementById("myDomain").innerHTML = "Domain: <input type='text' class='compulsory' name='domain' value=" + cookieList[i].domain + " disabled></p>";
				document.getElementById("myPath").innerHTML = "Path: <input type='text' name='path' value=" + cookieList[i].path + " disabled></p>";
				document.getElementById("myName").innerHTML = "Name: <input type='text' class='compulsory' name='name' value=" + cookieList[i].name + " disabled></p>";
				document.getElementById("myValue").innerHTML = "Value: </br><textarea name='value' cols=55 rows=5>" + cookieList[i].value + "</textarea></p>";

				var expDate = new Date(cookieList[i].expirationDate * 1000);

				if (expDate == "Invalid Date") {
					document.getElementById("myExpiration").innerHTML =
						"<p>Expiration:" +
						"<fieldset id='modDateContainer" + i + "'>" +
						"<p>This is a session cookie.</p>" +
						"<p name='modDateDate'><input type='radio' name='lifetime2'>Date: <input type='text' class='datetimepicker' disabled/> <img src='calendaricon.png'></p>" +
						"<p name='modDateDay'><input type='radio' name='lifetime2'>Days: <input type='text' size='5' disabled/></p>" +
						"<p name='modDateSession'><input type='radio' name='lifetime2' checked>Session</p>" +
						"</fieldset>" +
						"</p>";
				} else {
					document.getElementById("myExpiration").innerHTML =
						"<p>Expiration:" +
						"<fieldset id='modDateContainer" + i + "'>" +
						"<p>Current expiration:</p>" +
						expDate +
						"<p name='modDateDate'><input type='radio' name='lifetime2'>Date: <input type='text' class='datetimepicker' disabled/> <img src='calendaricon.png'></p>" +
						"<p name='modDateDay'><input type='radio' name='lifetime2'>Days: <input type='text' size='5' disabled/></p>" +
						"<p name='modDateSession'><input type='radio' name='lifetime2' checked>Session</p>" +
						"</fieldset>" +
						"</p>";
				}

				var myPanel = document.getElementById("outerPanel");
				var element = $("<button id='button" + i + "' class = 'accordion'>" + cookieList[i].domain + " | " + cookieList[i].name + "</button>" + myPanel.innerHTML);

				$("#modifyCookie").append(element);
			}

			//Toggle between adding and removing the "active" and "show" classes when the user clicks on one of the "Section" buttons. The "active" class is used to add a background color to the current button when its belonging panel is open. The "show" class is used to open the specific accordion panel
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

	window.onload = getCurrentDomain;

	// ACE++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	//this is so that every file upload attempt is registered as a different one
	document.getElementById("fileUpload").onclick = function () {
		this.value = null;
	};

	document.getElementById("fileUpload").onchange = function () {

		document.getElementById("jpaste").innerHTML = "";

		var file = this.files[0];
		var reader = new FileReader();

		if (file.type.match(/text.*/)) {

			reader.onload = function () {
				// Entire file
				document.getElementById("jpaste").innerHTML = this.result;
			}
			reader.readAsText(file);
		} else {

			$("#importDialog p").text("File not supported! Ensure that the file contains cookie data in JSON format.");
			$("#importDialog").open;
		}
	};

	$("#submitImport").click(function () {

		try {
			var z = $('#jpaste').val();
			myImport(z);
			$('#importDialog p').text('Cookies have been successfully imported.');
		} catch (err) {
			$('#importDialog p').text(err);
		}
		$('#importDialog').dialog("open");
		//$('#jpaste').val('');
		document.getElementById("jpaste").innerHTML = "";
	});

	$("#importEncrypt").click(function () {

		try {
			var z = $('#jpaste').val();
			importEncrypted(z);
			$('#importDialog p').text('Cookies have been successfully imported.');
		} catch (err) {
			$('#importDialog p').text(err);
		}
		$('#importDialog').dialog("open");
		//$('#jpaste').val('');
		document.getElementById("jpaste").innerHTML = "";
		document.getElementById("passwordBoxImport").value = "";

	});

	$("#passwordBoxImport").on("keyup", function () {

		var textbox_value = $("#passwordBoxImport").val();

		if (textbox_value != "") {
			$("#importEncrypt").attr("disabled", false);
		} else {
			$("#importEncrypt").attr("disabled", true);
		}
	});

	$('#importDialog').dialog({

		autoOpen : false,
		modal : true,
		buttons : {

			Ok : function () {
				$(this).dialog("close");
			}
		}
	});

	function myImport(z) {

		//here goes parsing function

		try {
			var arr = JSON.parse(z);

			var i;

			var out = "<table>";

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
			out += "</table>";

		} catch (err) {
			throw "Import error: Format not recognized";
		}
	}

	function importEncrypted(z) {

		try {
			var passwordValue = document.getElementById("passwordBoxImport").value;
			var decrypted = CryptoJS.AES.decrypt(z, passwordValue).toString(CryptoJS.enc.Utf8);

			//displayStatus("#importstatus",x,y,z);

			//$("#importstatus").text(x+" "+y +" "+ z);

			//here goes parsing function

			var arr = JSON.parse(decrypted);

			var i;

			var out = "<table>";

			var impCookie = {};

			for (i = 0; i < arr.length; i++) {

				impCookie.name = arr[i].name;

				impCookie.domain = arr[i].domain;

				impCookie.value = arr[i].value;

				impCookie.expirationDate = arr[i].expirationDate;

				impCookie.secure = arr[i].secure;

				impCookie.httpOnly = arr[i].httpOnly;

				//impCookie.hostOnly = arr[1].hostOnly;

				//impCookie.session = arr[1].session; these two dont work

				impCookie.path = arr[i].path;

				impCookie.storeId = arr[i].storeId;

				impCookie.url = arr[i].url;

				chrome.cookies.set(impCookie);

			}

			out += "</table>";

		} catch (err) {
			throw "Import error: Format not recognized.";
		}
	}

	// GIAN+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	//http://stackoverflow.com/questions/18436245/how-to-fetch-url-of-current-tab-in-my-chrome-extention-using-javascript

	$("#exportClipboard").click(function () {
		toClipboard();
	});

	$("#exportFile").click(function () {

		toFile();
	});

	$("#exportEncrypt").click(function () {

		toEncrypt();
	});

	$("#passwordBoxExport").on("keyup", function () {

		var textbox_value = $("#passwordBoxExport").val();

		if (textbox_value != "") {
			$("#exportEncrypt").attr("disabled", false);
		} else {
			$("#exportEncrypt").attr("disabled", true);
		}
	});

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
			var cookieUrl = 'http' + ((cookieArray[i].secure) ? 's' : '') + '://' + cookieArray[i].domain + cookieArray[i].path;
			text += '{' + '\n';
			//text += '    "url": "' + filter.url + '", \n';
			text += '    "url": "' + cookieUrl + '", \n';
			text += '    "domain": "' + cookieArray[i].domain + '", \n';
			if (typeof cookieArray[i].expirationDate !== "undefined") {
				text += '    "expirationDate": ' + cookieArray[i].expirationDate + ', \n';
			}
			text += '    "hostOnly": ' + cookieArray[i].hostOnly + ', \n';
			text += '    "httpOnly": ' + cookieArray[i].httpOnly + ', \n';
			text += '    "name": "' + cookieArray[i].name + '", \n';
			text += '    "path": "' + cookieArray[i].path + '", \n';
			text += '    "sameSite": "' + cookieArray[i].sameSite + '", \n';
			text += '    "secure": ' + cookieArray[i].secure + ', \n';
			text += '    "session": ' + cookieArray[i].session + ', \n';
			text += '    "storeId": "' + cookieArray[i].storeId + '", \n';
			text += '    "value": "' + cookieArray[i].value + '", \n';
			text += '    "id": ' + (i + 1) + ' \n';
			text += '}';
			if (i + 1 < cookieArray.length) {
				text += ',';
			}
			text += '\n';
		}
		text += ']';
		return text;
	}

	function copyTextToClipboard(text) {

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

	function toClipboard() {

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
					copyTextToClipboard(text);
					$("#exportDialog p").text("Cookies from www" + cookieArray[0].domain + " have been successfully copied to the clipboard.");
				} catch (err) {
					$("#exportDialog p").text("Export error");
				}
				$('#exportDialog').dialog("open");
			});
		});
	}

	function toFile() {

		chrome.tabs.query({
			currentWindow : true,
			active : true
		}, function (tabs) {

			var exportFilter = tabs[0].url;

			var filter = {};

			filter.url = exportFilter;

			chrome.cookies.getAll(filter, function (cookieArray) {

				var text = getCopyText(cookieArray);

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

				$("#downloadLink1").attr("download", tabs[0].url + ".txt");
				var link = document.getElementById('downloadLink1');
				link.href = makeTextFile(text);
				link.style.display = 'block';
			});
		});
	}

	function toEncrypt() {

		chrome.tabs.query({
			currentWindow : true,
			active : true
		}, function (tabs) {

			var exportFilter = tabs[0].url;

			var filter = {};

			filter.url = exportFilter;

			chrome.cookies.getAll(filter, function (cookieArray) {

				var text = getCopyText(cookieArray);
				var passwordValue = document.getElementById("passwordBoxExport").value;
				document.getElementById("passwordBoxExport").value = "";
				var encrypted = CryptoJS.AES.encrypt(text, passwordValue);
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

				$("#downloadLink2").attr("download", tabs[0].url + "(encrypted).txt");
				var link = document.getElementById('downloadLink2');
				link.href = makeTextFile(encrypted);
				link.style.display = 'block';
			});
		});
	}
	// EXPORTIMPORTPROFILE+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	$('#exportProfile').click(function () {
		//export
		chrome.tabs.query({
			currentWindow : true,
			active : true
		}, function (tabs) {

			var exportFilter = tabs[0].url;
			var filter = {};
			filter.url = exportFilter;

			chrome.cookies.getAll(filter, function (cookieArray) {
				var lastProfileString = getCopyText(cookieArray);
				chrome.storage.sync.set({
					'lastProfile' : lastProfileString
				}, function () {
					$("#exportDialog p").text("Cookies have been successfully exported.");
					$('#exportDialog').dialog("open");
				});
			});
		});
	});

	$('#importProfile').click(function () { // restore last remove

		chrome.storage.sync.get('lastProfile', function (results) {
			if (results.lastProfile) {
				var lastProfileString = results.lastProfile;
				if (!chrome.extension.getBackgroundPage().isundefinednull(lastProfileString)) {
					//import
					try {
						myImport(lastProfileString);
						$('#importDialog p').text('Cookies have been successfully imported.');
					} catch (err) {
						$('#importDialog p').text(err);
					}
				}
			} else {
				$('#importDialog p').text('Unable to import from profile, did you export to profile first?');
			}
			$('#importDialog').dialog("open");
		});
	});

	$('#clearProfileI').click(function () {

		try {
			chrome.storage.sync.remove('lastProfile');
			$('#importDialog p').text('Synced cookies have been successfully cleared.');
		} catch (err) {
			$('#importDialog p').text(err);
		}
		$('#importDialog').dialog("open");
	});

	$('#clearProfileE').click(function () {

		try {
			chrome.storage.sync.remove('lastProfile');
			$('#exportDialog p').text('Synced cookies have been successfully cleared.');
		} catch (err) {
			$('#exportDialog p').text(err);
		}
		$('#exportDialog').dialog("open");
	});
});
