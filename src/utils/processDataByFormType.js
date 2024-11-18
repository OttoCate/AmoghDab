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

const handleTransaction = (inputData, company, debitAccounts, creditAccounts, processFn, hasInvoice,laPhanBu,ctgs) => {
    const preProcessedData = getRowsRelatedToForm(inputData, debitAccounts, creditAccounts, hasInvoice, laPhanBu, ctgs);
    return processFn(preProcessedData, inputData, company);
}

export const muaDichVuDaTienTe = (inputData, company, ctgs) =>
    handleTransaction(inputData, company, ["335", "6", "8"], ["335", "331", "111", "112", "338"], processDataMDVDTT,true,false,ctgs);

export const muaHangTrongNuocNhieuHD = (inputData, company, ctgs) =>
    handleTransaction(inputData, company, ["15", "2"], ["335", "331", "111", "112", "338"], processDataMHTNNHD,true,false,ctgs);

export const banDichVuDaTienTe = (inputData, company, ctgs) =>
    handleTransaction(inputData, company, ["131", "111", "112", "138","521"], ["5113","131"], processDataBDVDTT,true,false,ctgs);

export const banHangDaTienTe = (inputData, company, ctgs) =>
    handleTransaction(inputData, company, ["131", "111", "112", "138","521"], ["5111", "5112","1562A","131"], processDataBHDTT,true,false,ctgs);

export const xuatKhoFull = (inputData, company, ctgs) => 
    handleTransaction(inputData, company, ["6","8","157","154","141"], ["152","153","155","156"], processDataXKF, false,false,ctgs);

export const nhapKhoFull = (inputData, company, ctgs) => 
    handleTransaction(inputData, company, ["152","153","155","156"], ["6","8","157","154","141"], processNKF,false,false,ctgs);

export const chungTuNghiepVuKhacDaTienTe = (inputData, company, ctgs) => 
    handleTransaction(inputData, company, ["111", "112", "152", "153", "155", "156", "157","133","33311"], ["33311","133","111", "112", "152", "153", "155", "156", "157"], processNVK,false,true,ctgs);