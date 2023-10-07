import axios from "axios";
import { Resend } from "resend";
import { openDB } from "../sqllite.js";
import { API_RESEND, API_URL, HEADERS, PARAMS_STRING } from "../constants.js";

const resend = new Resend(API_RESEND);

const getAnnouncements = async () => {
  try {
    console.log("Running Cron Job");
    console.log(new Date().toLocaleString());
    const { data } = await axios.post(API_URL, PARAMS_STRING, {
      headers: HEADERS,
      validateStatus: () => true,
    });
    const { annListResponse } = data.response;
    const { annList } = annListResponse;
    const mappedAnnList = annList.map((ann) => {
      return {
        id: ann.id,
        title: ann.title,
        courseName: ann.course_name,
        description: ann.description,
        date: ann.dateDeploy,
      };
    });
    const SQLConn = await openDB();
    const rows = await SQLConn.all("SELECT * FROM announcements");
    console.log(`Notificaciones totales: ${rows.length}`);
    for (const ann of mappedAnnList) {
      const isMatch = rows.some((el) => el.id.toString() === ann.id.toString());
      if (!isMatch) {
        console.log("Agregado: ", ann.id);
        await SQLConn.run(
          `INSERT INTO announcements (id, title, courseName, description, date) VALUES (?, ?, ?, ?, ?)`,
          [ann.id, ann.title, ann.courseName, ann.description, ann.date]
        );
        resend.emails.send({
          from: "onboarding@resend.dev",
          to: "sh4c0p@gmail.com",
          subject: "Nueva Notificacion de UDLA 🎉",
          html: `
                <h1>Notificaciones UDLA</h1>
                <h2>${ann.title}</h2>
                <div>${ann.description}</div>
                `,
        });
      }
    }
    
    return {
      message: "Notificaciones obtenidas correctamente",
      data: mappedAnnList,
      status: 200
    };
  } catch (error) {
    return {
      message: "Error al obtener notificaciones",
      data: error,
      status: 500
    };
  }
};

export default getAnnouncements;
