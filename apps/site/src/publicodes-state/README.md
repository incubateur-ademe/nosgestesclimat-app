# Publicodes State

This interval library contains context/providers and hooks to manage the publicodes user and form state for the Nos Gestes Climat webapp.

## Providers

- The [UserProvider](./userProvider/provider.ts) should encapsulate at the higher level the app code. It allows to call the `useUser` hook inside its children. It contains all the logic relative to instantiating and updating the user state.

- The [EngineProvider](./engineProvider/provider.ts) should be encapsulated inside the `UserProvider` (as it needs access to the simulations saved inside the user state, i.e.). It allows to call the `useEngine` hook inside its children. This provider:
  - creates the Publicodes engine
  - extract the categories and subcategories from the rules
  - loads the situation in the engine
  - handles computing the computedResults, as a permanent background task

- The [FormProvider](./formProvider/provider.ts) should be encapsulated inside the `EngineProvider`. This provider handles the form logic, most notably manages the questions (which is the current one, the remaining questions...). It allows its children to call the `useFormState`, which gives access to questions, setting the current question etc.

## Hooks

- [useUser](./useUser/useUser.ts)

- [useEngine](./useEngine/useEngine.ts)

- [useFormState](./useFormState/useFormState.ts)

- [useRule](./useRule/useRule.ts)

- [useActions](./useUser/useActions.ts)

- [useCurrentSimulation](./useCurrentSimulation/useCurrentSimulation.ts)

- [useDisposableEngine](./useDisposableEngine/useDisposableEngine.ts)

- [useTempEngine](./useTempEngine/useTempEngine.ts)
