import { checkIfDataIsMatchToForm } from './getRowsRelatedToForm'
import { formSettings } from '../globalVariables'

const handleTransaction = (
  inputData,
  debitAccounts,
  creditAccounts,
  processFn,
  hasInvoice,
  isComplement,
  ctgs,
  software,
  applyOveride,
  overrideInfo
) => {
  const preProcessedData = inputData.filter((line) =>
    checkIfDataIsMatchToForm(
      line,
      debitAccounts,
      creditAccounts,
      hasInvoice,
      isComplement,
      ctgs,
      applyOveride,
      overrideInfo
    )
  )
  return processFn(preProcessedData, inputData, software)
}

export const createTransactionHandler = (
  inputData,
  ctgs,
  software,
  misaForm,
  applyOveride,
  overrideInfo
) =>
  handleTransaction(
    inputData,
    formSettings[misaForm].debit,
    formSettings[misaForm].credit,
    formSettings[misaForm].function,
    formSettings[misaForm].invoiceRequired,
    formSettings[misaForm].isComplement,
    ctgs,
    software,
    applyOveride,
    overrideInfo
  )
