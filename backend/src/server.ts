import { app } from "./app.js";
import { env } from "./config/env.js";
import { startImapImportCron } from "./jobs/imap-import.job.js";
import { logger } from "./utils/logger.js";

const port = env.PORT;

startImapImportCron();

app.listen(port, () => {
  logger.info(
    `Server running on http://localhost:${port} in ${env.NODE_ENV} mode`,
  );
});
