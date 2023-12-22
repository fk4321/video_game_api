const pg = require('pg')
const client = new pg.Client('postgres://localhost/gamestore')
const express = require('express')
const morgan = require('morgan')
//create express app
const app = express()

app.use(morgan('dev'))
//tell express to parse json
app.use(express.json())

//see all the video game names 
app.get('/api/video_games', async(req, res, next) => {
    try {
        const SQL = `
        SELECT *
        FROM video_games
        `
        const response = await client.query(SQL)
        res.send(response.rows)
    } catch(error) {
        next(error)
    }
})

//get a single video game
app.get('/api/video_games/:id', async(req, res, next) => {
    try {
        const SQL = `
            SELECT * 
            FROM video_games
            WHERE id = $1
        `
        const response = await client.query(SQL, [req.params.id])
        res.send(response.rows[0])
    } catch(error) {
        next(error)
    }
})

//delete a specific video game 
app.delete('/api/video_games/:id', async(req, res, next) => {
    try {
        const SQL = `
            DELETE
            FROM video_games
            WHERE id = $1
        `
        const response = await client.query(SQL, [req.params.id])
        res.send(response.rows)
    } catch (error) {
        next(error)
    }
})

//create new video game 
app.post('/api/video_games', async(req, res, next) => {
    try {
        const SQL = `
            INSERT INTO video_games(name, type, purchase_price)
            VALUES($1, $2, $3)
            RETURNING *
        `
        const response = await client.query(SQL, [req.body.name, req.body.type, req.body.purchase_price])
        res.send(response.rows)
    } catch(error) {
        next(error)
    }
})

//update video game with put 
app.put('/api/video_games/:id', async (req, res, next) => {
    try {
        const SQL =`
        UPDATE video_games
        SET name = $1, type = $2, purchase_price = $3
        WHERE id = $4
        RETURNING *
        `
        const response = await client.query(SQL, [req.body.name, req.body.type, req.body.purchase_price, req.params.id])
        res.send(response.rows)
    }catch(error) {
        next(error)
    }
})

const start = async () => {
    //connect client to gamestore data base 
    await client.connect()
    console.log("Client connected to db")

    //create video_games table 
    const SQL = `
        DROP TABLE IF EXISTS video_games;
        CREATE TABLE video_games (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100),
            type VARCHAR(100),
            purchase_price INT
        );
        INSERT INTO video_games(name, type, purchase_price) VALUES('Call of Duty', 'Action', 99);
        INSERT INTO video_games(name, type, purchase_price) VALUES('Super Mario Bros', 'Action', 23);
        INSERT INTO video_games(name, type, purchase_price) VALUES('Grand Theft Auto', 'Action', 34);
        INSERT INTO video_games(name, type, purchase_price) VALUES('Super Smash Bros', 'Action', 23);
    `
    await client.query(SQL)
    console.log("Video Table Created!")
    
    //create board_games table 
    const SQLB = `
        DROP TABLE IF EXISTS board_games;
        CREATE TABLE board_games (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100),
            type VARCHAR(100),
            purchase_price INT
        );
        INSERT INTO board_games(name, type, purchase_price) VALUES('Scrabble', 'Action', 99);
        INSERT INTO board_games(name, type, purchase_price) VALUES('Cue', 'Action', 23);
        INSERT INTO board_games(name, type, purchase_price) VALUES('Monopoly', 'Action', 34);
        INSERT INTO board_games(name, type, purchase_price) VALUES('Chess', 'Action', 23);
    `
    await client.query(SQLB)
    console.log("Board Table Created!")

    //start express server at port 
    const port = process.env.PORT || 3000
    app.listen(port, () => {
        console.log(`app running on port: ${port}`)
    })
}
start()
