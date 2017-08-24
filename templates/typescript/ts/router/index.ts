import * as path from "path";
import * as Router from "koa-router";

const index = new Router({
	prefix: "/"
});

const root = path.resolve(__dirname, "../../static");

index.get("/", async ctx => {
    await ctx.send(ctx, "index.html", { root });
});

index.get("swagger", async ctx => {
	await ctx.send(ctx, "swagger.html", { root });
});

export default index;