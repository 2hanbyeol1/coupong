import { EmailType } from "./type";

export const sendEmail = async (emailOptions: EmailType) => {
  const response = fetch("/api/email", {
    method: "POST",
    body: JSON.stringify(emailOptions),
  });

  return response;
};
