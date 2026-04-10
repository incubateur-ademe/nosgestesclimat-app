import { IframeOptionsContext } from '@/app/[locale]/_components/mainLayoutProviders/IframeOptionsContext'
import { useContext } from 'react'

export const useIframe = () => useContext(IframeOptionsContext)
