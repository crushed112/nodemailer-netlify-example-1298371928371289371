import type { Handler } from "@netlify/functions";
import isEmail from "validator/es/lib/isEmail";
import * as nodemailer from "nodemailer";
import type { SendMailOptions } from "nodemailer";
import type { Options as SMTPTransportOptions } from "nodemailer/lib/smtp-transport";

// Define Environment Variables Type
type Env = {
  // SMTP_HOST: string;
  // SMTP_PORT: string;
  // SMTP_USER: string;
  // SMTP_PASSWORD: string;
  EMAIL: string;
  PASS: string;
  ALLOWED_ORIGINS: string;
};

type RequestPayload = {
  email?: string;
  subject?: string;
  message?: string;
};

const env: Env = process.env as any;

// Validate environment variables
if (!env.EMAIL || !env.PASS || !env.ALLOWED_ORIGINS) {
  throw new Error(
    "Environment variables EMAIL, PASS, and ALLOWED_ORIGINS must be set"
  );
}

// Email Configuration
const emailConfig = {
  service: "gmail",
  auth: {
    user: env.EMAIL,
    pass: env.PASS,
  },
} satisfies SMTPTransportOptions;

const allowedOrigins = env.ALLOWED_ORIGINS.split(",").filter(Boolean); // Remove any empty strings

const parseRequestBody = (body: string | null): RequestPayload => {
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    const params = new URLSearchParams(body);
    return {
      email: params.get("email") || undefined,
      subject: params.get("subject") || undefined,
      message: params.get("message") || undefined,
    };
  }
};

const sendEmail = async (
  payload: RequestPayload,
  origin: string,
  isJson: boolean,
  headers: Record<string, string>
) => {
  const transporter = nodemailer.createTransport(emailConfig);
  const mailOptions = {
    from: env.EMAIL,
    to: payload.email,
    subject: payload.subject,
    html: `<p>${payload.message}</p>`,
  } satisfies SendMailOptions;

  try {
    console.log("sending email")
    await transporter.sendMail(mailOptions);
    return isJson
      ? {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: "Email sent successfully" }),
        }
      : {
          statusCode: 303,
          headers: { ...headers, Location: `${origin}/#success` },
          body: "",
        };
  } catch (error) {
    console.error("Error sending email: ", error);
    return isJson
      ? {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: "Failed to send email" }),
        }
      : {
          statusCode: 303,
          headers: { ...headers, Location: `${origin}/#error` },
          body: "",
        };
  }
};

const handler: Handler = async (event) => {
  const origin = event.headers.origin;
  let headers = {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin)
      ? origin
      : "",
  } as const;

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers,
      body: "",
    };
  }

  if (!allowedOrigins.includes(origin)) {
    return {
      statusCode: 403,
      headers,
      body: "Access denied. Origin not allowed.",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: "Method Not Allowed",
    };
  }

  const payload = parseRequestBody(event.body);
  const isJson = event.headers["content-type"] === "application/json";

  // Validate all fields exist
  if (
    !payload.email.trim() ||
    !payload.subject.trim() ||
    !payload.message.trim()
  ) {
    console.log("all required fields exist")
    return isJson
      ? {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Missing email, subject, or message" }),
        }
      : {
          statusCode: 303,
          headers: { ...headers, Location: `${origin}/#error` },
          body: "",
        };
  }

  // Validate the email
  if (!isEmail(payload.email)) {
    console.log("valid email")
    return isJson
      ? {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Invalid email address" }),
        }
      : {
          statusCode: 303,
          headers: { ...headers, Location: `${origin}/#error` },
          body: "",
        };
  }

  return sendEmail(payload, origin, isJson, headers);
};

export { handler };
