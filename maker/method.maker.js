export function modelMethodMaker(method, model) {
  // email/password
  if (method.includes("email/password")) {
    if (!model["email"]) model["email"] = {};
    Object.assign(model["email"], {
      isRequired: true,
      isUnique: true,
      len: { min: 3, max: Infinity },
      type: "string",
      regExp: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    });
  }

  // [abc]/password
  if (method.findIndex((e) => e.toLowerCase().indexOf("password") > -1) > -1) {
    if (!model["password"]) model["password"] = {};
    Object.assign(model["password"], {
      isRequired: true,
      type: "string",
      len: { min: 8, max: Infinity },
    });
  }

  // username/password
  if (method.includes("username/password")) {
    if (!model["username"]) model["username"] = {};
    Object.assign(model["username"], {
      isRequired: true,
      isUnique: true,
      len: { min: 3, max: Infinity },
      type: "string",
    });
  }

  // magiclink
  if (method.includes("magiclink")) {
    if (!model["email"]) model["email"] = {};
    Object.assign(model["email"], {
      isRequired: true,
      isUnique: true,
      len: { min: 3, max: Infinity },
      type: "string",
      regExp: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    });
  }

  // mobile
  if (method.includes("mobile")) {
    if (!model["mobile"]) model["mobile"] = {};
    Object.assign(model["mobile"], {
      isRequired: true,
      isUnique: true,
      len: { min: 10, max: Infinity },
      type: "string",
    });
  }

  return model;
}
