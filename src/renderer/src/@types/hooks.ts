import { TransactionTransferAsset } from '@cityofzion/blockchain-service'

import { IAccountState } from './store'

export type TUseActionsData = Record<string, any>

export type TUseActionsErrors<T> = Record<keyof T, string | undefined>

export type TUseActionsChanged<T> = Record<keyof T, boolean>

export type TUseActionsActionState<T> = {
  isValid: boolean
  isActing: boolean
  errors: TUseActionsErrors<T>
  changed: TUseActionsChanged<T>
  hasActed: boolean
}
export type TUseActionsKeysMatching<T, V> = { [K in keyof T]: T[K] extends V ? K : never }[keyof T]

export type TUseImportActionInputType = 'key' | 'mnemonic' | 'encrypted' | 'address'

export type TUseTransactionsTransfer = {
  time: number
  hash: string
  account: IAccountState
  toAccount?: IAccountState
  fromAccount?: IAccountState
  isPending?: boolean
} & TransactionTransferAsset

export type TFetchTransactionsResponse = {
  transfers: TUseTransactionsTransfer[]
  hasMore: boolean
  page: number
}