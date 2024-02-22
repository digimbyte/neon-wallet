import { Fragment, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdAdd, MdMoreVert } from 'react-icons/md'
import { TbEyePlus, TbFileImport, TbMenuDeep, TbPencil, TbPlug, TbRefresh, TbRepeat } from 'react-icons/tb'
import { EStatus } from '@cityofzion/wallet-connect-sdk-wallet-core'
import { useWalletConnectWallet } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { IAccountState, IWalletState } from '@renderer/@types/store'
import { AccountBalancePanel } from '@renderer/components/AccountData/AccountBalancePanel'
import { AccountDataPanel } from '@renderer/components/AccountData/AccountDataPanel'
import { AccountList } from '@renderer/components/AccountList'
import { ActionPopover } from '@renderer/components/ActionPopover'
import { Button } from '@renderer/components/Button'
import { IconButton } from '@renderer/components/IconButton'
import { PopOver } from '@renderer/components/PopOver'
import { Separator } from '@renderer/components/Separator'
import { WalletCard } from '@renderer/components/WalletCard'
import { WalletSelect } from '@renderer/components/WalletSelect'
import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useBalancesAndExchange } from '@renderer/hooks/useBalancesAndExchange'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useWalletsSelector } from '@renderer/hooks/useWalletSelector'
import { MainLayout } from '@renderer/layouts/Main'
import { accountReducerActions } from '@renderer/store/reducers/AccountReducer'

export const WalletsPage = () => {
  const { status } = useWalletConnectWallet()
  const { t } = useTranslation('pages', { keyPrefix: 'wallets' })
  const { t: commonActivity } = useTranslation('pages', { keyPrefix: 'activity' })
  const { wallets } = useWalletsSelector()
  const { accounts } = useAccountsSelector()
  const dispatch = useAppDispatch()
  const { modalNavigateWrapper } = useModalNavigate()

  const [selectedWallet, setSelectedWallet] = useState<IWalletState | undefined>(wallets[0])
  const [isReordering, setIsReordering] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<IAccountState | undefined>(undefined)

  const filteredAccounts = useMemo(() => {
    if (selectedAccount) {
      return [selectedAccount]
    }
    return accounts.filter(account => account.idWallet === selectedWallet?.id)
  }, [accounts, selectedAccount, selectedWallet?.id])

  const balanceExchange = useBalancesAndExchange(accounts)
  const balanceExchangeAccountData = useBalancesAndExchange(filteredAccounts)

  const handleReorderSave = (accountsOrder: string[]) => {
    dispatch(accountReducerActions.reorderAccounts(accountsOrder))
    setIsReordering(false)
  }

  const handleReorderCancel = () => {
    setIsReordering(false)
  }

  useEffect(() => {
    setSelectedWallet(prev => {
      if (prev) {
        const updatedWallet = wallets.find(wallet => wallet.id === prev.id)
        if (updatedWallet) {
          return updatedWallet
        }
      }

      return wallets[0]
    })
  }, [wallets])

  useEffect(() => {
    setSelectedAccount(undefined)
  }, [selectedWallet, accounts])

  return (
    <MainLayout
      heading={
        <div>
          <WalletSelect
            balanceExchange={balanceExchange}
            wallets={wallets}
            selected={selectedWallet}
            onSelect={setSelectedWallet}
            disabled={isReordering}
          />
        </div>
      }
      rightComponent={
        <div className="flex gap-x-2">
          <PopOver trigger={<IconButton icon={<TbMenuDeep />} size="md" text={t('manageButtonLabel')} />}>
            {wallets.map((wallet, index) => (
              <Fragment key={index}>
                {index !== 0 && <Separator />}

                <WalletCard
                  wallet={wallet}
                  noHover
                  balanceExchange={balanceExchange}
                  rightComponent={
                    <IconButton
                      icon={<TbPencil className={'stroke-neon w-5 h-5'} />}
                      className={'ml-2 self-center '}
                      onClick={modalNavigateWrapper('edit-wallet', { state: { wallet: wallet } })}
                    />
                  }
                  className="pr-1"
                />
              </Fragment>
            ))}
          </PopOver>
          <IconButton icon={<MdAdd />} size="md" text={t('newWalletButtonLabel')} disabled />
          <IconButton
            icon={<TbFileImport />}
            size="md"
            text={t('importButtonLabel')}
            onClick={modalNavigateWrapper('import')}
          />
          <IconButton
            icon={<TbEyePlus />}
            size="md"
            text={t('addWatchAccountButtonLabel')}
            onClick={modalNavigateWrapper('add-watch')}
          />
          <IconButton
            icon={<TbPlug />}
            size="md"
            text={t('dappConnectionButtonLabel')}
            onClick={modalNavigateWrapper('dapp-connection-list')}
            disabled={status !== EStatus.STARTED}
          />
          <IconButton icon={<TbRefresh />} size="md" text={t('buttonRefreshLabel')} disabled />
        </div>
      }
      contentClassName="flex-row gap-x-2.5"
    >
      {selectedWallet && (
        <section className="bg-gray-800 flex-grow rounded drop-shadow-lg max-w-[11.625rem] flex flex-col">
          <header className="flex justify-between pl-4 pr-2 py-3 items-center h-fit gap-x-1">
            <h2 className="text-sm truncate">{selectedWallet.name}</h2>

            <ActionPopover
              actions={[
                {
                  icon: <TbPencil />,
                  label: t('editWalletButtonLabel'),
                  onClick: modalNavigateWrapper('edit-wallet', { state: { wallet: selectedWallet } }),
                },
                {
                  icon: <TbRepeat />,
                  label: t('reorderAccountsButtonLabel'),
                  onClick: () => setIsReordering(true),
                },
              ]}
            >
              <IconButton compacted icon={<MdMoreVert />} size="md" disabled={isReordering} />
            </ActionPopover>
          </header>

          <main className="flex-grow">
            <Separator />
            <WalletCard
              onClick={() => setSelectedAccount(undefined)}
              wallet={selectedWallet}
              iconWithAccounts
              balanceExchange={balanceExchange}
              active={selectedAccount === undefined}
            />
            <AccountList
              selectedWallet={selectedWallet}
              balanceExchange={balanceExchange}
              isReordering={isReordering}
              onReorderCancel={handleReorderCancel}
              onReorderSave={handleReorderSave}
              onSelect={setSelectedAccount}
              selectedAccount={selectedAccount}
            />
          </main>

          <footer className="px-4 pb-6">
            {selectedAccount && (
              <Button
                label={t('editAccountButton')}
                variant="outlined"
                className="w-full pb-2"
                flat
                onClick={modalNavigateWrapper('edit-account', { state: { account: selectedAccount } })}
                leftIcon={<TbPencil />}
              />
            )}
            <Button
              label={t('addAccountButtonLabel')}
              variant="outlined"
              className="w-full"
              flat
              disabled
              leftIcon={<MdAdd />}
            />
          </footer>
        </section>
      )}
      <div className="flex-grow flex flex-col gap-y-5">
        <AccountBalancePanel balanceExchange={balanceExchangeAccountData} hideWalletAccountsLength />
        <div className="w-full bg-gray-800 rounded flex-grow overflow-scroll max-h-[20rem] p-4">
          <h1 className="text-white pb-4">{commonActivity('title')}</h1>
          <Separator />
          <AccountDataPanel balanceExchange={balanceExchangeAccountData} accounts={filteredAccounts} />
        </div>
      </div>
    </MainLayout>
  )
}
