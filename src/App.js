import './App.css'
import { useState } from 'react'
import Dropzone from 'react-dropzone'
import * as FileSaver from 'file-saver'
import {
  validExcelFile,
  formSettings,
  softwareSource,
  rules,
  invoiceSymbolState,
  invoiceNumberState,
} from './globalVariables.js'
import styled from 'styled-components'
import excelLogo from './images/excel.png'
import enImg from './images/en.png'
import { transformFormSettingsToArray } from './functions/turnObjectToArray.js'
// eslint-disable-next-line import/no-webpack-loader-syntax
import DataProcessWorker from 'worker-loader!./workers/dataProcessor.worker.js'
import { Upload, Tooltip, Button, Switch, Select, Alert, Input } from 'antd'
import { MdOutlineContentPasteSearch } from 'react-icons/md'
import lodash from 'lodash'

function App() {
  const [dropState, setDropState] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [applyOveride, setApplyOverride] = useState(false)
  const [misaForm, setMisaForm] = useState('')
  const [ctgs, setCtgs] = useState('')
  const [software, setSoftware] = useState('asa')
  const [customDebits, setCustomDebits] = useState('')
  const [customCredits, setCustomCredits] = useState('')
  const [invoiceSymbol, setInvoiceSymbol] = useState('whatever')
  const [invoiceNumber, setInvoiceNumber] = useState('whatever')
  const [maxRowPerSheet, setMaxRowPerSheet] = useState(495)

  const handleProcessData = (data) => {
    const overrideInfo = {
      debits: customDebits,
      credits: customCredits,
      invoiceSymbol: invoiceSymbol,
      invoiceNumber: invoiceNumber,
    }
    const worker = new DataProcessWorker()
    worker.postMessage({
      data,
      misaForm,
      ctgs,
      software,
      applyOveride,
      overrideInfo,
      maxRowPerSheet,
    })
    worker.onmessage = (e) => {
      const { blob, fileName } = e.data
      FileSaver.saveAs(blob, fileName)
      worker.terminate()
      setIsProcessing(false)
    }
    worker.onerror = (err) => {
      console.error('Worker error:', err)
      worker.terminate()
      setIsProcessing(false)
    }
  }

  const handleCheckExclusiveData = (data) => {
    const worker = new Worker(
      new URL('./workers/exclusiveDataProcessor.worker.js', import.meta.url)
    )
    worker.postMessage({ data })
    worker.onmessage = (e) => {
      const { blob, fileName } = e.data
      FileSaver.saveAs(blob, fileName)
      worker.terminate()
      setIsProcessing(false)
    }
    worker.onerror = (err) => {
      console.error('Worker error:', err)
      worker.terminate()
      setIsProcessing(false)
    }
  }

  const getFormDataRules = () => {
    const ruleList = rules[misaForm] || []
    return (
      <div>
        <span>Hệ thống lấy những dòng thỏa điều kiện sau:</span>
        <ul style={{ paddingLeft: 15 }}>
          {ruleList.map((rule, index) => (
            <li key={index}>{rule}</li>
          ))}
        </ul>
      </div>
    )
  }

  const handleAddFile = async (file, isCheckingExclusive) => {
    try {
      if (!misaForm && !isCheckingExclusive)
        return alert('Vui lòng chỉ định mẫu form bạn muốn chuyển đổi dữ liệu')

      if (!software && !isCheckingExclusive)
        return alert('Vui lòng chỉ định dữ liệu đến từ phần mềm nào')

      if (applyOveride && (!customDebits || !customCredits))
        return alert('Vui lòng nhập đầy đủ thông tin muốn ghi đè')

      if (!lodash.isInteger(parseInt(maxRowPerSheet)))
        return alert('Số dòng tối đa mỗi sheet phải là số nguyên dương')

      const fileType = isCheckingExclusive ? file.type : file[0].type
      if (!validExcelFile.includes(fileType))
        return alert('File của bạn phải là excel')

      setIsProcessing(true)
      // Read file into ArrayBuffer
      const buffer = await new Promise((resolve, reject) => {
        const fileReader = new FileReader()
        fileReader.readAsArrayBuffer(isCheckingExclusive ? file : file[0])
        fileReader.onload = (e) => resolve(e.target.result)
        fileReader.onerror = (err) => reject(err)
      })

      // Create a worker from public directory
      const worker = new Worker(`${process.env.PUBLIC_URL}/excelWorker.js`)

      // Post the buffer to the worker
      worker.postMessage(buffer)

      // Handle response from the worker
      worker.onmessage = (e) => {
        const { success, data, error } = e.data

        if (success) {
          if (isCheckingExclusive) {
            handleCheckExclusiveData(data)
          } else {
            handleProcessData(data)
          }
        } else {
          alert('Lỗi xử lý file: ' + error)
        }

        worker.terminate()
      }

      // Handle worker errors
      worker.onerror = (err) => {
        console.error('Worker error:', err)
        alert('Đã xảy ra lỗi trong quá trình xử lý file.')
        worker.terminate()
      }
    } catch (error) {
      alert('Lỗi không xác định: ' + error.message)
      setIsProcessing(false)
    }
  }

  return (
    <Wrapper>
      <div className="sidebar">
        <div className="form-selection">
          <p style={{ fontSize: 14, lineHeight: '14px' }}>
            Bạn muốn chuyển đổi dữ liệu ra mẫu nào?{' '}
            <span style={{ color: 'red', fontWeight: 700 }}>*</span>
          </p>
          <Select
            showSearch
            className="sidebar-select"
            allowClear
            style={{ width: '100%' }}
            disabled={isProcessing}
            placeholder="Chọn một mẫu cần xuất"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            value={misaForm}
            onChange={(value) => {
              setMisaForm(value)
            }}
            options={transformFormSettingsToArray(formSettings)}
          />
        </div>
        <div className="form-selection">
          <p style={{ fontSize: 14, lineHeight: '14px' }}>
            Dữ liệu này đến từ phần mềm nào?{' '}
            <span style={{ color: 'red', fontWeight: 700 }}>*</span>
          </p>
          <Select
            showSearch
            className="sidebar-select"
            allowClear
            style={{ width: '100%' }}
            disabled={isProcessing}
            placeholder="Chọn phần mềm"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            value={software}
            onChange={(value) => {
              setSoftware(value)
            }}
            options={softwareSource}
          />
        </div>
        <div className="form-selection">
          <p style={{ fontSize: 14, lineHeight: '14px' }}>
            Bạn muốn lọc theo CTGS nào?
          </p>
          <Input
            style={{ width: '100%' }}
            disabled={isProcessing}
            onChange={(e) => setCtgs(e.target.value)}
          />
        </div>
        <div className="form-selection">
          <p style={{ fontSize: 14, lineHeight: '14px' }}>
            Bạn muốn mỗi sheet tối đa bao nhiêu dòng?
          </p>
          <Input
            style={{ width: '100%' }}
            value={maxRowPerSheet}
            disabled={isProcessing}
            inputMode="numeric"
            onChange={(e) => setMaxRowPerSheet(e.target.value)}
          />
        </div>
        <div className="form-selection">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginTop: 24,
            }}
          >
            <p style={{ fontSize: 14, lineHeight: '14px' }}>
              Bạn muốn ghi đè quy tắc lấy dữ liệu?
            </p>
            <Switch
              disabled={isProcessing}
              onChange={(checked) => setApplyOverride(checked)}
              value={applyOveride}
            />
          </div>
        </div>
        {applyOveride && (
          <div className="form-selection">
            <p style={{ fontSize: 14, lineHeight: '14px' }}>
              Danh sách tài khoản Nợ{' '}
              <span style={{ color: 'red', fontWeight: 700 }}>*</span>
            </p>
            <Input
              style={{ width: '100%' }}
              disabled={isProcessing}
              placeholder="111,112,6,7,811K"
              value={customDebits}
              onChange={(e) => setCustomDebits(e.target.value)}
            />
          </div>
        )}
        {applyOveride && (
          <div className="form-selection">
            <p style={{ fontSize: 14, lineHeight: '14px' }}>
              Danh sách tài khoản Có{' '}
              <span style={{ color: 'red', fontWeight: 700 }}>*</span>
            </p>
            <Input
              style={{ width: '100%' }}
              disabled={isProcessing}
              placeholder="338,4,62"
              value={customCredits}
              onChange={(e) => setCustomCredits(e.target.value)}
            />
          </div>
        )}
        {applyOveride && (
          <div className="form-selection">
            <p style={{ fontSize: 14, lineHeight: '14px' }}>
              Ký hiệu hóa đơn có bắt buộc?
            </p>
            <Select
              showSearch
              className="sidebar-select"
              style={{ width: '100%' }}
              disabled={isProcessing}
              placeholder="Chọn điều kiện cho ký hiệu hóa đơn"
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              value={invoiceSymbol}
              onChange={(value) => {
                setInvoiceSymbol(value)
              }}
              options={invoiceSymbolState}
            />
          </div>
        )}
        {applyOveride && (
          <div className="form-selection">
            <p style={{ fontSize: 14, lineHeight: '14px' }}>
              Số hóa đơn có bắt buộc?
            </p>
            <Select
              showSearch
              className="sidebar-select"
              style={{ width: '100%' }}
              disabled={isProcessing}
              placeholder="Chọn điều kiện cho ký hiệu hóa đơn"
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              value={invoiceNumber}
              onChange={(value) => {
                setInvoiceNumber(value)
              }}
              options={invoiceNumberState}
            />
          </div>
        )}
      </div>
      <div className="dropbox-container-wrapper">
        {misaForm && (
          <Alert
            style={{ position: 'absolute', top: 15, right: 15, width: 400 }}
            message={
              <span style={{ fontWeight: 700 }}>
                Quy tắc hệ thống lấy dữ liệu
              </span>
            }
            description={getFormDataRules()}
            type="info"
            closable
          />
        )}
        <div style={{ position: 'absolute', top: 15, left: 15 }}>
          <Upload
            disabled={isProcessing}
            multiple={false}
            beforeUpload={(file) => {
              handleAddFile(file, true)
              return false // Prevent upload
            }}
            showUploadList={false}
          >
            <Tooltip
              placement="bottom"
              title={
                'Dựa vào quy tắc lấy dữ liệu mặc định của hệ thống, hệ thống sẽ trả về danh sách các hạch toán không thỏa tất cả mẫu của MISA'
              }
              arrow={true}
            >
              <Button size="medium" icon={<MdOutlineContentPasteSearch />}>
                Kiểm tra loại trừ
              </Button>
            </Tooltip>
          </Upload>
        </div>
        <div className="dropbox-area-wrapper">
          {isProcessing ? (
            <div className="loading">
              <img alt="" src={enImg} />
              <div className="loader"></div>
            </div>
          ) : (
            <div className={`dropbox-area ${dropState === 2 && 'alert'}`}>
              <div
                className={`dropbox-spin ${dropState === 2 && 'alert'}`}
              ></div>
              <div className="dropbox-container">
                <Dropzone
                  multiple={false}
                  onDragOver={() => setDropState(2)}
                  onDropAccepted={() => setDropState(0)}
                  onDropRejected={() => setDropState(0)}
                  onDragLeave={() => setDropState(0)}
                  onFileDialogCancel={() => setDropState(0)}
                  onDrop={(acceptedFiles) =>
                    handleAddFile(acceptedFiles, false)
                  }
                >
                  {({ getRootProps, getInputProps }) => (
                    <section
                      className={`dropbox-wrapper ${
                        dropState === 2 && 'alert'
                      }`}
                    >
                      <div {...getRootProps()} className="dropbox">
                        <input
                          {...getInputProps()}
                          onClick={(event) => {
                            event.target.value = ''
                          }}
                        />
                        {dropState !== 2 ? (
                          <>
                            <div className={`dropbox-icon-wrapper`}>
                              <img alt="" src={excelLogo} />
                            </div>
                            <h3>File cần chuyển đổi</h3>
                            <small>hoặc kéo thả file vào</small>
                          </>
                        ) : (
                          <div className="dropbox-alert">
                            <h1>Thả vào!</h1>
                          </div>
                        )}
                      </div>
                    </section>
                  )}
                </Dropzone>
              </div>
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  )
}

