$(function () {
	// JASMINE++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	//General http: //www.w3schools.com/js/js_cookies.asp
	//https://developer.chrome.com/extensions/cookies#method-get
	//https://developer.chrome.com/extensions/cookies
	//https://developer.chrome.com/extensions/webRequest
	//https://www.chromium.org/developers/design-documents/extensions/proposed-changes/apis-under-development/proposal-chrome-extensions-cookies-api

	//INITIALISATION*******************************************************
	$("#tabs").tabs();
	$("#autoRemove").addClass('autoRemoveOff'); // remove //default
	restoreSessionOptions();
	//SAVE A SESSION OPTIONS************************************************
	function saveSessionOptions(option) {
		chrome.storage.sync.clear();
		chrome.storage.sync.set({
			'inSession' : option
		});
	}
	function restoreSessionOptions() { // only use in initialisation
		chrome.storage.sync.get('inSession', function (results) {
			if (!chrome.extension.getBackgroundPage().isundefinednull(results.inSession)) {
				if (results.inSession) {
					setAddSession();
				}
			}
		});
	}
	//REMOVE====================================================
	//AUTO REMOVE----------------------------------
	$('#autoRemoveButton').click(function () {
		//https: //bufferwall.com/petersirka/2015-03-12-tutorial-simple-html-toggle-button/
		resetManualRemove('');
		var status = $('#autoRemoveButton').text();
		if (status === 'ON') {
			setRemoveSession();
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
				saveSessionOptions(true);
				setAddSession();
			},
			'NO' : function () {
				$(this).dialog("close");
			}
		}
	});
	function setAddSession() {
		$('#autoRemoveButton').text('ON');
		$("#autoRemove").toggleClass('autoRemoveOn');
		setAllCookiesToSession();
		chrome.extension.getBackgroundPage().addSessionListener();
	}
	function setRemoveSession() {
		$('#autoRemoveButton').text('OFF');
		$("#autoRemove").toggleClass('autoRemoveOn');
		chrome.extension.getBackgroundPage().removeSessionListener();
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
		if ($('#chooseRemoveCookies option:selected').length > 0) {
			$('#chooseRemoveCookies option:selected').each(function () {
				var remCookie = {};
				remCookie.url = $(this).attr('data-description');
				remCookie.name = $(this).val();
				chrome.cookies.remove(remCookie);
			});
			resetManualRemove("Success Remove");
		}
	});
	$('#submitRemoveAll').click(function () {
		chrome.cookies.getAll({}, function (cookieArray) {
			if (cookieArray.length <= 0) {
				resetManualRemove("No Cookies Found");
			} else {
				for (var i = 0; i < cookieArray.length; i++) {
					var remCookie = chrome.extension.getBackgroundPage().copyAsRemoveCookie(cookieArray[i])
						chrome.cookies.remove(remCookie);
				}
				resetManualRemove("Success Remove");
			}
		});
	});
	function resetManualRemove(displayMsg) {
		$('#submitRemove').hide();
		$('#chooseRemoveCookiesBox').hide();
		displayStatus('#rStatus', displayMsg, '');
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
			var domainArray = [];
			for (var i = 0; i < cookieArray.length; i++) {
				domainArray.push(cookieArray[i].domain);
			}
			domainArray = jQuery.uniqueSort(domainArray);
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
	//TOOLTIPS================================================
	$('.tooltipElements').tooltip({
		position : {
			my : "center bottom-5",
			at : "right top"
		}
	});
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
				document.getElementById("myValue").innerHTML = "Value: </br><textarea name='value' cols=39 rows=5>" + cookieList[i].value + "</textarea></p>";
				document.getElementById("myExpiration").innerHTML =
					"<p>Expiration:" +
					"<fieldset id='modDateContainer" + i + "'>" +
					"<p name='modDateDate'><input type='radio' name='lifetime2'>Date: <input type='text' class='datetimepicker' disabled/></p>" +
					"<p name='modDateDay'><input type='radio' name='lifetime2'>Days: <input type='text' size='5' disabled/></p>" +
					"<p name='modDateSession'><input type='radio' name='lifetime2' checked>Session</p>" +
					"</fieldset>" +
					"</p>";

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

				chrome.cookies.set(modCookie);

				alert("Cookie has been successfully modified: " + modCookie.name);
				reset("#modifyCookie");

			});

			//DATE====================================================
			$.datetimepicker.setLocale('en');
			$('.datetimepicker').datetimepicker({
				minDate : 0
			});
		});
	}

	window.onload = getCurrentDomain;

	// ACE++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

	$("#submitImport").click(function () {

		myImport();

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

	function myImport() {

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

			//impCookie.url = arr[i].domain.replace(".","https://www.");

			/*if (arr[i].domain.substr(0,1) === "."){

			impCookie.url = "http://www" + arr[i].domain;

			}

			else if (arr[i].domain.substr(0,1) !== "."){

			impCookie.url = "http://www." + arr[i].domain;

			}*/

			impCookie.url = arr[i].url;

			chrome.extension.getBackgroundPage().console.log(impCookie.hostOnly);

			chrome.cookies.set(impCookie);

			//table output

			/*

			out += "<tr><td>" +

			arr[i].domain + "</td><td>" +

			arr[i].expirationDate + "</td><td>" +

			arr[i].name + "</td><td>" +

			arr[i].secure + "</td><td>" +

			arr[i].httpOnly + "</td><td>" +

			arr[i].session + "</td><td>" +

			impCookie.url + "</td><td>" +

			arr[i].path + "</td></tr>";*/

		}

		out += "</table>";

		//$("#importstatus").html(out);

		//alert("Cookies successfully imported.")

		$('#importDialog').dialog("open");

	}

	// GIAN+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

	$("#ExportClipboard").click(function () {

		//http://stackoverflow.com/questions/18436245/how-to-fetch-url-of-current-tab-in-my-chrome-extention-using-javascript

		exportClip();

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

	function exportClip() {

		chrome.tabs.query({
			currentWindow : true,
			active : true
		}, function (tabs) {

			var exportFilter = tabs[0].url;

			var filter = {};

			filter.url = exportFilter;

			chrome.cookies.getAll(filter, function (cookieArray) {

				var text = '';

				text += '[' + '\n';

				for (var i = 0; i < cookieArray.length; i++) {

					var cookieUrl = 'http' + ((cookieArray[i].secure) ? 's' : '') + '://' + cookieArray[i].domain;

					text += '{' + '\n';

					text += '    "url": "' + filter.url + '", \n';

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

				copyTextToClipboard(text);

				//alert("Cookies from "+filter.url+" has been exported to clipboard");

				$("#exportDialog").html("Cookies from " + cookieArray[0].domain + " successfully exported");

				$('#exportDialog').dialog("open");

			});

		});

	}

	function copyTextToClipboard(text) {

		var textArea = document.createElement("textarea");

		textArea.value = text;

		document.body.appendChild(textArea);

		textArea.select();

		try {

			var successful = document.execCommand('copy');

		} catch (err) {}

		document.body.removeChild(textArea);

	}

});
