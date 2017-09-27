import Koa from "koa";
import cors from "koa-cors";
import compress from "koa-compress";
import json from "koa-json";
import send from "koa-send";
import serve from "koa-static";
import logger from "koa-logger";
import convert from "koa-convert";
import respond from "koa-respond";
import bodyParser from "koa-bodyparser";
import path from "path";

import index from "./router/index";

const app = new Koa();

//  https://www.npmjs.com/package/koa-respond
app.use(respond());

// 全局错误处理
app.use(async(ctx, next) => {
    try {
        ctx.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
        ctx.set("Access-Control-Allow-Origin", "*");
        ctx.set("X-Powered-By", "create-koa-app");
        await next();
    } catch (err) {
        ctx.internalServerError(err);
    }
});

// 设置gzip
app.use(compress({
    threshold: 2048,
    flush: require("zlib").Z_SYNC_FLUSH
}));

// 记录所用方式与时间
app.use(convert(logger()));

// 设置跨域
app.use(convert(cors()));

// 传输JSON
app.use(convert(json()));

// body解析
app.use(bodyParser());

// 静态文件夹
app.use(convert(serve(path.resolve(__dirname, "static"))));

// 发送静态文件，如HTML等
app.use(async(ctx, next) => {
    ctx.send = send;
    await next();
});

// 路由
app.use(index.routes());

app.listen(process.env.PORT || 3000);

console.log(`Server up and running! On port ${process.env.PORT || 3000}!`);
