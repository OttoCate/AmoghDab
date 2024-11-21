export const getRowsRelatedToForm = (data, allowedDebitAccounts,allowedCreditAccounts, hasInvoice,laPhanBu,ctgs) => {
    return [...data].filter((line)=>{
        let chungTuGhiSo = line["CTGS"] || line["Document ID"];
        let kyHieuHD = line["Kyù hieäu"] || line["InvSeriNo"];
        let soHD = line["Soá HÑ"] || line["InvoiceNo"];
        let TKNo = line["TK Nôï"] || line["RecvAcctID"];
        let TKCo = line["TK Coù"] || line["IncomeAcctID"];

        if(ctgs && !chungTuGhiSo?.startsWith(ctgs)) return false;
        if(hasInvoice && (!kyHieuHD || !soHD)) return false;
        if(laPhanBu && (allowedDebitAccounts.some(i => TKNo?.toString()?.startsWith(i?.toString())) || allowedCreditAccounts.some(i => TKCo?.toString()?.startsWith(i?.toString())))) return false;
        if(!laPhanBu && (!allowedDebitAccounts.some(i => TKNo?.toString()?.startsWith(i?.toString())) || !allowedCreditAccounts.some(i => TKCo?.toString()?.startsWith(i?.toString())))) return false;
        return true;
    })
}