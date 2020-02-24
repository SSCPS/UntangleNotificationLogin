// Refer to LICENSE file for appropriate usage.
'use strict';

function clearLog() {
  let dataDebugLog = new Date() + ': Log cleared.';
  chrome.storage.sync.set({'dataDebugLog': dataDebugLog}, function () {
    console.log('set dataDebugLog:  ' + dataDebugLog);
  });
  chrome.storage.sync.get(['dataDebugLog'], function(item) {
    console.log('retrieved dataDebugLog: ' + item.dataDebugLog);
    document.getElementById('showDataDebugLog').innerHTML = item.dataDebugLog;
  });
}

function refreshLog() {
  chrome.storage.sync.get(['dataDebugLog'], function(item) {
    console.log('retrieved dataDebugLog: ' + item.dataDebugLog);
    document.getElementById('showDataDebugLog').innerHTML = item.dataDebugLog;
  });
}

function internetCheck() {
  chrome.storage.sync.get(['captivePortalTestURL'], function(item) {
    console.log('retrieved captivePortalTestURL: ' + item.captivePortalTestURL);
    chrome.tabs.create({ url: item.captivePortalTestURL });
  });
}

function setAlarm(event) {
  // create alarm manually, will run 1 millisecond after create because using "when", okay to do if not cros
  chrome.storage.sync.get(['runEvery'], function(item) {
    chrome.browserAction.setBadgeText({text: 'RD'});
    chrome.alarms.create({when: Date.now() + 1, periodInMinutes: item.runEvery});
  });
  // if debug, log inside create alarm & first run
  chrome.storage.sync.get(['enableDebugLog'], function(item) {
    if (item.enableDebugLog) {
      chrome.storage.sync.get(['dataDebugLog'], function(item) {
        var valueToStore = item.dataDebugLog + '<br>' + new Date() + ': Created alarm via checkbox.'
        chrome.storage.sync.set({'dataDebugLog': valueToStore}, function () {
          console.log('set dataDebugLog:  ' + toString(valueToStore));
        });
      });
    }
  });
}

function clearAlarm() {
  chrome.browserAction.setBadgeText({text: 'OFF'});
  chrome.alarms.clearAll();
  // if debug, log clear alarme
  chrome.storage.sync.get(['enableDebugLog'], function(item) {
    if (item.enableDebugLog) {
      chrome.storage.sync.get(['dataDebugLog'], function(item) {
        var valueToStore = item.dataDebugLog + '<br>' + new Date() + ': Removed alarm via checkbox.'
        chrome.storage.sync.set({'dataDebugLog': valueToStore}, function () {
          console.log('set dataDebugLog:  ' + toString(valueToStore));
        });
      });
    }
  });
}

// do everything here
document.body.onload = function() {
  // retreive & display values
  chrome.storage.sync.get(['runEvery'], function(item) {
    console.log('retrieved runEvery: ' + item.runEvery);
    document.getElementById('showAlarmLengthParagraph').innerHTML = '<b>runEvery:</b> ' + item.runEvery + ' minutes.';
  });
  chrome.storage.sync.get(['userName'], function(item) {
    console.log('retrieved userName: ' + item.userName);
    document.getElementById('showUserNameParagraph').innerHTML = '<b>userName:</b> ' + item.userName + '.';
  });

  chrome.storage.sync.get(['hostName'], function(item) {
    console.log('retrieved hostName: ' + item.hostName);
    document.getElementById('showHostNameParagraph').innerHTML = '<b>hostName:</b> ' + item.hostName + '.';
  });
  chrome.storage.sync.get(['domainName'], function(item) {
    console.log('retrieved domainName: ' + item.domainName);
    document.getElementById('showDomainNameParagraph').innerHTML = '<b>domainName:</b> ' + item.domainName + '.';
  });

  chrome.storage.sync.get(['ipAddress'], function(item) {
    console.log('retrieved ipAddress: ' + item.ipAddress);
    document.getElementById('showIPAddressParagraph').innerHTML = '<b>ipAddress:</b> ' + item.ipAddress + '.';
  });
  chrome.storage.sync.get(['ipGateway'], function(item) {
    console.log('retrieved ipGateway: ' + item.ipGateway);
    document.getElementById('showIPGatewayParagraph').innerHTML = '<b>ipGateway:</b> ' + item.ipGateway + '.';
  });

  chrome.storage.sync.get(['autoLogin'], function(item) {
    console.log('retrieved autoLogin: ' + item.autoLogin);
    document.getElementById('checkboxAutoLogin').checked = item.autoLogin;
  });
  chrome.storage.sync.get(['showNotification'], function(item) {
    console.log('retrieved showNotification: ' + item.showNotification);
    document.getElementById('checkboxShowNotification').checked = item.showNotification;
  });
  chrome.storage.sync.get(['enableDebugLog'], function(item) {
    console.log('retrieved enableDebugLog: ' + item.enableDebugLog);
    document.getElementById('checkboxEnableDebugLog').checked = item.enableDebugLog;
  });
  chrome.storage.sync.get(['dataDebugLog'], function(item) {
    console.log('retrieved dataDebugLog: ' + item.dataDebugLog);
    document.getElementById('showDataDebugLog').innerHTML = item.dataDebugLog;
  });

  // autoLogin on/off
  document.getElementById('checkboxAutoLogin').addEventListener('change', function() {
    var checkboxAutoLogin = document.getElementById('checkboxAutoLogin');
    chrome.storage.sync.set({'autoLogin': checkboxAutoLogin.checked}, function () {
      console.log('set autoLogin:  ' + toString(checkboxAutoLogin.checked));
    });
    if (checkboxAutoLogin.checked) {
      setAlarm();
    } else {
      clearAlarm();
    };
  });

  // notification on/off, need to save because popup.html goes away & alarm can use it
  document.getElementById('checkboxShowNotification').addEventListener('change', function() {
    var checkboxShowNotification = document.getElementById('checkboxShowNotification');
    chrome.storage.sync.set({'showNotification': checkboxShowNotification.checked}, function () {
      console.log('set showNotification:  ' + toString(checkboxShowNotification.checked));
    });
  });

  // debug on/off, need to save because popup.html goes away & alarm can use it
  document.getElementById('checkboxEnableDebugLog').addEventListener('change', function() {
    var checkboxEnableDebugLog = document.getElementById('checkboxEnableDebugLog');
    chrome.storage.sync.set({'enableDebugLog': checkboxEnableDebugLog.checked}, function () {
      console.log('set enableDebugLog:  ' + toString(checkboxEnableDebugLog.checked));
    });
  });
}

document.getElementById('clearLog').addEventListener('click', clearLog);
document.getElementById('refreshLog').addEventListener('click', refreshLog);
document.getElementById('internetCheck').addEventListener('click', internetCheck);
