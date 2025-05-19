import {
  processDataMDVDTT,
  processDataMHTNNHD,
  processDataBDVDTT,
  processDataBHDTT,
  processDataXKF,
  processNKF,
  processNVK,
  processPTTG,
  processPCTG,
  processPCTNB,
} from './functions/processDetailData'

export const validExcelFile = [
  '.csv',
  '.xlsx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
]

export const formSettings = {
  3: {
    debit: ['335', '6', '8'],
    credit: ['335', '331', '111', '112', '338'],
    invoiceRequired: false,
    isComplement: false,
    function: processDataMDVDTT,
    label: 'Mẫu mua dịch vụ đa tiền tệ',
  },

  4: {
    debit: ['15', '2', '64', '335', '62', '811'],
    credit: ['335', '331', '111', '112', '338', '336'],
    invoiceRequired: false,
    isComplement: false,
    function: processDataMHTNNHD,
    label: 'Mẫu mua hàng trong nước nhiều hóa đơn đa tiền tệ',
  },

  1: {
    debit: ['131', '111', '112', '138', '521'],
    credit: ['5113', '131'],
    invoiceRequired: true,
    isComplement: false,
    function: processDataBDVDTT,
    label: 'Mẫu bán dịch vụ đa tiền tệ',
  },

  2: {
    debit: ['131', '111', '112', '138', '521'],
    credit: ['5111', '5112', '1562A', '131', '138'],
    invoiceRequired: true,
    isComplement: false,
    function: processDataBHDTT,
    label: 'Mẫu bán hàng đa tiền tệ',
  },

  5: {
    debit: ['6', '8', '157', '154', '141'],
    credit: ['152', '153', '155', '156'],
    invoiceRequired: false,
    isComplement: false,
    function: processDataXKF,
    label: 'Mẫu xuất kho',
  },

  6: {
    debit: ['152', '153', '155', '156'],
    credit: ['6', '8', '157', '154', '141', '138', '335'],
    invoiceRequired: false,
    isComplement: false,
    function: processNKF,
    label: 'Mẫu nhập kho',
  },

  7: {
    debit: ['111', '112', '152', '153', '155', '156', '157', '133', '33311'],
    credit: ['33311', '133', '111', '112', '152', '153', '155', '156', '157'],
    invoiceRequired: false,
    isComplement: true,
    function: processNVK,
    label: 'Mẫu chứng từ nghiệp vụ khác đa tiền tệ',
  },

  8: {
    debit: ['111', '112'],
    credit: ['131', '138', '141', '331', '338', '5', '7'],
    invoiceRequired: false,
    isComplement: false,
    function: processPTTG,
    label: 'Mẫu phiếu thu tiền gửi',
  },

  9: {
    debit: [
      '131',
      '133',
      '138',
      '141',
      '331',
      '333',
      '334',
      '335',
      '338',
      '5',
      '6',
      '7',
      '8',
    ],
    credit: ['111', '112'],
    invoiceRequired: false,
    isComplement: false,
    function: processPCTG,
    label: 'Mẫu phiếu chi tiền gửi',
  },

  10: {
    debit: ['111', '112'],
    credit: ['111', '112'],
    invoiceRequired: false,
    isComplement: false,
    function: processPCTNB,
    label: 'Mẫu phiếu chuyển tiền nội bộ đa tiền tệ',
  },
}

export const softwareSource = [
  { value: 'asa', label: 'Phần mềm ASA' },
  { value: 'isale', label: 'ISale' },
]

export const rules = {
  1: [
    'TK Nợ thuộc nhóm (131,111,112,138,521)',
    'TK Có thuộc nhóm (5113,131)',
    'Cột số HĐ và ký hiệu HĐ có giá trị',
  ],
  2: [
    'TK Nợ thuộc nhóm (131,111,112,138,521)',
    'TK Có thuộc nhóm (5111,5112,131,138)',
    'Cột số HĐ và ký hiệu HĐ có giá trị',
  ],
  3: ['TK Nợ thuộc nhóm (335,6,8)', 'TK Có thuộc nhóm (335,331,111,112,338)'],
  4: [
    'TK Nợ thuộc nhóm (15,2,64,335,62,811)',
    'TK Có thuộc nhóm (335,331,111,112,338,336)',
  ],
  5: [
    'TK Nợ thuộc nhóm (6,8,157,154,141)',
    'TK Có thuộc nhóm (152,153,155,156)',
  ],
  6: [
    'TK Nợ thuộc nhóm (152,153,155,156)',
    'TK Có thuộc nhóm (6,8,157,154,141,138,335)',
  ],
  7: [
    'TK Nợ không thuộc nhóm (111,112,152,153,155,156,157,133,33311)',
    'TK Có không thuộc nhóm (111,112,152,153,155,156,157,133,33311)',
  ],
  8: [
    'TK Nợ thuộc nhóm (111,112)',
    'TK Có thuộc nhóm (131,138,141,331,338,5,7)',
  ],
  9: [
    'TK Nợ thuộc nhóm (131,133,138,141,331,333,334,335,338,5,6,7,8)',
    'TK Có thuộc nhóm (111,112)',
  ],
  10: ['TK Nợ thuộc nhóm (111,112)', 'TK Có thuộc nhóm (111,112)'],
}
