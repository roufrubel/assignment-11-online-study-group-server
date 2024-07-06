const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware
const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json()); // Middleware to enable CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", 
      "https://assign-10-jute-decor-client.web.app");
     // Replace with your client's origin
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tjqypvp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const craftCollection = client.db('artCraft').collection('craft');
    const categoryCollection = client.db('artCraft').collection('category');
    // const userCollection = client.db('coffeeDB').collection('user');

    app.get('/craft', async (req, res) => {
      const cursor = craftCollection.find();
      const result = await cursor.toArray();
      res.send(result);
      // console.log(result)
    })

    app.get('/category', async (req, res) => {
      const cursor = categoryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
      // console.log(result)
    })
    
    app.post('/craft', async (req, res) => {
      const newCraft = req.body;
      console.log(newCraft)
      const result = await craftCollection.insertOne(newCraft);
      res.send(result);
      // console.log(result)
    })

    app.delete('/craft/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };     
      const result = await craftCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('jute  server is running running')
})

app.listen(port, () =>{
    console.log('jute server is running running running on port ', port);
})







