import { config } from "./utils/common.js";
import { mobSignup } from "./utils/mob.login.js";

function singup(data) {
  let method = config.method;
  switch (data.type) {
    case "mobile":
      if (method != "mobile") return;
      return mobSignup(data);
    case "email":
      if (method != "email") return;
      break;
    case "magiclink":
      if (method != "magiclink") return;

      break;
  }
}
