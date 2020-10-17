export function serializeSearchParams(searchParams: URLSearchParams) {
  const result = {}
  for (const [key, value] of searchParams) {
    const numValue = Number(value)

    if (!isNaN(numValue)) {
      result[key] = numValue
    } else {
      result[key] = value
    }
  }
  return result
}
