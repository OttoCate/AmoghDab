/* eslint-disable no-restricted-globals */
import * as XLSX from 'xlsx'
import { formSettings } from '../globalVariables'
import { transformFormSettingsToArrayForExclusive } from '../functions/turnObjectToArray'

const startsWithAny = (value, prefixes) =>
  prefixes.some((prefix) => value?.toString()?.startsWith(prefix?.toString()))

const checkIfDataIsMatchToForm = (
  line,
  allowedDebitAccounts,
  allowedCreditAccounts,
  hasInvoice,
  isComplement
) => {
  const invoiceSymbol = line['Kyù hieäu'] || line['InvSeriNo']
  const invoiceNumber = line['Soá HÑ'] || line['InvoiceNo']
  const debitAccount = line['TK Nôï'] || line['RecvAcctID']
  const creditAccount = line['TK Coù'] || line['IncomeAcctID']

  if (hasInvoice && (!invoiceSymbol || !invoiceNumber)) return false

  const isDebitAllowed = startsWithAny(debitAccount, allowedDebitAccounts)
  const isCreditAllowed = startsWithAny(creditAccount, allowedCreditAccounts)

  return isComplement
    ? !(isDebitAllowed || isCreditAllowed)
    : isDebitAllowed && isCreditAllowed
}

const processExclusiveData = (data, transformedFormSettings) => {
  return data.filter((line) => {
    return !transformedFormSettings.some(
      ({
        allowedDebitAccounts,
        allowedCreditAccounts,
        hasInvoice,
        isComplement,
      }) =>
        checkIfDataIsMatchToForm(
          line,
          allowedDebitAccounts,
          allowedCreditAccounts,
          hasInvoice,
          isComplement
        )
    )
  })
}

self.onmessage = function (e) {
  const { data } = e.data
  const transformedFormSettings =
    transformFormSettingsToArrayForExclusive(formSettings)

  const finalData = processExclusiveData(data, transformedFormSettings)

  const fileName = 'Hạch toán bị loại trừ'
  const fileType =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  const fileExtension = '.xlsx'

  const CHUNK_SIZE = 495
  let wb = { Sheets: {}, SheetNames: [] }
  if (finalData.length === 0) {
    const ws = XLSX.utils.json_to_sheet(finalData)
    wb = { Sheets: { data: ws }, SheetNames: ['data'] }
  } else {
    for (let i = 0; i < finalData.length; i += CHUNK_SIZE) {
      const chunk = finalData.slice(i, i + CHUNK_SIZE)
      const sheet = XLSX.utils.json_to_sheet(chunk)
      const sheetName = `Sheet_${Math.floor(i / CHUNK_SIZE) + 1}`
      wb.Sheets[sheetName] = sheet
      wb.SheetNames.push(sheetName)
    }
  }

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: fileType })

  self.postMessage({ blob, fileName: fileName + fileExtension })
}
