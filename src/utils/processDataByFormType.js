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

const handleTransaction = (inputData, debitAccounts, creditAccounts, processFn, hasInvoice,laPhanBu,ctgs, software) => {
    const preProcessedData = getRowsRelatedToForm(inputData, debitAccounts, creditAccounts, hasInvoice, laPhanBu, ctgs);
    return processFn(preProcessedData, inputData, software);
}

export const muaDichVuDaTienTe = (inputData, ctgs, software) =>
    handleTransaction(inputData, ["335", "6", "8"], ["335", "331", "111", "112", "338"], processDataMDVDTT,true,false,ctgs, software);

export const muaHangTrongNuocNhieuHD = (inputData, ctgs, software) =>
    handleTransaction(inputData, ["15", "2"], ["335", "331", "111", "112", "338"], processDataMHTNNHD,true,false,ctgs, software);

export const banDichVuDaTienTe = (inputData, ctgs, software) =>
    handleTransaction(inputData, ["131", "111", "112", "138","521"], ["5113","131"], processDataBDVDTT,true,false,ctgs, software);

export const banHangDaTienTe = (inputData, ctgs, software) =>
    handleTransaction(inputData, ["131", "111", "112", "138","521"], ["5111", "5112","1562A","131"], processDataBHDTT,true,false,ctgs, software);

export const xuatKhoFull = (inputData, ctgs, software) => 
    handleTransaction(inputData, ["6","8","157","154","141"], ["152","153","155","156"], processDataXKF, false,false,ctgs, software);

export const nhapKhoFull = (inputData, ctgs, software) => 
    handleTransaction(inputData, ["152","153","155","156"], ["6","8","157","154","141","138","335"], processNKF,false,false,ctgs, software);

export const chungTuNghiepVuKhacDaTienTe = (inputData, ctgs, software) => 
    handleTransaction(inputData, ["111", "112", "152", "153", "155", "156", "157","133","33311"], ["33311","133","111", "112", "152", "153", "155", "156", "157"], processNVK,false,true,ctgs, software);