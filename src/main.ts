import "dotenv/config";

import { app } from "./infra/http/server.js";

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`MedStock Core Service rodando na porta ${PORT}`);
});