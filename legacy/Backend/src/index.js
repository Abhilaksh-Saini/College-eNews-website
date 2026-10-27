const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcrypt");
const collection = require("./mongodb")

const tempelatePath = path.join(__dirname,'../tempelates')
app.use(express.json());
app.set("view engine","hbs");
app.set("views",tempelatePath);
app.use(express.urlencoded({extended:false}));

app.use(express.static("./"));

app.get("/",(req,res)=>{
    const successMessage = req.query.success;
    res.render("login", { success: successMessage});
});
app.get("/signup", (req,res)=>{
    res.render("signup");
});
app.get("/home", (req,res)=>{
    res.render("home");
});
app.get("/forget-Password", (req,res)=>{
    res.render("forgetPassword");
});
app.get("/delete-account", (req,res)=>{
    res.render("deleteAccount");
});

app.post("/signup", async(req,res)=>{
    const {name, password} = req.body;
    try{
        const existingUser = await collection.findOne({name});
        if(existingUser){
            return res.render("signup",{error: "Username already taken"});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const data = {name, password: hashedPassword};
        await collection.insertMany([data]);
        res.redirect("/?success=User Successfully Signed Up");
    }catch(error){
        console.error("Signup error: ",error);
        res.status(500).render("signup", {error: "Error Signing Up. Please Try Up"});
    }
});
app.post("/", async (req,res)=>{
    try{
        const check = await collection.findOne({name: req.body.name});
        if(check && await bcrypt.compare(req.body.password, check.password)){
            res.redirect("http://localhost:3000");
        }
        else{
            res.render("login", {error: "Wrong Password"});
        }
    }catch{
        console.error("Login Error", error);
        res.render("login", {error: "User Not Found"});
    }
});
app.post("/forget-password", async (req,res)=>{
    const {username, newPassword} = req.body;
    try{
        const user = await collection.findOne({name: username});
        if(!user){
            return res.render("forgetPassword", {error: "Username Not Found"});
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await collection.updateOne(
            {name: username},
            {$set:{password: hashedPassword}}
        );
        res.redirect("/?success=Password Updated Successfully");
    }catch(error){
        console.error("Error Resetting Password: ",error);
        res.status(500).render("forgetPassword", {error:"Error resetting the password. Please try again"});
    }
});
app.post("/delete-account", async (req,res)=>{
    const {name,password} = req.body;
    try{
        const user = await collection.findOne({name});
        if(!user){
            return res.render("deleteAccount", {error: "Username Not Found"});
        }
        if(!await bcrypt.compare(password, user.password)){
            return res.render("deleteAccount", {error: "Incorrect Password"});
        }
        await collection.deleteOne({name});
        res.redirect("/?success=Account Deleted Successfully");
    }catch(error){
        console.error("Error Deleting the Account", error);
        res.status(500).render("login", {error: "Error Deleting the Account. Please try again"});
    }
});

app.listen(3001, ()=>{
    console.log("Port Connected");
});


