/* eslint-disable no-restricted-globals */
import * as XLSX from 'xlsx'
import { createTransactionHandler } from '../functions/processDataByFormType'
import { formSettings } from '../globalVariables'

self.onmessage = function (e) {
  const {
    data,
    misaForm,
    ctgs,
    software,
    applyOveride,
    overrideInfo,
    maxRowPerSheet,
  } = e.data

  if (!formSettings[misaForm]) {
    self.postMessage({ error: `Invalid misaForm: ${misaForm}` })
    return
  }

  let finalData = createTransactionHandler(
    data,
    ctgs,
    software,
    misaForm,
    applyOveride,
    overrideInfo
  )

  const fileName = formSettings[misaForm].label || 'Result'
  const fileType =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  const fileExtension = '.xlsx'

  const CHUNK_SIZE = parseInt(maxRowPerSheet)
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
