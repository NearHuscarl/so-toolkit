export function getBrowser(): "firefox" | "chrome" | undefined {
  if (navigator.userAgent.toLowerCase().indexOf("firefox") > -1) {
    return "firefox"
  }
  // @ts-ignore
  if (!!window.chrome) {
    return "chrome"
  }
}
