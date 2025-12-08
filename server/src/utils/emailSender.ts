import nodemailer from 'nodemailer';

// Configura il transporter (il "postino")
// È meglio crearlo fuori dalla funzione per evitare di riconnettersi a ogni email
const transporter = nodemailer.createTransport({
  service: 'gmail', // Usa 'gmail' per semplicità, oppure host/port per altri SMTP
  auth: {
    user: process.env.EMAIL_USER, // La tua email (es. tuo.nome@gmail.com)
    pass: process.env.EMAIL_PASS, // ATTENZIONE: Non la tua password di Gmail, ma la "App Password" (vedi sotto)
  },
});

export const sendVerificationEmail = async (userEmail: string, verificationCode: string) => {
  try {
    // Verifica che la configurazione sia corretta (opzionale, utile per debug)
    // await transporter.verify(); 

    const info = await transporter.sendMail({
      from: `"Participium Team" <${process.env.EMAIL_USER}>`, // Deve coincidere con l'utente autenticato
      to: userEmail,
      subject: 'Verify your email for Participium',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Welcome to Participium!</h2>
          <p>In order to complete your registration, please enter the following code:</p>
          <h1 style="letter-spacing: 5px; color: #4CAF50;">${verificationCode}</h1>
          <p>The code will expire in 15 minutes.</p>
        </div>
      `,
    });

    console.log("Message sent: %s", info.messageId);
    return info;

  } catch (error) {
    console.error("Error sending email with Nodemailer:", error);
    throw error;
  }
};