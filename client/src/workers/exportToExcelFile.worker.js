/* eslint-disable no-restricted-globals */
import * as XLSX from 'xlsx'

self.onmessage = function (e) {
  const { data, fileName } = e.data
  const fileType =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  const fileExtension = '.xlsx'

  const CHUNK_SIZE = 70000
  let wb = { Sheets: {}, SheetNames: [] }
  if (data.length === 0) {
    const ws = XLSX.utils.json_to_sheet(data)
    wb = { Sheets: { data: ws }, SheetNames: ['data'] }
  } else {
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE)
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
