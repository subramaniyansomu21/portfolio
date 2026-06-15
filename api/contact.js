const nodemailer = require("nodemailer");

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateContactPayload(payload) {
  const name = String(payload.name || "").trim();
  const email = String(payload.email || "").trim();
  const message = String(payload.message || "").trim();

  if (!name || !email || !message) {
    return { ok: false, error: "Name, email, and message are required." };
  }

  if (name.length > 100) {
    return { ok: false, error: "Name must be 100 characters or fewer." };
  }

  if (!isValidEmail(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  if (message.length > 5000) {
    return { ok: false, error: "Message must be 5000 characters or fewer." };
  }

  return { ok: true, data: { name, email, message } };
}

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

module.exports = async (request, response) => {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response
      .status(405)
      .json({ ok: false, error: "Method not allowed." });
  }

  const validation = validateContactPayload(request.body || {});

  if (!validation.ok) {
    return response.status(400).json(validation);
  }

  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS ||
    !process.env.MAIL_TO
  ) {
    return response.status(500).json({
      ok: false,
      error: "Email service is not configured on the server.",
    });
  }

  const { name, email, message } = validation.data;
  const transporter = getTransporter();
  const submittedAt = new Date().toISOString();

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: process.env.MAIL_TO,
      replyTo: email,
      subject: `Portfolio Contact: ${name}`,
      text: [
        "New portfolio contact form submission",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Submitted: ${submittedAt}`,
        "",
        "Message:",
        message,
      ].join("\n"),
    });

    return response.status(200).json({
      ok: true,
      message: "Message sent successfully.",
    });
  } catch (error) {
    console.error("Email send error:", error);
    return response.status(500).json({
      ok: false,
      error: "Failed to send message. Please try again later.",
    });
  }
};
