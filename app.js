const express = require('express')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const PORT = 3000
const connectDb = require('./dbConfig')

const JWT_SECRET = "Mfoniso@607"

app.use(express.json())
app.use(cors())

let db

(async ()=>{
    db = await connectDb();
})()

app.get('/', (req, res)=>{
    res.send("Server Running")
})

app.post('/auth/signup', async (req, res)=>{
   const {player_name, player_email, player_password, player_username} = req.body

   try{
    // Hash Password
    const hashedPwd = await bcrypt.hash(player_password, 10)

    // Insert into Database
    const collection = db.collection('users')
    const result = await collection.insertOne({player_name, player_email, player_password:hashedPwd, player_username})

    // Response message
    res.status(201).json({
        success:true,
        message: "Player registered successfully", 
        userId: result._id
    })

   }catch(error){
    console.error("Signup Error", error);
    res.status(500).json({message: "Error Registering User", success:false})
   }

})

app.post('/auth/addquiz', async (req, res)=>{
    const quizData = req.body
    if(!quizData){
        console.log("Data not received");
        res.status(400).json({message:"Data not received"})        
    }else{
        try {
            const collection = db.collection('quiz')
            const result = await collection.insertOne(quizData)
           
            res.status(201).json({
                    success:true,
                    message: "Quiz Successfully Added",
                    quizId:result._id
                })
        } catch (error) {
            console.error("Error Uploading Quiz", error)
            res.status(500).json({
                success:false,
                message:"Failed to Add Quiz"
            })
        }
    }
})

app.post('/auth/login', async (req, res)=>{
    const {player_username, player_password} = req.body
    
    try {
        // check if user exists
        const collection = db.collection('users')
        const user = await collection.findOne({player_username})
        if(!user){
            return res.status(404).json({
                message: "Player Not Found", 
                success:false
            })
        }
        
        // Check if password match
        const chkPwd = await bcrypt.compare(player_password, user.player_password)
        if(!chkPwd){
            return res.status(404).json({
                message: "Username or Password Incorrect",
                success:false
            })
        }

        // Generate JWT token
        const token = jwt.sign({
            userId:user._id, 
            username:user.player_username
        }, JWT_SECRET, { expiresIn:'1h'})

        res.status(200).json({
            success:true,
            message:"Login Successful",
            token
        })
    } catch (error) {
        console.error("Error loggin in", error);
        res.status(500).json({ message:"Error Logging In", success:false})
        
    }
    
})


app.listen(PORT, ()=>{
    console.log("Server is running at http://localhost:3000");
})