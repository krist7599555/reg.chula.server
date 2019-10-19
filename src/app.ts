require("dotenv").config();

import * as Koa from "koa";

import * as cors from "koa2-cors";
import * as logger from "koa-logger";
import * as skip from "koa-ignore";
import * as mongo from "koa-mongo";
import * as bodyParser from "koa-bodyparser";
import api from "./api";

const app = new Koa();
app
  .use(cors())
  .use(skip(logger()).if(() => process.env.JEST))
  .use(bodyParser())
  .use(mongo({ uri: process.env.MONGO_URL }))
  .use(api.routes());

export default app;
