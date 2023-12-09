const PermissionSet = require("../board");
const { getUserRoleList } = require("../db");

let list = null;

async function getAllRolesList(){
  list = await getUserRoleList();
}

function getPermissionSet(name){
  function innerfunc(res){
    let j = list.filter(e=>e.role==name);
    if(j.length > 0) res(new PermissionSet(j[0].permission))
    else res(null);
  }
  return new Promise(async res=>{
    if(list){
      innerfunc(res);
    }else{
      try{
        await getAllRolesList();
      }catch(err){
        console.log(err);
      }finally{
        innerfunc(res);
      }
    }
  });
}

module.exports = {
  getPermissionSet
}