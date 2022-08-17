const express = require('express');
const redis = require('redis');
const fetch = require('node-fetch');
const moment = require('moment')
const app = express();
const port = 3000;
const cors = require("cors")
const redis_port = process.env.redis_port || 6379
require('dotenv').config()
app.use(cors())
const client = redis.createClient(redis_port);




app.get('/api/:date', async function checkCache(req, res) {
  const { date: currentdate } = req.params
  const prevdate = moment(currentdate).subtract(1, 'days').format('YYYY-MM-DD')
  const nextdate = moment(currentdate).add(1, 'days').format('YYYY-MM-DD')

  // initial render NO NEXT DATE
  if( await client.exists(`${currentdate}`) === 0 && currentdate === moment().format('YYYY-MM-DD')) {
    const initialResponse = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}&start_date=${prevdate}&end_date=${currentdate}`)
    const initialData = await initialResponse.json()
    console.log(initialData[0].date)
    for (let i = 0; i < 2; i++) {
      client.set(initialData[i].date, JSON.stringify(initialData[i]))
    }

    const prevData = await client.get(`${prevdate}`)
    const currentData = await client.get(`${currentdate}`)
    const x = JSON.parse(prevData)
    const y= JSON.parse(currentData)
    const z = {
      "message": `There is not an Astronomy Picture of the Day for this date. Please select another date.`,
      "date" : `${nextdate}`
    }
    res.send([x, y, z])
  }
  if(await client.exists(`${currentdate}`) === 1 && currentdate === moment().format('YYYY-MM-DD')) {
    const prevData = await client.get(`${prevdate}`)
    const currentData = await client.get(`${currentdate}`)
    const x = JSON.parse(prevData)
    const y= JSON.parse(currentData)
    const z = {
      "message": `There is not an Astronomy Picture of the Day for this date. Please select another date.`,
      "date" : `${nextdate}`
    }
    res.send([x, y, z])
  }
  // fetch left
  if (await client.exists(`${currentdate}`)  === 1 && await client.exists(`${nextdate}`)  === 1 && await client.exists(`${prevdate}`)  === 0 && currentdate < moment().format('YYYY-MM-DD')) {
      const nextData = await client.get(`${nextdate}`) 
      const currentData = await client.get(`${currentdate}`)

      const prevResponse = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}&date=${prevdate}`)
      console.log(prevResponse)
      const prevDate = await prevResponse.json()

      await client.set(`${prevDate.date}`, JSON.stringify(prevDate) )
      const prevData = await client.get(`${prevdate}`)

      const x = JSON.parse(prevData)
      const y = JSON.parse(currentData)
      const z = JSON.parse(nextData)

      res.send([x,y,z])
  }
  if (await client.exists(`${prevdate}`)  === 1 && await client.exists(`${currentdate}`)  === 1 && await client.exists(`${nextdate}`)  === 1) {
      const prevData = await client.get(`${prevdate}`)
      const currentData = await client.get(`${currentdate}`)
      const nextData = await client.get(`${nextdate}`) 
      
      const x = JSON.parse(prevData)
      const y = JSON.parse(currentData)
      const z = JSON.parse(nextData) 

      res.send([x,y,z])
  }
});

(async () => {
  await client.connect();
})();

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})




