import axios from 'axios'

let baseURL = 'http://localhost:5000'
const app = axios.create({
  baseURL,
  withCredentials: true,
})

app.interceptors.response.use((response) => response)
export default app
