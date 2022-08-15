const express = require('express')
const fetch = require('node-fetch')
const app = express()
const port = 3000;

app.get('/api/:date', async (req, res, body) => {
    fetch(`https://api.nasa.gov/planetary/apod?api_key=VSDIcILkW1pYNnyUHRjtAYIa2285Q2TbLH4QkzFj&date=${req.params.date}`)
    
    .then(response => response.json())
    .then(data => {
      res.send(data)
    })
    .catch(err => console.log(err))
   
    
})
  
app.listen(port, () => {
console.log(`Example app listening on port ${port}`)
})