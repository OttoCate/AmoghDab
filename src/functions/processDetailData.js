import lodash from 'lodash'
import { excelDateToJSDate } from './convertToDate.js'
import ISaleProduct from '../source/NJSC/danhMucSanPham.json'

const checkIsaleProductCode = (productCode) => {
  return (
    [...ISaleProduct].find(
      (i) => i['Tªn t¾t'] === productCode?.trim()?.slice(1)?.trim()
    )?.['M· hµng (KT)'] || ''
  )
}

const checkTaxType = (line) => {
  if (line['TK Coù'] === '1331') return 'Giaûm thueá ñaàu vaøo'
  if (line['TK Coù'] === '33311') return 'Taêng thueá ñaàu ra'
  if (line['TK Nôï'] === '1331') return 'Taêng thueá ñaàu vaøo'
  if (line['TK Nôï'] === '33311') return 'Giaûm thueá ñaàu ra'
  return ''
}

export const processDataMDVDTT = (data, originalData, software) => {
  const processedData = data.map((line) => {
    const taxLine = [...originalData].filter((i) => {
      if (
        i['CTGS'] === line['CTGS'] &&
        i['Soá phieáu'] === line['Soá phieáu'] &&
        i['Soá HÑ'] === line['Soá HÑ'] &&
        i['Ngaøy HÑ'] === line['Ngaøy HÑ'] &&
        i['TK Nôï']?.toString().startsWith('133')
      ) {
        return true
      } else {
        return false
      }
    })

    return {
      'Phương thức thanh toán': line['TK Coù'].startsWith('111')
        ? 'Tieàn maët'
        : line['TK Coù'].startsWith('112')
        ? 'UÛy nhieäm chi'
        : 'Chöa thanh toaùn',
      'Nhận kèm hóa đơn': 'Nhaän keøm hoùa ñôn',
      'Là CP mua hàng': '',
      'Ngày hạch toán (*)': excelDateToJSDate(line['Ngaøy GS']),
      'Ngày chứng từ (*)': excelDateToJSDate(line['Ngaøy GS']),
      'Số chứng từ (*)': line['CTGS'] + '-' + line['Soá phieáu'],
      'Số tài khoản chi': '',
      'Tên ngân hàng chi': '',
      'Nhà cung cấp': ['111', '112'].some((i) => line['TK Coù'].startsWith(i))
        ? ''
        : line['Ñoái töôïng (ghi chuù)'],
      'Địa chỉ': '',
      'Diễn giải/Lý do chi/Nội dung thanh toán': line['Dieãn giaûi'],
      'Số tài khoản nhận': '',
      'Tên ngân hàng nhận': '',
      'Mã nhân viên mua hàng': '',
      'Hạn thanh toán': '',
      'Loại tiền': '',
      'Tỷ giá': lodash.isNumber(line['Tyû giaù']) ? line['Tyû giaù'] : '',
      'Mã dịch vụ (*)': line['C.Tieát Nôï'],
      'Tên dịch vụ': '',
      'Là dòng ghi chú': '',
      'TK kho/TK chi phí (*)': line['TK Nôï'],
      'TK công nợ/TK tiền (*)': line['TK Coù'],
      'Mã đối tượng': '',
      ĐVT: '',
      'Số lượng': line['S.Löôïng'],
      'Đơn giá':
        lodash.isNumber(line['S.Löôïng']) && line['S.Löôïng'] > 0
          ? line['Soá tieàn'] / line['S.Löôïng']
          : line['Soá tieàn'],
      'Thành tiền': line['Soá tieàn'],
      'Thành tiền quy đổi': lodash.isNumber(line['Tyû giaù'])
        ? line['Soá tieàn'] * line['Tyû giaù']
        : line['Soá tieàn'],
      'Tỷ lệ CK (%)': 0,
      'Tiền chiết khấu': 0,
      'Tiền chiết khấu quy đổi': 0,
      'Mã khoản mục chi phí': '',
      'Mã đơn vị': '',
      'Mã đối tượng THCP': '',
      'Mã công trình': '',
      'Số đơn đặt hàng': '',
      'Số hợp đồng mua': '',
      'Số hợp đồng bán': '',
      'Mã thống kê': '',
      'Số khế ước đi vay': '',
      'Số khế ước cho vay': '',
      'CP không hợp lý':
        line['TK Nôï']?.toString().toUpperCase().includes('K') ||
        line['TK Coù']?.toString().toUpperCase().includes('K')
          ? 'Coù'
          : 'Khoâng',
      '% thuế GTGT': taxLine.length === 0 ? '' : taxLine[0]['TS %'],
      '% thuế suất KHAC': '',
      'Tiền thuế GTGT':
        taxLine.length === 0
          ? 0
          : lodash.isNumber(taxLine[0]['TS %'])
          ? Math.round((line['Soá tieàn'] * taxLine[0]['TS %']) / 100)
          : 0,
      'Tiền thuế GTGT quy đổi':
        taxLine.length === 0 ||
        (taxLine.length > 0 && !lodash.isNumber(taxLine[0]['TS %']))
          ? 0
          : !lodash.isNumber(line['Tyû giaù'])
          ? Math.round((line['Soá tieàn'] * taxLine[0]['TS %']) / 100)
          : Math.round(
              (line['Soá tieàn'] * taxLine[0]['TS %'] * line['Tyû giaù']) / 100
            ),
      'TK thuế GTGT': taxLine.length === 0 ? '' : taxLine[0]['TK Nôï'],
      'Ngày hóa đơn': excelDateToJSDate(line['Ngaøy HÑ']),
      'Số hóa đơn': line['Soá HÑ'],
      'Mẫu số HĐ': 1,
      'Ký hiệu HĐ': line['Kyù hieäu']?.slice(1),
      'Nhóm HHDV mua vào': '',
      'Mã NCC': ['111', '112'].some((i) => line['TK Coù'].startsWith(i))
        ? ''
        : line['C.Tieát Coù'],
      'Tên NCC': ['111', '112'].some((i) => line['TK Coù'].startsWith(i))
        ? ''
        : line['Ñoái töôïng (ghi chuù)'],
      'Mã số thuế NCC': line['Maõ Thueá'],
      'Địa chỉ NCC': '',
    }
  })

  return processedData
}

