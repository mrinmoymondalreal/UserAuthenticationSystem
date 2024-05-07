export const user_model = {
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
};
