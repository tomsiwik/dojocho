import app from "./server";

const port = Number.parseInt(process.env.PORT ?? "3001", 10);
app.listen(port, ({ hostname, port: listeningPort }) => {
  console.log(`Dojofoo courses API listening on http://${hostname}:${listeningPort}`);
});
