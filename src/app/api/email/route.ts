import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  const { from, to, subject, html } = await request.json();

  const resend = new Resend(process.env.RESEND_API_KEY);

  const data = await resend.emails.send({
    from,
    to,
    subject,
    html,
  });

  return NextResponse.json(data);
}
