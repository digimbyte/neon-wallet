import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'

import icon from '../../resources/icon.png?asset'

import { registerEncryptionHandlers } from './encryption'
import { registerLedgerHandlers } from './ledger'
import { setupSentry } from './sentryElectron'
import { registerWindowHandlers } from './window'

setupSentry()

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 1280,
    minHeight: 720,
    show: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
    autoHideMenuBar: true,
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler(details => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.webContents.session.on('select-hid-device', (event, details, callback) => {
    // Add events to handle devices being added or removed before the callback on
    // `select-hid-device` is called.
    mainWindow.webContents.session.on('hid-device-added', (event, device) => {
      console.log('hid-device-added FIRED WITH', device)
      // Optionally update details.deviceList
    })

    mainWindow.webContents.session.on('hid-device-removed', (event, device) => {
      console.log('hid-device-removed FIRED WITH', device)
      // Optionally update details.deviceList
    })

    event.preventDefault()
    if (details.deviceList && details.deviceList.length > 0) {
      callback(details.deviceList[0].deviceId)
    }
  })

  mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
    if (permission === 'hid' && details.securityOrigin === 'file:///') {
      return true
    }
  })

  mainWindow.webContents.session.setDevicePermissionHandler(details => {
    if (details.deviceType === 'hid' && details.origin === 'file://') {
      return true
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

registerWindowHandlers()
registerEncryptionHandlers()
registerLedgerHandlers()
