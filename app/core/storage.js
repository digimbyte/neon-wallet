import { ipcRenderer } from 'electron'
import storage from 'electron-json-storage'
import promisify from 'es6-promisify'
import fs from 'fs/promises'

const get = promisify(storage.get, storage)
const set = promisify(storage.set, storage)

const ENCRYPTED_FILES_WHITELIST = ['address']

export const setStorage = async (key, value, encrypt = false) => {
  const path = await ipcRenderer?.invoke('getStoragePath')
  storage.setDataPath(path)
  const encryptedValue = await ipcRenderer.invoke(
    'safeStorageEncrypt',
    JSON.stringify(value),
  )
  await set(key, encrypt ? encryptedValue : value)
}

export const getStorage = async key => {
  const path = await ipcRenderer?.invoke('getStoragePath')
  storage.setDataPath(path)
  const value = await get(key)
  const encryptionIsWhitelisted = !!ENCRYPTED_FILES_WHITELIST.find(fileName =>
    key.toLowerCase().includes(fileName),
  )
  // If the file name being requested includes address
  // and is NOT encrypted, we encrypt the file.
  if (key && encryptionIsWhitelisted) {
    // if the value is a valid JS object it has not been encrypted
    if (typeof value === 'object') {
      await setStorage(key, value, true)
    }
  }
  // Only encrypted values get stored as strings
  if (typeof value === 'string' && encryptionIsWhitelisted) {
    const multiChainName = 'multi-chain-address-book'
    if (key === multiChainName) {
      const stats = await fs.stat(path + "/" + multiChainName + ".json");
      //There are some cases where an error occurs in decryption.
      //To prevent showing a message to the user without content, check the file size first.
      if (stats.size > 30) {
        const decryptedValue = await ipcRenderer?.invoke(
          'safeStorageDecrypt',
          value,
        )
        return JSON.parse(decryptedValue)
      }
      return {}
    }
    const decryptedValue = await ipcRenderer?.invoke(
      'safeStorageDecrypt',
      value,
    )
    return JSON.parse(decryptedValue)
  }

  return value
}
