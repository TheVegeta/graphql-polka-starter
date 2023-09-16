import "dotenv/config";
import "reflect-metadata";

import { json } from "body-parser";
import cors from "cors";
import polka from "polka";
import { PORT } from "./env";
import { graphqlHelperFn } from "./graphqlHelper";

(async () => {
  const app = polka();
  const { requestHandler } = await graphqlHelperFn();

  app.use(cors());
  app.use(json());

  app.use("/graphql", requestHandler);

  app.listen(PORT, () => {
    console.log(`App is started @${PORT}`);
  });
})();
