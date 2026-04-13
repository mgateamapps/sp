import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.NODE_ENV === 'production' 
  ? 'ScorePrompt <noreply@scoreprompt.com>'
  : 'ScorePrompt <onboarding@resend.dev>';

export interface SendInviteEmailParams {
  to: string;
  campaignName: string;
  inviteUrl: string;
  deadline?: string | null;
  customMessage?: string | null;
  replyTo?: string | null;
  organizationName?: string | null;
}

export async function sendInviteEmail({
  to,
  campaignName,
  inviteUrl,
  deadline,
  customMessage,
  replyTo,
  organizationName,
}: SendInviteEmailParams): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    return { success: false, error: 'Email service not configured' };
  }

  const deadlineText = deadline 
    ? `Please complete by ${new Date(deadline).toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      })}.`
    : '';

  const introText = customMessage
    ? customMessage
    : `You've been invited to complete an AI literacy assessment:<br><strong>${campaignName}</strong>`;

  const senderLabel = organizationName ? `${organizationName} via ScorePrompt` : 'ScorePrompt';

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `You're invited to complete an AI assessment: ${campaignName}`,
      ...(replyTo ? { replyTo } : {}),
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #f8f9fa; border-radius: 12px; padding: 32px; text-align: center;">
              <h1 style="color: #111; margin-bottom: 16px; font-size: 24px;">You're Invited!</h1>

              <p style="color: #555; font-size: 15px; margin-bottom: 24px;">
                ${introText}
              </p>

              ${deadlineText ? `<p style="color: #555; font-size: 14px; margin-bottom: 24px;">${deadlineText}</p>` : ''}

              <p style="color: #555; font-size: 14px; margin-bottom: 24px;">
                The assessment takes approximately 15-20 minutes.
              </p>

              <a href="${inviteUrl}"
                 style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Start Assessment
              </a>

              <p style="color: #888; font-size: 12px; margin-top: 32px;">
                If the button doesn't work, copy and paste this link:<br>
                <a href="${inviteUrl}" style="color: #2563eb; word-break: break-all;">${inviteUrl}</a>
              </p>
            </div>

            <p style="color: #888; font-size: 12px; text-align: center; margin-top: 24px;">
              This invitation was sent by ${senderLabel}.
            </p>
          </body>
        </html>
      `,
      text: `You're Invited!\n\n${customMessage ?? `You've been invited to complete an AI literacy assessment: ${campaignName}`}\n\n${deadlineText}\n\nStart here: ${inviteUrl}\n\nSent by ${senderLabel}.`.trim(),
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: 'Failed to send email' };
  }
}
