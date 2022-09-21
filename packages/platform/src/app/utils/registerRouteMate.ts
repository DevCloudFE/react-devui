interface RouteMate {
  CLASS_ROUTE: string;
  CLASS_PREFIX: string;
}

export function registerRouteMate<N extends string>(mate: { NAME: N }): RouteMate {
  const { NAME } = mate;

  return {
    CLASS_ROUTE: `app-${NAME}-route`,
    CLASS_PREFIX: `app-${NAME}-route__`,
  };
}
