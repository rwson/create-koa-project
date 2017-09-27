import * as Koa from "koa";
import * as bodyparser from "koa-bodyparser";
import * as logger from "koa-logger";
import * as compress from "koa-compress";
import * as cors from "koa-cors";
import * as json from "koa-json";
import * as convert from "koa-convert";
import * as serve from "koa-static";
import * as respond from "koa-respond";
import * as path from "path";
import index from "./router";

const app = new Koa();

//  https://www.npmjs.com/package/koa-respond
app.use(respond());

app.use(async (ctx, next) => {
    try {
        ctx.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
        ctx.set("Access-Control-Allow-Origin", "*");
        ctx.set("X-Powered-By", "create-koa-app");
        await next();
    } catch (e) {
        ctx.status = e.status || 1;
        ctx.body = {
            status: e.status || 1,
            message: e.message,
            data: {}
        };

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
app.use(bodyparser());

// 静态文件夹
app.use(convert(serve(path.resolve(__dirname, "../static"))));

// 路由
app.use(index.routes());

app.listen(process.env.PORT || 3000);

console.log(`Server up and running! On port ${process.env.PORT || 3000}!`);
