import type { Action } from '../../types/action.ts'
import {
  food,
  housing,
  misc,
  societalServices,
  transport,
} from '../themes/index.ts'

const buildSampleActions = (
  prefix: string,
  theme: Action['theme'],
  ids: [string, string, string, string, string]
): Action[] =>
  [1, 2, 3, 4, 5].map((index, i) => ({
    id: ids[i],
    language: 'fr',
    title: `${prefix} ${index}`,
    theme,
    ruleId: `${theme.key}.action_${index}`,
    longDescription: `Action exemple ${index} pour le thème ${theme.title}.`,
    means: `Étapes pratiques pour mettre en place ${prefix.toLowerCase()} ${index}.`,
    furtherReading: `Ressource complémentaire sur ${prefix.toLowerCase()} ${index}.`,
  }))

export const actions: Action[] = [
  ...buildSampleActions('Action alimentation', food, [
    '3472aeb0-8fdd-4b64-9784-7b357ca062f1',
    'a7d5b89f-f0de-4c18-97db-5427f98ab5ff',
    '66f52aa6-0636-4f54-a02f-6596efef4ad0',
    'd8f6cfef-8b3f-48d1-95ea-a823aa59de66',
    'd7e682fa-8f6c-4ff8-ae8b-2010a83d56b8',
  ]),
  ...buildSampleActions('Action transport', transport, [
    '2f923ea7-8f22-4e2e-a406-c5f6f7c1b356',
    '1fe4c4a2-a95f-4f52-83f5-dd34e7f0a80e',
    'd6ea1f26-38d1-4f8f-966f-d13ca33124f8',
    '2275d66d-97ec-4e60-a8f9-5faecf7d8e95',
    'f522d5f5-d28f-422e-8759-3e9ce6f7ecbf',
  ]),
  ...buildSampleActions('Action services sociétaux', societalServices, [
    '0f5f3150-e723-482e-9d9b-6190c9f4709a',
    '10e446fa-205f-443d-a0dc-0a8cc53f6fb4',
    'ad58f086-568a-4ff7-8603-66d6ac2c95dd',
    '6f2e6fb8-7f1a-4439-b94e-5a671f8f9a49',
    '8f6ed1a9-08e6-42f7-b3d4-2f4e23a0d45e',
  ]),
  ...buildSampleActions('Action logement', housing, [
    'f91dbd40-b66b-42fa-9377-f84cebe62e9c',
    'd22b8619-8f39-43f5-8f01-f27af4b9e6a0',
    'fb282178-a7f3-4f31-935c-a96798d16f9c',
    '782031f2-8665-415b-bf95-6734da6203d6',
    '8b7966f9-cb7a-4f35-a5ee-cbf95fdce4d7',
  ]),
  ...buildSampleActions('Action divers', misc, [
    '511ec095-d5a4-4d3f-9aac-74e17dc06ca7',
    '79d608d8-12da-4a87-bf72-f4b9eccf712a',
    'b34d1abf-6c8f-4cb2-b9e4-f4588d9332b2',
    '40544f34-623f-4f4a-a8fb-c6f6c66ac8cc',
    'bc43076f-8f15-4d84-bdbf-a0473d2eb20f',
  ]),
]