export const processDataMHTNNHD = (data, originalData, software) => {
  const processedData = data.map((line) => {
    const taxLine = [...originalData].filter((i) => {
      if (
        i['CTGS'] === line['CTGS'] &&
        i['Soá phieáu'] === line['Soá phieáu'] &&
        i['Soá HÑ'] === line['Soá HÑ'] &&
        i['Ngaøy HÑ'] === line['Ngaøy HÑ'] &&
        i['TK Nôï']?.toString().startsWith('133')
      ) {
        return true
      } else {
        return false
      }
    })

    return {
      'Hình thức mua hàng': line['TK Nôï'].startsWith('15')
        ? 'Mua haøng trong nöôùc nhaäp kho'
        : 'Mua haøng trong nöôùc khoâng qua kho',
      'Phương thức thanh toán': line['TK Coù'].startsWith('111')
        ? 'Tieàn maët'
        : line['TK Coù'].startsWith('112')
        ? 'UÛy nhieäm chi'
        : 'Chöa thanh toaùn',
      'Ngày hạch toán (*)': excelDateToJSDate(line['Ngaøy GS']),
      'Ngày chứng từ (*)': excelDateToJSDate(line['Ngaøy GS']),
      'Số phiếu nhập (*)': line['CTGS'] + '-' + line['Soá phieáu'],
      'Số chứng từ ghi nợ/Số chứng từ thanh toán': '',
      'Người giao hàng': '',
      'Địa chỉ': '',
      'Diễn giải': line['Dieãn giaûi'],
      'Mã nhân viên mua hàng': '',
      'Số lượng chứng từ kèm theo': '',
      'Số tài khoản chi': '',
      'Tên ngân hàng chi': '',
      'Số tài khoản nhận': '',
      'Tên ngân hàng nhận': '',
      'Lý do chi/nội dung thanh toán': '',
      'Loại tiền': '',
      'Tỷ giá': lodash.isNumber(line['Tyû giaù']) ? line['Tyû giaù'] : '',
      'Mã hàng (*)': line['C.Tieát Nôï'],
      'Tên hàng': '',
      'Là dòng ghi chú': '',
      'Mã kho': line['kho nôï'],
      'Hàng hóa giữ hộ/bán hộ': '',
      'TK kho/TK chi phí (*)': line['TK Nôï'],
      'TK công nợ/TK tiền (*)': line['TK Coù'],
      ĐVT: '',
      'Số lượng': line['S.Löôïng'],
      'Đơn giá':
        lodash.isNumber(line['S.Löôïng']) && line['S.Löôïng'] > 0
          ? line['Soá tieàn'] / line['S.Löôïng']
          : line['Soá tieàn'],
      'Thành tiền': line['Soá tieàn'],
      'Thành tiền quy đổi': lodash.isNumber(line['Tyû giaù'])
        ? line['Soá tieàn'] * line['Tyû giaù']
        : line['Soá tieàn'],
      'Tỷ lệ CK (%)': 0,
      'Tiền chiết khấu': 0,
      'Tiền chiết khấu quy đổi': 0,
      'Mã đối tượng': '',
      'Phí hàng về kho/Chi phí mua hàng': '',
      'Mã khoản mục chi phí': '',
      'Mã đơn vị': '',
      'Mã đối tượng THCP': '',
      'Mã công trình': '',
      'Số đơn đặt hàng': '',
      'Số đơn mua hàng': '',
      'Số hợp đồng mua': '',
      'Số hợp đồng bán': '',
      'Mã thống kê': '',
      'Số khế ước đi vay': '',
      'Số khế ước cho vay': '',
      'CP không hợp lý':
        line['TK Nôï']?.toString().toUpperCase().includes('K') ||
        line['TK Coù']?.toString().toUpperCase().includes('K')
          ? 'Coù'
          : 'Khoâng',
      '% thuế GTGT': taxLine.length === 0 ? '' : taxLine[0]['TS %'],
      '% thuế suất KHAC': '',
      'Tiền thuế GTGT':
        taxLine.length === 0
          ? 0
          : lodash.isNumber(taxLine[0]['TS %'])
          ? Math.round((line['Soá tieàn'] * taxLine[0]['TS %']) / 100)
          : 0,
      'Tiền thuế GTGT quy đổi':
        taxLine.length === 0 ||
        (taxLine.length > 0 && !lodash.isNumber(taxLine[0]['TS %']))
          ? 0
          : !lodash.isNumber(line['Tyû giaù'])
          ? Math.round((line['Soá tieàn'] * taxLine[0]['TS %']) / 100)
          : Math.round(
              (line['Soá tieàn'] * taxLine[0]['TS %'] * line['Tyû giaù']) / 100
            ),
      'TK thuế GTGT': taxLine.length === 0 ? '' : taxLine[0]['TK Nôï'],
      'Mẫu số HĐ': 1,
      'Ký hiệu HĐ': line['Kyù hieäu']?.slice(1),
      'Số hóa đơn': line['Soá HÑ'],
      'Ngày hóa đơn': excelDateToJSDate(line['Ngaøy HÑ']),
      'Nhóm HHDV mua vào': '',
      'Mã NCC': ['111', '112'].some((i) => line['TK Coù'].startsWith(i))
        ? ''
        : line['C.Tieát Coù'],
      'Tên NCC': ['111', '112'].some((i) => line['TK Coù'].startsWith(i))
        ? ''
        : line['Ñoái töôïng (ghi chuù)'],
      'Mã số thuế NCC': line['Maõ Thueá'],
      'Địa chỉ NCC': '',
    }
  })

  return processedData
}

