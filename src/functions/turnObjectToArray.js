export const transformFormSettingsToArray = (settings) => {
  return Object.entries(settings).map(([key, value]) => ({
    value: Number(key),
    label: value.label,
  }))
}

export const transformFormSettingsToArrayForExclusive = (settings) => {
  return Object.entries(settings).map(([key, value]) => ({
    value: Number(key),
    allowedDebitAccounts: value.debit,
    allowedCreditAccounts: value.credit,
    hasInvoice: value.invoiceRequired,
    isComplement: value.isComplement,
  }))
}
