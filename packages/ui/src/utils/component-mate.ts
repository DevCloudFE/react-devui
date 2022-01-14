const COMPONENT_MATES: Array<{ name: string }> = [];

const COMPONENT_NAME_REG = /^D[A-Z][a-zA-Z]+$/;

export function generateComponentMate(name: string) {
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
