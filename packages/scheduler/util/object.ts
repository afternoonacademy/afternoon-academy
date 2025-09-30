// shallow compare two plain objects
export function isPropsEqual(obj0: any, obj1: any): boolean {
  if (obj0 === obj1) return true;

  if (!obj0 || !obj1) return false;

  let keys0 = Object.keys(obj0);
  let keys1 = Object.keys(obj1);

  if (keys0.length !== keys1.length) return false;

  for (let key of keys0) {
    if (obj0[key] !== obj1[key]) {
      return false;
    }
  }

  return true;
}
