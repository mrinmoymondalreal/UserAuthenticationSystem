const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

const path = require("path");
const { SignUp, logIn, verifyUser } = require("./auth/sign");
const { readFile } = require("fs");
const { getPermissionSet } = require("./auth/user");


const app = express();
const PORT = 8081;

app.use(bodyParser.json());

app.use(cookieParser());

app.use('/static', express.static(path.join(__dirname, "template/static")));

try{
  
  app.get("/login", (req, res)=>{
    res.sendFile(path.join(__dirname, "template/login.html"));
  });
  
  app.get("/signup", (req, res)=>{
    res.sendFile(path.join(__dirname, "template/signup.html"));
  });

  app.get("/", (req, res)=>{
    res.sendFile(path.join(__dirname, "template/dashboard.html"));
  });

  app.get("/role", (req, res)=>{
    res.sendFile(path.join(__dirname, "template/role.html"));
  });
  
  app.post("/sign", async (req, res)=>{
    let d = await SignUp(req.body);
    res.send(d);
  });

  app.get("/get_access", async (req, res)=>{
    let user = await verifyUser({ token: req.cookies["user"], isTemp: true });
    let p = await getPermissionSet(user.data.role);

    res.send(p.data().p);
  });

  app.get('/re_token', async (req, res)=>{

    let d1 = req.headers["authorization"];
    
    if(!d1) return res.send({ data: "INVALID_REQ" });
    else{
      d1 = d1.slice(7);
      let d = req.cookies["user"] ? await verifyUser({ token: req.cookies["user"], isTemp: true }) : { message: "ERR_TOKEN_EXP" };
      if(d.message == "ERR_TOKEN_EXP"){
        let d = await verifyUser({ token: d1, isTemp: false });
        if(d.message == "SUCCESS"){
          res.setHeader("set-cookie", [`user=${d.data}; Path=/; HttpOnly; Secure;`]);
          d = await verifyUser({ token: d.data, isTemp: true });
          return res.send({ data: "SUCCESS", data: d });
        }else{
          return res.send({ data: "INVALID_TOKEN" });
        }
      }else if(d.message == "SUCCESS"){
        return res.send({ message: "SUCCESS", data: d.data });
      }
      res.send({ data: "OOPS" });
    }
  });

  app.get("/logout", (req, res)=>{
    res.setHeader("set-cookie", [`user=null; Path=/; HttpOnly; Secure; expires=Thu, 01 Jan 1970 00:00:00 GMT`]);
    res.send({ message: "SUCCESS" });
  })
  
  app.post("/log", async (req, res)=>{
    let d = await logIn(req.body);
    if(d.message == "SUCCESS"){
      res.setHeader("set-cookie", [`user=${d.data[0]}; Path=/; HttpOnly; Secure;`])
    }
    if(d.message == "SUCCESS") return res.send({ data: d.data[1], message: "SUCCESS" });
    res.send(d);
  });

}catch(err){
  console.log(err);
}



app.listen(PORT, ()=>{
  console.log(`Listening on http://localhost:${PORT}/`);
});