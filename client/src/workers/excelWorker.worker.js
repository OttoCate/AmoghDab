/* eslint-disable no-restricted-globals */
import * as XLSX from 'xlsx'

self.onmessage = function (e) {
  const fileBuffer = e.data

  try {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
    const wsname = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[wsname]
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) // optional: preserve empty fields
    self.postMessage({ success: true, data })
  } catch (err) {
    self.postMessage({ success: false, error: err.message })
  }
}
