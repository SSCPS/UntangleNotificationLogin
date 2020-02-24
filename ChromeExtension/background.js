// Refer to LICENSE file for appropriate usage.
'use strict';

// this gets the IPs on the device, filters out non-local IPs and logs stuff if logging enabled
function getLocalIPs(callback) {
  var ips = [];

  var RTCPeerConnection = window.RTCPeerConnection ||
    window.webkitRTCPeerConnection || window.mozRTCPeerConnection;

  var pc = new RTCPeerConnection({
    // Don't specify any stun/turn servers, otherwise you will
    // also find your public IP addresses.
      iceServers: []
  });

  // Add a media line, this is needed to activate candidate gathering.
  pc.createDataChannel('');

  // onicecandidate is triggered whenever a candidate has been found.
  pc.onicecandidate = function(e) {
    if (!e.candidate) { // Candidate gathering completed.
      pc.close();
      callback(ips);
      return;
    }

    var ip = /^candidate:.+ (\S+) \d+ typ/.exec(e.candidate.candidate)[1];

    // test if valid IP
    if ((ip.substring(0,5) === "10.1.") || (ip.substring(0,5) === "10.2.") || (ip.substring(0,5) === "10.3.")) {
      // log added IP
      chrome.storage.sync.get(['enableDebugLog'], function(item) {
        if (item.enableDebugLog) {
          chrome.storage.sync.get(['dataDebugLog'], function(item) {
            var valueToStore = item.dataDebugLog + '<br>' + new Date() + ': Portion is: (' + ip.substring(0,4) + '), added IP: ' + ip + '.';
            chrome.storage.sync.set({'dataDebugLog': valueToStore}, function () {
              console.log('set dataDebugLog:  ' + toString(valueToStore));
            });
          });
        }
      });
      // push IP to array
      ips.push(ip);
    } else {
      // log ignored IP
      chrome.storage.sync.get(['enableDebugLog'], function(item) {
        if (item.enableDebugLog) {
          chrome.storage.sync.get(['dataDebugLog'], function(item) {
            var valueToStore = item.dataDebugLog + '<br>' + new Date() + ': Portion is: (' + ip.substring(0,4) + '), ignored IP: ' + ip + '.';
            chrome.storage.sync.set({'dataDebugLog': valueToStore}, function () {
              console.log('set dataDebugLog:  ' + toString(valueToStore));
            });
          });
        }
      });
    }
  };

  pc.createOffer(function(sdp) {
    pc.setLocalDescription(sdp);
  }, function onerror() {});
}