export const processDataBDVDTT = (data, originalData, software) => {
  const processedData = data.map((line) => {
    const taxLine =
      software !== 'isale'
        ? [...originalData].filter((i) => {
            if (
              i['CTGS'] === line['CTGS'] &&
              i['Soá phieáu'] === line['Soá phieáu'] &&
              i['Soá HÑ'] === line['Soá HÑ'] &&
              i['Ngaøy HÑ'] === line['Ngaøy HÑ'] &&
              i['TK Coù']?.toString().startsWith('33311')
            ) {
              return true
            } else {
              return false
            }
          })
        : []

    let soChungTu =
      line['Document ID'] || line['CTGS'] + '-' + line['Soá phieáu']
    let TKNo = line['TK Nôï'] || line['RecvAcctID'] || ''
    let TKCo = line['TK Coù'] || line['IncomeAcctID'] || ''
    let NgayGS = line['Document Date'] || excelDateToJSDate(line['Ngaøy GS'])
    let NgayHD = line['InvoiceDate'] || excelDateToJSDate(line['Ngaøy HÑ'])
    let KyHieuHD = line['Kyù hieäu']?.slice(1) || line['InvSeriNo']
    let SoHD = line['Soá HÑ'] || line['InvoiceNo']
    let mst = line['Maõ Thueá'] || line['CustVATID']
    let custonerName = line['Ñoái töôïng (ghi chuù)'] || line['CustName']
    let customerAddress = line['CustAddr'] || ''
    let dienGiai = line['Dieãn giaûi'] || ''
    let loaiTien = line['Currency ID'] || ''
    let tyGia = line['Tyû giaù'] || line['Rate Of Exchange']
    let tenHang = line['TenHang'] || ''
    let maHang = line['C.Tieát Coù'] || checkIsaleProductCode(line['Item ID'])
    let soLuong = line['S.Löôïng'] || line['Quantity']
    let donGia =
      line['Unit Price'] ||
      (lodash.isNumber(soLuong) && soLuong > 0
        ? line['Soá tieàn'] / soLuong
        : line['Soá tieàn'])
    let thanhTien = line['Soá tieàn'] || soLuong * donGia
    let dvt = line['UOM'] || ''
    let TKThue =
      line['OutVATAcctID'] || (taxLine.length === 0 ? '' : taxLine[0]['TK Coù'])
    let taxPercent = line['VAT Amount']
      ? Math.round((line['VAT Amount'] * 100) / thanhTien)
      : taxLine.length === 0
      ? ''
      : taxLine[0]['TS %']
    let taxAmount =
      line['VAT Amount'] ||
      (taxLine.length === 0
        ? 0
        : lodash.isNumber(taxLine[0]['TS %'])
        ? Math.round((thanhTien * taxLine[0]['TS %']) / 100)
        : 0)
    let taxAmountQuyDoi = line['VAT Amount']
      ? line['VAT Amount'] * tyGia
      : taxLine.length === 0 ||
        (taxLine.length > 0 && !lodash.isNumber(taxLine[0]['TS %']))
      ? 0
      : !lodash.isNumber(tyGia)
      ? Math.round((thanhTien * taxLine[0]['TS %']) / 100)
      : Math.round((thanhTien * taxLine[0]['TS %'] * tyGia) / 100)

    return {
      'Phương thức thanh toán': TKNo.startsWith('111')
        ? 'Thu tieàn ngay - Tieàn maët'
        : TKNo.startsWith('112')
        ? 'Thu tieàn ngay - Chuyeån khoaûn'
        : 'Chöa thu tieàn',
      'Lập kèm hóa đơn': 'Coù',
      'Đã lập hóa đơn': 'Đaõ laäp',
      'Ngày hạch toán (*)': NgayGS,
      'Ngày chứng từ (*)': NgayGS,
      'Số chứng từ (*)': soChungTu,
      'Mẫu số HĐ': 1,
      'Ký hiệu HĐ': KyHieuHD,
      'Số hóa đơn': SoHD,
      'Ngày hóa đơn': NgayHD,
      'Mã khách hàng': line['C.Tieát Nôï'] || '',
      'Tên khách hàng': custonerName,
      'Địa chỉ': customerAddress,
      'Mã số thuế': mst,
      'Người nộp': '',
      'Nộp vào TK': '',
      'Tên ngân hàng': '',
      'Diễn giải/Lý do nộp': dienGiai,
      'Mã nhân viên bán hàng': '',
      'Hạn thanh toán': '',
      'Số chứng từ kèm theo (Phiếu thu)': '',
      'Loại tiền': loaiTien,
      'Tỷ giá': lodash.isNumber(tyGia) ? tyGia : '',
      'Mã dịch vụ (*)': maHang,
      'Tên dịch vụ': tenHang,
      'Là dòng ghi chú': '',
      'Hàng khuyến mại': '',
      'TK Tiền/Chi phí/Nợ (*)': TKNo,
      'TK Doanh thu/Có (*)': TKCo,
      ĐVT: dvt,
      'Số lượng': !soLuong || soLuong?.toString() === '0' ? 1 : soLuong,
      'Đơn giá': donGia,
      'Thành tiền': thanhTien,
      'Thành tiền quy đổi': lodash.isNumber(tyGia)
        ? thanhTien * tyGia
        : thanhTien,
      'Tỷ lệ CK (%)': 0,
      'Tiền chiết khấu': 0,
      'Tiền chiết khấu quy đổi': 0,
      'TK chiết khấu': '',
      '% thuế GTGT': taxPercent,
      '% thuế suất KHAC': '',
      'Tiền thuế GTGT': taxAmount,
      'Tiền thuế GTGT quy đổi': taxAmountQuyDoi,
      'TK thuế GTGT': TKThue,
      'HH không TH trên tờ khai thuế GTGT': '',
      'Mã khoản mục chi phí': '',
      'Mã đơn vị': '',
      'Mã đối tượng THCP': '',
      'Mã công trình': '',
      'Số đơn đặt hàng': '',
      'Số hợp đồng bán': '',
      'Mã thống kê': '',
      'Số khế ước cho vay': '',
      'CP không hợp lý':
        TKNo?.toString().toUpperCase().includes('K') ||
        TKCo?.toString().toUpperCase().includes('K')
          ? 'Coù'
          : 'Khoâng',
    }
  })

  return processedData
}

