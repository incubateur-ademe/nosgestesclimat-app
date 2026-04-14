import { t } from 'i18next'

export enum OrganisationTypeEnum {
  association = 'association',
  company = 'company',
  cooperative = 'cooperative',
  groupOfFriends = 'groupOfFriends',
  other = 'other',
  publicOrRegionalAuthority = 'publicOrRegionalAuthority',
  universityOrSchool = 'universityOrSchool',
}

export const ORGANISATION_TYPES = {
  [OrganisationTypeEnum.company]: t('Entreprise'),
  [OrganisationTypeEnum.cooperative]: t('Coopérative'),
  [OrganisationTypeEnum.association]: t('Association'),
  [OrganisationTypeEnum.publicOrRegionalAuthority]: t('Service public'),
  [OrganisationTypeEnum.universityOrSchool]: t('Université ou école'),
  [OrganisationTypeEnum.groupOfFriends]: t("Groupe d'amis"),
  [OrganisationTypeEnum.other]: t('Autre'),
}