// if autologin is checked (by default it is), then alarm is created, and most everything (besides setup) is done in the alarm
chrome.alarms.onAlarm.addListener(function() {
  // change badge, mostly for testing purposes when no notification
  chrome.browserAction.setBadgeText({text: 'ON'});
  // if debug, log that alarm ran
  chrome.storage.sync.get(['enableDebugLog'], function(item) {
    if (item.enableDebugLog) {
      chrome.storage.sync.get(['dataDebugLog'], function(item) {
        var valueToStore = item.dataDebugLog + '<br>' + new Date() + ': Alarm ran.'
        chrome.storage.sync.set({'dataDebugLog': valueToStore}, function () {
          console.log('set dataDebugLog:  ' + toString(valueToStore));
        });
      });
    }
  });
  // display notification, mostly for testing purposes
  chrome.storage.sync.get(['showNotification'], function(item) {
    console.log('retrieved showNotification: ' + item.showNotification);
    if (item.showNotification) {
      var currentDateTime = new Date();
      chrome.notifications.create({
          type:     'basic',
          iconUrl:  'icon128.png',
          title:    'Untangle Alarm',
          message:  currentDateTime + '  Alarm ran! Click OK to change extension badge text.',
          buttons: [
            {title: 'OK!'}
          ],
          priority: 0});
    };
  });
  // get IP information
  var arrayLocalIPs = [];
  arrayLocalIPs = getLocalIPs(function(ips) { // <!-- ips is an array of local IP addresses. -->
    // check if valid array of IPs
    if (Array.isArray(ips) && ips.length) {
      var strIPAddress = ips[0];
      // determine ipGateway
      var numLocationFirstDot = strIPAddress.indexOf(".",0);
      var numFirstOctet = strIPAddress.substring(0,numLocationFirstDot);
      var numLocationSecondDot = strIPAddress.indexOf(".",numLocationFirstDot+1);
      var numSecondOctet = strIPAddress.substring(numLocationFirstDot+1,numLocationSecondDot);
      var numLocationThirdDot = strIPAddress.indexOf(".",numLocationSecondDot+1);
      var numThirdOctet = strIPAddress.substring(numLocationSecondDot+1,numLocationThirdDot);
      var numFourthOctet = strIPAddress.substring(numLocationThirdDot+1);
      var strGateway = numFirstOctet + '.' + numSecondOctet + '.0.1';
      // store ipAddress & ip Gateway
      chrome.storage.sync.set({'ipAddress': strIPAddress}, function () {
        console.log('set ipAddress:  ' + strIPAddress);
      });
      chrome.storage.sync.set({'ipGateway': strGateway}, function () {
        console.log('set ipGateway:  ' + toString(strGateway));
      });
      chrome.storage.sync.get(['enableDebugLog'], function(item) {
        if (item.enableDebugLog) {
          chrome.storage.sync.get(['dataDebugLog'], function(item) {
            var valueToStore = item.dataDebugLog + '<br>' + new Date() + ': First IP of cleaned array:' + strIPAddress;
            chrome.storage.sync.set({'dataDebugLog': valueToStore}, function () {
              console.log('set dataDebugLog:  ' + toString(valueToStore));
            });
          });
        }
      });
      // need to get all data in order to avoid async issues: userName, hostName, domainName, secretKey
      chrome.storage.sync.get(['userName', 'hostName', 'domainName', 'secretKey'], function(item) {
        var userName = item.userName;
        var hostName = item.hostName;
        var domainName = item.domainName;
        var secretKey = item.secretKey;
        var strGetURL = 'http://' + strGateway + '/userapi/registration?action=login&clientIP=' + strIPAddress + '&username=' + userName + '&domain=' + domainName;
        if (secretKey != 'NOKEY') {
          strGetURL = strGetURL + '&secretKey=' + secretKey;
        }
        var xhr = new XMLHttpRequest();
        xhr.open("GET", strGetURL, true);
        xhr.send();
        // if debug, log that URL was sent
        chrome.storage.sync.get(['enableDebugLog'], function(item) {
          if (item.enableDebugLog) {
            chrome.storage.sync.get(['dataDebugLog'], function(item) {
              var valueToStore = item.dataDebugLog + '<br>' + new Date() + ': URL Sent: ' + 'userName: ' + userName + ', strIPAddress: ' + strIPAddress + ', strGateway: ' + strGateway + '.';
              chrome.storage.sync.set({'dataDebugLog': valueToStore}, function () {
                console.log('set dataDebugLog:  ' + toString(valueToStore));
              });
            });
          }
        });
      });

    } else {
      chrome.storage.sync.get(['enableDebugLog'], function(item) {
        if (item.enableDebugLog) {
          chrome.storage.sync.get(['dataDebugLog'], function(item) {
            var valueToStore = item.dataDebugLog + '<br>' + new Date() + ': URL Not Sent: No valid array of cleaned IPs. ';
            chrome.storage.sync.set({'dataDebugLog': valueToStore}, function () {
              console.log('set dataDebugLog:  ' + toString(valueToStore));
            });
          });
        }
      });
    }
  });
});

chrome.notifications.onButtonClicked.addListener(function() {
  chrome.storage.sync.get(['runEvery'], function(item) {
    chrome.browserAction.setBadgeText({text: 'OK'});
    chrome.alarms.create({delayInMinutes: item.runEvery});
  });
});

