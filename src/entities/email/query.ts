import { mutationOptions } from "@tanstack/react-query";

import { sendEmail } from "./api";
import { EmailType } from "./type";

export const sendEmailOption = () =>
  mutationOptions({
    mutationFn: async (emailOptions: EmailType) =>
      await sendEmail(emailOptions),
  });
