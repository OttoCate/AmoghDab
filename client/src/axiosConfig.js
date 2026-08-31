import axios from 'axios'

let baseURL = process.env.REACT_APP_API_URL
const app = axios.create({
  baseURL,
  withCredentials: true,
})

app.interceptors.response.use((response) => response)
export default app
