'use strict';

var {app, BrowserWindow, Menu, shell, ipcMain} = require('electron');
var fs = require('fs');
var path = require('path');

var mainWindow = null;
var settingWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if(process.platform != 'win32') {
    app.quit();
  }
});

app.on('ready', () => {
  createApplicationMenu();
  openMainWindow();

  ipcMain.on('open-setting', () => {
    if(settingWindow == null){
      openSettingWindow();
    } else {
      settingWindow.focus();
    }
  });
});

var openMainWindow = () => {
  mainWindow = new BrowserWindow({frame: false ,resizable: false, backgroundColor: "#000", width: 1000, height: 700, show: false, webPreferences: {nodeIntegration: true, webSecurity: false}, icon:  path.join(__dirname, 'resource/icon/dango.png')});
  mainWindow.loadURL('file://' + __dirname + '/resource/main.html');
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
    // mainWindow.openDevTools();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    settingWindow = null;
    app.quit();
  });
};

var openSettingWindow = () => {
  settingWindow = new BrowserWindow({frame: false ,resizable: false, backgroundColor: "#000", width: 600, height: 250, show: true, webPreferences: {nodeIntegration: true, webSecurity: false}, icon:  path.join(__dirname, 'resource/icon/dango.png')});
  settingWindow.loadURL('file://' + __dirname + '/resource/setting.html');
  settingWindow.webContents.on('did-finish-load', () => {
  });

  settingWindow.on('closed', () => {
    settingWindow = null;
  });
};

var createApplicationMenu = () => {
  var menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Quit',
          accelerator: 'Ctrl+Q',
          click: () => {app.quit();}
        }
      ]
    }, {
      label: 'Help',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'Ctrl+R',
          click: function() {
            mainWindow.reload();
          }
        },
        {
          label: 'Dev Tools',
          accelerator: 'Ctrl+Shift+I',
          click: function() {
            mainWindow.openDevTools();
          }
        },
        {
          label: 'Dev Tools',
          accelerator: 'Ctrl+Shift+U',
          click: function() {
            if (settingWindow) {
              settingWindow.openDevTools();
            }
          }
        }
      ]
    }
  ];
  var menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
};