import {getRowsRelatedToForm} from '../functions/getRowsRelatedToForm'
import {processDataMDVDTT} from '../functions/processData'

export const muaDichVuDaTienTe = (inputData) => {
    const debitAccountsAllowed = ["2","3","6","8"];
    const creditAccountsAllowed = ["335","331"];

    const preProcessedData = getRowsRelatedToForm(inputData,debitAccountsAllowed,creditAccountsAllowed,true);
    const processedData = processDataMDVDTT(preProcessedData,inputData);
    return processedData;
}