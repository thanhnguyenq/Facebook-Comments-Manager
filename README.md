# Facebook Comments Manager
Manage commnent of specific post

This app is built with Electron, Bootstrap , Facebook API to get all comment from specific post URL with USER ACCESS TOKEN

## Supported URL
POST: 	`https://www.facebook.com/<PAGE_NAME | PAGE_ID>/posts/<POST_ID>`

PHOTO: `https://www.facebook.com/<PAGE_NAME | PAGE_ID>/photos/.../<POST_ID>/?type=3&theater`

VIDEO: `https://www.facebook.com/<PAGE_NAME | PAGE_ID>/videos/<POST_ID>/`

## How to get ACCESS TOKEN
Step 1: Go to https://developers.facebook.com/ and register account

Step 2: Go to https://developers.facebook.com/tools/explorer/ and copy a User Access Token to use in App
(this token only valid in a hour, to get 3 months valid token you need to create new Facebook App ,then in [this page](https://developers.facebook.com/tools/explorer/) at top right conner change `Graph API Explorer` to your new app => click icon "i" at token box then click `Open in Access Token Tool` and finally click `Extend Access Token` at the bottom)

Step 3: Go to Setting screen on App and change new token

## Screenshot

![Screen1](/screenshot/screenshot1.png?raw=true "Screen1")
***
![Screen2](/screenshot/screenshot2.png?raw=true "Screen2")
***
![Screen3](/screenshot/screenshot3.png?raw=true "Screen3")
***
![Screen4](/screenshot/screenshot4.png?raw=true "Screen4")
