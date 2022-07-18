interface ComponentMate<N extends string> {
  COMPONENT_NAME: N;
}

const COMPONENT_NAME_REG = /^D[A-Z][a-zA-Z]+$/;

export function registerComponentMate<N extends string>(mate: ComponentMate<N>): ComponentMate<N> {
  const { COMPONENT_NAME } = mate;

  if (!COMPONENT_NAME_REG.test(COMPONENT_NAME)) {
    throw new Error(`'${COMPONENT_NAME}' not a correct component name`);
  }

  return mate;
}
