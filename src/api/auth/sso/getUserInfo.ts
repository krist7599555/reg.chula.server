import { Request, Response } from "express";
import { cookie, param } from "express-validator/check";
import { expressValidatorAssert } from "@util/bodyChecker";

import ticket2user from "./function/ticket2user";
import { users } from "@db/index";

export const root = [
  cookie("ticket").exists(),
  expressValidatorAssert(401),
  async function(req: Request, res: Response) {
    const user = await ticket2user(req.cookies.ticket);
    if (user) {
      return res.status(200).send(user);
    } else {
      res.clearCookie("ticket");
      return res.sendStatus(404);
    }
  }
];

export const ouid = [
  param("ouid").exists(),
  expressValidatorAssert(400),
  function(req: Request, res: Response) {
    users.findOne({ ouid: req.params.ouid }, (err, doc) => {
      if (err) {
        return res.status(200).send(err);
      } else if (doc) {
        return res.status(200).send(doc.toJSON());
      } else {
        return res.sendStatus(204);
      }
    });
  }
];
