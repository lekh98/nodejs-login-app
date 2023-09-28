import express from "express";
//import path from 'path';
import path from 'path';
import mongoose from 'mongoose';
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
mongoose
    .connect("mongodb://127.0.0.1:27017/",{
    dbName:"backend",
    })
    .then(()=>console.log("Database is connected"))
    .catch((e)=>console.log(e))

    const userSchema = new mongoose.Schema({
        name:String,
        email:String,
        password:String,
    });

    const User = mongoose.model("User",userSchema)

const app = express();
const users=[];

app.use(express.static(path.join(path.resolve(),"public")))
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.set("view engine","ejs");

const isAuthenticated = async(req,resp,next)=>{
    const {token} =req.cookies;
    if(token){
        const decoded = jwt.verify(token,"abcdefgh");
        req.user = await User.findById(decoded._id)
        //console.log(decoded)
        next();
    }
    else{
        resp.redirect("/login")
    }

}
app.get("/",isAuthenticated,(req,resp)=>{
    //console.log(req.user)
    resp.render("logout",{name:req.user.name});
});

app.get("/login",(req,resp)=>{
    //console.log(req.user)
    resp.render("login");
});

app.get("/register",(req,resp)=>{
    //console.log(req.user)
    resp.render("register");
});

//for routing
app.get("/",(req,resp)=>{
    const {token} =req.cookies;
    if(token){
        resp.render("logout");
    }
    else{
        resp.render("login");
    }

     resp.render("login");

    /*console.log(req.cookies)
    //resp.render("index.ejs");
    //resp.render("index",{name: "Pradeep"});
   

   
    const pathlocation = path.resolve();
    resp.sendFile(path.join(pathlocation, "./index.html"));
    resp.send('hi');
    resp.sendStatus(404)
   resp.status(400).send("hi hello")

   resp.json({
    success:true,
    products:[],
   });*/
});

/*app.get("/success",(req,resp)=>{
    resp.render("success");

})*/

app.post("/login",async (req,resp)=>{
    const { email,password }=req.body;
    let user =await User.findOne({email});
    if(!user){
        return resp.redirect("/register")
    }
    const isMatch =await bcrypt.compare(password,user.password);
    isMatch =user.password===password;
    if(!isMatch){
        return resp.render("login",{email,message:"Incorrect Password"})
    }
    const token = jwt.sign({_id:user._id},"abcdefgh");
    //console.log(token);



    resp.cookie("token",token,{
        httpOnly:true,
        expires:new Date(Date.now()+60*1000)
    })
    resp.redirect("/")

});

app.post("/register",async(req,resp)=>{
    const {name,email,password}=req.body

    let user =await User.findOne({email});
    if(user){
        return resp.redirect("/login");
    }

    const hashedPassword =await bcrypt.hash(password,10)
    user = await User.create({
        name,
        email,
        password:hashedPassword,
    });

    const token = jwt.sign({_id:user._id},"abcdefgh");
    //console.log(token);



    resp.cookie("token",token,{
        httpOnly:true,
        expires:new Date(Date.now()+60*1000)
    })
    resp.redirect("/")
})

app.get("/logout",(req,resp)=>{
    resp.cookie("token",null,{
        httpOnly:true,
        expires:new Date(Date.now())
    })
    resp.redirect("/")
})

/*app.get("/add",async(req,resp)=>{
   await Message.create({name:"pradeep",email:"sample@gmail.com"});
        resp.send("Hello pradeep");  

});

app.get("/users",(req,resp)=>{
    resp.json({
        users,
    });
});


app.post("/contact",async(req,resp)=>{
    console.log(req.body);
    users.push({username:req.body.name,email:req.body.email});
    resp.render("success");
    const {name,email}=req.body
    await User.create({name,email});

    resp.redirect("/success");

});*/

app.listen(5000,()=>{
    console.log("server is working")
});