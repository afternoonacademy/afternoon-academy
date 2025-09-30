export class RefMap<T> {
  currentMap: { [key: string]: T | null } = {};

  createRef(key: string) {
    return (el: T | null) => {
      this.currentMap[key] = el;
    };
  }

  getAll(): (T | null)[] {
    return Object.values(this.currentMap);
  }
}
