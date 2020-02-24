#!/usr/bin/env bash
# Bash skips errors and resumes by default
# This script is based on the ad_login.vb script provided by untangle.com.

# Turn logging off (0) or on (1)
logging=0

#today's date and time
year=`date "+%Y"`       # 2016
month=`date "+%m"`      # 08
dayOfMonth=`date "+%d"` # 20
hour=`date "+%H"`       # 15 (24hr format)
minute=`date "+%M"`     # 45
date=$month/$dayOfMonth/$year
time=$hour:$minute

if [ ! -d /Users/$USER/logs ]; then
   mkdir -p /Users/$USER/logs
fi

logPath=/Users/$USER/logs/
logFile=$logPath'untangle_logon.log'

function sendToLog {
   message="$date $time: $1"
   logger -s $message
   echo $message >> $logFile
}

function getGateway {
   gateway=(`netstat -rn | grep "default" | awk '{print $2}'`)
   SERVERNAME="${gateway[0]}"
}

getGateway

# Check for valid gateway, wifi sometimes needs a moment
# loop every 5 seconds for 30 seconds or until valid gateway found
COUNTER=0
   while [ $COUNTER -lt 5 ]; do
      if [ $logging -eq 1 ]; then sendToLog "In while loop, counter:$COUNTER server:$SERVERNAME"; fi
      if [ $SERVERNAME ]; then
         break;
      else
         sleep 5
         getGateway
         let COUNTER=COUNTER+1
         if [ $logging -eq 1 ]; then sendToLog "After sleep, counter:$COUNTER server:$SERVERNAME"; fi
      fi
done

# log any previous user to system out of the Captive Portal
# Skip and exit if sscpslocal is user
if [ "${USER}" == "sscpslocal" ] || [ "${USER}" == "teacher" ] || [ "${USER}" == "student" ]; then
   exit 0;
fi

curl --location http://"${SERVERNAME}"/capture/logout

strUser=$USER
strDomain=AD
strHostname=$(hostname -s)

# This should "overwrite" any active Directory Connector credentials
URLCOMMAND="http://"${SERVERNAME}"/userapi/registration?username="${strUser}"&domain="${strDomain}"&hostname="${strHostname}"&action=login&secretKey=<replace me>"
curl -f -s -m 10 $URLCOMMAND

# Sometimes this curl command just doesn't stick.   Nothing wrong with script, it is an Untangle issue.
# Did the curl command work?
title=`curl --location "http://sscps.org" | grep "<title>"`
if [ "$title" == "<title>Untangle | Captive Portal</title>" ]; then
   # We didn't get through Captive Portal, try URLCOMMAND again
   if [ $logging -eq 1 ]; then sendToLog "<title> was from Captive Portal page, URLCOMMAND didn't take.   Running again."; fi
   curl -f -s -m 10 $URLCOMMAND
fi

if [ $logging -eq 1 ]; then sendToLog "Script executed. Gateway: $SERVERNAME"; fi
if [ $logging -eq 1 ]; then sendToLog $URLCOMMAND; fi
