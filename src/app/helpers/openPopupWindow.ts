/*
 * Open popup window at center position. Works with multi-monitor setup
 * https://stackoverflow.com/a/32261263/9449426
 */
export function openPopupWindow(
  url: string,
  windowName: string,
  win = window,
  width = 660,
  height = 480
) {
  const y = win.top.outerHeight / 2 + win.top.screenY - height / 2
  const x = win.top.outerWidth / 2 + win.top.screenX - width / 2
  return win.open(
    url,
    windowName,
    `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${y}, left=${x}`
  )
}
