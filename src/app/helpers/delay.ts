export function delay(delayTime: number) {
  return new Promise((r) => setTimeout(r, delayTime))
}
