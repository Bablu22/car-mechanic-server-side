const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId

require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

// MIddleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sqmxk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect()
        const database = client.db("Car_Mechanic");
        const servicesCollection = database.collection("services");


        // POST API
        app.post('/services', async (req, res) => {

            const service = req.body;
            const result = await servicesCollection.insertOne(service);
            // console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.json(result)
        })

        // GET API
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const services = await cursor.toArray()
            res.json(services)
        })

        // GET Single API
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const service = await servicesCollection.findOne(query);
            res.json(service)
        })

        // DELETE APi
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const deleteService = await servicesCollection.deleteOne(query);
            res.json(deleteService)
        })

    }
    finally {
        // await client.close()
    }
}
run().catch(console.dir)



app.get('/', (req, res) => {
    res.send('Running server')
})

app.listen(port, () => {
    console.log('Runnnig server port:', port);
})