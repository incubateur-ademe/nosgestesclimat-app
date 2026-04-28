export const defaultUserSelection = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
}

export const defaultVerifiedUserSelection = {
  id: true,
  name: true,
  email: true,
  position: true,
  telephone: true,
  optedInForCommunications: true,
  createdAt: true,
  updatedAt: true,
}

export const defaultGroupParticipantSelection = {
  id: true,
  userId: true,
  user: {
    select: defaultUserSelection,
  },
  simulationId: true,
  createdAt: true,
  updatedAt: true,
}

export const defaultGroupSelectionWithoutParticipants = {
  id: true,
  name: true,
  emoji: true,
  administrator: {
    select: {
      user: {
        select: defaultUserSelection,
      },
    },
  },
  updatedAt: true,
  createdAt: true,
}

export const defaultGroupSelection = {
  ...defaultGroupSelectionWithoutParticipants,
  participants: {
    select: defaultGroupParticipantSelection,
  },
}

export const defaultGroupParticipantSimulationSelection = {
  id: true,
  date: true,
  situation: true,
  foldedSteps: true,
  progression: true,
  actionChoices: true,
  computedResults: true,
  additionalQuestionsAnswers: {
    select: {
      key: true,
      answer: true,
      type: true,
    },
  },
  polls: {
    select: {
      pollId: true,
      poll: {
        select: {
          slug: true,
        },
      },
    },
  },
  createdAt: true,
  updatedAt: true,
}

export const defaultOrganisationSelectionWithoutPolls = {
  id: true,
  name: true,
  slug: true,
  type: true,
  numberOfCollaborators: true,
  administrators: {
    select: {
      id: true,
      user: {
        select: defaultVerifiedUserSelection,
      },
    },
  },
  createdAt: true,
  updatedAt: true,
}

export const defaultOrganisationSelection = {
  ...defaultOrganisationSelectionWithoutPolls,
  polls: {
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
    },
  },
}

export const defaultPollSelection = {
  id: true,
  name: true,
  slug: true,
  organisationId: true,
  funFacts: true,
  computedResults: true,
  defaultAdditionalQuestions: true,
  customAdditionalQuestions: true,
  expectedNumberOfParticipants: true,
  computeRealTimeStats: true,
  createdAt: true,
  updatedAt: true,
}

export const defaultSimulationSelection = {
  id: true,
  date: true,
  model: true,
  situation: true,
  foldedSteps: true,
  progression: true,
  actionChoices: true,
  computedResults: true,
  additionalQuestionsAnswers: {
    select: {
      key: true,
      answer: true,
      type: true,
    },
  },
  createdAt: true,
  updatedAt: true,
}

export const simulationSelectionWithPolls = {
  ...defaultSimulationSelection,
  user: {
    select: {
      name: true,
    },
  },
  polls: {
    select: {
      pollId: true,
      poll: {
        select: {
          slug: true,
        },
      },
    },
  },
}

export const simulationSelectionWithGroup = {
  ...defaultSimulationSelection,
  groups: {
    select: {
      groupId: true,
    },
  },
}

export const simulationSelectionWithUsers = {
  ...defaultSimulationSelection,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  verifiedUser: {
    select: defaultVerifiedUserSelection,
  },
}

export const defaultSimulationSelectionWithoutPollAndSituation = {
  ...simulationSelectionWithUsers,
  situation: false,
  foldedSteps: false,
  actionChoices: false,
}

export const simulationSelection = {
  ...defaultSimulationSelection,
  polls: simulationSelectionWithPolls.polls,
  user: simulationSelectionWithUsers.user,
  verifiedUser: simulationSelectionWithUsers.verifiedUser,
  groups: simulationSelectionWithGroup.groups,
}

export const defaultEmailWhitelistSelection = {
  id: true,
  emailPattern: true,
  description: true,
  apiScopeName: true,
  createdAt: true,
  updatedAt: true,
}

export const defaultJobSelection = {
  id: true,
  status: true,
  params: true,
  result: true,
  createdAt: true,
  updatedAt: true,
}
