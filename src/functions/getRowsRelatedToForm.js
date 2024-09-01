export const getRowsRelatedToForm = (data, allowedDebitAccounts,allowedCreditAccounts, hasInvoice,laPhanBu) => {
    return [...data].filter((line)=>{
        if(hasInvoice && (!line["Kyù hieäu"] || !line["Soá HÑ"])) return false;
        if(laPhanBu && (allowedDebitAccounts.some(i => line["TK Nôï"].toString().startsWith(i.toString())) || allowedCreditAccounts.some(i => line["TK Coù"].toString().startsWith(i.toString())))) return false;
        if(!laPhanBu && (!allowedDebitAccounts.some(i => line["TK Nôï"].toString().startsWith(i.toString())) || !allowedCreditAccounts.some(i => line["TK Coù"].toString().startsWith(i.toString())))) return false;
        return true;
    })
}