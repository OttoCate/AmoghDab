import './App.css';
import {useState} from 'react'
import Dropzone from 'react-dropzone'
import * as XLSX from 'xlsx'
import * as FileSaver from 'file-saver';
import {validExcelFile} from './validTypeOfFile.js';
import styled from 'styled-components';
import excelLogo from './images/excel.png';
import { Select } from 'antd';
import enImg from './images/en.png';

import {
  muaDichVuDaTienTe, 
  muaHangTrongNuocNhieuHD,
  banDichVuDaTienTe,
  banHangDaTienTe
} from './utils/processDataByFormType.js'

const formOptions = [
  { value: '1', label: 'Mẫu bán dịch vụ đa tiền tệ' },
  { value: '2', label: 'Mẫu bán hàng đa tiền tệ' },
  { value: '3', label: 'Mẫu mua dịch vụ đa tiền tệ' },
  { value: '4', label: 'Mẫu mua hàng trong nước đa tiền tệ' },
]

const companyOptions = [
  { value: 'dngrf', label: 'DNG-RF' },
]

function App() {
  const [dropState,setDropState] = useState(0);
  const [misaForm,setMisaForm] = useState("");
  const [company,setCompany] = useState("");
  const [isProcessing,setIsProcessing] = useState(false);
  
  const handleProcessData = (data)=>{
    setIsProcessing(false);
    
    let finalData = [];

    switch(misaForm){
      case "1":
        finalData = banDichVuDaTienTe(data,company);
        break;
      case "2":
        finalData = banHangDaTienTe(data,company);
        break;
      case "3":
        finalData = muaDichVuDaTienTe(data,company);
        break;
      case "4":
        finalData = muaHangTrongNuocNhieuHD(data,company);
        break;
    }

    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';
    const fileName = formOptions.find(i => i.value === misaForm)?.label || "Result"
    const ws = XLSX.utils.json_to_sheet(finalData);
    const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const result = new Blob([excelBuffer], {type: fileType});
    FileSaver.saveAs(result, fileName + fileExtension);
  }

  const handleAddFile = async (file) => {
    try {
      if (!misaForm) {
        alert("Vui lòng chỉ định mẫu form bạn muốn chuyển đổi dữ liệu");
        return;
      }

      if (!company) {
        alert("Vui lòng chỉ định công ty bạn muốn chuyển đổi dữ liệu");
        return;
      }
  
      if (!validExcelFile.includes(file[0].type)) {
        alert("File của bạn phải là excel");
        return;
      }
  
      setIsProcessing(true);
  
      // Read file into ArrayBuffer
      const buffer = await new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file[0]);
        fileReader.onload = (e) => resolve(e.target.result);
        fileReader.onerror = (err) => reject(err);
      });
  
      // Create a worker from public directory
      const worker = new Worker(`${process.env.PUBLIC_URL}/excelWorker.js`);
  
      // Post the buffer to the worker
      worker.postMessage(buffer);
  
      // Handle response from the worker
      worker.onmessage = (e) => {
        const { success, data, error } = e.data;
  
        if (success) {
          handleProcessData(data);
        } else {
          alert("Lỗi xử lý file: " + error);
        }
  
        setIsProcessing(false);
        worker.terminate();
      };
  
      // Handle worker errors
      worker.onerror = (err) => {
        console.error("Worker error:", err);
        alert("Đã xảy ra lỗi trong quá trình xử lý file.");
        setIsProcessing(false);
        worker.terminate();
      };
  
    } catch (error) {
      alert("Lỗi không xác định: " + error.message);
      setIsProcessing(false);
    }
  };

  return (
    <Wrapper>
      <div className="dropbox-container-wrapper">
        <div className='form-selection'>
          <p>Bạn muốn chuyển đổi dữ liệu ra mẫu nào?</p>
          <Select
            showSearch
            className="sidebar-select"
            allowClear
            disabled = {isProcessing}
            placeholder="Chọn một mẫu cần xuất"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            value = {misaForm}
            onChange = {(value)=>{setMisaForm(value)}}
            options={formOptions}
          />
        </div>
        <div className='form-selection'>
          <p>Dữ liệu này đến từ công ty nào?</p>
          <Select
            showSearch
            className="sidebar-select"
            allowClear
            disabled = {isProcessing}
            placeholder="Chọn công ty"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            value = {company}
            onChange = {(value)=>{setCompany(value)}}
            options={companyOptions}
          />
        </div>
        <div className="dropbox-area-wrapper">
          {
            isProcessing
            ?
            <div className="loading">
              <img alt="" src={enImg}/>
              <h4>Đang xử lý dữ liệu...</h4>
            </div>
            :
            <div className={`dropbox-area ${dropState === 2 && 'alert'}`}>
              <div className={`dropbox-spin ${dropState === 2 && 'alert'}`}></div>
              <div className="dropbox-container">
                <Dropzone 
                  multiple={false}
                  onDragOver={()=>setDropState(2)}
                  onDropAccepted={()=>setDropState(0)}
                  onDropRejected={()=>setDropState(0)}
                  onDragLeave={()=>setDropState(0)}
                  onFileDialogCancel={()=>setDropState(0)}
                  onDrop={acceptedFiles =>handleAddFile(acceptedFiles)}>
                  {({getRootProps, getInputProps}) => (
                      <section className={`dropbox-wrapper ${dropState === 2 && 'alert'}`}>
                          <div {...getRootProps()} className="dropbox">
                              <input {...getInputProps()} 
                              onClick={(event)=>{
                                event.target.value = ''
                              }}/>
                              {
                                dropState !== 2
                                ?
                                <>
                                <div className={`dropbox-icon-wrapper`}>
                                    <img alt="" src={excelLogo}/>
                                </div>
                                <h3>File cần chuyển đổi</h3>
                                <small>hoặc kéo thả file vào</small>
                                </>
                                :
                                <div className="dropbox-alert">
                                  <h1>Thả vào!</h1>
                                </div>
                              }
                          </div>
                      </section>
                  )}
                </Dropzone>
              </div>
            </div>
          }
        </div>
      </div>
    </Wrapper>
  );
}

