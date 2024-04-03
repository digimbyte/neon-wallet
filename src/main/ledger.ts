import { BSAggregator } from '@cityofzion/blockchain-service'
import { BSEthereum } from '@cityofzion/bs-ethereum'
import { BSNeoLegacy } from '@cityofzion/bs-neo-legacy'
import { BSNeo3 } from '@cityofzion/bs-neo3'
import { ipcMain } from 'electron'

export function registerLedgerHandlers() {
  ipcMain.on('getBsAggregator', event => {
    event.returnValue = new BSAggregator<string>({
      neo3: new BSNeo3('neo3', { type: 'testnet' }),
      neoLegacy: new BSNeoLegacy('neoLegacy', { type: 'testnet' }),
      ethereum: new BSEthereum('ethereum', { type: 'testnet' }, import.meta.env.RENDERER_VITE_BITQUERY_API_KEY ?? ''),
    })
  })
}
