// run this to add test data: npm run seed
require('dotenv').config({ path: require('path').join(__dirname, '../.env') })

const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')
const QRCode = require('qrcode')

const User = require('../models/User')
const Visitor = require('../models/Visitor')
const Appointment = require('../models/Appointment')
const Pass = require('../models/Pass')
const CheckLog = require('../models/CheckLog')

// passwords are all 'password123' for testing
async function seed() {
  console.log('connecting to db...')
  await mongoose.connect(process.env.MONGO_URI)
  console.log('connected!')

  // clear existing data first
  console.log('clearing old data...')
  await User.deleteMany({})
  await Visitor.deleteMany({})
  await Appointment.deleteMany({})
  await Pass.deleteMany({})
  await CheckLog.deleteMany({})
  console.log('cleared.')

  // create users
  console.log('creating users...')
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@vpms.com',
    password: 'password123',
    role: 'admin',
    phone: '9876543210',
    department: 'IT'
  })
  console.log('created user:', admin.email)

  const security = await User.create({
    name: 'Ravi Security',
    email: 'security@vpms.com',
    password: 'password123',
    role: 'security',
    phone: '9876543211',
    department: 'Security'
  })
  console.log('created user:', security.email)

  const employee1 = await User.create({
    name: 'Priya Sharma',
    email: 'employee@vpms.com',
    password: 'password123',
    role: 'employee',
    phone: '9876543212',
    department: 'HR'
  })
  console.log('created user:', employee1.email)

  const employee2 = await User.create({
    name: 'Amit Singh',
    email: 'amit@vpms.com',
    password: 'password123',
    role: 'employee',
    phone: '9876543213',
    department: 'Engineering'
  })
  console.log('created user:', employee2.email)

  const visitorUser = await User.create({
    name: 'Raj Visitor',
    email: 'visitor@vpms.com',
    password: 'password123',
    role: 'visitor',
    phone: '9876543214'
  })
  console.log('created user:', visitorUser.email)

  // create visitors
  console.log('creating visitors...')
  const visitor1 = await Visitor.create({
    name: 'Raj Visitor',
    email: 'visitor@vpms.com',
    phone: '9876543214',
    company: 'ABC Corp',
    purpose: 'Meeting',
    host: employee1._id,
    status: 'approved'
  })
  console.log('created visitor:', visitor1.name)

  const visitor2 = await Visitor.create({
    name: 'Sunita Patel',
    email: 'sunita@example.com',
    phone: '9876500001',
    company: 'XYZ Ltd',
    purpose: 'Interview',
    host: employee2._id,
    status: 'pending'
  })
  console.log('created visitor:', visitor2.name)

  const visitor3 = await Visitor.create({
    name: 'Deepak Kumar',
    email: 'deepak@example.com',
    phone: '9876500002',
    company: 'Delivery Co',
    purpose: 'Delivery',
    host: employee1._id,
    status: 'checked-in'
  })
  console.log('created visitor:', visitor3.name)

  const visitor4 = await Visitor.create({
    name: 'Meena Joshi',
    email: 'meena@example.com',
    phone: '9876500003',
    company: 'Repairs Inc',
    purpose: 'Maintenance',
    host: employee2._id,
    status: 'rejected'
  })
  console.log('created visitor:', visitor4.name)

  const visitor5 = await Visitor.create({
    name: 'Arjun Nair',
    email: 'arjun@example.com',
    phone: '9876500004',
    company: 'Consulting LLC',
    purpose: 'Meeting',
    host: employee1._id,
    status: 'checked-out'
  })
  console.log('created visitor:', visitor5.name)

  // create appointments
  console.log('creating appointments...')

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)

  const today2pm = new Date()
  today2pm.setHours(14, 0, 0, 0)

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(11, 0, 0, 0)

  await Appointment.create({ visitor: visitor1._id, host: employee1._id, scheduledAt: tomorrow, purpose: 'Meeting', status: 'approved' })
  await Appointment.create({ visitor: visitor2._id, host: employee2._id, scheduledAt: today2pm, purpose: 'Interview', status: 'pending' })
  await Appointment.create({ visitor: visitor3._id, host: employee1._id, scheduledAt: yesterday, purpose: 'Delivery', status: 'approved' })
  console.log('appointments created')

  // create passes
  console.log('creating passes...')

  const passCode1 = uuidv4()
  const qr1 = await QRCode.toDataURL(passCode1)

  const validFrom = new Date()
  const validUntil = new Date()
  validUntil.setDate(validUntil.getDate() + 1)

  const pass1 = await Pass.create({
    visitor: visitor1._id,
    passCode: passCode1,
    qrCodeData: qr1,
    pdfUrl: null,
    validFrom,
    validUntil,
    isActive: true,
    issuedBy: security._id
  })
  console.log('created pass for:', visitor1.name)

  const passCode2 = uuidv4()
  const qr2 = await QRCode.toDataURL(passCode2)

  const pass2 = await Pass.create({
    visitor: visitor3._id,
    passCode: passCode2,
    qrCodeData: qr2,
    pdfUrl: null,
    validFrom,
    validUntil,
    isActive: true,
    issuedBy: security._id
  })
  console.log('created pass for:', visitor3.name)

  // create check logs
  console.log('creating check logs...')

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000)

  await CheckLog.create({ visitor: visitor3._id, pass: pass2._id, action: 'check-in', scannedBy: security._id, timestamp: twoHoursAgo })
  await CheckLog.create({ visitor: visitor5._id, pass: pass2._id, action: 'check-out', scannedBy: security._id, timestamp: oneHourAgo })
  await CheckLog.create({ visitor: visitor1._id, pass: pass1._id, action: 'check-in', scannedBy: security._id, timestamp: thirtyMinsAgo })

  console.log('check logs created')
  console.log('')
  console.log('all done! you can now login with admin@vpms.com / password123')
  process.exit(0)
}

seed().catch(err => {
  console.log('seed failed:', err)
  process.exit(1)
})
