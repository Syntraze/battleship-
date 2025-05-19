


import httpServer from "./src/http_server";
import "./src/webScoketServer/server";
import "dotenv/config";

const severPort = process.env.PORT || 8181;

console.log(
  `Start static http server on the ${severPort} port!`
);
httpServer.listen(severPort);
