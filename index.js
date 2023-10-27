const express = require("express");
const cors = require("cors");
const { connectToDatabase, client } = require("./dataBase");
const { ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

// route
app.get("/", (req, res) => {
  res.send("card doctor is running");
});
// database
const run = async () => {
  try {
    //   database connection
    await connectToDatabase();
    // create collection
    const database = client.db("carDoctorDB");
    const serviceCollection = database.collection("services");
    const bookingsCollection = database.collection("bookings");
    // get all services
    app.get("/services", async (req, res) => {
      const allServices = serviceCollection.find();
      const result = await allServices.toArray();
      res.send(result);
    });
    // single service
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await serviceCollection.findOne(query);
      res.send(result);
    });
    // get booking by enail
    app.get("/bookings", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await bookingsCollection.find(query).toArray();
      res.send(result);
    });
    // booking api
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const bookings = await bookingsCollection.insertOne(booking);
      res.send(bookings);
    });
    // delete booking
    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingsCollection.deleteOne(query);
      res.send(result);
      console.log(result);
    });
    // patch
    app.patch("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = req.body;
      console.log(options);
      const updateDoc = {
        $set: {
          status: options.status,
        },
      };
      const result = await bookingsCollection.updateOne(query, updateDoc);
      res.send(result);
    });
  } catch (error) {
    console.log(error.message);
  }
};
run();

app.listen(port, () => {
  console.log(`Car doctor app listening on port ${port}`);
});
