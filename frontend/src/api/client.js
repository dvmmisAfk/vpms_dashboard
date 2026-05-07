import axios from 'axios'

// create an axios instance so i dont have to type the base url everywhere
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

// before every request, grab the token from localstorage and add it to the headers
// learned about interceptors from the axios docs - basically middleware for requests
client.interceptors.request.use(function(config) {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token
  }
  return config
})

// handle responses - if we get a 401, the token expired so redirect to login
// found this pattern on stack overflow
client.interceptors.response.use(
  function(response) {
    // successful response, just pass it through
    return response
  },
  function(error) {
    if (error.response && error.response.status === 401) {
      // clear token and send them back to login
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default client
