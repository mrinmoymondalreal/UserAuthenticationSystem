export default {
  method: ["mobile", "magiclink", "username/password", "email/password"],
  token_expireIn: 100,
  database_url: process.env.DATABASE_URI,
  token_secert: process.env.TOKEN_SECERT,
  user_model: {
    username: {
      len: { max: 20, min: 10 },
      type: "string",
      isRequired: true,
      isUnique: true,
    },
    email: {
      len: { max: 30, min: 10 },
      type: "string",
      isRequired: false,
      regExp: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      isUnique: true,
    },
    mobile: {
      len: { max: 10, min: 10 },
      type: "string",
      isRequired: true,
      isUnique: true,
    },
    name: {
      isRequired: true,
      type: "string",
      len: { max: 30, min: 4 },
    },
    password: {
      isRequired: true,
      type: "string",
      len: { max: 30, min: 4 },
    },
  },
  coloumn_in_jwt: ["name", "username", "email", "mobile"],
  sendVerification: function (mobile, code, type) {
    console.log(mobile, code);
  },
  requestTimeout: 15 * 1000,
};
