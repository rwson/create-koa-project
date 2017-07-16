import * as Router from "koa-router";

const index = new Router({
	prefix: "/"
});

index.get("/", async ctx => {
    await ctx.send(ctx, "index.html", { root: "../static" });
});

export default index;