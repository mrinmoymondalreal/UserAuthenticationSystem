const { v4: uuidv4 } = require('uuid');

function PermissionSet(d){
  
  this._ = {};
  this._.__databases = [];

  this._.__update = this._.__delete = this._.__create = this._.__read = 0;

  this.setData = function(_){
    this._ = JSON.parse(_);
  }

  if(d) this.setData(d);

  this.addDatabase = function(db){
    this._.__databases.push(db);
  }
  
  this.deleteDatabase = function(db){
    this._.__databases = _.__databases.filter(e=>e!=db);
  }

  this.setPermission = function({
    c,r,u,d
  }){
    this._.__update = u || 0;
    this._.__delete = d || 0;
    this._.__create = c || 0;
    this._.__read = r || 0;
  }

  this.getString = function(){
    return JSON.stringify(this._);
  }

  this.data = function(){
     return{
      d: this._.__databases,
      p: {
        c: this._.__create,
        u: this._.__update,
        d: this._.__update,
        r: this._.__read
      },
      r: this._.__role[0],
      c: this._.__role[1]
     }
  }

  this.setRole = function(role, code = uuidv4()){
    this._.__role = [role, code];
  }

  this.checkRole = function (r){
    return (this._.__role[0] == r);
  }

  this.checkPermission = function(t){
    let d = this.data().p[t];
    return !(d == undefined && d == null) && (d == 1);
  }

  this.getUUID = function(){
    return this._.__role[1];
  }

  return this;
}

module.exports = PermissionSet;