export const processDataBHDTT = (data, originalData, software) => {
  const processedData = data.map((line) => {
    const taxLine =
      software !== 'isale'
        ? [...originalData].filter((i) => {
            if (
              i['CTGS'] === line['CTGS'] &&
              i['Soá phieáu'] === line['Soá phieáu'] &&
              i['Soá HÑ'] === line['Soá HÑ'] &&
              i['Ngaøy HÑ'] === line['Ngaøy HÑ'] &&
              i['TK Coù']?.toString().startsWith('33311')
            ) {
              return true
            } else {
              return false
            }
          })
        : []

    let soChungTu =
      line['Document ID'] || line['CTGS'] + '-' + line['Soá phieáu']
    let TKNo = line['TK Nôï'] || line['RecvAcctID'] || ''
    let TKCo = line['TK Coù'] || line['IncomeAcctID'] || ''
    let NgayGS = line['Document Date'] || excelDateToJSDate(line['Ngaøy GS'])
    let NgayHD = line['InvoiceDate'] || excelDateToJSDate(line['Ngaøy HÑ'])
    let KyHieuHD = line['Kyù hieäu']?.slice(1) || line['InvSeriNo']
    let SoHD = line['Soá HÑ'] || line['InvoiceNo']
    let mst = line['Maõ Thueá'] || line['CustVATID']
    let custonerName = line['Ñoái töôïng (ghi chuù)'] || line['CustName']
    let customerAddress = line['CustAddr'] || ''
    let dienGiai = line['Dieãn giaûi'] || ''
    let loaiTien = line['Currency ID'] || ''
    let tyGia = line['Tyû giaù'] || line['Rate Of Exchange']
    let tenHang = line['TenHang'] || ''
    let maHang = line['C.Tieát Coù'] || checkIsaleProductCode(line['Item ID'])
    let soLuong = line['S.Löôïng'] || line['Quantity']
    let donGia =
      line['Unit Price'] ||
      (lodash.isNumber(soLuong) && soLuong > 0
        ? line['Soá tieàn'] / soLuong
        : line['Soá tieàn'])
    let thanhTien = line['Soá tieàn'] || soLuong * donGia
    let dvt = line['UOM'] || ''
    let TKThue =
      line['OutVATAcctID'] || (taxLine.length === 0 ? '' : taxLine[0]['TK Coù'])
    let taxPercent = line['VAT Amount']
      ? Math.round((line['VAT Amount'] * 100) / thanhTien)
      : taxLine.length === 0
      ? ''
      : taxLine[0]['TS %']
    let taxAmount =
      line['VAT Amount'] ||
      (taxLine.length === 0
        ? 0
        : lodash.isNumber(taxLine[0]['TS %'])
        ? Math.round((thanhTien * taxLine[0]['TS %']) / 100)
        : 0)
    let taxAmountQuyDoi = line['VAT Amount']
      ? line['VAT Amount'] * tyGia
      : taxLine.length === 0 ||
        (taxLine.length > 0 && !lodash.isNumber(taxLine[0]['TS %']))
      ? 0
      : !lodash.isNumber(tyGia)
      ? Math.round((thanhTien * taxLine[0]['TS %']) / 100)
      : Math.round((thanhTien * taxLine[0]['TS %'] * tyGia) / 100)

    return {
      'Hình thức bán hàng': 'Baùn haøng hoùa trong nöôùc',
      'Phương thức thanh toán': TKNo.startsWith('111')
        ? 'Thu tieàn ngay - Tieàn maët'
        : TKNo.startsWith('112')
        ? 'Thu tieàn ngay - Chuyeån khoaûn'
        : 'Chöa thu tieàn',
      'Kiêm phiếu xuất kho': 'Khoâng',
      'Lập kèm hóa đơn': 'Coù',
      'Đã lập hóa đơn': 'Đaõ laäp',
      'Ngày hạch toán (*)': NgayGS,
      'Ngày chứng từ (*)': NgayGS,
      'Số chứng từ (*)': soChungTu,
      'Số phiếu xuất': '',
      'Mẫu số HĐ': 1,
      'Ký hiệu HĐ': KyHieuHD,
      'Số hóa đơn': SoHD,
      'Ngày hóa đơn': NgayHD,
      'Mã khách hàng': line['C.Tieát Nôï'] || '',
      'Tên khách hàng': custonerName,
      'Địa chỉ': customerAddress,
      'Mã số thuế': mst,
      'Đơn vị giao đại lý': '',
      'Người nộp': '',
      'Nộp vào TK': '',
      'Tên ngân hàng': '',
      'Diễn giải/Lý do nộp': TKCo === '1562A' ? 'Phuï phí saân bay' : dienGiai,
      'Lý do xuất': dienGiai,
      'Mã nhân viên bán hàng': '',
      'Số chứng từ kèm theo (Phiếu thu)': '',
      'Số chứng từ kèm theo (Phiếu xuất)': '',
      'Hạn thanh toán': '',
      'Loại tiền': loaiTien,
      'Tỷ giá': lodash.isNumber(tyGia) ? tyGia : '',
      'Mã hàng (*)': maHang,
      'Thuộc combo': '',
      'Tên hàng': tenHang,
      'Là dòng ghi chú': '',
      'Hàng khuyến mại': '',
      'TK Tiền/Chi phí/Nợ (*)': TKNo,
      'TK Doanh thu/Có (*)': TKCo === '1562A' ? '1388' : TKCo,
      ĐVT: dvt,
      'Số lượng': !soLuong || soLuong?.toString() === '0' ? 1 : soLuong,
      'Đơn giá': donGia,
      'Thành tiền': thanhTien,
      'Thành tiền quy đổi': lodash.isNumber(tyGia)
        ? thanhTien * tyGia
        : thanhTien,
      'Tỷ lệ CK (%)': 0,
      'Tiền chiết khấu': 0,
      'Tiền chiết khấu quy đổi': 0,
      'TK chiết khấu': '',
      'Giá tính thuế XK': '',
      '% thuế xuất khẩu': '',
      'Tiền thuế xuất khẩu': '',
      'TK thuế xuất khẩu': '',
      '% thuế GTGT': TKCo === '1562A' ? 'KKKNT' : taxPercent,
      '% thuế suất KHAC': '',
      'Tiền thuế GTGT': taxAmount,
      'Tiền thuế GTGT quy đổi': taxAmountQuyDoi,
      'TK thuế GTGT': TKThue,
      'HH không TH trên tờ khai thuế GTGT': '',
      'Mã khoản mục chi phí': '',
      'Mã đơn vị': '',
      'Mã đối tượng THCP': '',
      'Mã công trình': '',
      'Số đơn đặt hàng': '',
      'Số hợp đồng bán': '',
      'Mã thống kê': '',
      'Số khế ước cho vay': '',
      'CP không hợp lý':
        TKNo?.toString().toUpperCase().includes('K') ||
        TKCo?.toString().toUpperCase().includes('K')
          ? 'Coù'
          : 'Khoâng',
      'Mã kho': '',
      'TK giá vốn': '',
      'TK Kho': '',
      'Đơn giá vốn': '',
      'Tiền vốn': '',
      'Hàng hóa giữ hộ/bán hộ': '',
    }
  })

  return processedData
}

