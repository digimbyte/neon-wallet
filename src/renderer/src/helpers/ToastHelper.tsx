import { ErrorToast, InfoToast, PromiseToast, SuccessToast } from '@renderer/libs/sonner'
import { toast } from 'sonner'

import { UtilsHelper } from './UtilsHelper'

type TToastProp = {
  message: string
  id?: string | number
}

export class ToastHelper {
  static success(props: TToastProp) {
    const customId = props.id ?? UtilsHelper.uuid()
    toast.custom(sonnerId => <SuccessToast sonnerId={sonnerId} message={props.message} />, {
      id: customId,
      unstyled: true,
    })
  }

  static error(props: TToastProp) {
    const customId = props.id ?? UtilsHelper.uuid()
    toast.custom(sonnerId => <ErrorToast sonnerId={sonnerId} message={props.message} />, {
      id: customId,
      unstyled: true,
    })
  }

  static info(props: TToastProp) {
    const customId = props.id ?? UtilsHelper.uuid()
    toast.custom(sonnerId => <InfoToast sonnerId={sonnerId} message={props.message} />, {
      id: customId,
      unstyled: true,
    })
  }

  static async promise<T = any>(promise: Promise<T>, props: TToastProp) {
    const customId = props.id ?? UtilsHelper.uuid()
    toast.custom(sonnerId => <PromiseToast sonnerId={sonnerId} message={props.message} />, {
      id: customId,
      unstyled: true,
      duration: Infinity,
    })
    try {
      const result = await promise
      return result
    } finally {
      toast.dismiss(customId)
    }
  }
}