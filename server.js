var express = require('express')
var fs = require('fs')
var parser = require('xml2json')

var app = express()

var port = process.env.PORT || 8080

var boothObjects

fs.readFile('./coordinates.xml', 'utf-8', (err, data) => {
  boothObjects = parser.toJson(data, { object: true }).MCAD1_Export_XML.Boothes.Class
  err && console.log(err)
})

var router = express.Router()

// Use this method to do something after every api call to /api
router.use((req, res, next) => {
  console.log('Something is happening.')
  next()
})

// --------------------------------------
// actual logic for the api calls at /api
// --------------------------------------

router.get('/', (req, res) => {
  res.json({ message: 'Server for the indoor navigation project' })
})

// get to /all-booth-objects returns an array of all booth objects from the xml file
// no url or query parameters
// localhost:8080/api/get-booths
router.get('/get-booths', (req, res) => {
  res.json(boothObjects)
})

// get to /position-from-companies should return the endusers position at some point
// takes query parameters a, b, c
// just returns error message and the companies so far
// localhost:8080/api/position-from-companies?a=A&b=B&c=C
router.get('/position-from-companies', (req, res) => {
  res.json({ message: 'Not implemented so far',
    companies: [req.query.a, req.query.b, req.query.c] })
})

// all requests have to go through /api
app.use('/api', router)

app.listen(port)
console.log('Server running at localhost:' + port)
