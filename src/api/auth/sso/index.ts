import * as Router from "koa-router";
import axios from "axios";
import { path } from "lodash/fp";
import * as _ from "lodash";
import crypto from "./crypto";
const router = new Router();

import * as faculty from "./faculty.json";

router
  .prefix("/sso")
  .get("/", ctx => (ctx.body = "SSO"))
  .get("/login", ctx => (ctx.body = "NOT ALLOW GET"))
  .get("/decypt/:data", ctx => (ctx.body = crypto.decrypt(ctx.params.data)))
  .get("/encypt/:data", ctx => (ctx.body = crypto.encrypt(ctx.params.data)))
  .post("/login", async ctx => {
    const password = "krist7599555";
    const ticket = await axios
      .get(process.env.SSO_URL + "/login", {
        params: {
          username: "6031301721".slice(0, 8),
          password: password,
          service: "https://account.it.chula.ac.th",
          serviceName: "Chula+SSO"
        }
      })
      .then(path("data.ticket"));

    const raw = await axios({
      method: "POST",
      url: process.env.SSO_URL + "/serviceValidation",
      headers: {
        DeeAppId: process.env.SSO_appId,
        DeeAppSecret: process.env.SSO_appSecret,
        DeeTicket: ticket
      }
    }).then(path("data"));
    const facultyNUM = raw.ouid.slice(-2);
    const year = String(62 - +raw.ouid.slice(0, 2));
    const raw2 = _.omitBy(
      {
        ticket: ticket,
        ouid: raw.ouid,
        pwid: crypto.encrypt(password),
        titleTH: undefined,
        titleEN: undefined,
        nameTH: raw.firstnameth,
        nameEN: raw.firstname,
        surnameTH: raw.lastnameth,
        surnameEN: raw.lastname,
        facultyTH: faculty[facultyNUM].nameTH,
        facultyEN: faculty[facultyNUM].nameEN,
        facultyNUM: facultyNUM,
        facultyABBR: faculty[facultyNUM].nameABBR,
        year: year
      },
      _.isUndefined
    );
    ctx.body = { ticket };
    await ctx.db.collection("user").updateOne({ ouid: raw.ouid }, { $set: raw2 }, { upsert: true });
    ctx.cookies.set("ticket", ticket, { overwrite: true, maxAge: 1000 * 60 * 60 * 24 });
  })
  .get("/profile", async ctx => {
    ctx.body = await ctx.db
      .collection("user")
      .findOne(
        { ticket: ctx.cookies.get("ticket") },
        { projection: { _id: 0, ticket: 0, pwid: 0 } }
      );
  });

export default router;
