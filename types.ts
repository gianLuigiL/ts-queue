export type Resolvers = Record<string, (arg: any) => any>;

export type Jobs<T extends Resolvers> = {
  [Name in keyof T]: Parameters<T[Name]> extends [infer Arg]
    ? { type: Name; params: Arg }
    : { type: Name };
}[keyof T];

export type OnSuccess<T extends Resolvers> = (
  data: {
    [Name in keyof T]: {
      data: Parameters<T[Name]> extends [infer Arg]
        ? { type: Name; params: Arg, result: ReturnType<T[Name]> }
        : { type: Name; result: ReturnType<T[Name]> };
    }['data'];
  }[keyof T]
) => void;

export type OnError<T extends Resolvers> = (
  data: {
    [Name in keyof T]: {
      data: Parameters<T[Name]> extends [infer Arg]
        ? { type: Name; params: Arg, error: any }
        : { type: Name; error: any };
    }['data'];
  }[keyof T]
) => void;

export type OnCleared = () => any;

export type Params<T extends Resolvers> = {
  resolvers: T;
  concurrency?: number;
  onSuccess?: OnSuccess<T>,
  onError?: OnError<T>,
  onCleared?: OnCleared
};
