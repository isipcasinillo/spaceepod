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

app.get('/api', async function (req, res) {
  console.log('----------------------------------------------------')
  const { date } = req.query
  const prevdate = moment(date).subtract(1, 'days').format('YYYY-MM-DD')
  
  const nextdate = moment(date).add(1, 'days').format('YYYY-MM-DD')
  const today =  moment().format('YYYY-MM-DD')
  console.log(date)

  const cachedDatePrev = await client.get(`${prevdate}`)
  const cachedDate = await client.get(`${date}`)
  const cachedDateNext = await client.get(`${nextdate}`)

  // initial fetch
  if (!cachedDate && date === today) {
      console.log(`initial Fetch\n`)
      const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}&start_date=${prevdate}&end_date=${date}`)
      const data = await response.json()
      
      for (let i = 0; i < 2; i++) {
          client.set(`${data[i].date}`, JSON.stringify(data[i]))
      }

      const prevData = await client.get(`${prevdate}`)
      const curData = await client.get(`${date}`)

      const cachedPrev = JSON.parse(prevData)
      const cachedCur = JSON.parse(curData)
      const tomorrowMessage = {
          message: 'No API Call for future',
          date: nextdate
          
      }
      res.send([cachedPrev, cachedCur, tomorrowMessage])
      return;
  } 
  // initial fetch from cache
  else if (cachedDate && cachedDatePrev  && date === today) {
      console.log(`initial Fetch but with cache\n`)
      const prevData = await client.get(`${prevdate}`)
      const curData = await client.get(`${date}`)

      const cachedPrev = JSON.parse(prevData)
      const cachedCur = JSON.parse(curData)
      const tomorrowMessage = {
          message: 'No API Call for future',
          date: nextdate
          
      }
      res.send([cachedPrev, cachedCur, tomorrowMessage])
      return
  }
  // fetch left only
  else if(!cachedDatePrev && date < today && cachedDate && cachedDateNext) {
      console.log(`Fetching from left only\n`)
      const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}&date=${prevdate}`)
      const data = await response.json()
      await client.set(`${data.date}`, JSON.stringify(data))

     
      const prevData = await client.get(`${prevdate}`)
      const curData = await client.get(`${date}`)
      const nextData = await client.get(`${nextdate}`)

      const cachedPrev = JSON.parse(prevData)
      const cachedCur = JSON.parse(curData)
      const cachedNex = JSON.parse(nextData)

      res.send([cachedPrev,cachedCur,cachedNex])
  }
  // fetch middle only
  else if(cachedDatePrev && date < today && !cachedDate && cachedDateNext) {
      console.log(`Fetching from middle only\n`)
      const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}&date=${date}`)
      const data = await response.json()
      await client.set(`${data.date}`, JSON.stringify(data))

      const prevData = await client.get(`${prevdate}`)
      const curData = await client.get(`${date}`)
      const nextData = await client.get(`${nextdate}`)

      const cachedPrev = JSON.parse(prevData)
      const cachedCur = JSON.parse(curData)
      const cachedNex = JSON.parse(nextData)

      res.send([cachedPrev,cachedCur,cachedNex])
  }
  // fetch right only
  else if(cachedDatePrev && date < today && cachedDate && !cachedDateNext) {
      console.log(`Fetching from right only\n`)
      const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}&date=${nextdate}`)
      const data = await response.json()
      await client.set(`${data.date}`, JSON.stringify(data))

     
      const prevData = await client.get(`${prevdate}`)
      const curData = await client.get(`${date}`)
      const nextData = await client.get(`${nextdate}`)

      const cachedPrev = JSON.parse(prevData)
      const cachedCur = JSON.parse(curData)
      const cachedNex = JSON.parse(nextData)

      res.send([cachedPrev,cachedCur,cachedNex])
  }
  // fetch all 
  else if (!cachedDatePrev && !cachedDate && !cachedDateNext && date < today) {
      console.log(`fetching all\n`)
      const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}&start_date=${prevdate}&end_date=${nextdate}`)
      const data = await response.json()
      
      for (let i = 0; i < 3; i++) {
          client.set(`${data[i].date}`, JSON.stringify(data[i]))
      }

      const prevData = await client.get(`${prevdate}`)
      const curData = await client.get(`${date}`)
      const nextData = await client.get(`${nextdate}`)

      const cachedPrev = JSON.parse(prevData)
      const cachedCur = JSON.parse(curData)
      const cachedNex = JSON.parse(nextData)

      res.send([cachedPrev,cachedCur,cachedNex])
  }
  // fetch all from cache
  else if(cachedDatePrev && cachedDate && cachedDateNext && date < today) {
      console.log(`fetching all from cache\n`)
      const prevData = await client.get(`${prevdate}`)
      const curData = await client.get(`${date}`)
      const nextData = await client.get(`${nextdate}`)

      const cachedPrev = JSON.parse(prevData)
      const cachedCur = JSON.parse(curData)
      const cachedNex = JSON.parse(nextData)

      res.send([cachedPrev,cachedCur,cachedNex])
  
  }

 
});
(async () => {
  await client.connect();
})();

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})




