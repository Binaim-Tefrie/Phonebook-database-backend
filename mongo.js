const mongoose = require('mongoose')

const password = process.argv[2]

const url = `mongodb+srv://biniamtefrie:${password}@cluster0.tte3czs.mongodb.net/phoneBookApp?appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url, { family: 4 })

const phoneSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Phone = mongoose.model('Phone', phoneSchema)

if(process.argv.length === 3){
  Phone.find({}).then(result => {
    result.forEach(phone => {
      console.log(phone)
    })
    mongoose.connection.close()
  })
}
else {
  const phone = new Phone({
    name: process.argv[3],
    number: process.argv[4]
  })

  phone.save().then(result => {
    console.log('phone is saved', result)
    console.log(`added ${process.argv[3]} number ${process.argv[4]} to phonebok`)
    mongoose.connection.close()
  })
}


//added Anna number 040-1234556 to phonebook