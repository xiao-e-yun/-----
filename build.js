const esbuild = require("esbuild");

const options = {
  entryPoints: ["./src/index.js"],
  minify: false,
  outfile: "./dist/bundle.js",
  bundle: true,
  platform: 'node',
  loader: { ".ts": "ts" },
}

async function watch() {
  const isWatch = process.argv.includes("watch")
  if(isWatch) {
    let ctx = await esbuild.context(options);
    await ctx.watch();
    console.log('Watching...');
  } else {
    await esbuild.build(options)
    console.log('Build');
  }
}
watch();