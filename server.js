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

// get to /get-position returns the endusers position
// takes query parameters a, b, c
// localhost:8080/api/get-position?a=QCS&b=SkyCell&c=Sinalco
router.get('/get-position', (req, res) => {
  var companies = req.query
  var positionX = 0
  var positionY = 0
  for (var key in companies) {
    boothObjects.forEach((booth) => {
      if (companies[key] === booth.name) {
        positionX += calculateCenter(booth.coords).x
        positionY += calculateCenter(booth.coords).y
      }
    })
  }

  res.json({x: positionX / 3, y: positionY / 3})
})

// takes a string of coordinates as a parameter and calculates and returns the center
var calculateCenter = (coordString) => {
  var numberOfCorners = coordString.split(':')[0]
  var listOfCoordinates = coordString.split(':')[3].split(';')
  var sumX = 0
  var sumY = 0
  listOfCoordinates.forEach((coordinate) => {
    sumX += parseFloat(coordinate.split(',')[0])
    sumY += parseFloat(coordinate.split(',')[1])
  })
  return {x: sumX / numberOfCorners, y: sumY / numberOfCorners}
}

// all requests have to go through /api
app.use('/api', router)

app.listen(port)
console.log('Server running at localhost:' + port)