export default App

const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  .sidebar {
    width: 350px;
    background: #fafafa;
    padding: 1.5rem;
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.15);
  }
  .dropbox-container-wrapper {
    flex: 1;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    flex-direction: column;
    .form-selection {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      height: 100px;
      .sidebar-select {
        width: 300px;
      }
    }
    .dropbox-area-wrapper {
      display: flex;
      height: 100%;
      justify-content: center;
      align-items: center;
      .loading {
        font-size: 1.5rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: center;
        img {
          height: 150px;
        }

        h4 {
          margin: 0;
          font-weight: 500;
        }
        .loader {
          width: fit-content;
          font-weight: bold;
          font-family: monospace;
          font-size: 24px;
          clip-path: inset(0 3ch 0 0);
          animation: l4 1.7s steps(4) infinite;
        }
        .loader:before {
          content: 'Đang xử lý...';
        }
        @keyframes l4 {
          to {
            clip-path: inset(0 -1ch 0 0);
          }
        }
      }
      @media (max-width: 350px) {
        width: 260px;
        height: 260px;
      }
      @media (max-width: 300px) {
        width: 240px;
        height: 240px;
      }
      .dropbox-area {
        width: 300px;
        height: 300px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;
        position: relative;
        padding: 0.75rem;
        .dropbox-spin {
          width: 250px;
          height: 250px;
          position: absolute;
          border-radius: 50%;
          border: 5px dashed #0d9ede;
          animation: spin 60s linear infinite;
          @media (max-height: 700px) {
            /* border-radius:0; */
            border: 4px dashed #0d9ede;
          }
          @media (max-height: 700px) and (max-width: 426px) {
            /* border-radius:0; */
            border: 4px dashed #0d9ede;
          }
          @-moz-keyframes spin {
            100% {
              -moz-transform: rotate(360deg);
            }
          }
          @-webkit-keyframes spin {
            100% {
              -webkit-transform: rotate(360deg);
            }
          }
          @keyframes spin {
            100% {
              -webkit-transform: rotate(360deg);
              transform: rotate(360deg);
            }
          }
        }
        .dropbox-spin.alert {
          width: 100%;
          height: 100%;
          position: absolute;
          border-radius: 50%;
          border: 5px dashed #0d9ede;
          animation: spin 10s linear infinite;
          @media (max-height: 700px) {
            /* border-radius:0; */
            border: 4px dashed #0d9ede;
          }
          @media (max-height: 700px) and (max-width: 426px) {
            /* border-radius:0; */
            border: 4px dashed #0d9ede;
          }
          @-moz-keyframes spin {
            100% {
              -moz-transform: rotate(360deg);
            }
          }
          @-webkit-keyframes spin {
            100% {
              -webkit-transform: rotate(360deg);
            }
          }
          @keyframes spin {
            100% {
              -webkit-transform: rotate(360deg);
              transform: rotate(360deg);
            }
          }
        }
        .dropbox-container {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          position: relative;
          border-radius: 50%;
          background: ${(props) => props.theme.primary};
          .dropbox-wrapper {
            width: 100%;
            border-radius: 50%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s;
            background: ${(props) => props.theme.dropboxBackground};
            :hover {
              background: ${(props) => props.theme.dropboxBackgroundWhenHover};
            }
            @media (max-height: 700px) {
              /* border-radius:0; */
            }

            @media (max-height: 700px) and (max-width: 426px) {
              /* border-radius:0; */
            }
            .dropbox {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-direction: column;
              @media (max-height: 550px) {
                padding: 0.5rem;
              }
              input {
                width: 100%;
                height: 100%;
              }

              .dropbox-alert {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                h1 {
                  margin: 0;
                  font-size: 2.5rem;
                  font-weight: 600;
                  text-align: center;
                  color: white;
                }
              }

              .dropbox-icon-wrapper {
                img {
                  width: 70px;
                  height: 70px;
                }
              }
              .dropbox-icon-wrapper.shake {
                position: relative;
                animation: shake 0.5s;
                animation-iteration-count: infinite;
                @keyframes shake {
                  0% {
                    transform: translate(1px, 1px) rotate(0deg);
                  }
                  10% {
                    transform: translate(-1px, -2px) rotate(-1deg);
                  }
                  20% {
                    transform: translate(-3px, 0px) rotate(1deg);
                  }
                  30% {
                    transform: translate(3px, 2px) rotate(0deg);
                  }
                  40% {
                    transform: translate(1px, -1px) rotate(1deg);
                  }
                  50% {
                    transform: translate(-1px, 2px) rotate(-1deg);
                  }
                  60% {
                    transform: translate(-3px, 1px) rotate(0deg);
                  }
                  70% {
                    transform: translate(3px, 1px) rotate(-1deg);
                  }
                  80% {
                    transform: translate(-1px, -1px) rotate(1deg);
                  }
                  90% {
                    transform: translate(1px, 2px) rotate(0deg);
                  }
                  100% {
                    transform: translate(1px, -2px) rotate(-1deg);
                  }
                }
              }
              h3 {
                margin: 0;
                font-size: 20px;
                color: ${(props) => props.theme.primary};
                font-weight: 500;
                text-align: center;
                @media (max-height: 550px) {
                  font-size: 16px;
                }
              }
              small {
                margin: 0;
                color: grey;
                font-size: 16px;
                color: ${(props) => props.theme.primary};
                text-align: center;
                @media (max-height: 550px) {
                  font-size: 14px;
                }
              }
            }
          }
          .dropbox-wrapper.alert {
            background: #0d9ede;
          }
        }
      }
      .dropbox-area.alert {
        position: relative;
        transform: scale(1.1);
      }
    }

    .analysis_form_wrapper {
      padding: 0rem 1.5rem;
      border-radius: 0.5rem;
      margin: 1rem 0 2rem;
      @media (max-width: 769px) {
        padding: 0 1.25rem;
      }
      .analysis_input {
        padding: 0.25rem 0;
        p {
          margin: 0;
          font-size: 1rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: ${(props) => props.theme.textColor};
        }
        input {
          width: 100%;
          font-size: 1rem;
          border-radius: 0.25rem;
          padding: 0.25rem 0.5rem;
          background: #f1f1f1;
        }
        select {
          width: 100%;
          font-size: 1rem;
          border-radius: 0.25rem;
          padding: 0.25rem 0.5rem;
          background: #f1f1f1;
        }
      }

      .start-btn {
        margin-top: 1rem;
        background-color: ${(props) => props.theme.textColor};
        padding: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s;
        border-radius: 0.5rem;
        position: relative;
        opacity: 1;
        :hover {
          opacity: 0.7;
        }
        span {
          font-weight: 500;
          font-size: 1.1rem;
          color: ${(props) => props.theme.primary};
        }
      }
    }

    h1 {
      margin: 0;
      margin-top: 1.5rem;
      font-size: 1.5rem;
      text-align: center;
      font-weight: 400;
      max-width: 80%;
      color: ${(props) => props.theme.textColor};
      @media (max-width: 350px) {
        font-size: 1rem;
      }
      @media (max-height: 550px) {
        margin-top: 0.5rem;
      }
      span {
        a {
          cursor: pointer;
          color: #0d9ede;
          text-decoration: none;
        }
        :hover {
          text-decoration: underline;
        }
      }
    }
  }
`
