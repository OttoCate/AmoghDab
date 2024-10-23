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
  const { data, company, misaForm, formOptions } = e.data;
  let finalData = [];

  switch (misaForm) {
    case "1": finalData = banDichVuDaTienTe(data, company); break;
    case "2": finalData = banHangDaTienTe(data, company); break;
    case "3": finalData = muaDichVuDaTienTe(data, company); break;
    case "4": finalData = muaHangTrongNuocNhieuHD(data, company); break;
    case "5": finalData = xuatKhoFull(data, company); break;
    case "6": finalData = nhapKhoFull(data, company); break;
    case "7": finalData = chungTuNghiepVuKhacDaTienTe(data, company); break;
    default: finalData = []; break;
  }

  const fileName = formOptions.find((i) => i.value === misaForm)?.label || 'Result';
  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  const fileExtension = '.xlsx';

  const ws = XLSX.utils.json_to_sheet(finalData);
  const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: fileType });
  
  self.postMessage({ blob, fileName: fileName + fileExtension });
}
