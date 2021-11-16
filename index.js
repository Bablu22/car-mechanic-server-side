const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId
require('dotenv').config()
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const fileUpload = require('express-fileupload');


const app = express()
const port = process.env.PORT || 5000

// MIddleware
app.use(express.static("public"));
app.use(cors())
app.use(express.json())
app.use(fileUpload())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sqmxk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect()
        const database = client.db("Car_Mechanic");
        const servicesCollection = database.collection("services");


        // POST API
        app.post('/services', async (req, res) => {
            const name = req.body.name
            const price = req.body.price
            const pic = req.files.img
            const picData = pic.data
            const encodedData = picData.toString('base64')
            const image = Buffer.from(encodedData, 'base64')
            const service = {
                name,
                price,
                img: image
            }
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
        app.put('services/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const updateDoc = {
                $set: {
                    payment: payment
                }
            }
            const result = await servicesCollection.updateOne(filter, updateDoc)
            res.json(result)
        })
        // DELETE APi
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const deleteService = await servicesCollection.deleteOne(query);
            res.json(deleteService)
        })

        app.post("/create-payment-intent", async (req, res) => {
            const paymentInfo = req.body;
            const amount = paymentInfo.price * 100;

            // Create a PaymentIntent with the order amount and currency
            const paymentIntent = await stripe.paymentIntents.create({
                currency: "eur",
                amount: amount,
                payment_method_types: [
                    "giropay",
                    "eps",
                    "p24",
                    "sofort",
                    "sepa_debit",
                    "card",
                    "bancontact",
                    "ideal",
                ],
            });

            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });


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