/* eslint-disable no-restricted-globals */
import * as XLSX from 'xlsx'
import { formSettings } from '../globalVariables'
import { transformFormSettingsToArrayForExclusive } from '../functions/turnObjectToArray'
import { checkIfDataIsMatchToForm } from '../functions/getRowsRelatedToForm'

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
