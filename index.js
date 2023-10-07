import express from "express";
import cronJob from "node-cron";
import axios from "axios";
import getAnnouncements from "./functions/index.js";
import { PORT, CRON_JOB_SCHEDULE } from "./constants.js";

const app = express();

app.get("/healthz", (req, res) => {
  return res.status(200).send("Servidor funcionando correctamente 🚀!");
});

app.get("/get-notifications", (req, res) => {
  const data = getAnnouncements()
  if (data.status === 500) return res.status(500).send(data.message);
  return res.status(200).send(data.message);
});

const server = app.listen(PORT || 3000, () => {
  console.log(`Servidor corriendo en puerto ${server.address().port}`);
  cronJob.schedule(
    CRON_JOB_SCHEDULE,
    () => {
      axios.get("http://localhost:3000/get-notifications");
    },
    {
      scheduled: true,
      timezone: "America/Santiago",
      runOnInit: true,
    }
  );
});
