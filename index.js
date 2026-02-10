const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(morgan('tiny'))
app.use(cors())

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

let phoneBook = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (req, res) => {
    res.send('<h1>WelcomeTo Part 3</h1>')
})
//Info visitors and date
app.get('/api/persons', (req, res) => {
    res.json(phoneBook)
})

let visitors = 0
app.get('/info', (req, res) => {
  const now = new Date().toString()
   visitors += 1
   const info = `
                  <div>
                    <p>Phonebook has info for ${visitors} people</p>
                    <P>${now}</p>
                  </div> 
                `
  res.send(`<h1>${info}</h1>`)

})

//Fetch a resource
app.get('/api/persons/:id', (req, res) => {
    const id = req.params.id
    const phone = phoneBook.find(phone => phone.id === id)
    
    if(phone){
        res.json(phone)
    }
    else {
        res.status(404).end()
    }
})

//Delete a resource
app.delete('/api/persons/:id', (req, res) => {
    const id = req.params.id
    phoneBook = phoneBook.filter(person => person.id !== id)
    res.status(204).end()
})

//Generate an id
const generate_id = () => {
  return Math.floor(Math.random() * 1_000_000).toString()
}
const check_id = () => {
  const ids = phoneBook.map(p => p.id)
  const id = generate_id()

  return ids.includes(id) ? check_id() : id
}

//Send a data to the server
app.post('/api/persons', (req, res) => {
  const id = check_id()
  const body = req.body

  if(!body.name || !body.number){
    res.status(404).json({ 
      error: 'name must be unique' 
    })
  }
  const newPhone = {
    'id': id,
    'name': body.name, 
    'number': body.number
  }
  phoneBook = phoneBook.concat(newPhone)
  res.json(phoneBook)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log('The server is running at port 3001')
})

