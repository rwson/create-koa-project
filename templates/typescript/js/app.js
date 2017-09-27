"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
const bodyparser = require("koa-bodyparser");
const logger = require("koa-logger");
const compress = require("koa-compress");
const cors = require("koa-cors");
const json = require("koa-json");
const convert = require("koa-convert");
const serve = require("koa-static");
const respond = require("koa-respond");
const path = require("path");
const router_1 = require("./router");
const app = new Koa();
app.use(respond());
app.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
    try {
<<<<<<< HEAD
        ctx.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
        ctx.set("Access-Control-Allow-Origin", "*");
        ctx.set("X-Powered-By", "create-koa-app");
=======
        if (ctx.request.method == "OPTIONS") {
            ctx.ok();
        }
>>>>>>> b7bf4c8a65dea7f224c9a1e7e8aed80c1ba07391
        yield next();
    }
    catch (err) {
        ctx.internalServerError(err);
    }
}));
app.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
    yield next();
    ctx.set("X-Powered-By", "create-koa-app");
}));
app.use(compress({
    threshold: 2048,
    flush: require("zlib").Z_SYNC_FLUSH
}));
app.use(convert(logger()));
app.use(convert(cors()));
app.use(convert(json()));
app.use(bodyparser());
app.use(convert(serve(path.resolve(__dirname, "../static"))));
app.use(router_1.default.routes());
app.listen(process.env.PORT || 3000);
console.log(`Server up and running! On port ${process.env.PORT || 3000}!`);
