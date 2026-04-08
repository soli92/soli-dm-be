import dotenv from "dotenv";
import { createApp } from "./createApp";
import { logCorsStartup } from "./lib/corsConfig";

dotenv.config();
logCorsStartup();

const app = createApp();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🎲 Soli-DM API running on http://localhost:${PORT}`);
  console.log(`📚 Health check: GET http://localhost:${PORT}/health`);
});

export default app;
