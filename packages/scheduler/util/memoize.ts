// Generic memoization utility
// Returns the same function reference if args are shallow-equal
export function memoize<Arg extends any[], Result>(
  workerFunc: (...args: Arg) => Result,
  equalityFunc: (a: any, b: any) => boolean = (a, b) => a === b
): (...args: Arg) => Result {
  let prevArgs: Arg | null = null;
  let prevResult: Result;

  return function (...args: Arg): Result {
    if (
      prevArgs &&
      args.length === prevArgs.length &&
      args.every((arg, i) => equalityFunc(arg, prevArgs![i]))
    ) {
      return prevResult;
    }

    prevArgs = args;
    prevResult = workerFunc(...args);
    return prevResult;
  };
}
