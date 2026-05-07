// put this first or env vars wont be available when the rest of the code runs
require('dotenv').config()

const express = require('express')
const http = require('http')
const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')
const { Server } = require('socket.io')

console.log('starting server...')

const app = express()
const httpServer = http.createServer(app)

const PORT = process.env.PORT || 5000
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

// socket.io setup - had to use http.createServer because socket.io
// needs access to the raw http server, not just the express app
// watched like 3 different tutorials to figure this out
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    credentials: true
  }
})

// attach io to app so controllers can emit events
app.set('io', io)

// cors needs to come before routes or requests get blocked
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}))

app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

// morgan logs each request - useful for debugging, might remove in prod
app.use(morgan('dev'))

// load routes
const authRoutes = require('./routes/auth')
const visitorRoutes = require('./routes/visitors')
const appointmentRoutes = require('./routes/appointments')
const passRoutes = require('./routes/passes')
const checkRoutes = require('./routes/checks')
const dashboardRoutes = require('./routes/dashboard')
const analyticsRoutes = require('./routes/analytics')
const auditRoutes = require('./routes/audit')
const bootstrapRoutes = require('./routes/bootstrap')

// bootstrap has to be registered before auth middleware runs
app.use('/api/bootstrap', bootstrapRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/visitors', visitorRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/passes', passRoutes)
app.use('/api/checks', checkRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/audit-logs', auditRoutes)

// basic health check
app.get('/health', function(req, res) {
  res.json({ ok: true })
})

// socket.io connection handler
io.on('connection', function(socket) {
  console.log('client connected to socket:', socket.id)

  socket.on('disconnect', function() {
    console.log('client disconnected:', socket.id)
  })
})

// connect to mongodb then start the server
// if db fails, there's no point starting the server
mongoose.connect(process.env.MONGO_URI)
  .then(function() {
    console.log('mongodb connected')
    httpServer.listen(PORT, function() {
      console.log('server is running on http://localhost:' + PORT)
    })
  })
  .catch(function(err) {
    console.log('failed to connect to mongodb:', err.message)
    process.exit(1)
  })
