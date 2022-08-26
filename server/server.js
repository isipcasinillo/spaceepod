const express = require('express');
const redis = require('redis');
const fetch = require('node-fetch');
const moment = require('moment')
const app = express();
const port = 3000;
const host = '0.0.0.0';
const cors = require("cors")
const redis_port = process.env.redis_port || 6379
require('dotenv').config()
app.use(cors())

// const client = redis.createClient({
//     url: 'redis://redis',
//     port: 6379
// });

// // const client = redis.createClient(6379);

const client = redis.createClient(redis_port);


async function init() {
    await client.connect();
}
init()

// (async () => {
//     await client.connect();
// })();

app.get('/api', async function (req, res) {
    console.log('----------------------------------------------------')
    const { date } = req.query
    const prevdate = moment(date).subtract(1, 'days').format('YYYY-MM-DD')
    const nextdate = moment(date).add(1, 'days').format('YYYY-MM-DD')
    const today = moment().format('YYYY-MM-DD')

    const cachedDatePrev = await client.get(`${prevdate}`)
    const cachedDate = await client.get(`${date}`)
    const cachedDateNext = await client.get(`${nextdate}`)

    // initial fetch
    if (date > today && !cachedDatePrev && !cachedDate && !cachedDateNext) {
        console.log(`Unknown all\n`)
        const todayMessage = {
            explanation: 'There is not an Astronomy Picture of the Day for this date Please select another date',
            url: 'https://via.placeholder.com/500x250',
            media_type: 'image',
            date: date
        }
        const tomorrowMessage = {
            explanation: 'There is not an Astronomy Picture of the Day for this date Please select another date',
            url: 'https://via.placeholder.com/500x250',
            media_type: 'image',
            date: nextdate
        }
        const prevMessage = {
            explanation: 'There is not an Astronomy Picture of the Day for this date Please select another date',
            url: 'https://via.placeholder.com/500x250',
            media_type: 'image',
            date: prevdate
        }
        res.send([prevMessage, todayMessage, tomorrowMessage])
    }
    if (date > today && cachedDatePrev && !cachedDate && !cachedDateNext) {
        console.log(`Unknown mid and right\n`)
        const tomorrowMessage = {
            explanation: 'There is not an Astronomy Picture of the Day for this date Please select another date',
            url: 'https://via.placeholder.com/500x250',
            media_type: 'image',
            date: nextdate
        }
        const todayMessage = {
            explanation: 'There is not an Astronomy Picture of the Day for this date Please select another date',
            url: 'https://via.placeholder.com/500x250',
            media_type: 'image',
            date: prevdate
        }
        const cachedDatePrev = await client.get(`${prevdate}`)
        const cachedPrev = JSON.parse(cachedDatePrev)
        res.send([cachedPrev, todayMessage, tomorrowMessage])
    }
    if (!cachedDate && date === today) {
        console.log(`initial Fetch\n`)
        const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}&start_date=${prevdate}&end_date=${date}`)
        const data = await response.json()
        for (let i = 0; i < 2; i++) {
            client.set(`${data[i].date}`, JSON.stringify(data[i]))
        }

        const cachedPrev = JSON.parse(cachedDatePrev)
        const cachedCur = JSON.parse(cachedDate)
        const tomorrowMessage = {
            explanation: 'There is not an Astronomy Picture of the Day for this date Please select another date',
            url: 'https://via.placeholder.com/500x250',
            media_type: 'image',
            date: nextdate
        }

        res.send([cachedPrev, cachedCur, tomorrowMessage])
        return;
    }
    // initial fetch from cache
    else if (cachedDate && cachedDatePrev && date === today) {
        console.log(`initial Fetch but with cache\n`)
        const prevData = await client.get(`${prevdate}`)
        const curData = await client.get(`${date}`)

        const cachedPrev = JSON.parse(prevData)
        const cachedCur = JSON.parse(curData)
        const tomorrowMessage = {
            explanation: 'There is not an Astronomy Picture of the Day for this date Please select another date',
            url: 'https://via.placeholder.com/500x250',
            media_type: 'image',
            date: nextdate
        }
        res.send([cachedPrev, cachedCur, tomorrowMessage])
        return
    }
    // fetch left only
    else if (!cachedDatePrev && date < today && cachedDate && cachedDateNext) {
        console.log(`Fetching from left only\n`)
        const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}&date=${prevdate}`)
        const data = await response.json()
        await client.set(`${data.date}`, JSON.stringify(data))

        const cachedDatePrev = await client.get(`${prevdate}`)
        const cachedDate = await client.get(`${date}`)
        const cachedDateNext = await client.get(`${nextdate}`)

        const cachedPrev = JSON.parse(cachedDatePrev)
        const cachedCur = JSON.parse(cachedDate)
        const cachedNex = JSON.parse(cachedDateNext)

        res.send([cachedPrev, cachedCur, cachedNex])
    }
    // fetch middle only
    else if (cachedDatePrev && date < today && !cachedDate && cachedDateNext) {
        console.log(`Fetching from middle only\n`)
        const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}&date=${date}`)
        const data = await response.json()
        await client.set(`${data.date}`, JSON.stringify(data))

        const cachedPrev = JSON.parse(cachedDatePrev)
        const cachedCur = JSON.parse(cachedDate)
        const cachedNex = JSON.parse(cachedDateNext)

        res.send([cachedPrev, cachedCur, cachedNex])
    }
    // fetch right only
    else if (cachedDatePrev && date < today && cachedDate && !cachedDateNext) {
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

        res.send([cachedPrev, cachedCur, cachedNex])
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

        res.send([cachedPrev, cachedCur, cachedNex])
    }
    // fetch all from cache
    else if (cachedDatePrev && cachedDate && cachedDateNext && date < today) {
        console.log(`fetching all from cache\n`)
        const prevData = await client.get(`${prevdate}`)
        const curData = await client.get(`${date}`)
        const nextData = await client.get(`${nextdate}`)

        const cachedPrev = JSON.parse(prevData)
        const cachedCur = JSON.parse(curData)
        const cachedNex = JSON.parse(nextData)

        res.send([cachedPrev, cachedCur, cachedNex])
    }
});

// app.listen(port, host);
app.listen(port);
console.log(`app is listening on ${port} ${host} `);




