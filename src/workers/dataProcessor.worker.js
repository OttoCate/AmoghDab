/* eslint-disable no-restricted-globals */
import * as XLSX from 'xlsx';
import {
  muaDichVuDaTienTe,
  muaHangTrongNuocNhieuHD,
  banDichVuDaTienTe,
  banHangDaTienTe,
  xuatKhoFull,
  nhapKhoFull,
  chungTuNghiepVuKhacDaTienTe
} from '../utils/processDataByFormType';

self.onmessage = function (e) {
  const { data, misaForm, formOptions, ctgs, software } = e.data;
  let finalData = [];

  switch (misaForm) {
    case "1": finalData = banDichVuDaTienTe(data, ctgs, software); break;
    case "2": finalData = banHangDaTienTe(data, ctgs, software); break;
    case "3": finalData = muaDichVuDaTienTe(data, ctgs, software); break;
    case "4": finalData = muaHangTrongNuocNhieuHD(data, ctgs, software); break;
    case "5": finalData = xuatKhoFull(data, ctgs, software); break;
    case "6": finalData = nhapKhoFull(data, ctgs, software); break;
    case "7": finalData = chungTuNghiepVuKhacDaTienTe(data, ctgs, software); break;
    default: finalData = []; break;
  }

  const fileName = formOptions.find((i) => i.value === misaForm)?.label || 'Result';
  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  const fileExtension = '.xlsx';

  const CHUNK_SIZE = 495;
  let wb = { Sheets: {}, SheetNames: [] };
  if(finalData.length === 0){
    const ws = XLSX.utils.json_to_sheet(finalData);
    wb = { Sheets: { data: ws }, SheetNames: ['data'] };
  } else {
    for (let i = 0; i < finalData.length; i += CHUNK_SIZE) {
      const chunk = finalData.slice(i, i + CHUNK_SIZE);
      const sheet = XLSX.utils.json_to_sheet(chunk);
      const sheetName = `Sheet_${Math.floor(i / CHUNK_SIZE) + 1}`;
      wb.Sheets[sheetName] = sheet;
      wb.SheetNames.push(sheetName);
    }
  }

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: fileType });
  
  self.postMessage({ blob, fileName: fileName + fileExtension });
}
