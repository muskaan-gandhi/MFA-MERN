import { mailtrapClient, sender } from "./mailtrap.js";
import { VERIFICATION_EMAIL_TEMPLATE , PASSWORD_RESET_REQUEST_TEMPLATE , PASSWORD_RESET_SUCCESS_TEMPLATE } from "./emailTemplates.js";

export const sendVerficationEmail = async (email, verificationToken) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Account Verification",
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
      category: "Verification Email"
    })
    console.log("Verification email sent", response);
  } catch (error) {
    console.log("Error sending verification email", error);
  }

}

export const sendWelcomeEmail = async (email, name) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from : sender,
      to: recipient,
      template_uuid : "8ece7298-9b7d-49c2-b790-f76e36b35346",
      template_variables: {
        name : name
      },
    })   
    console.log("Welcome email sent", response);
  } catch (error) {
    console.log("Error sending welcome email", error);
  }
  
}

export const sendForgotPasswordEmail = async (email, resetToken) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Password Reset",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetToken),
      category: "Password Reset"
    })
    console.log("Password reset email sent", response);
  } catch (error) {
    console.log("Error sending password reset email", error);
    throw new Error("Error sending password reset email");
  }
}

export const sendPasswordResetSuccessEmail = async (email) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset"
    })
    console.log("Password reset success email sent", response);
  } catch (error) {
    console.log("Error sending password reset success email", error);
    throw new Error("Error sending password reset success email");
  }
}