export default App;


const Wrapper = styled.div`
  height:100vh;
  .dropbox-container-wrapper{
    height:100%;
    display:flex;
    align-items:center;
    flex-direction:column;
    .form-selection{
      display:flex;
      align-items:center;
      justify-content:center;
      flex-direction:column;
      height:100px;
      .sidebar-select{
        width:300px;
      }
    }
    .dropbox-area-wrapper{
      display:flex;
      height: calc(100vh - 100px);
      justify-content:center;
      align-items:center;
      .loading{
        font-size:1.5rem;
        font-weight:600;
        display:flex;
        align-items:center;
        flex-direction:column;
        justify-content:center;
        img{
          height:150px;
        }
          
        h4{
          margin:0;
          font-weight:500;
        }
      }
      @media (max-width:350px){
        width:260px;
        height:260px;
      }
      @media (max-width:300px){
        width:240px;
        height:240px;
      }
      .dropbox-area{
        width:300px;
        height:300px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        transition:all 0.3s;
        position:relative;
        padding:0.75rem;
        .dropbox-spin{
          width:250px;
          height:250px;
          position:absolute;
          border-radius:50%;
          border:5px dashed #0D9EDE;
          animation: spin 60s linear infinite;
          @media (max-height:700px){
            /* border-radius:0; */
            border:4px dashed #0D9EDE;
          }
          @media (max-height:700px) and (max-width:426px){
            /* border-radius:0; */
            border:4px dashed #0D9EDE;
          }
          @-moz-keyframes spin { 
            100% { -moz-transform: rotate(360deg); } 
          }
          @-webkit-keyframes spin { 
            100% { -webkit-transform: rotate(360deg); } 
          }
          @keyframes spin { 
            100% { 
                -webkit-transform: rotate(360deg); 
                transform:rotate(360deg); 
            } 
          }
        }
        .dropbox-spin.alert{
          width:100%;
          height:100%;
          position:absolute;
          border-radius:50%;
          border:5px dashed #0D9EDE;
          animation: spin 10s linear infinite;
          @media (max-height:700px){
            /* border-radius:0; */
            border:4px dashed #0D9EDE;
          }
          @media (max-height:700px) and (max-width:426px){
            /* border-radius:0; */
            border:4px dashed #0D9EDE;
          }
          @-moz-keyframes spin { 
            100% { -moz-transform: rotate(360deg); } 
          }
          @-webkit-keyframes spin { 
            100% { -webkit-transform: rotate(360deg); } 
          }
          @keyframes spin { 
            100% { 
                -webkit-transform: rotate(360deg); 
                transform:rotate(360deg); 
            } 
          }
        }
        .dropbox-container{
          width:100%;
          display:flex;
          align-items:center;
          justify-content:center;
          height:100%;
          position:relative;
          border-radius:50%;
          background:${props => props.theme.primary};
          .dropbox-wrapper{
            width:100%;
            border-radius:50%;
            height:100%;
            display:flex;
            align-items:center;
            justify-content:center;
            cursor:pointer;
            transition: all 0.3s;
            background:${props => props.theme.dropboxBackground};
            :hover{
                background:${props => props.theme.dropboxBackgroundWhenHover};
            }
            @media (max-height:700px){
              /* border-radius:0; */
            }
  
            @media (max-height:700px) and (max-width:426px){
              /* border-radius:0; */
            }
            .dropbox{
              width:100%;
              height:100%;
              display:flex;
              align-items:center;
              justify-content:center;
              flex-direction:column;
              @media (max-height:550px){
                padding:0.5rem;
              }
              input{
                  width:100%;
                  height:100%;
              }
  
              .dropbox-alert{
                display:flex;
                align-items: center;
                justify-content: center;
                width:100%;
                h1{
                  margin:0;
                  font-size:2.5rem;
                  font-weight:600;
                  text-align:center;
                  color: white;
                }
              }
  
              .dropbox-icon-wrapper{
                img{
                  width:70px;
                  height:70px;
                }
              }
              .dropbox-icon-wrapper.shake{
                position:relative;
                animation: shake 0.5s;
                animation-iteration-count: infinite;
                @keyframes shake {
                  0% { transform: translate(1px, 1px) rotate(0deg); }
                  10% { transform: translate(-1px, -2px) rotate(-1deg); }
                  20% { transform: translate(-3px, 0px) rotate(1deg); }
                  30% { transform: translate(3px, 2px) rotate(0deg); }
                  40% { transform: translate(1px, -1px) rotate(1deg); }
                  50% { transform: translate(-1px, 2px) rotate(-1deg); }
                  60% { transform: translate(-3px, 1px) rotate(0deg); }
                  70% { transform: translate(3px, 1px) rotate(-1deg); }
                  80% { transform: translate(-1px, -1px) rotate(1deg); }
                  90% { transform: translate(1px, 2px) rotate(0deg); }
                  100% { transform: translate(1px, -2px) rotate(-1deg); }
                }
              }
              h3{
                margin:0;
                font-size:20px;
                color:${props => props.theme.primary};
                font-weight:500;
                text-align:center;
                @media (max-height:550px){
                  font-size:16px;
                }
              }
              small{
                margin:0;
                color:grey;
                font-size:16px;
                color:${props => props.theme.primary};
                text-align:center;
                @media (max-height:550px){
                  font-size:14px;
                }
              }
            }
          }
          .dropbox-wrapper.alert{
            background:#0d9ede;
          }
        }
      }
      .dropbox-area.alert{
        position:relative;
        transform:scale(1.1);
      }
    }

    .analysis_form_wrapper{
        padding:0rem 1.5rem;
        border-radius:0.5rem;
        margin:1rem 0 2rem;
        @media (max-width:769px){
            padding:0 1.25rem;
        }
        .analysis_input{
            padding:0.25rem 0;
            p{
                margin:0;
                font-size:1rem;
                font-weight:500;
                margin-bottom:0.5rem;
                color:${props => props.theme.textColor};
            }
            input{
                width:100%;
                font-size:1rem;
                border-radius:0.25rem;
                padding:0.25rem 0.5rem;
                background:#f1f1f1;
            }
            select{
                width:100%;
                font-size:1rem;
                border-radius:0.25rem;
                padding:0.25rem 0.5rem;
                background:#f1f1f1;
            }
        }

        .start-btn{
            margin-top:01rem;
            background-color:${props => props.theme.textColor};
            padding:0.5rem;
            display:flex;
            align-items:center;
            justify-content:center;
            cursor:pointer;
            transition: all 0.3s;
            border-radius:0.5rem;
            position:relative;
            opacity:1;
            :hover{
                opacity:0.7;
            }
            span{
                font-weight:500;
                font-size:1.1rem;
                color:${props => props.theme.primary};
            }
        }
    }

    h1{
      margin:0;
      margin-top:1.5rem;
      font-size:1.5rem;
      text-align:center;
      font-weight:400;
      max-width:80%;
      color:${props => props.theme.textColor};
      @media (max-width:350px){
        font-size:1rem;
      }
      @media (max-height:550px){
        margin-top:0.5rem;
      }
      span{
        a{
          cursor:pointer;  
          color:#0d9ede;
          text-decoration:none;
        } 
        :hover{
          text-decoration:underline;
        }   
      }
    }
  }

`
