import dotenv from "dotenv";
import { createApp } from "./createApp";

dotenv.config();

const app = createApp();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🎲 Soli-DM API running on http://localhost:${PORT}`);
  console.log(`📚 Health check: GET http://localhost:${PORT}/health`);
});

export default app;
