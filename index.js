const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

// middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://assign-11-online-study-group.web.app",
      "https://assign-11-online-study-group.firebaseapp.com",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tjqypvp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const cookieOption = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production" ? true : false,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const assignmentCollection = client
      .db("groupStudy")
      .collection("assignment");
    const submitCollection = client.db("groupStudy").collection("submit");

    // jwt api
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      // console.log("user for token", user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.cookie("token", token, cookieOption).send({ success: true });
    });

    app.post("/logout", async (req, res) => {
      const user = req.body;
      console.log("logging out", user);
      res
        .clearCookie("token", { ...cookieOption, maxAge: 0 })
        .send({ success: true });
    });

    app.put("/assignment/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedAssignment = req.body;
      console.log(updatedAssignment);
      const updateDoc = {
        $set: {
          title: updatedAssignment.title,
          description: updatedAssignment.description,
          marks: updatedAssignment.marks,
          image: updatedAssignment.image,
          difficulty: updatedAssignment.difficulty,
          date: updatedAssignment.date,
          user_email: updatedAssignment.user_email,
        },
      };
      const result = await assignmentCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.get("/assignment", async (req, res) => {
      const cursor = assignmentCollection.find();
      const result = await cursor.toArray();
      res.send(result);
      // console.log(result)
    });

    app.get("/assignment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      // const options = {
      //   // Include only the `title` and `imdb` fields in the returned document
      //   projection: { title: 1, marks: 1, description: 1, image: 1 },
      // };

      // const result = await assignmentCollection.findOne(query, options);
      const result = await assignmentCollection.findOne(query);
      // console.log("update result", result);
      res.send(result);
    });

    app.get("/submit", async (req, res) => {
      const cursor = submitCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/assignment", async (req, res) => {
      const newAssignment = req.body;
      // console.log(newAssignment);
      const result = await assignmentCollection.insertOne(newAssignment);
      res.send(result);
      // console.log(result)
    });

    app.post("/submit", async (req, res) => {
      try {
        const { title, marks, userEmail, quickNote, docLink } = req.body;

        const submitAssignment = {
          docLink,
          quickNote,
          title,
          marks,
          userEmail,
        };
        const result = await submitCollection.insertOne(submitAssignment);
        res.send(result)
      } catch (error) {
        console.error("Error in assignment submission:", error);
        res.status(500).json({ error: "Failed to submit the assignment" });
      }
    });

    app.patch("/submit/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const { obtainedMark, feedBack, status } = req.body;
      console.log(req.body);

      const updateDoc = {
        $set: {
          obtainedMark,
          feedBack,
          status,
        },
      };

      const result = await submitCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete("/assignment/:id", async (req, res) => {
      const id = req.params.id;
      const email = req.query.email;

      const query = { _id: new ObjectId(id), user_email: email };
      const result = await assignmentCollection.deleteOne(query);
      if (result.deletedCount === 1) {
        // res.send({ message: "Assignment deleted successfully" });
      } else {
        res
          .status(404)
          .send({ message: "Assignment not found or user not authorized" });
      }
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("assignment  server is running running");
});

app.listen(port, () => {
  console.log("assignment server is running running running on port ", port);
});
