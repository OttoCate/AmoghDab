import lodash from 'lodash'
import { excelDateToJSDate } from './convertToDate.js';
import DNGRF1521 from '../source/DNGRF/danhMuc1521_DNGRF.json';
import DNGRF1531 from '../source/DNGRF/danhMuc1531_DNGRF.json';
import DNGRF1532 from '../source/DNGRF/danhMuc1532_DNGRF.json';
import DNGRF156 from '../source/DNGRF/danhMuc156_DNGRF.json';
import DNGRF155 from '../source/DNGRF/danhMuc155_DNGRF.json';
import DNGRF1121 from '../source/DNGRF/danhMuc1121_DNGRF.json';

const checkBank = (company,bankCode) => {
    let moneyOutBank = "";

    switch(company){
        case "dngrf":
            moneyOutBank = DNGRF1121.find(i => i['Maõ CTieát'] === bankCode)?.['Teân danh muïc chi tieát'] || "";
            break;
        default:
            moneyOutBank = "";
            break;
    }

    return moneyOutBank;
}

const checkProduct = (company,productCode) => {
    let productName = "";

    switch(company){
        case "dngrf":
            productName = [...DNGRF1521,...DNGRF1531,...DNGRF1532,...DNGRF155,...DNGRF156].find(i => i['Maõ CTieát'] === productCode)?.['Teân danh muïc chi tieát'] || "";
            break;
    }

    return productName;
}

export const processDataMDVDTT = (data,originalData,company) => {

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
            "Phương thức thanh toán": line["TK Coù"].startsWith("111") ? "Tieàn maët" : line["TK Coù"].startsWith("112") ? "UÛy nhieäm chi" : "Chöa thanh toaùn",
            "Nhận kèm hóa đơn": "Nhaän keøm hoùa ñôn",
            "Là CP mua hàng":"",
            "Ngày hạch toán (*)": excelDateToJSDate(line["Ngaøy GS"]),
            "Ngày chứng từ (*)": excelDateToJSDate(line["Ngaøy GS"]),
            "Số chứng từ (*)":line["CTGS"]+"-"+line["Soá phieáu"],
            "Số tài khoản chi":"",
            "Tên ngân hàng chi":checkBank(company,line["C.Tieát Coù"]),
            "Nhà cung cấp": ["111","112"].some((i) => line["TK Coù"].startsWith(i)) ? "" : line["Ñoái töôïng (ghi chuù)"],	
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
            "CP không hợp lý": line["TK Nôï"].toString().toUpperCase().includes("K") ? "Coù" : "Khoâng",
            "% thuế GTGT": taxLine.length === 0? "KCT" : taxLine[0]["TS %"],
            "% thuế suất KHAC": "",
            "Tiền thuế GTGT": taxLine.length === 0 ? 0 : taxLine[0]["Soá tieàn"],
            "Tiền thuế GTGT quy đổi": taxLine.length === 0 ? 0 : lodash.isNumber(line["Tyû giaù"]) ? taxLine[0]["Soá tieàn"] : taxLine[0]["Soá tieàn"] * line["Tyû giaù"],
            "TK thuế GTGT": taxLine.length === 0 ? "" : taxLine[0]["TK Nôï"],
            "Ngày hóa đơn": excelDateToJSDate(line["Ngaøy HÑ"]),
            "Số hóa đơn": line["Soá HÑ"],
            "Mẫu số HĐ":1,
            "Ký hiệu HĐ": line["Kyù hieäu"].slice(1),
            "Nhóm HHDV mua vào": "",
            "Mã NCC": ["111","112"].some((i) => line["TK Coù"].startsWith(i)) ? "" : line["C.Tieát Coù"],
            "Tên NCC":["111","112"].some((i) => line["TK Coù"].startsWith(i)) ? "" : line["Ñoái töôïng (ghi chuù)"],	
            "Mã số thuế NCC": line["Maõ Thueá"],
            "Địa chỉ NCC":"",
        }

    })

    return processedData;
}