export const processDataXKF = (data, originalData, software) => {
  const processedData = data.map((line) => {
    return {
      'Loại xuất kho': ['154', '62'].some((i) => line['TK Nôï'].startsWith(i))
        ? 'Xuaát kho saûn xuaát'
        : ['632'].some((i) => line['TK Nôï'].startsWith(i))
        ? 'Xuaát kho baùn haøng'
        : 'Xuaát kho khaùc',
      'Ngày hạch toán (*)': excelDateToJSDate(line['Ngaøy GS']),
      'Ngày chứng từ (*)': excelDateToJSDate(line['Ngaøy GS']),
      'Số chứng từ (*)': line['CTGS'] + '-' + line['Soá phieáu'],
      'Mã đối tượng': line['C.Tieát Nôï'],
      'Tên đối tượng': line['Ñoái töôïng (ghi chuù)'],
      'Địa chỉ/Bộ phận': '',
      'Người nhận': '',
      'Lý do xuất': line['Dieãn giaûi'],
      'Mã nhân viên bán hàng': '',
      'Số chứng từ kèm theo': '',
      'Mã hàng (*)': line['C.Tieát Coù'],
      'Tên hàng': '',
      'Là dòng ghi chú': '',
      'Hàng khuyến mại': 'khoâng',
      'Mã kho': line['kho coù'],
      'Hàng hóa giữ hộ/bán hộ': '',
      'TK Nợ (*)': line['TK Nôï'],
      'TK Có (*)': line['TK Coù'],
      ĐVT: '',
      'Số lượng': line['S.Löôïng'],
      'Đơn giá':
        lodash.isNumber(line['S.Löôïng']) && line['S.Löôïng'] > 0
          ? line['Soá tieàn'] / line['S.Löôïng']
          : line['Soá tieàn'],
      'Thành tiền': line['Soá tieàn'],
      'Số lệnh sản xuất': '',
      'Mã khoản mục chi phí': '',
      'Mã đơn vị': '',
      'Mã đối tượng THCP': '',
      'Mã công trình': '',
      'Số đơn đặt hàng': '',
      'Số hợp đồng mua': '',
      'Số hợp đồng bán': '',
      'Mã thống kê': '',
      'CP không hợp lý':
        line['TK Nôï']?.toString().toUpperCase().includes('K') ||
        line['TK Coù']?.toString().toUpperCase().includes('K')
          ? 'Coù'
          : 'Khoâng',
    }
  })

  return processedData
}

