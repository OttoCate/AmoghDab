import {getRowsRelatedToForm} from '../functions/getRowsRelatedToForm'
import {
    processDataMDVDTT,
    processDataMHTNNHD,
    processDataBDVDTT,
    processDataBHDTT
} from '../functions/processDetailData'

export const muaDichVuDaTienTe = (inputData,company) => {
    const debitAccountsAllowed = ["335","6","8"];
    const creditAccountsAllowed = ["335","331","111","112","338"];

    const preProcessedData = getRowsRelatedToForm(inputData,debitAccountsAllowed,creditAccountsAllowed,true);
    const processedData = processDataMDVDTT(preProcessedData,inputData,company);
    return processedData;
}

export const muaHangTrongNuocNhieuHD = (inputData,company) => {
    const debitAccountsAllowed = ["15","2"];
    const creditAccountsAllowed = ["335","331","111","112","338"];

    const preProcessedData = getRowsRelatedToForm(inputData,debitAccountsAllowed,creditAccountsAllowed,true);
    const processedData = processDataMHTNNHD(preProcessedData,inputData,company);
    return processedData;
}

export const banDichVuDaTienTe = (inputData,company) => {
    const debitAccountsAllowed = ["131","111","112","138"];
    const creditAccountsAllowed = ["5113"];

    const preProcessedData = getRowsRelatedToForm(inputData,debitAccountsAllowed,creditAccountsAllowed,true);
    const processedData = processDataBDVDTT(preProcessedData,inputData,company);
    return processedData;
}

export const banHangDaTienTe = (inputData,company) => {
    const debitAccountsAllowed = ["131","111","112","138"];
    const creditAccountsAllowed = ["5111","5112"];

    const preProcessedData = getRowsRelatedToForm(inputData,debitAccountsAllowed,creditAccountsAllowed,true);
    const processedData = processDataBHDTT(preProcessedData,inputData,company);
    return processedData;
}