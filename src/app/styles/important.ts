export function important<T extends unknown>(cssValue: T) {
  return (cssValue + "!important") as T
}
