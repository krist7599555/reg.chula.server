import { Request, Response } from "express";
import axios from "axios";
import * as config from "@config/index";
import * as _ from "lodash";
import { body } from "express-validator/check";
import assert from "./middleware/assertValidator";
import auth2ticket from "./function/auth2ticket";

import auth2all from "./function/auth2all";
import { log } from "util";

export default [
  body("username", "username must be 10 digit numeric")
    .isNumeric()
    .isLength({ min: 10, max: 10 }),
  body("password").exists(),
  assert(400),
  async function(req: Request, res: Response, next) {
    let { username, password } = req.body;

    // const ticket = await auth2ticket(username, password);
    const json = await auth2all(username, password).catch(next);
    const ticket = json.ticket;
    res.cookie("ticket", ticket, {
      maxAge: 24 * 60 * 60 * 1000
    });
    return res.status(200).send(_.assign({ ticket }, json));
  }
];