// most of the good stuff happens in here
chrome.runtime.onInstalled.addListener(function() {
  chrome.browserAction.setBadgeText({text: 'IN'});
  // setup some variables that might change and used below
  var runEvery = parseFloat('2');
  var hostName = 'statichostname';
  var domainName = 'AD';
  var ipAddress = 'ipAddress Init';
  var ipGateway = 'ipGatewat Init';
  var secretKey = 'NOKEY';
  var captivePortalTestURL = 'http://en.wikipedia.org/wiki/Captive_portal'
  var autoLogin = true;
  var showNotification = false;
  // logging stuff, make sure false before loading to webstore
  var enableDebugLog = false;
  var dataDebugLog = new Date() + ': Extension Installed.';

  console.log("Installed.");

  // keep data across page changes.
  localStorage.counter = 1;

  // set & store internal variables
  chrome.storage.sync.set({'runEvery': runEvery}, function () {
    console.log('set runEvery:  ' + toString(runEvery));
  });
  chrome.identity.getProfileUserInfo(function(userInfo) {
    var userName = userInfo.email;
    var numLocationAt = userName.indexOf("@",0);
    userName = userName.substring(0,numLocationAt);
    chrome.storage.sync.set({'userName': userName}, function () {
      console.log('set userName:  ' + userName);
    });
  });
  chrome.storage.sync.set({'hostName': hostName}, function () {
    console.log('set hostName:  ' + toString(hostName));
  });
  chrome.storage.sync.set({'domainName': domainName}, function () {
    console.log('set domainName:  ' + toString(domainName));
  });
  chrome.storage.sync.set({'ipAddress': ipAddress}, function () {
    console.log('set ipAddress:  ' + toString(ipAddress));
  });
  chrome.storage.sync.set({'ipGateway': ipGateway}, function () {
    console.log('set ipGateway:  ' + toString(ipGateway));
  });
  chrome.storage.sync.set({'secretKey': secretKey}, function () {
    console.log('set secretKey:  ' + toString(secretKey));
  });
  chrome.storage.sync.set({'captivePortalTestURL': captivePortalTestURL}, function () {
    console.log('set captivePortalTestURL:  ' + toString(captivePortalTestURL));
  });
  chrome.storage.sync.set({'autoLogin': autoLogin}, function () {
    console.log('set autoLogin:  ' + toString(autoLogin));
  });
  chrome.storage.sync.set({'showNotification': showNotification}, function () {
    console.log('set showNotification:  ' + toString(showNotification));
  });
  chrome.storage.sync.set({'enableDebugLog': enableDebugLog}, function () {
    console.log('set enableDebugLog:  ' + toString(enableDebugLog));
  });
  chrome.storage.sync.set({'dataDebugLog': dataDebugLog}, function () {
    console.log('set dataDebugLog:  ' + dataDebugLog);
  });


  // check OS, to set alarm, get hostname
  chrome.runtime.getPlatformInfo(function(platformInfo) {
    var strHostOS = platformInfo.os;
    // proceed only if ChromeOS, can manually with autologin checkbox
    if (strHostOS == "cros") {
      // get hostname, if possible, need to test by pushing it out, grrrr.....
      //chrome.enterprise.deviceAttributes.getDeviceAssetId(assetId => {
      //  if (assetId != '') {
      //    hostName = assetId;
      //  }
      //  chrome.storage.sync.set({'hostName': hostName}, function () {
      //    console.log('set hostName:  ' + hostName);
      //  });
      //});
      // create alarm, will run 1 millisecond after create because using "when"
      chrome.storage.sync.get(['runEvery'], function(item) {
        chrome.browserAction.setBadgeText({text: 'UP'});
        chrome.alarms.create({when: Date.now() + 1, periodInMinutes: item.runEvery});
      });
      // if debug, log inside create alarm & first run
      chrome.storage.sync.get(['enableDebugLog'], function(item) {
        if (item.enableDebugLog) {
          chrome.storage.sync.get(['dataDebugLog'], function(item) {
            var valueToStore = item.dataDebugLog + '<br>' + new Date() + ': Created alarm via onInstalled.'
            chrome.storage.sync.set({'dataDebugLog': valueToStore}, function () {
              console.log('set dataDebugLog:  ' + toString(valueToStore));
            });
          });
        }
      });
    } else {
      chrome.browserAction.setBadgeText({text: 'OFF'});
      autoLogin = false;
      chrome.storage.sync.set({'autoLogin': autoLogin}, function () {
        console.log('set autoLogin:  ' + toString(autoLogin));
      });
      chrome.storage.sync.get(['dataDebugLog'], function(item) {
        var valueToStore = item.dataDebugLog + '<br>' + new Date() + ': Not ChromeOS; nothing to do.'
        chrome.storage.sync.set({'dataDebugLog': valueToStore}, function () {
          console.log('set dataDebugLog:  ' + toString(valueToStore));
        });
      });
    }
  });
});
