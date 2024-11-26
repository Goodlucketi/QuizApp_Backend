require("dotenv").config()
const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = process.env.MONGO_URI;

const uri = "mongodb+srv://fabian:fabian607@quizapp.7x5as.mongodb.net/?retryWrites=true&w=majority&appName=quizApp"


const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log("Connection Successful");
    return client.db('quiz_app')
  } catch(err) {
    console.error('Failed to Connect', err)
    throw err
  }
}

module.exports = connectDB