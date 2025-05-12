import { getRowsRelatedToForm } from './getRowsRelatedToForm'
import { formSettings } from '../globalVariables'

const handleTransaction = (
  inputData,
  debitAccounts,
  creditAccounts,
  processFn,
  hasInvoice,
  isComplement,
  ctgs,
  software
) => {
  const preProcessedData = getRowsRelatedToForm(
    inputData,
    debitAccounts,
    creditAccounts,
    hasInvoice,
    isComplement,
    ctgs
  )
  return processFn(preProcessedData, inputData, software)
}

export const createTransactionHandler = (inputData, ctgs, software, misaForm) =>
  handleTransaction(
    inputData,
    formSettings[misaForm].debit,
    formSettings[misaForm].credit,
    formSettings[misaForm].function,
    formSettings[misaForm].invoiceRequired,
    formSettings[misaForm].isComplement,
    ctgs,
    software
  )
