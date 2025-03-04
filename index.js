const express = require('express');
const cors = require('cors');
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000
app.use(cors());
app.use(express.json())




const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h4wau.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });

    //console.log("Pinged your deployment. You successfully connected to MongoDB!");
    const TaskCollection = client.db('To-Do').collection('tasks');
    const userCollection = client.db('To-Do').collection('user');
    app.post('/tasks', async (req, res) => {
      const task = req.body;
      console.log(task)
      const result = await TaskCollection.insertOne(task);
      res.send(result);
    })
    app.get('/tasks', async (req, res) => {
      const email = req.query.email; // Extract email from query parameters
      if (!email) {
        return res.status(400).send({ message: "Email is required" });
      }
      try {
        // Find tasks by email
        const result = await TaskCollection.find({ email: email }).toArray();
        res.send(result);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).send({ message: 'Server error' });
      }
    });

    const { ObjectId } = require('mongodb'); // Make sure ObjectId is required
    app.get('/task/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await TaskCollection.find(query).toArray();
      res.send(result);
    })
    // app.patch('/tasks/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const { category } = req.body; // Get the new category from the request body

    //   // Ensure category is provided
    //   if (!category) {
    //     return res.send({ error: "Category is required" });
    //   }

    //   const filter = { _id: new ObjectId(id) };
    //   const updatedDoc = { $set: { category } }; // Update the category field

    //   // Update task in MongoDB
    //   const result = await TaskCollection.updateOne(filter, updatedDoc);

    //   if (result.matchedCount === 0) {
    //     return res.send({ error: "Task not found" });
    //   }

    //   // Send response with the update result
    //   res.send({ message: "Task updated successfully", result });
    // });
    app.patch("/task/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const {category,order}=req.body;
      console.log(category,order)
      const filter = { _id: new ObjectId(id) };
      const options={upsert:true}
      const updatedDoc = {
        $set: {
          category: category,
          order:order
        }
      };
      console.log(updatedDoc)
      const result = await TaskCollection.updateOne(filter, updatedDoc,options);
      console.log(result)
      res.send(result)
    });
    app.patch("/update/:id", async (req, res) => {
      const { id } = req.params;
      const { title, description, category, timestamp } = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          title:title,
          description:description,
          category:category,
          timestamp:timestamp}}
          console.log(updatedDoc)
          const result = await TaskCollection.updateOne(filter, updatedDoc);
          res.send(result)
    });
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      console.log(id)
      const result = await TaskCollection.deleteOne(filter);
      res.send(result);
    });

    app.post('/user', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existinguser = await userCollection.findOne(query);
      if (existinguser) {
        return res.send({ message: 'User Already exist' })
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    })
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('to-do')
})

app.listen(port, () => {
  console.log('ta-da!!')
})