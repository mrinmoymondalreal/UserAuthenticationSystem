export const mobLoginModel = {
  mobile: { isRequired: true, len: { min: 3, max: 10 }, type: "string" },
};

export const magicLoginModel = {
  email: { isRequired: true, len: { min: 3, max: 30 }, type: "string" },
};

export const passwordLoginModel = {
  email: { isRequired: true, len: { min: 3, max: 30 }, type: "string" },
  password: { isRequired: true, len: { min: 3, max: 30 }, type: "string" },
};
