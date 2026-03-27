import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'ScorePrompt <noreply@scoreprompt.com>';

export interface SendInviteEmailParams {
  to: string;
  campaignName: string;
  inviteUrl: string;
  deadline?: string | null;
}

export async function sendInviteEmail({
  to,
  campaignName,
  inviteUrl,
  deadline,
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

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `You're invited to complete an AI assessment: ${campaignName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #f8f9fa; border-radius: 12px; padding: 32px; text-align: center;">
              <h1 style="color: #111; margin-bottom: 16px; font-size: 24px;">
                You're Invited!
              </h1>
              
              <p style="color: #555; font-size: 16px; margin-bottom: 8px;">
                You've been invited to complete an AI literacy assessment:
              </p>
              
              <p style="color: #111; font-size: 20px; font-weight: 600; margin-bottom: 24px;">
                ${campaignName}
              </p>
              
              <p style="color: #555; font-size: 14px; margin-bottom: 24px;">
                This assessment takes approximately 15-20 minutes and will help evaluate your AI prompting skills.
                ${deadlineText}
              </p>
              
              <a href="${inviteUrl}" 
                 style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Start Assessment
              </a>
              
              <p style="color: #888; font-size: 12px; margin-top: 32px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${inviteUrl}" style="color: #2563eb; word-break: break-all;">${inviteUrl}</a>
              </p>
            </div>
            
            <p style="color: #888; font-size: 12px; text-align: center; margin-top: 24px;">
              This invitation was sent by ScorePrompt on behalf of your organization.
            </p>
          </body>
        </html>
      `,
      text: `
You're Invited!

You've been invited to complete an AI literacy assessment: ${campaignName}

This assessment takes approximately 15-20 minutes and will help evaluate your AI prompting skills.
${deadlineText}

Start your assessment here: ${inviteUrl}

This invitation was sent by ScorePrompt on behalf of your organization.
      `.trim(),
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
