export const getRowsRelatedToForm = (data, allowedDebitAccounts, allowedCreditAccounts, hasInvoice, isComplement, ctgs) => {
    const startsWithAny = (value, prefixes) => 
        prefixes.some(prefix => value?.toString()?.startsWith(prefix?.toString()));

    return data.filter(line => {
        const documentId = line["CTGS"] || line["Document ID"];
        const invoiceSymbol = line["Kyù hieäu"] || line["InvSeriNo"];
        const invoiceNumber = line["Soá HÑ"] || line["InvoiceNo"];
        const debitAccount = line["TK Nôï"] || line["RecvAcctID"];
        const creditAccount = line["TK Coù"] || line["IncomeAcctID"];

        if (ctgs && !documentId?.startsWith(ctgs)) return false;
        if (hasInvoice && (!invoiceSymbol || !invoiceNumber)) return false;

        const isDebitAllowed = startsWithAny(debitAccount, allowedDebitAccounts);
        const isCreditAllowed = startsWithAny(creditAccount, allowedCreditAccounts);

        if (isComplement) {
            return !(isDebitAllowed || isCreditAllowed);
        } else {
            return isDebitAllowed && isCreditAllowed;
        }
    });
};