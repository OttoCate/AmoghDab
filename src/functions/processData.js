import lodash from 'lodash'
export const processDataMDVDTT = (data,originalData) => {
    const processedData = [...data].map((line)=>{
        const taxLine = [...originalData].filter(i => {
            if(
                i["CTGS"] === line["CTGS"] 
                && i["Soá phieáu"] === line["Soá phieáu"] 
                && i["Soá HÑ"] === line["Soá HÑ"] 
                && i["Ngaøy HÑ"] === line["Ngaøy HÑ"] 
                && i["TK Nôï"].toString().startsWith("133")
            ){
                return true;
            } else {
                return false;
            }
        });

        return {
            "Phương thức thanh toán": "Chưa thanh toán",
            "Nhận kèm hóa đơn": "Nhận kèm hóa đơn",
            "Là CP mua hàng":"",
            "Ngày hạch toán (*)": line["Ngaøy GS"],
            "Ngày chứng từ (*)": line["Ngaøy GS"],
            "Số chứng từ (*)":line["CTGS"]+"-"+line["Soá phieáu"],
            "Số tài khoản chi":"",
            "Tên ngân hàng chi":"",
            "Nhà cung cấp": line["C.Tieát Coù"],
            "Địa chỉ":"",
            "Diễn giải/Lý do chi/Nội dung thanh toán": line["Dieãn giaûi"],
            "Số tài khoản nhận": "",
            "Tên ngân hàng nhận":"",
            "Mã nhân viên mua hàng":"",
            "Hạn thanh toán":"",
            "Loại tiền":"",
            "Tỷ giá":lodash.isNumber(line["Tyû giaù"]) ? line["Tyû giaù"] : "",
            "Mã dịch vụ (*)": line["C.Tieát Nôï"],
            "Tên dịch vụ":"",
            "Là dòng ghi chú":"",
            "TK kho/TK chi phí (*)": line["TK Nôï"],
            "TK công nợ/TK tiền (*)": line["TK Coù"],
            "Mã đối tượng":"",
            "ĐVT":"",
            "Số lượng": line["S.Löôïng"],
            "Đơn giá": lodash.isNumber(line["S.Löôïng"]) && line["S.Löôïng"] > 0 ?  line["Soá tieàn"] / line["S.Löôïng"] : "",
            "Thành tiền": line["Soá tieàn"],
            "Thành tiền quy đổi": lodash.isNumber(line["Tyû giaù"]) ? line["Soá tieàn"] * line["Tyû giaù"] : 0,
            "Tỷ lệ CK (%)":0,
            "Tiền chiết khấu":0,
            "Tiền chiết khấu quy đổi":0,
            "Mã khoản mục chi phí":"",
            "Mã đơn vị":"",
            "Mã đối tượng THCP":"",
            "Mã công trình":"",
            "Số đơn đặt hàng":"",
            "Số hợp đồng mua":"",
            "Số hợp đồng bán":"",
            "Mã thống kê":"",
            "Số khế ước đi vay":"",
            "Số khế ước cho vay":"",
            "CP không hợp lý": line["TK Nôï"].toString().toUpperCase().includes("K") ? "Có" : "Không",
            "% thuế GTGT": taxLine.length === 0? "KCT" : taxLine[0]["TS %"],
            "% thuế suất KHAC": "",
            "Tiền thuế GTGT": taxLine.length === 0 ? 0 : taxLine[0]["Soá tieàn"],
            "Tiền thuế GTGT quy đổi": taxLine.length === 0 ? 0 : lodash.isNumber(line["Tyû giaù"]) ? taxLine[0]["Soá tieàn"] : taxLine[0]["Soá tieàn"] * line["Tyû giaù"],
            "TK thuế GTGT": taxLine.length === 0 ? "" : taxLine[0]["TK Nôï"],
            "Ngày hóa đơn": line["Ngaøy HÑ"],
            "Số hóa đơn": line["Soá HÑ"],
            "Mẫu số HĐ":1,
            "Ký hiệu HĐ": line["Kyù hieäu"],
            "Nhóm HHDV mua vào": "",
            "Mã NCC": line["C.Tieát Coù"],
            "Tên NCC":"",
            "Mã số thuế NCC": line["Maõ Thueá"],
            "Địa chỉ NCC":"",
        }

    })

    return processedData;
}