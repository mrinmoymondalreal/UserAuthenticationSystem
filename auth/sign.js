const { hash, compare } = require("bcrypt");
const db = require("../db.js");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const { v4: uuidv4 } = require('uuid');

function isDef(e){
  return !(e == undefined || e == null);
}

function refun({error, errorMessage, data, message}){
  return ([{
    error,
    errorMessage,
    data,
    message,
  }]).map(e=>{
    let json = {};
    for(let f in e){
      if(e[f]){ json[f] = e[f]; }
    }

    return json;
  })[0];
}

function SignUp({ name, email, password, dob, username }){
  if(Object.values({ name, email, password, dob, username }).filter(e=>!isDef(e)).length > 0) return new Promise(res=>res(refun({ error: 400, errorMessage: "ERR_INVALID_INPUTS" })))
  return new Promise(async res=>{
    const passwordRegExp = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegExp.test(password)) return res(refun({ error: 400, errorMessage: "ERR_INVALID_PASSWORD" }));

    const emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegExp.test(email)) { return res(refun({ error: 400, errorMessage: "ERR_INVALID_EMAIL" })); }

    const usernameRegExp = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegExp.test(username)) { return res(refun({ error: 400, errorMessage: "ERR_INVALID_USERNAME" })); }

    let isUnique = await db.checkUnique(email, username);
    if(!isUnique.isUnique) return res(refun({ error: 400, errorMessage: `ERR_${isUnique.field.toUpperCase()}_EXISTS` }));
    
    let hashed_password = await hash(password, 10);

    let { id } = await db.addToDb({ name, email, password: hashed_password, dob, username });

    sendVerificationEmail({ id, email });

    if(id) res(refun({ data: 200, message: "SUCCESS" }));
  })
}

function sendVerificationEmail({ email, id }){
  let uuid_id = uuidv4();
  db.add_to_verify_table(email, id, uuid_id);
  console.log(`http://localhost:8080/vu/user=${uuid_id}`)
}

function logIn({ usrEmail, password }){
  if(Object.values({ usrEmail, password }).filter(e=>!isDef(e)).length > 0) return new Promise(res=>res(refun({ error: 400, errorMessage: "ERR_INVALID_INPUTS" })))
  return new Promise(async res=>{
    let status = await db.checkUsrEmail(usrEmail);
    if(status.error) return res(refun({ error: 404, errorMessage: "ERR_USER_NOT_FOUND:" }));
    let s = await compare(password, status.data[0]);
    if(!s) return res(refun({ error: 404, errorMessage: "ERR_USER_NOT_FOUND" }));
    let [, user_id, username, email, name, verified] = status.data;
    
    let tkn_temp = jwt.sign({
        email,
        username,
        name,
        verified
    }, process.env.JWT_TKN, { expiresIn: parseInt(process.env.TEMP_OUT) });

    let tkn = jwt.sign({
      email,
      username,
      name,
      verified,
      user_id
    }, process.env.JWT_P_TKN);

    db.set_user_token(tkn, user_id);

    res(refun({ data: [tkn_temp, tkn], message: "SUCCESS"  }));
  });
}

function verifyUser({ token, isTemp }){
  return new Promise(async res=>{
    if(isTemp) {
      try{
        let data = jwt.verify(token, process.env.JWT_TKN);
        return res(refun({ data, message: "SUCCESS" }));
      }catch(err){
        if(err.name == "TokenExpiredError"){
          return res(refun({ data: null, message: "ERR_TOKEN_EXP" }));
        }else{
          return res(refun({ data: null, message: "ERR_TOKEN_INVALID" }));
        }
      }
    }else{
      try{
        let data = jwt.verify(token, process.env.JWT_TKN);
        let { name, username, verified, email } = data;
        let f = await db.check_token(token, data.user_id);
        if(f.data = true){
          let tkn_temp = jwt.sign({
            email,
            username,
            name,
            verified
          }, process.env.JWT_TKN, { expiresIn: parseInt(process.env.TEMP_OUT) })
          res(refun({ data: tkn_temp, message: "SUCCESS" }));
        }else{
          res(refun({ data: false, message: "ERR_INVALID" }));
        }
      }catch(err){
        
        return res(refun({ data: null, message: "ERR_TOKEN_INVALID" }));
      }
    }
  });
}

module.exports = {
  SignUp,
  logIn,
  verifyUser
};