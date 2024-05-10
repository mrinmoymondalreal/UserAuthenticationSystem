import { config } from "./utils/common.js";
import { mobLogin, mobSignup } from "./utils/mob.login.js";
import { passwordLogin, passwordSignup } from "./utils/password.login.js";
import { magicLogin, magicSignup } from "./utils/magic.login.js";

export async function singup(data) {
  let method = config.method;
  switch (data.type) {
    case "mobile":
      if (method.includes("mobile")) return await mobSignup(data);
    case "password":
      if (method.includes("password")) return await passwordSignup(data);
    case "magiclink":
      if (method.includes("magiclink")) return await magicSignup(data);
  }

  return;
}

export async function login(data) {
  let method = config.method;
  switch (data.type) {
    case "mobile":
      if (method.includes("mobile")) return await mobLogin(data);
    case "password":
      if (method.includes("password")) return await passwordLogin(data);
    case "magiclink":
      if (method != "magiclink") return await magicLogin(data);
  }

  return;
}
