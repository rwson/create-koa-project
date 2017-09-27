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

//  https://github.com/jeffijoe/koa-respond
app.use(respond());

// 全局错误处理
app.use(async (ctx, next) => {
    try {
        if (ctx.request.method == "OPTIONS") {
            ctx.ok();
        }
        await next();
    } catch (err) {
        ctx.internalServerError(err);
    }
});

// 设置Header
app.use(async(ctx, next) => {
    await next();
    ctx.set("X-Powered-By", "create-koa-app");
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
app.use(bodyparser());

// 静态文件夹
app.use(convert(serve(path.resolve(__dirname, "../static"))));

// 路由
app.use(index.routes());

app.listen(process.env.PORT || 3000);

console.log(`Server up and running! On port ${process.env.PORT || 3000}!`);
