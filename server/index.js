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




async function fetchOnInit(currentDate) {
  console.log(`--------------------------------------------------`)
  const prevdate = moment(currentDate).subtract(1, 'days').format('YYYY-MM-DD')
  const nextdate = moment(currentDate).add(1, 'days').format('YYYY-MM-DD')
  try {
    if (await client.exists(`${currentDate}`) === 1 && await client.exists(`${prevdate}`) === 1 && await client.get(`${nextdate}`) !== 1) {
      console.log('fetchOnInit with caching ....')
      const prevCachedResponse = JSON.parse(await client.get(`${prevdate}`))
      const currentCachedResponse = JSON.parse(await client.get(`${currentDate}`))
      return [prevCachedResponse, currentCachedResponse]
    } else {
      console.log('fetchOnInit with fetching....')
      const InitResponse = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}&start_date=${prevdate}&end_date=${currentDate}`)
      const initData = await InitResponse.json()
      for (let i = 0; i < 2; i++) {
        client.set(initData[i].date, JSON.stringify(initData[i]))
      }
      return initData
    }
  } catch (e) {
    console.log(e)
  }
}
// only fetch/cache when all three entries are not cached
async function fetchBulkAll(currentDate) {
  const prevdate = moment(currentDate).subtract(1, 'days').format('YYYY-MM-DD')
  const nextdate = moment(currentDate).add(1, 'days').format('YYYY-MM-DD')
  try {
    const bulkResponse = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}&start_date=${prevdate}&end_date=${nextdate}`)
    const bulkData = await bulkResponse.json()
    for (let i = 0; i < 3; i++) {
      await client.set(bulkData[i].date, JSON.stringify(bulkData[i]))
      console.log(i, 'I am storing the cache!')
    }
    return bulkData
  } catch (e) {
    console.log(e)
  }
}

app.get('/api/:date', async function checkCache(req, res) {
 
  const { date: currentDate } = req.params
  const prevdate = moment(currentDate).subtract(1, 'days').format('YYYY-MM-DD')
  const nextdate = moment(currentDate).add(1, 'days').format('YYYY-MM-DD')
  try {
    if (currentDate > moment().format('YYYY-MM-DD')) {
      res.send({ message: 'go back' })
    }
    else if (await client.exists(`${currentDate}`) === 1 && await client.exists(`${prevdate}`) === 1 && await client.exists(`${nextdate}`) === 1) {
      const prevData = await client.get(`${prevdate}`)
      const currentData = await client.get(`${currentDate}`)
      const nextData = await client.get(`${nextdate}`)
      res.send([JSON.parse(prevData), JSON.parse(currentData), JSON.parse(nextData)])
    }
    // if date is current date only fetch the left and middle entries
    else if (currentDate === moment().format('YYYY-MM-DD')) {
      const fetchOnInitData = await fetchOnInit(currentDate)
      const concurrentData = await fetchOnInitData.push({ message: 'No data sir for this day' })
      res.send(fetchOnInitData)
    } else if (await client.exists(`${currentDate}`) !== 1 && await client.exists(`${prevdate}`) !== 1 && await client.exists(`${nextdate}`) !== 1) {
      console.log('I am fetching all the datas!')
      const bulkDataResponse = await fetchBulkAll(currentDate)
      res.send(bulkDataResponse)
    }
    // if either one fails that means that there is a missing entry either left or right
    else {
      (await client.exists(`${currentDate}`) !== 1 || await client.exists(`${prevdate}`) !== 1 || await client.exists(`${nextdate}`) !== 1)
      console.log('fetching remaining data')
      const { fetchedEntry, cachedEntry } = await fetchRemaining(currentDate)
      const currentResponse = await client.get(`${currentDate}`)
      const cachedEntryResponse = await client.get(`${cachedEntry}`)
      console.log(typeof fetchedEntry, typeof currentResponse, typeof cachedEntryResponse  )
      res.send([
        fetchedEntry,
        JSON.parse(currentResponse),
        JSON.parse(cachedEntryResponse),
      ])
    }
  } catch (e) {
    console.log(e, 'checkCache Error')
  }
})

// prev = 14 , current = 15 , next = 16
async function fetchRemaining(currentDate) {
  const prevdate = moment(currentDate).subtract(1, 'days').format('YYYY-MM-DD')
  const nextdate = moment(currentDate).add(1, 'days').format('YYYY-MM-DD')

  try {
    // the left side of the carousel is not cached
    if (await client.exists(`${prevdate}`) === 1) {
      const nextResponse = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}&date=${nextdate}`);
      const nextData = await nextResponse.json();
      client.set(nextData.date, JSON.stringify(nextData))
      console.log('fetching right', nextdate)
      return { fetchedEntry: nextData, cachedEntry: prevdate }
    }
    // the right side of the carousel is not cached
    else if (await client.exists(`${nextdate}`) === 1) {
      const prevdateResponse = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}&date=${prevdate}`);
      const prevData = await prevdateResponse.json();
      client.set(prevData.date, JSON.stringify(prevData))
      console.log('fetching left', prevdate)
      return { fetchedEntry: prevData, cachedEntry: nextdate }
    }
  } catch (e) {
    console.log(e, 'FetchRemaining Error')
  }
}
(async () => {
  await client.connect();
})();

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})




