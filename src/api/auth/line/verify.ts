import { Request, Response } from "express";
import * as url from "url";
import axios from "axios";
import * as qs from "qs";
import * as _ from "lodash";
import * as jwt from "jsonwebtoken";
import * as db from "@db/index";

import * as line from "@config/line";

function fullUrl(req: Request) {
  // return "https://hugsnan.ml";
  return process.env.NODE_ENV == "production"
    ? req.protocol + "://" + req.get("host")
    : "http://localhost:9000";
}

export default (req: Request, res: Response) => {
  const { code, state } = req.query;
  console.log("hostname", fullUrl(req));
  axios({
    method: "POST",
    url: "https://api.line.me/oauth2/v2.1/token",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    data: qs.stringify({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: fullUrl(req) + line.redirect_uri,
      client_id: line.client_id,
      client_secret: line.client_secret
    })
  })
    .then(result => result.data)
    .then(async json => {
      // console.log(json.id_token);
      const decode = jwt.verify(json.id_token, line.client_secret);
      const data = _.assign({ userId: decode.sub, channelId: decode.aud }, json, decode);
      await db.users.updateOne(
        { ticket: req.cookies.ticket },
        { line: data, picture: data.picture },
        { upsert: false, strict: false }
      );
      return res.redirect("/");
      // return res.status(200).json(data);
    })
    .catch(err => {
      console.log(err.response.data);
      return res.status(400).send(err.response.data);
    });
};
