const COMPONENT_MATES: { name: string }[] = [];

const COMPONENT_NAME_REG = /^D[A-Z][a-zA-Z]+$/;

export function generateComponentMate<N extends string>(name: N) {
  if (COMPONENT_MATES.findIndex((mate) => mate.name === name) !== -1) {
    throw new Error(`'${name}' already exists`);
  } else {
    if (COMPONENT_NAME_REG.test(name)) {
      COMPONENT_MATES.push({ name });
    } else {
      throw new Error(`'${name}' not a correct component name`);
    }
  }

  return { COMPONENT_NAME: name };
}
