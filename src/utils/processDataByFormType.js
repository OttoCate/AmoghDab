import { getRowsRelatedToForm } from '../functions/getRowsRelatedToForm'
import {
    processDataMDVDTT,
    processDataMHTNNHD,
    processDataBDVDTT,
    processDataBHDTT,
    processDataXKF,
    processNKF,
} from '../functions/processDetailData'

const handleTransaction = (inputData, company, debitAccounts, creditAccounts, processFn, hasInvoice) => {
    const preProcessedData = getRowsRelatedToForm(inputData, debitAccounts, creditAccounts, hasInvoice);
    return processFn(preProcessedData, inputData, company);
}

export const muaDichVuDaTienTe = (inputData, company) =>
    handleTransaction(inputData, company, ["335", "6", "8"], ["335", "331", "111", "112", "338"], processDataMDVDTT,true);

export const muaHangTrongNuocNhieuHD = (inputData, company) =>
    handleTransaction(inputData, company, ["15", "2"], ["335", "331", "111", "112", "338"], processDataMHTNNHD,true);

export const banDichVuDaTienTe = (inputData, company) =>
    handleTransaction(inputData, company, ["131", "111", "112", "138"], ["5113"], processDataBDVDTT,true);

export const banHangDaTienTe = (inputData, company) =>
    handleTransaction(inputData, company, ["131", "111", "112", "138"], ["5111", "5112"], processDataBHDTT,true);

export const xuatKhoFull = (inputData, company) => 
    handleTransaction(inputData, company, ["6","8","157","154"], ["152","153","155","156"], processDataXKF, false);

export const nhapKhoFull = (inputData, company) => 
    handleTransaction(inputData, company, ["152","153","155","156"], ["6","8","157","154"], processNKF,false);