export const processNKF = (data, originalData, software) => {
  const processedData = data.map((line) => {
    return {
      'Loại nhập kho': ['154', '62'].some((i) => line['TK Coù'].startsWith(i))
        ? 'Nhaäp kho thaønh phaåm saûn xuaát'
        : ['632'].some((i) => line['TK Coù'].startsWith(i))
        ? 'Nhaäp kho haøng baùn traû laïi'
        : 'Nhaäp kho khaùc',
      'Ngày hạch toán (*)': excelDateToJSDate(line['Ngaøy GS']),
      'Ngày chứng từ (*)': excelDateToJSDate(line['Ngaøy GS']),
      'Số chứng từ (*)': line['CTGS'] + '-' + line['Soá phieáu'],
      'Mã đối tượng': line['C.Tieát Coù'],
      'Tên đối tượng': line['Ñoái töôïng (ghi chuù)'],
      'Địa chỉ': '',
      'Người giao': '',
      'Diễn giải': line['Dieãn giaûi'],
      'Mã nhân viên bán hàng': '',
      'Số chứng từ kèm theo': '',
      'Mã hàng (*)': line['C.Tieát Nôï'],
      'Tên hàng': '',
      'Là dòng ghi chú': '',
      'Hàng khuyến mại': 'khoâng',
      'Mã kho': line['kho nôï'],
      'Hàng hóa giữ hộ/bán hộ': '',
      'TK Nợ (*)': line['TK Nôï'],
      'TK Có (*)': line['TK Coù'],
      ĐVT: '',
      'Số lượng': line['S.Löôïng'],
      'Đơn giá':
        lodash.isNumber(line['S.Löôïng']) && line['S.Löôïng'] > 0
          ? line['Soá tieàn'] / line['S.Löôïng']
          : line['Soá tieàn'],
      'Thành tiền': line['Soá tieàn'],
      'Số lệnh sản xuất': '',
      'Mã khoản mục chi phí': '',
      'Mã đơn vị': '',
      'Mã đối tượng THCP': '',
      'Mã công trình': '',
      'Số đơn đặt hàng': '',
      'Số hợp đồng mua': '',
      'Số hợp đồng bán': '',
      'Mã thống kê': '',
      'CP không hợp lý':
        line['TK Coù']?.toString().toUpperCase().includes('K') ||
        line['TK Nôï']?.toString().toUpperCase().includes('K')
          ? 'Coù'
          : 'Khoâng',
    }
  })

  return processedData
}