export const processDataMHTNNHD = (data,originalData,company) => {
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
            "Hình thức mua hàng": line["TK Nôï"].startsWith("15") ? "Mua haøng trong nöôùc nhaäp kho" : "Mua haøng trong nöôùc khoâng qua kho",
            "Phương thức thanh toán": line["TK Coù"].startsWith("111") ? "Tieàn maët" : line["TK Coù"].startsWith("112") ? "UÛy nhieäm chi" : "Chöa thanh toaùn",
            "Ngày hạch toán (*)": excelDateToJSDate(line["Ngaøy GS"]),
            "Ngày chứng từ (*)": excelDateToJSDate(line["Ngaøy GS"]),
            "Số phiếu nhập (*)":line["CTGS"]+"-"+line["Soá phieáu"],
            "Số chứng từ ghi nợ/Số chứng từ thanh toán":"",
            "Người giao hàng": "",
            "Địa chỉ": "",	
            "Diễn giải": line["Dieãn giaûi"],
            "Mã nhân viên mua hàng":"",
            "Số lượng chứng từ kèm theo": "",	
            "Số tài khoản chi":"",
            "Tên ngân hàng chi":checkBank(company,line["C.Tieát Coù"]),
            "Số tài khoản nhận": "",	
            "Tên ngân hàng nhận":"",
            "Lý do chi/nội dung thanh toán": "",
            "Loại tiền":"",
            "Tỷ giá":lodash.isNumber(line["Tyû giaù"]) ? line["Tyû giaù"] : "",
            "Mã hàng (*)": line["C.Tieát Nôï"],
            "Tên hàng":checkProduct(company,line["C.Tieát Nôï"]),
            "Là dòng ghi chú":"",
            "Mã kho": line["kho nôï"],
            "Hàng hóa giữ hộ/bán hộ": "",
            "TK kho/TK chi phí (*)": line["TK Nôï"],
            "TK công nợ/TK tiền (*)": line["TK Coù"],
            "ĐVT":"",
            "Số lượng": line["S.Löôïng"],
            "Đơn giá": lodash.isNumber(line["S.Löôïng"]) && line["S.Löôïng"] > 0 ?  line["Soá tieàn"] / line["S.Löôïng"] : "",
            "Thành tiền": line["Soá tieàn"],
            "Thành tiền quy đổi": lodash.isNumber(line["Tyû giaù"]) ? line["Soá tieàn"] * line["Tyû giaù"] : 0,
            "Tỷ lệ CK (%)":0,
            "Tiền chiết khấu":0,
            "Tiền chiết khấu quy đổi":0,
            "Mã đối tượng":"",
            "Phí hàng về kho/Chi phí mua hàng": "",
            "Mã khoản mục chi phí":"",
            "Mã đơn vị":"",
            "Mã đối tượng THCP":"",
            "Mã công trình":"",
            "Số đơn đặt hàng":"",
            "Số đơn mua hàng":"",
            "Số hợp đồng mua":"",
            "Số hợp đồng bán":"",
            "Mã thống kê":"",
            "Số khế ước đi vay":"",
            "Số khế ước cho vay":"",
            "CP không hợp lý": line["TK Nôï"].toString().toUpperCase().includes("K") ? "Coù" : "Khoâng",
            "% thuế GTGT": taxLine.length === 0? "KCT" : taxLine[0]["TS %"],
            "% thuế suất KHAC": "",
            "Tiền thuế GTGT": taxLine.length === 0 ? 0 : taxLine[0]["Soá tieàn"],
            "Tiền thuế GTGT quy đổi": taxLine.length === 0 ? 0 : lodash.isNumber(line["Tyû giaù"]) ? taxLine[0]["Soá tieàn"] : taxLine[0]["Soá tieàn"] * line["Tyû giaù"],
            "TK thuế GTGT": taxLine.length === 0 ? "" : taxLine[0]["TK Nôï"],
            "Mẫu số HĐ":1,
            "Ký hiệu HĐ": line["Kyù hieäu"].slice(1),
            "Số hóa đơn": line["Soá HÑ"],
            "Ngày hóa đơn": excelDateToJSDate(line["Ngaøy HÑ"]),
            "Nhóm HHDV mua vào": "",
            "Mã NCC": ["111","112"].some((i) => line["TK Coù"].startsWith(i)) ? "" : line["C.Tieát Coù"],	
            "Tên NCC":["111","112"].some((i) => line["TK Coù"].startsWith(i)) ? "" : line["Ñoái töôïng (ghi chuù)"],	
            "Mã số thuế NCC": line["Maõ Thueá"],
            "Địa chỉ NCC":"",
        }

    })

    return processedData;
}