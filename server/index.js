const express = require('express');
const redis = require('redis');
const fetch = require('node-fetch');
const app = express();
const port = 3000;
const redis_port = process.env.redis_port || 6379
require('dotenv').config()

const client = redis.createClient(redis_port);


function cache(res, req, next) {
  const { date } = req.params

  client.get(date, (error, data) => {
    if (error) throw error;

    if (!data) {
      res.send(data)
    } else {
      next();
    }
  })
}
app.get('/api/:date', cache, async (req, res) => {
  try {
    const { date } = req.params

    const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}&date=${date}`);

    const data = await response.json();

    res.send(data)
  } catch (e) {
    console.log(e)
  }
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})