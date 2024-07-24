  // Convert Excel serial to JS Date
  export const excelDateToJSDate = (serial) => {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    
    const dd = String(date_info.getDate()).padStart(2, '0');
    const mm = String(date_info.getMonth() + 1).padStart(2, '0');
    const yyyy = date_info.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };