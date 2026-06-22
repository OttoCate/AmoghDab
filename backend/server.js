require('dotenv').config()
const morgan = require('morgan')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const xssClean = require('xss-clean')
const hpp = require('hpp')
const mongoose = require('mongoose')

const uri = process.env.MONGO_URI
const port = process.env.PORT || 5000
const jwtSecret = process.env.JWT_SECRET

const whitelist = [
  'http://localhost:3000',
  'http://localhost:3000/',
  'http://localhost:5000/',
  'http://localhost:5000',
  'https://sea-accounting.onrender.com',
  'https://sea-accounting.onrender.com/',
]

const isOriginAllowed = (origin) => {
  if (whitelist.indexOf(origin) !== -1) {
    return true
  }
  return false
}

const corsConfig = {
  origin: function (origin, callback) {
    if (isOriginAllowed(origin) || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: 'GET,PATCH,POST,DELETE',
  credentials: true,
}

const app = express()
app.use(express.json())
app.use(bodyParser.json({ limit: '1mb', type: 'application/json' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }))
app.use(cookieParser(jwtSecret))
app.use(cors(corsConfig))
app.use(helmet())
app.use(hpp())
app.use(morgan('tiny'))

app.use('/api', require('./routes/auth.js'))
app.use('/api', require('./routes/data.js'))

const start = async () => {
  try {
    await mongoose.connect(uri)
    console.log('MongoDB connected')
    app.listen(port, () => {
      console.log('Server is listening on port', port)
    })
  } catch (err) {
    console.log(err)
  }
}

start()
