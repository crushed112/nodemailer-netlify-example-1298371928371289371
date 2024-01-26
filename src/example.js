import nodemailer from "nodemailer";

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [];
// const smtpConfig = {
//   host: process.env.SMTP_HOST,
//   port: process.env.SMTP_PORT,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASSWORD,
//   },
// };
const emailConfig = {
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
    }
}

export async function handler(event) {
  const origin = event.headers.origin;
  let headers = {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Origin": false,
  };

  // Preflight request handling (CORS)
  if (event.httpMethod === "OPTIONS") {
    if (allowedOrigins.includes(origin)) {
      headers["Access-Control-Allow-Origin"] = origin;
    }
    return {
      statusCode: 204,
      headers,
      body: "",
    };
  }

  // Handle requests from unallowed origins
  if (!allowedOrigins.includes(origin)) {
    return {
      statusCode: 403,
      headers,
      body: "Access denied. Origin not allowed.",
    };
  }

  // Set CORS headers for allowed origins
  headers["Access-Control-Allow-Origin"] = origin;

  // Handle incorrect HTTP methods
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: "Method Not Allowed",
    };
  }

  // Parse the event(post request) body
  let params;
  //   let parsedBody;
  try {
    params = new URLSearchParams(event.body);
    // parsedBody = JSON.parse(event.body);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return {
      statusCode: 400,
      headers,
      body: "Invalid request body",
    };
  }
  const email = params.get("email");
  const subject = params.get("subject");
  const message = params.get("message");
  //   const { email, subject, message } = parsedBody;

  const transporter = nodemailer.createTransport(emailConfig);
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: subject,
    html: `<p>${message}</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return {
      statusCode: 303,
      headers: {
        Location: `${origin}/#success`,
      },
    };
    // return {
    //   statusCode: 200,
    //   headers,
    //   body: JSON.stringify({ "Email sent": "true" }),
    // };
  } catch (error) {
    console.error("Error sending email: ",error)
    return {
      statusCode: 303,
      headers: {
        Location: `${origin}/#error`,
      },
    };
    // return {
    //   statusCode: 500,
    //   headers,
    //   body: JSON.stringify({ "Email sent": "false" }),
    // };
  }
}