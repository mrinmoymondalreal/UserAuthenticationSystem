export default {
  method: "mobile",
  token_expireIn: 100,
  database_url: "postgres://postgres:mrinmoymondal@localhost:5432/zuthauth",
  token_secert: "superSecert",
  sendVerification: function (mobile, code) {
    console.log(mobile, code);
  },
};
