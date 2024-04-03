import { Fragment, useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useWalletConnectWallet } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { RootState } from '@renderer/@types/store'
import { TestnetBanner } from '@renderer/components/TestnetBanner'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useAppDispatch, useAppSelector } from '@renderer/hooks/useRedux'
import { useEncryptedPasswordSelector } from '@renderer/hooks/useSettingsSelector'
import { accountReducerActions } from '@renderer/store/reducers/AccountReducer'

export const AppPage = () => {
  const dispatch = useAppDispatch()
  const { sessions, requests } = useWalletConnectWallet()
  const { modalNavigate } = useModalNavigate()
  const { value: securityType } = useAppSelector((state: RootState) => state.settings.securityType)
  const { encryptedPassword } = useEncryptedPasswordSelector()
  const location = useLocation()

  useEffect(() => {
    if (requests.length <= 0) return
    const request = requests[0]

    const session = sessions.find(session => session.topic === request.topic)
    if (!session) return

    window.api.restoreWindow()
    modalNavigate('dapp-permission', { state: { session, request } })
  }, [requests, sessions, modalNavigate])

  useEffect(() => {
    dispatch(accountReducerActions.removeAllPendingTransactions())
  }, [dispatch])

  if (securityType !== 'password' || !encryptedPassword) {
    return <Navigate to={'/login'} state={{ from: location.pathname }} />
  }

  return (
    <Fragment>
      <TestnetBanner />
      <Outlet />
    </Fragment>
  )
}
