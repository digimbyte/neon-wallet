import { useTranslation } from 'react-i18next'
import { MdOutlineLock, MdOutlineSave } from 'react-icons/md'
import { TbReload } from 'react-icons/tb'
import { useMatch } from 'react-router-dom'

import { SettingsSidebarLink } from './SettingsSidebarLink'

export const SettingsSecurityTabContent = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings' })
  const matchRootEncryptKey = useMatch('app/settings/security')

  return (
    <nav className="flex flex-row justify-between h-15 w-full mb-5 text-[14px]">
      <ul className="max-w-full w-full">
        <SettingsSidebarLink
          title={t('securityOption.encryptKey')}
          icon={<MdOutlineLock />}
          to="/app/settings/security/encrypt-key"
          match={!!matchRootEncryptKey}
        />
        <SettingsSidebarLink
          title={t('securityOption.recoverWallet')}
          icon={<TbReload />}
          to="/app/settings/security/recover-wallet"
        />
        <SettingsSidebarLink
          title={t('securityOption.backupWallet')}
          icon={<MdOutlineSave />}
          to="/app/settings/security/backup-wallet"
        />
      </ul>
    </nav>
  )
}
