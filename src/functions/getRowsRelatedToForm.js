const startsWithAny = (value, prefixes) =>
  prefixes.some((prefix) => value?.toString()?.startsWith(prefix?.toString()))

export const checkIfDataIsMatchToForm = (
  line,
  allowedDebitAccounts,
  allowedCreditAccounts,
  hasInvoice,
  isComplement,
  ctgs = '',
  applyOveride = false,
  overrideInfo = undefined
) => {
  const documentId = line['CTGS'] || line['Document ID']
  const invoiceSymbol = line['Kyù hieäu'] || line['InvSeriNo']
  const invoiceNumber = line['Soá HÑ'] || line['InvoiceNo']
  const debitAccount = line['TK Nôï'] || line['RecvAcctID']
  const creditAccount = line['TK Coù'] || line['IncomeAcctID']

  const debitAccountList =
    applyOveride && overrideInfo?.debits
      ? overrideInfo?.debits?.replace(/\s+/g, '')?.split(',')
      : allowedDebitAccounts
  const creditAccountList =
    applyOveride && overrideInfo?.credits
      ? overrideInfo?.credits?.replace(/\s+/g, '')?.split(',')
      : allowedCreditAccounts

  const isDebitAllowed = startsWithAny(debitAccount, debitAccountList)
  const isCreditAllowed = startsWithAny(creditAccount, creditAccountList)

  if (ctgs && !documentId?.startsWith(ctgs)) return false

  if (applyOveride) {
    if (
      (overrideInfo?.invoiceSymbol === 'yes' && !invoiceSymbol) ||
      (overrideInfo?.invoiceSymbol === 'no' && invoiceSymbol) ||
      (overrideInfo?.invoiceNumber === 'yes' && !invoiceNumber) ||
      (overrideInfo?.invoiceNumber === 'no' && invoiceNumber)
    ) {
      return false
    }
  } else if (hasInvoice && (!invoiceSymbol || !invoiceNumber)) {
    return false
  }

  return isComplement
    ? !(isDebitAllowed || isCreditAllowed)
    : isDebitAllowed && isCreditAllowed
}
