var express = require('express')
var fs = require('fs')
var parser = require('xml2json')

var app = express()

var port = process.env.PORT || 8080

var boothObjects
var boothResponsObject

fs.readFile('./coordinates.xml', 'utf-8', (err, data) => {
  boothObjects = parser.toJson(data, { object: true }).MCAD1_Export_XML.Boothes.Class
  boothResponsObject = []
  boothObjects.forEach((booth) => {
    var coords = booth.coords.split(':')[3].split(';').map((coord) => coord.split(','))
    boothResponsObject.push({
      name: booth.name,
      coordinates: coords.map((coord) => translateToLatLng(coord[0], coord[1]))
    })
  })
  err && console.log(err)
})

var getLogDate = () => {
  var date = new Date()
  return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`
}

var router = express.Router()

// Use this method to do something after every api call to /api
router.use((req, res, next) => {
  console.log(getLogDate(), 'api called with enpoint:', `api${req.url}`)
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With')
  next()
})

// --------------------------------------
// actual logic for the api calls at /api
// --------------------------------------

router.get('/', (req, res) => {
  res.json({ message: 'Server for the indoor navigation project' })
})

// get to /get-booths returns an array of all booth objects from the xml file
// no url or query parameters
// localhost:8080/api/get-booths
router.get('/get-booths', (req, res) => {
  console.log(getLogDate(), 'response object for request for booths sent')
  res.json(boothResponsObject)
})

const originLat = 48.137302
const originLng = 11.693632
const rEarth = 6366821
const scaleFactorx = 0.85
const scaleFactory = 1.45

var translateToLatLng = (x, y) => {
  var latitude = originLat - (x * scaleFactorx / rEarth) * (180 / Math.PI)
  var longitude = originLng + (y * scaleFactory / rEarth) * (180 / Math.PI) / Math.cos(originLng * Math.PI / 180)
  return {lat: latitude, lng: longitude}
}

// this is the number of companies which is currently required for position calculation
const numberOfCompanies = 3

// get to /get-position returns the endusers position
// takes query parameter companies as a comma seperated list
// localhost:8080/api/get-position?companies=QCS,SkyCell,Sinalco
router.get('/get-position', (req, res) => {
  console.log(getLogDate(), 'start position calculation')
  if (req.query.companies) {
    var companies = req.query.companies.split(',')
    if (companies.length === numberOfCompanies) {
      var positionX = 0
      var positionY = 0
      var notEmpty = 0
      boothObjects.forEach((booth) => {
        companies.forEach((company) => {
          if (company === booth.name) {
            notEmpty++
            positionX += calculateCenter(booth.coords).x
            positionY += calculateCenter(booth.coords).y
          }
        })
      })
      if (notEmpty === numberOfCompanies) {
        console.log(getLogDate(), 'position calculation done:', `x: ${positionX}, y: ${positionY}`)
        res.status(200).json(translateToLatLng(positionX / numberOfCompanies, positionY / numberOfCompanies))
      } else {
        console.error(getLogDate(), 'One or several companies could not be found!')
        res.status(404).json({'error': 'One or several companies could not be found!'})
      }
    } else {
      console.error(getLogDate(), 'Three company names expected')
      res.status(400).json({'error': 'Three company names expected'})
    }
  } else {
    console.error(getLogDate(), 'Companies missing. Call e.g. /api/get-position?companies=QCS,SkyCell,Sinalco')
    res.status(400).json({'error': 'Companies missing. Call e.g. /api/get-position?companies=QCS,SkyCell,Sinalco'})
  }
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
