export interface Parser<V, O> {
  deserializer: (value: V) => O;
  serializer: (value: O) => V;
}

export interface AbstractParserOptions<V> {
  plain: Parser<V, string>;
  number: Parser<V, number>;
  json: Parser<V, any>;
}

export const STRING_PARSER: AbstractParserOptions<string> = {
  plain: {
    serializer: (value) => value,
    deserializer: (value) => value,
  },
  number: {
    serializer: (value) => String(value),
    deserializer: (value) => Number(value),
  },
  json: {
    serializer: (value) => JSON.stringify(value),
    deserializer: (value) => JSON.parse(value),
  },
};
