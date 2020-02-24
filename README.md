# Untangle Notification Login

Untanlge supplies only a Windows (VB) script to login a user transparently in the background (at login).  This repo is for Mac OS as well as Chrome OS (chromebooks).  It determines and sends an appropriate URL to an Untangle server.  

# Mac OS Notes
There is a bit more "auto-magic" stuff then Untangle's Windows script:
* The IP to use for Untangle is assumed to be the gateway.  This can always be changed & hardcoded.
* The secretKey should replace <replace me>.
* Also, the script is expected to be a LaunchAgent script.  The script and sample plist are in paths for their respective locations.

# Chrome OS Notes
First important piece is that there is an assumption users can already log into the Chromebook.  Any related Google URLs will need to be unblocked; a separate rack for "Chromebook_Login" can be used.  

Second, the extension needs to be auto-installed on any relevant user.  It is expected to be from the Web Store.  

This extension also has some "auto-magic" stuff; which means some things are hardcoded.  There is a single alarm that does most of the heavy lifting.  The IP to use for Untangle is assumed to be the gateway; which is in turn determined by the IP address.  This means different IP schemes may require adjust to functions listed under what is hardcoded.

The following things are "hardcoded" and may need to be adjusted before adding the extension to the Web Store:
* Variable secretKey should be adjusted if Untangle's Directory Connector is configured to require a "Secret Key".
* The URL prefix (http | https) is hardcoded.  Both manifest.json and background.js need to be adjusted.
* It may be desirable to change the URL to check.  This is both manifest.json and background.js as well.
* IP ranges are hardcoded, examples ones might be per building.  Both manifest.json (listed IP URLs) and background.js (getLocalIPs(), chrome.alarms.onAlarm.addListener()) need to be adjusted.

## Trouble Shooting Tips
* After installation, the badge will say "IN"
* After alarm creation, the badge will say "UP"
* After alarm running, the badge will say "ON" (this is somewhat confusing, but means Untangle should be okay.)
* More information is appended to a "debug log".  This both "enableDebugLog" and "dataDebugLog" inside chrome.storage.[items]
* If OS is not CROS, there should be a debug message saying so.  
* If OS is not CROS, expect an error about requesting networking.config.  This is OK.
