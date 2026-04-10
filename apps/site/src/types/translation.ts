import type { TOptions } from 'i18next'
import type { JSX } from 'react'
import type { TransProps } from 'react-i18next'

export enum Lang {
  Default = 'Fr',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  Fr = 'Fr',
  En = 'En',
  // Commented until validation by a native speaker
  // It = 'It',
}

export interface LangInfos {
  name: string
  abrv: string
  abrvLocale: string
  uiTrad: Record<string, unknown> // The UI translation in YAML
}

export interface YamlEntry {
  entries: Record<string, string>
}

export type TranslationFunctionType = (key: string) => JSX.Element | string

export type TransPropsWithInterpolation = TransProps<
  string,
  string,
  TOptions,
  undefined,
  // NOTE(@EmileRolley): hack to be able to use string interpolation in Trans components.
  // However, TransProps<string> should be sufficient.
  Record<string, unknown>
>
