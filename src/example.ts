import { Handler } from '@netlify/functions';
import * as nodemailer from 'nodemailer';


// Define Environment Variables Type
type Env = {
  // SMTP_HOST: string;
  // SMTP_PORT: string;
  // SMTP_USER: string;
  // SMTP_PASSWORD: string;
  EMAIL: string;
  PASS: string;
  ALLOWED_ORIGINS: string;
}
const env: Env = process.env as any;

// Email Configuration
const emailConfig = {
  service: 'gmail',
  auth: {
    user: env.EMAIL,
    pass: env.PASS,
  },
};

const allowedOrigins = env.ALLOWED_ORIGINS.split(',');

const handler: Handler = async (event) => {
  const origin = event.headers.origin || '';
  let headers = {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : false,
  };

  // Handle Preflight (CORS) Requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers,
      body: "",
    };
  }

  // Reject requests from disallowed origins
  if (!allowedOrigins.includes(origin)) {
    return {
      statusCode: 403,
      headers,
      body: "Access denied. Origin not allowed.",
    };
  }

  // Handle only POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: "Method Not Allowed",
    };
  }

  let email: string | null = null, subject: string | null = null, message: string | null = null;
  let isJson = false;

  if (event.body) {
    try {
      // Try to parse JSON body
      const parsedBody = JSON.parse(event.body);
      email = parsedBody.email;
      subject = parsedBody.subject;
      message = parsedBody.message;
      isJson = true;
    } catch (error) {
      // Fall back to parsing as URL-encoded form data
      const params = new URLSearchParams(event.body);
      email = params.get("email");
      subject = params.get("subject");
      message = params.get("message");
    }
  } else {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Request body is empty" }),
    };
  }

  // Check for null values in email, subject, and message
  if (email === null || subject === null || message === null) {
    if (isJson) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing email, subject, or message" }),
      };
    } else {
      // Redirect for URL-encoded form data when required fields are missing
      return {
        statusCode: 303,
        headers: {
          ...headers,
          Location: `${origin}/#error`,
        },
        body: '',
      };
    }
  }

  const transporter = nodemailer.createTransport(emailConfig);
  const mailOptions = {
    from: env.EMAIL,
    to: email,
    subject: subject,
    html: `<p>${message}</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);

    if (isJson) {
      // JSON response for JSON data
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "Email sent successfully" }),
      };
    } else {
      // Redirect for URL-encoded form data
      return {
        statusCode: 303,
        headers: {
          ...headers,
          Location: `${origin}/#success`,
        },
        body: '',
      };
    }
  } catch (error) {
    console.error("Error sending email: ", error);

    if (isJson) {
      // JSON response for JSON data
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Failed to send email" }),
      };
    } else {
      // Redirect for URL-encoded form data
      return {
        statusCode: 303,
        headers: {
          ...headers,
          Location: `${origin}/#error`,
        },
        body: '',
      };
    }
  }
};

export { handler };
