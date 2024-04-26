// @flow
import React, { useEffect, useState } from 'react'

import { useWalletConnectWallet } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { ROUTES } from '../../core/constants'
import Sidebar from './Sidebar'
import ModalRenderer from '../ModalRenderer'
import Notifications from '../Notifications'
import { upgradeUserWalletNEP6 } from '../../modules/generateWallet'

import styles from './App.scss'
import themes from '../../themes'
import ErrorBoundary from '../../components/ErrorBoundaries/Main'
import FramelessNavigation from '../../components/FramelessNavigation'
import { parseQuery } from '../../core/formatters'
import withSettingsContext from '../../hocs/withSettingsContext'
import { getInformationFromSession } from '../../util/walletConnect'

const ipc = require('electron').ipcRenderer

type Props = {
  children: React$Node,
  address: string,
  checkVersion: Function,
  showErrorNotification: Function,
  showInfoNotification: Function,
  location: Object,
  theme: string,
  store: any,
  history: any,
}

const routesWithSideBar = [
  ROUTES.DASHBOARD,
  ROUTES.TRANSACTION_HISTORY,
  ROUTES.RECEIVE,
  ROUTES.CONTACTS,
  ROUTES.SETTINGS,
  ROUTES.SEND,
  ROUTES.TOKEN_SALE,
  ROUTES.NEWS,
  ROUTES.MOBILE,
  ROUTES.MIGRATION,
  ROUTES.NFT,
]

const App = ({
  children,
  address,
  theme,
  location,
  checkVersion,
  showErrorNotification,
  store,
  history,
  showInfoNotification,
}: Props) => {
  const { requests, sessions, disconnect } = useWalletConnectWallet()
  const [decodedDeeplinkUri, setDecodedDeeplinkUri] = useState(null)

  useEffect(() => {
    async function handleUpgrade() {
      checkVersion()
      try {
        await upgradeUserWalletNEP6()
      } catch (error) {
        showErrorNotification({
          message: `Error upgrading legacy wallet: ${error.message}`,
        })
      }
    }
    handleUpgrade()
  }, [])

  useEffect(() => {
    const listener = async (_event, uri) => {
      await ipc.invoke('restore')
      setDecodedDeeplinkUri(uri)
    }

    ipc.on('link', listener)

    return () => {
      ipc.off('link', listener)
    }
  }, [])

  useEffect(() => {
    ipc.invoke('getInitialDeepLinkUri').then(setDecodedDeeplinkUri)
  }, [])

  useEffect(
    () => {
      if (!decodedDeeplinkUri) return

      if (!address) {
        showInfoNotification({
          message: 'Please login before connecting to a dApp.',
        })
        return
      }

      const { uri } = parseQuery(decodeURI(decodedDeeplinkUri))
      if (!uri) return

      history.push({
        pathname: ROUTES.CONNECT_DAPP,
        state: { uri },
      })
      setDecodedDeeplinkUri(null)
    },
    [address, decodedDeeplinkUri, history, showInfoNotification],
  )

  useEffect(
    () => {
      async function handle() {
        // It is necessary to wait for the request result page to be rendered
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (history.location.pathname === ROUTES.DAPP_REQUEST) {
          if (
            !requests.some(
              request => request.id === history.location?.state?.request.id,
            )
          ) {
            history.push(ROUTES.DASHBOARD)
          }
          return
        }

        const request = requests[0]
        if (!request) return

        const session = sessions.find(
          session => session.topic === request.topic,
        )
        if (!session) return

        ipc.invoke('restore')

        history.push({
          pathname: ROUTES.DAPP_REQUEST,
          state: { request, session },
        })
      }

      handle()
    },
    [requests, history, sessions],
  )

  useEffect(
    () => {
      if (!address || !sessions.length) return

      const [{ address: connectedAddress }] = getInformationFromSession(
        sessions[0],
      )

      if (connectedAddress !== address) {
        Promise.all(sessions.map(session => disconnect(session)))
      }
    },
    [address],
  )

  useEffect(() => {
    const listener = () => ipc.send('closed')

    ipc.on('quit', listener)

    return () => {
      ipc.off('quit', listener)
    }
  }, [])

  return (
    <ErrorBoundary>
      <div style={themes[theme]} className={styles.container}>
        <Notifications />
        {address &&
          routesWithSideBar.includes(location.pathname) && (
            <Sidebar store={store} theme={theme} className={styles.sidebar} />
          )}
        <div className={styles.wrapper}>
          <FramelessNavigation />
          <div className={styles.content}>{children}</div>

          <ModalRenderer />
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default withSettingsContext(App)
