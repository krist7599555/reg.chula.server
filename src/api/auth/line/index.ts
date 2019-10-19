import * as Router from 'koa-router';
import * as qs from 'querystring';
import axios from 'axios';
import { path } from 'lodash/fp';
const router = new Router();
import { assign } from 'lodash';
import * as jwt from 'jsonwebtoken';

interface LINE_Token {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token: string;
  scope: string;
  token_type: string; // Bearer
}
interface LINE_JwtProfile {
  iss: string;
  sub: string;
  aud: string;
  exp: string;
  iat: string;
  auth_time: string;
  nonce: string;
  name: string;
  picture?: string;
  email?: string;
}

interface LINE_Profile {
  displayName: string;
  userId: string;
  pictureUrl: string;
  statusMessage?: string;
}

function lineAccessToken2profile(access_token): Promise<LINE_Profile> {
  return axios
    .get('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${access_token}` }
    })
    .then(path('data'));
}

router
  .prefix('/line')
  // https://7942aeae.ngrok.io/api/auth/line/login
  .get('/login', ctx => {
    return ctx.redirect(
      'https://access.line.me/oauth2/v2.1/authorize?' +
        qs.stringify({
          response_type: 'code',
          client_id: process.env.LINE_ChanneId,
          redirect_uri: process.env.LINE_RedirectUrl + '/api/auth/line/callback',
          state: 'random_state',
          scope: 'openid profile email'
        })
    );
  })
  //code=34ux9V9uPhunowxZKype&state=random_state
  .get('/callback', async (ctx, next) => {
    const token = (await axios
      .post(
        'https://api.line.me/oauth2/v2.1/token',
        qs.stringify({
          grant_type: 'authorization_code',
          code: ctx.query.code,
          redirect_uri: process.env.LINE_RedirectUrl + '/api/auth/line/callback',
          client_id: process.env.LINE_ChanneId,
          client_secret: process.env.LINE_ChanneSecret
        })
      )
      .then(path('data'))) as LINE_Token;
    const decode = jwt.verify(
      token.id_token,
      process.env.LINE_ChanneSecret || ''
    ) as LINE_JwtProfile;

    const token2 = {
      lineId: undefined,
      lineImage: decode.picture,
      lineUserId: decode.sub,
      lineDisplayName: decode.name
    };
    ctx.body = { decode, token: token2 };
  });

// import { Router, Request, Response, NextFunction } from "express";
// import login from "./login";
// import verify from "./verify";
// const router = Router();

// router.get("/", (req: Request, res: Response) => res.sendStatus(200));
// router.get("/login", login);
// router.get("/verify", verify);

export default router;
