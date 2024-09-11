import { getRowsRelatedToForm } from '../functions/getRowsRelatedToForm'
import {
    processDataMDVDTT,
    processDataMHTNNHD,
    processDataBDVDTT,
    processDataBHDTT,
    processDataXKF,
    processNKF,
    processNVK
} from '../functions/processDetailData'

const handleTransaction = (inputData, company, debitAccounts, creditAccounts, processFn, hasInvoice,laPhanBu) => {
    const preProcessedData = getRowsRelatedToForm(inputData, debitAccounts, creditAccounts, hasInvoice,laPhanBu);
    return processFn(preProcessedData, inputData, company);
}

export const muaDichVuDaTienTe = (inputData, company) =>
    handleTransaction(inputData, company, ["335", "6", "8"], ["335", "331", "111", "112", "338"], processDataMDVDTT,true,false);

export const muaHangTrongNuocNhieuHD = (inputData, company) =>
    handleTransaction(inputData, company, ["15", "2"], ["335", "331", "111", "112", "338"], processDataMHTNNHD,true,false);

export const banDichVuDaTienTe = (inputData, company) =>
    handleTransaction(inputData, company, ["131", "111", "112", "138"], ["5113"], processDataBDVDTT,true,false);

export const banHangDaTienTe = (inputData, company) =>
    handleTransaction(inputData, company, ["131", "111", "112", "138"], ["5111", "5112","1562A"], processDataBHDTT,true,false);

export const xuatKhoFull = (inputData, company) => 
    handleTransaction(inputData, company, ["6","8","157","154","141"], ["152","153","155","156"], processDataXKF, false,false);

export const nhapKhoFull = (inputData, company) => 
    handleTransaction(inputData, company, ["152","153","155","156"], ["6","8","157","154","141"], processNKF,false,false);

export const chungTuNghiepVuKhacDaTienTe = (inputData, company) => 
    handleTransaction(inputData, company, ["111", "112", "152", "153", "155", "156", "157"], ["111", "112", "152", "153", "155", "156", "157"], processNVK,false,true);