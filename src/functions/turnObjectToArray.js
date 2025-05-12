export const transformFormSettingsToArray = (settings) => {
  return Object.entries(settings).map(([key, value]) => ({
    value: Number(key),
    label: value.label,
  }))
}
