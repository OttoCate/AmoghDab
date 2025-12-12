import axios from 'axios'

let baseURL = 'https://sea-acc-service.onrender.com'
const app = axios.create({
  baseURL,
  withCredentials: true,
})

app.interceptors.response.use((response) => response)
export default app
