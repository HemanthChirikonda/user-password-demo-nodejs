const express = require('express');
const app = express();
const bodyParser= require('body-parser');
const mongodb= require('mongodb');
let bcrypt= require('bcryptjs');
var jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const shortId= require('shortid');
const mongodbClint= mongodb.MongoClient;
const url = 'mongodb+srv://hemanth:OHoCYn9ztyvAKrdH@cluster0.v7ugo.mongodb.net?retryWrites=true&w=majority';
const cors= require('cors');
//const { response } = require('express');

app.use(express.urlencoded({extended:false}));


let authenticate= function(req,res,next){
  //check if token present
  if(req.headers.authorization){
// check if token valid
let verifyResult= jwt.verify(req.headers.authorization,"mnbvcxsertyuiolknb");
// if valid then allow user
if(verifyResult){
    next();
}else{
    res.status(401).json({
        "message":"invalid authorization"
    })
}
  }else{
      res.status(401).json({
          "message":"no token present"
      })
  }
  
  
}

app.use(cors({
    origin:"http://127.0.0.1:5500"
}));
app.use(bodyParser.json());
const port=3030;

app.get("/",(req,res)=>{
res.send("hello")
})


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
  //  console.log(hash);
    let user = await db.collection('users').insertOne({
               "Email": req.body.Email,
               "Dob":req.body.Dob,
             "Address": req.body.Address,
            "Address2": req.body.Address2,
            "City": req.body.City,
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
    try {
        let client = await mongodbClint.connect(url);
        let db= client.db('trimurlapp');
        let user= await db.collection('users').findOne({'Email':req.body.Email});
        if(user){
          var result= await bcrypt.compare(req.body.Password,user.Password);
          if(result){
              let token= jwt.sign({Email:user.Email},"mnbvcxsertyuiolknb");
              //console.log(token);
              res.json({
                  "message":"Allow",
                  token
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

});


app.get("/dashboard", authenticate, async (req,res)=>{
    try {
        let client = await mongodbClint.connect(url);
        let db= client.db('trimurlapp');
        let shorturl= await db.collection('shorturls').find().toArray();
        client.close();
        res.json(shorturl);
    } catch (error) {
        res.json(error)
    }

});

app.post("/dashboard", authenticate, async (req,res)=>{
    try {
        let client = await mongodbClint.connect(url);
        let db= client.db('trimurlapp');
        let shorturl= await db.collection('shorturls').insertOne({
            "full":req.body.full,
              "short":shortId.generate(),
              "clicks":0,
              "user":req.body.Email
        });
        client.close();
        res.json({
            "message":"url created"
        });
    } catch (error) {
        res.json(error)
    }

})

app.get("/:code", async (req,res)=>{
    //console.log(hello)
    try {
        let variable= req.params.code;
        let client = await mongodbClint.connect(url);
        let db= client.db('trimurlapp');
        //console.log(shortUrl);
        let shorturl= await db.collection('shorturls').findOne({short: variable});
        console.log(shorturl);
        if(shorturl=== null) return res.status(404);
        shorturl.clicks++;
        console.log(shorturl)
        res.redirect(shorturl.full);
        client.close();
       res.json(shorturl)
    } catch (error) {
        console.log(error)
        res.json(error)
    }
})




app.post("/gencode", async (req,res)=>{
 try {
     let client = await mongodbClint.connect(url);
    let db= client.db('trimurlapp');
    let user= await db.collection('users').findOne({'Email':req.body.Email});
    if(user){
        let result =  (req.body.Dob === user.Dob);
      if(result){
        let code= Math.ceil(Math.random()*(999999-100000)+100000);
        let salt= bcrypt.genSalt(10);
        let hash= bcrypt.hash(code,salt);
    await db.collection('users').findOneAndUpdate({"Email":req.body.Email},{$set:{"Password":hash}});
      }else{
        res.json({
            "message":"invalid details"
        })
      }

    }else{
        res.json({
            "message":"invalid User"
        })
    }
    client.close();
    res.json({
        "message":"Code genareted"
    })
 } catch (error) {
     res.json({
         "message":error
     })
 }
})
app.post("/gencode", async (req,res)=>{
 try {
     let client = await mongodbClint.connect(url);
    let db= client.db('trimurlapp');
    let user= await db.collection('users').findOne({'Email':req.body.Email});
    if(user){
        let result =  (req.body.Dob === user.Dob);
      if(result){
        let code= Math.ceil(Math.random()*(999999-100000)+100000);
        let salt= bcrypt.genSalt(10);
        let hash= bcrypt.hash(code,salt);
    await db.collection('users').findOneAndUpdate({"Email":req.body.Email},{$set:{"Password":hash}});
      }else{
        res.json({
            "message":"invalid details"
        })
      }

    }else{
        res.json({
            "message":"invalid User"
        })
    }
    client.close();
    res.json({
        "message":"Code genareted"
    })
 } catch (error) {
     res.json({
         "message":error
     })
 }
});






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



    app.listen(process.env.PORT || 5000,()=>{
        console.log('server started')
    })