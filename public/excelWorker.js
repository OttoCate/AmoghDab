// public/excelWorker.js

self.importScripts("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js");

self.onmessage = function (e) {
  const fileBuffer = e.data;

  try {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const wsname = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[wsname];
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: "" }); // optional: preserve empty fields
    self.postMessage({ success: true, data });
  } catch (err) {
    self.postMessage({ success: false, error: err.message });
  }
};
