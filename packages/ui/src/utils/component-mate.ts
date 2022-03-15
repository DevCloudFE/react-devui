interface ComponentMate<N extends string> {
  COMPONENT_NAME: N;
}

const COMPONENT_NAME_REG = /^D[A-Z][a-zA-Z]+$/;

export const COMPONENT_MATES: ComponentMate<string>[] = [];

export function registerComponentMate<N extends string>(mate: ComponentMate<N>): ComponentMate<N> {
  const { COMPONENT_NAME } = mate;

  for (const _mate of COMPONENT_MATES) {
    if (_mate.COMPONENT_NAME === COMPONENT_NAME) {
      throw new Error(`'${COMPONENT_NAME}' already exists`);
    }
  }

  if (COMPONENT_NAME_REG.test(COMPONENT_NAME)) {
    COMPONENT_MATES.push(mate);
  } else {
    throw new Error(`'${COMPONENT_NAME}' not a correct component name`);
  }

  return mate;
}
