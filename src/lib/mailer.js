import { createTransport } from 'nodemailer';
import { env } from '$env/dynamic/private';

const transporter = createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  auth: {
    user: env.SMTP_USERNAME,
    pass: env.SMTP_PASSWORD
  },
  tls: {
    rejectUnauthorized: env.SMTP_REJECT_UNAUTHORIZED === 'false' ? false : true
  }
});

export default transporter;
