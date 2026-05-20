import nodemailer from "nodemailer";

export const transporter =
  nodemailer.createTransport({

    service: "gmail",

    auth: {

      user:
        process.env.EMAIL_USER,

      pass:
        process.env.EMAIL_PASS,
    },
  });

export async function sendShipmentEmail(
  to: string,
  trackingNumber: string,
  status: string
) {

  await transporter.sendMail({

    from:
      `"SSC Tracking" <${process.env.EMAIL_USER}>`,

    to,

    subject:
      `Shipment Update - ${trackingNumber}`,

    html: `
      <div style="font-family: Arial; padding: 20px;">

        <h2 style="color:#1d4ed8;">
          Shipment Status Update
        </h2>

        <p>
          Your shipment
          <strong>${trackingNumber}</strong>
          has been updated.
        </p>

        <div style="
          background:#eff6ff;
          padding:15px;
          border-radius:10px;
          margin-top:20px;
        ">

          <h3>Status:</h3>

          <p style="
            font-size:20px;
            font-weight:bold;
            color:#1d4ed8;
          ">
            ${status}
          </p>

        </div>

        <p style="margin-top:30px;">
          Thank you for using SSC Tracking.
        </p>

      </div>
    `,
  });
}