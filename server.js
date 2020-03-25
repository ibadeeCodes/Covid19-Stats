const axios = require('axios')
const express = require('express')
const app = express()
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const session = require('express-session')
const path = require('path')
const moment = require('moment')

const PORT = process.env.PORT || 5000

app.engine('handlebars', exphbs())
app.set('view engine', 'handlebars')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, '/public')))

app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
)

app.use(flash())
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  next()
})

app.listen(5000, console.log('server started at 5000'))

app.get('/', (req, res) => {
  res.render('index')
})

app.post('/', (req, res) => {
  let country = req.body.country
  if (country) {
    country = country.charAt(0).toUpperCase() + country.substring(1)
    console.log(country)
    axios({
      method: 'GET',
      url: `${process.env.API_URL}${country}`,
      headers: {
        'content-type': 'application/octet-stream',
        'x-rapidapi-host': process.env.API_HOST,
        'x-rapidapi-key': process.env.API_KEY
      }
    })
      .then(response => {
        let data = response.data
        // let date = data.data.lastChecked
        if (data.message != 'OK') {
          req.flash('error_msg', 'Country not found!')
          return res.redirect('/')
        }
        return res.render('index', {
          data: data.data,
          time: moment(data.data.lastChecked).fromNow()
        })
      })
      .catch(error => {
        console.log(error)
      })
  } else {
    req.flash('error_msg', 'Country not found!')
    res.redirect('/')
  }
})
