export default {
  "user_model": {
    "password": {
      "isRequired": true,
      "type": "string",
      "len": {
        "min": 8,
        "max": null
      }
    },
    "username": {
      "isRequired": true,
      "isUnique": true,
      "len": {
        "min": 3,
        "max": null
      },
      "type": "string"
    },
    "email": {
      "isRequired": true,
      "isUnique": true,
      "len": {
        "min": 3,
        "max": null
      },
      "type": "string",
      "regExp": {}
    },
    "mobile": {
      "isRequired": true,
      "isUnique": true,
      "len": {
        "min": 10,
        "max": null
      },
      "type": "string"
    }
  },
  "method": [
    "magiclink",
    "username/password",
    "mobile"
  ],
  "database_url": "hello",
  "token_secert": "tokenSecert",
  "coloumn_in_jwt": [
    "name",
    "username",
    "email"
  ]
}