import * as Koa from "koa";
import * as bodyparser from "koa-bodyparser";
import * as logger from "koa-logger";
import * as compress from "koa-compress";
import * as send from "koa-send";
import * as cors from "koa-cors";
import * as convert from "koa-convert";
import * as serve from "koa-static";
import * as path from "path";
import index from "./router";

const app = new Koa();

app.use(async (ctx, next) => {
    try {
        await next();
        ctx.set("X-Powered-By", "create-koa-app");
    } catch (e) {
        ctx.status = e.status || 1;
        ctx.body = {
            status: e.status || 1,
            message: e.message,
            data: {}
        };
    }
});

app.use(compress({
    threshold: 2048
}));

app.use(convert(cors()));

app.use(bodyparser());

app.use(convert(logger()));

app.use(convert(serve(path.resolve(__dirname, "..", "static"))));

app.use(async(ctx, next) => {
    ctx.send = send;
    await next();
});

app.use(index.routes());

let port: number = 3000;

if (process.env.PORT) {
    port = Number(process.env.PORT);
}

app.listen(port);

console.log(`Now server is listen ${port}`);
