import { Resend } from 'resend'

export async function sendFeedbackConfirmationEmail(email: string, name?: string | null) {
  if (!process.env.RESEND_API_KEY) return

  const resend = new Resend(process.env.RESEND_API_KEY)

  const greeting = name ? `Hey ${name},` : 'Hey there,'

  await resend.emails.send({
    from: 'noreply@anioncall.digital',
    to: email,
    subject: 'Got it — your 3 credits are on the way',
    text: `${greeting}

Thanks for taking the time — we read every submission personally.

Your 3 free credits have been added to your Ani on Call account.
Head back anytime to run another analysis.

If you submitted a suggestion, we use these directly to decide what
to build next. We'll follow up if we have questions.

— Ani on Call

anioncall.digital`,
  })
}
