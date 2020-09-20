const express = require('express');
const app = express();
const bodyParser= require('body-parser');
const mongodb= require('mongodb');
let bcrypt= require('bcryptjs');
const mongodbClint= mongodb.MongoClient;
const url = 'mongodb+srv://hemanth:OHoCYn9ztyvAKrdH@cluster0.v7ugo.mongodb.net?retryWrites=true&w=majority';
const cors= require('cors');
const { response } = require('express');

app.use(cors({
    origin:"http://127.0.0.1:5500"
}));
app.use(bodyParser.json());
const port=3030;




app.post("/register", async (req,res)=>{
    try {
//console.log(req.body);
let client = await mongodbClint.connect(url);
let db= client.db('trimurlapp');
let email= await db.collection('users').findOne({'Email':req.body.Email});
if(email){
    res.json({
        "message":"user alredy present"
    })
}else{
    let salt= await bcrypt.genSalt(10);
    let hash= await bcrypt.hash(req.body.Password,salt);
    req.body.Password= hash;
    console.log(hash);
    let user = await db.collection('users').insertOne({
            "Address": req.body.Address,
            "Address2": req.body.Address2,
            "City": req.body.City,
            "Email": req.body.Email,
            "Gridcheck": req.body.Gridcheck,
            "Password": req.body.Password,
            "State": req.body.State,
            "Zip": req.body.Zip
            }
    );
 
}

client.close();
res.json({
    "message":"user created"
}) 
    } catch (error) {
        res.json({
            "message":error
        })
    }

});

app.post("/login",async (req,res)=>{
    try {let client = await mongodbClint.connect(url);
        let db= client.db('trimurlapp');
        let user= await db.collection('users').findOne({'Email':req.body.Email});
        if(user){
          var result= await bcrypt.compare(req.body.Password,user.Password);
          if(result){
              res.json({
                  "message":"Allow"
              });
          }else{
             res.json({
                 "message":" Password or email is incorrect"
             })
          }
        
        }else{
           res.json({
               "message":"invalid user"
           });
         
        }
        client.close();
        
    } catch (error) {
        res.json({
            "message":error
        })
    }

})






app.get("/users", async (req,res)=>{
    try {
        let client = await mongodbClint.connect(url);
        let db= client.db('trimurlapp');
       let users= await db.collection('users').find().toArray();
        client.close();
       // console.log(student)
        res.json({"data":users,
        "message":"got the data"})
    } catch (error) {
      res.json({
          "message":error
      })
    }
    })



    app.listen(5000,()=>{
        console.log('server started')
    })