export const processNVK = (data, originalData, software) => {
  const processedData = data.map((line) => {
    const taxLine = [...originalData].filter((i) => {
      if (
        i['CTGS'] === line['CTGS'] &&
        i['Soá phieáu'] === line['Soá phieáu'] &&
        i['Soá HÑ'] === line['Soá HÑ'] &&
        i['Ngaøy HÑ'] === line['Ngaøy HÑ'] &&
        (i['TK Coù']?.toString().startsWith('33311') ||
          i['TK Nôï']?.toString().startsWith('33311') ||
          i['TK Coù']?.toString().startsWith('1331') ||
          i['TK Nôï']?.toString().startsWith('1331'))
      ) {
        return true
      } else {
        return false
      }
    })

    return {
      'Ngày chứng từ (*)': excelDateToJSDate(line['Ngaøy GS']),
      'Ngày hạch toán (*)': excelDateToJSDate(line['Ngaøy GS']),
      'Số chứng từ (*)': line['CTGS'] + '-' + line['Soá phieáu'],
      'Diễn giải': line['Dieãn giaûi'],
      'Loại nghiệp vụ':
        line['TK Nôï'].startsWith('911') || line['TK Coù'].startsWith('911')
          ? 'Keát chuyeån TK 911'
          : '',
      'Hạn thanh toán': '',
      'Loại tiền': '',
      'Tỷ giá': lodash.isNumber(line['Tyû giaù']) ? line['Tyû giaù'] : '',
      'Diễn giải (Hạch toán)': line['Dieãn giaûi'],
      'TK Nợ (*)': line['TK Nôï'],
      'TK Có (*)': line['TK Coù'],
      'Số tiền': line['Soá tieàn'],
      'Số tiền quy đổi': lodash.isNumber(line['Tyû giaù'])
        ? line['Soá tieàn'] * line['Tyû giaù']
        : line['Soá tieàn'],
      'Mã đối tượng Nợ': line['C.Tieát Nôï'],
      'Mã đối tượng Có': line['C.Tieát Coù'],
      'Nghiệp vụ': '',
      'Mã nhân viên': '',
      'Số TK ngân hàng': '',
      'Tên ngân hàng': '',
      'Số khế ước đi vay': '',
      'Số khế ước cho vay': '',
      'Mã khoản mục chi phí': '',
      'Mã đơn vị': '',
      'Mã đối tượng THCP': '',
      'Mã công trình': '',
      'Số đơn đặt hàng': '',
      'Số đơn mua hàng': '',
      'Số hợp đồng mua': '',
      'Số hợp đồng bán': '',
      'Mã thống kê': '',
      'CP không hợp lý':
        line['TK Nôï']?.toString().toUpperCase().includes('K') ||
        line['TK Coù']?.toString().toUpperCase().includes('K')
          ? 'Coù'
          : 'Khoâng',
      'Hạch toán gộp nhiều hóa đơn': 'Khoâng',
      'Diễn giải thuế': '',
      'Có hóa đơn': line['Soá HÑ'] ? 'Coù' : 'Khoâng',
      'Loại thuế': taxLine.length === 0 ? '' : checkTaxType(taxLine[0]),
      'Giá trị HHDV chưa thuế': line['Soá tieàn'],
      'Giá trị HHDV chưa thuế quy đổi': lodash.isNumber(line['Tyû giaù'])
        ? line['Soá tieàn'] * line['Tyû giaù']
        : line['Soá tieàn'],
      '% thuế GTGT': taxLine.length === 0 ? '' : taxLine[0]['TS %'],
      '% thuế suất KHAC': '',
      'Tiền thuế GTGT':
        taxLine.length === 0
          ? 0
          : lodash.isNumber(taxLine[0]['TS %'])
          ? Math.round((line['Soá tieàn'] * taxLine[0]['TS %']) / 100)
          : 0,
      'Tiền thuế GTGT quy đổi':
        taxLine.length === 0 ||
        (taxLine.length > 0 && !lodash.isNumber(taxLine[0]['TS %']))
          ? 0
          : !lodash.isNumber(line['Tyû giaù'])
          ? Math.round((line['Soá tieàn'] * taxLine[0]['TS %']) / 100)
          : Math.round(
              (line['Soá tieàn'] * taxLine[0]['TS %'] * line['Tyû giaù']) / 100
            ),
      'TK thuế GTGT':
        taxLine.length === 0
          ? ''
          : [taxLine[0]['TK Nôï'], taxLine[0]['TK Coù']].filter(
              (i) =>
                i?.toString().startsWith('1331') ||
                i?.toString().startsWith('33311')
            ).length > 0
          ? [taxLine[0]['TK Nôï'], taxLine[0]['TK Coù']].filter(
              (i) =>
                i?.toString().startsWith('1331') ||
                i?.toString().startsWith('33311')
            )[0]
          : '',
      'Ngày hóa đơn': excelDateToJSDate(line['Ngaøy HÑ']),
      'Số hóa đơn': line['Soá HÑ'],
      'Mẫu số HĐ': 1,
      'Ký hiệu HĐ': line['Kyù hieäu']?.slice(1),
      'Nhóm HHDV mua vào': '',
      'Mã đối tượng thuế': '',
      'Tên đối tượng thuế': '',
      'Mã số thuế đối tượng thuế': '',
    }
  })

  return processedData
}

export const processPTTG = (data, originalData, software) => {
  const processedData = data.map((line) => {
    return {
      'Ngày hạch toán (*)': excelDateToJSDate(line['Ngaøy GS']),
      'Ngày chứng từ (*)': excelDateToJSDate(line['Ngaøy GS']),
      'Số chứng từ (*)': line['CTGS'] + '-' + line['Soá phieáu'],
      'Mã đối tượng': line['C.Tieát Coù'],
      'Tên đối tượng': line['Ñoái töôïng (ghi chuù)'],
      'Địa chỉ': '',
      'Nộp vào TK': '',
      'Mở tại ngân hàng': '',
      'Lý do thu': line['Dieãn giaûi'],
      'Diễn giải lý do thu': line['Dieãn giaûi'],
      'Mã nhân viên thu': '',
      'Diễn giải (hạch toán)': line['Dieãn giaûi'],
      'TK Nợ (*)': line['TK Nôï'],
      'TK Có (*)': line['TK Coù'],
      'Số tiền': line['Soá tieàn'],
      'Mã đối tượng (hạch toán)': line['C.Tieát Coù'],
      'Số khế ước đi vay': '',
      'Số khế ước cho vay': '',
      'Mã khoản mục chi phí': '',
      'Mã đơn vị': '',
      'Mã đối tượng THCP': '',
      'Mã công trình': '',
      'Số đơn đặt hàng': '',
      'Số đơn mua hàng': '',
      'Số hợp đồng mua': '',
      'Số hợp đồng bán': '',
      'Mã thống kê': '',
      'CP không hợp lý': [line['TK Nôï'], line['TK Coù']].find((i) =>
        i.toString().toUpperCase().includes('K')
      )
        ? 'Coù'
        : 'Khoâng',
    }
  })

  return processedData
}

