import Router from "koa-router";

const index = new Router({
	prefix: "/"
});

index.get("", async ctx => {
	await ctx.send(ctx, "index.html", { root: "static" });
});

index.get("swagger", async ctx => {
	await ctx.send(ctx, "swagger.html", { root: "static" });
});

export default index;