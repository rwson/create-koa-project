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
const send = require("koa-send");
const cors = require("koa-cors");
const convert = require("koa-convert");
const serve = require("koa-static");
const respond = require("koa-respond");
const path = require("path");
const router_1 = require("./router");
const app = new Koa();
app.use(respond());
app.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        ctx.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
        ctx.set("Access-Control-Allow-Origin", "*");
        ctx.set("X-Powered-By", "create-koa-app");
        yield next();
    }
    catch (e) {
        ctx.status = e.status || 1;
        ctx.body = {
            status: e.status || 1,
            message: e.message,
            data: {}
        };
    }
}));
app.use(compress({
    threshold: 2048
}));
app.use(convert(cors()));
app.use(bodyparser());
app.use(convert(logger()));
app.use(convert(serve(path.resolve(__dirname, "..", "static"))));
app.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
    ctx.send = send;
    yield next();
}));
app.use(router_1.default.routes());
let port = 3000;
if (process.env.PORT) {
    port = Number(process.env.PORT);
}
app.listen(port);
console.log(`Now server is listen ${port}`);
