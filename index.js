require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Phone = require('./models/phone')
const app = express()

app.use(express.static('dist'))
app.use(express.json())
app.use(morgan('tiny'))

const display = (tokens, req, res) => {

  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens['response-time'](req, res), 'ms',
    JSON.stringify(req.body)
  ].join(' ')
}

app.use(morgan(display))

app.get('/api/persons', (req, res) => {
  Phone.find({}).then(result => {
    res.json(result)
  })
})

//Info visitors and date
app.get('/info', (req, res, next) => {
  const now = new Date().toString()

  Phone.find({})
    .then(result => {
      console.log('info', result.length)
      const info = `
                    <p>Phonebook has info for ${result.length} people</p>
                    <P>${now}</p>
                 `
      res.send(`<div>${info}</div>`)
    })
    .catch(error => next(error))
})

//Fetch a resource
app.get('/api/persons/:id', (req, res, next) => {
  Phone.findById(req.params.id)
    .then(phone => {
      if(phone){
        res.json(phone)
      }
      else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

//Delete a resource
app.delete('/api/persons/:id', (req, res, next) => {
  Phone.findByIdAndDelete(req.params.id)
    .then(result => {
      console.log('result', result)
      res.status(204).end()
    })
    .catch(error => next(error))
})

//Send a data to the server
app.post('/api/persons', (req, res, next) => {

  const body = req.body

  if(!body.name || !body.number){
    res.status(400).json({ error: 'name must be unique' })
  }

  const newPhone = new Phone({
    'name': body.name,
    'number': body.number
  })

  newPhone.save()
    .then(savedPhone => {
      res.json(savedPhone)
    })
    .catch(error => next(error))
})

//Update a resource
app.put('/api/persons/:id', (req, res, next) => {
  Phone.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
    .then(updatePhone => {
      if(updatePhone){
        res.json(updatePhone)
      }
      else {
        res.status(404).json({ error: 'Person not found' })
      }
    })
    .catch(error => next(error))
})

// Endpoint errors
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

// Error handling middleware
const errorHandler = (error, request, response, next) => {

  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'malformatted id' })
  }

  if (error.name === 'ValidationError') {
    const errors = {}

    for (const field in error.errors) {
      const err = error.errors[field]

      errors[field] = {
        message: err.message,
        type: err.kind === 'user defined' ? 'invalidFormat' : err.kind
      }
    }

    return response.status(400).json({ errors })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log('The server is running at port 3001')
})

