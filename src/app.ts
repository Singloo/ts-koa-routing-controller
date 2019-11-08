/*
 * File: /Users/origami/Desktop/templates/node-express-template/src/app.ts
 * Project: /Users/origami/Desktop/templates/node-express-template
 * Created Date: Friday July 12th 2019
 * Author: Rick yang tongxue(🍔🍔) (origami@timvel.com)
 * -----
 * Last Modified: Friday July 12th 2019 3:25:43 pm
 * Modified By: Rick yang tongxue(🍔🍔) (origami@timvel.com)
 * -----
 */
import 'reflect-metadata';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import session from 'koa-session';
import passport from 'koa-passport';
import cors from '@koa/cors';
import { useKoaServer } from 'routing-controllers';
import ApiV1Controller from './apiv1';
import { Mongo } from './db';
const PORT = 7000;
const app = new Koa();
app.use(cors());
app.use(bodyParser());
// session
app.keys = ['secret'];
app.use(session({}, app));
app.use(passport.initialize());
app.use(passport.session());

app.use(async (ctx, next) => {
  try {
    ctx.body = 'What are you looking for?';
    ctx.status = 404;
    await next();
  } catch (err) {
    console.log('errrrr');
    ctx.body = 'err';
  }
});
useKoaServer(app, {
  routePrefix: '/api/v1',
  controllers: [...ApiV1Controller],
});

app.listen(PORT, async () => {
  await Mongo.connect();
  console.log(`server is running at http://localhost:${PORT}`);
});