export const processPCTG = (data, originalData, software) => {
  const processedData = data.map((line) => {
    const taxLine = [...originalData].filter((i) => {
      if (
        i['CTGS'] === line['CTGS'] &&
        i['Soá phieáu'] === line['Soá phieáu'] &&
        i['Soá HÑ'] === line['Soá HÑ'] &&
        i['Ngaøy HÑ'] === line['Ngaøy HÑ'] &&
        (i['TK Coù']?.toString().startsWith('33311') ||
          i['TK Nôï']?.toString().startsWith('33311') ||
          i['TK Coù']?.toString().startsWith('1331') ||
          i['TK Nôï']?.toString().startsWith('1331'))
      ) {
        return true
      } else {
        return false
      }
    })

    return {
      'Phương thức thanh toán': line['TK Coù'].startsWith('112')
        ? 'UÛy nhieäm chi'
        : '',
      'Ngày hạch toán (*)': excelDateToJSDate(line['Ngaøy GS']),
      'Ngày chứng từ (*)': excelDateToJSDate(line['Ngaøy GS']),
      'Số chứng từ (*)': line['CTGS'] + '-' + line['Soá phieáu'],
      'Lý do chi': line['Dieãn giaûi'],
      'Nội dung thanh toán': line['Dieãn giaûi'],
      'Số tài khoản chi': '',
      'Tên tài khoản chi': '',
      'Mã đối tượng': line['C.Tieát Nôï'],
      'Tên đối tượng': line['Ñoái töôïng (ghi chuù)'],
      'Địa chỉ': '',
      'Số tài khoản nhận': '',
      'Tên ngân hàng nhận': '',
      'Người lĩnh tiền': '',
      'Số CMND': '',
      'Ngày cấp CMND': '',
      'Nơi cấp CMND': '',
      'Mã nhân viên': '',
      'Diễn giải (hạch toán)': line['Dieãn giaûi'],
      'TK Nợ (*)': line['TK Nôï'],
      'TK Có (*)': line['TK Coù'],
      'Số tiền': line['Soá tieàn'],
      'Mã đối tượng (hạch toán)': line['C.Tieát Nôï'],
      'Số khế ước đi vay': '',
      'Số khế ước cho vay': '',
      'Mã khoản mục chi phí': '',
      'Mã đơn vị': '',
      'Mã đối tượng THCP': '',
      'Mã công trình': '',
      'Số đơn đặt hàng': '',
      'Số đơn mua hàng': '',
      'Số hợp đồng mua': '',
      'Số hợp đồng bán': '',
      'Mã thống kê': '',
      'CP không hợp lý': [line['TK Nôï'], line['TK Coù']].find((i) =>
        i.toString().toUpperCase().includes('K')
      )
        ? 'Coù'
        : 'Khoâng',
      'Hạch toán gộp nhiều hóa đơn': 'Khoâng',
      'Diễn giải thuế': '',
      'Có hóa đơn': line['Soá HÑ'] ? 'Coù' : 'Khoâng',
      'Giá trị HHDV chưa thuế': line['Soá tieàn'],
      '% thuế GTGT': taxLine.length === 0 ? '' : taxLine[0]['TS %'],
      '% thuế suất KHAC': '',
      'Tiền thuế GTGT':
        taxLine.length === 0
          ? 0
          : lodash.isNumber(taxLine[0]['TS %'])
          ? Math.round((line['Soá tieàn'] * taxLine[0]['TS %']) / 100)
          : 0,
      'TK thuế GTGT':
        taxLine.length === 0
          ? ''
          : [taxLine[0]['TK Nôï'], taxLine[0]['TK Coù']].filter(
              (i) =>
                i?.toString().startsWith('1331') ||
                i?.toString().startsWith('33311')
            ).length > 0
          ? [taxLine[0]['TK Nôï'], taxLine[0]['TK Coù']].filter(
              (i) =>
                i?.toString().startsWith('1331') ||
                i?.toString().startsWith('33311')
            )[0]
          : '',
      'Ngày hóa đơn': excelDateToJSDate(line['Ngaøy HÑ']),
      'Số hóa đơn': line['Soá HÑ'],
      'Mẫu số HĐ': 1,
      'Ký hiệu HĐ': line['Kyù hieäu']?.slice(1),
      'Nhóm HHDV mua vào': '',
      'Mã NCC': '',
      'Tên NCC': '',
      'Mã số thuế NCC': line['Maõ Thueá'],
    }
  })

  return processedData
}

export const processPCTNB = (data, originalData, software) => {
  const processedData = data.map((line) => {
    return {
      'Ngày hạch toán (*)': excelDateToJSDate(line['Ngaøy GS']),
      'Ngày chứng từ (*)': excelDateToJSDate(line['Ngaøy GS']),
      'Số chứng từ (*)': line['CTGS'] + '-' + line['Soá phieáu'],
      'Số tài khoản đi (*)': line['C.Tieát Coù'],
      'Tên tài khoản đi': '',
      'Số tài khoản đến (*)': line['C.Tieát Nôï'],
      'Tên tài khoản đến': '',
      'Lý do chuyển': line['Dieãn giaûi'],
      'Loại tiền': '',
      'Tỷ giá': line['Tyû giaù'],
      'Diễn giải (hạch toán)': line['Dieãn giaûi'],
      'TK Nợ (*)': line['TK Nôï'],
      'TK Có (*)': line['TK Coù'],
      'Số tiền': line['Soá tieàn'],
      'Số tiền quy đổi': lodash.isNumber(line['Tyû giaù'])
        ? line['Soá tieàn'] * line['Tyû giaù']
        : line['Soá tieàn'],
      'Mã thống kê': '',
      'Số hợp đồng mua': '',
      'Mục thu/chi': '',
      'Số hợp đồng bán': '',
      'Mã công trình': '',
      'Mã khoản mục chi phí': '',
      'Mã đối tượng THCP': '',
      'Số đơn đặt hàng': '',
      'Số đơn mua hàng': '',
      'Mã đơn vị': '',
      'CP không hợp lý': [line['TK Nôï'], line['TK Coù']].find((i) =>
        i.toString().toUpperCase().includes('K')
      )
        ? 'Coù'
        : 'Khoâng',
    }
  })

  return processedData
}
