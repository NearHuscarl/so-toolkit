export default function toThrowSilently(
  fn: Function,
  error?: string | jest.Constructable | RegExp | Error
) {
  jest.spyOn(console, "error")
  // @ts-ignore
  console.error.mockImplementation(() => {})
  expect(fn).toThrow(error)
  // @ts-ignore
  console.error.mockRestore()
}
