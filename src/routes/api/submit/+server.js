import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import mailer from '$lib/mailer';

export const POST = async ({ request, locals }) => {
  const formData = await request.formData();

  let customValues = [];
  for (const [name, value] of formData.entries()) {
    if (name.startsWith('$')) {
      const customName = name.slice(1);
      customValues.push({ name: customName, value });
    }
  }

  try {
    const token = await locals.pb.collection('tokens').getOne(formData.get('accessKey'));

    let mailto = `mailto:${formData.get('email')}`;
    mailto += `?subject=RE: ${formData.get('subject')}`;
    const mailtoBody = `
    ---
    ${formData.get('replyExplanation') || 'You are receiving this message because you filled out a form on our website.'}
    ${formData.get('originalMessage') || 'Your original message:'}

    ${formData.get('message')}
    `;
    mailto += `&body=${encodeURIComponent(mailtoBody)}`;

    let html = `
    ${formData.get('message').replace(/\n/g, '<br />')}

    <br /><br />
    ---
    <h2 style="margin-top: -0.5em; margin-bottom: -0.5em;">User data</h2>
    <b>Email address:</b> ${formData.get('email')}<br />
    `;

    customValues.forEach((customValue) => {
      html += `<b>${customValue.name}:</b> ${customValue.value}<br />`;
    });

    html += `
    <br />
    <p style="margin-top: -0.5em; margin-bottom: -0.5em;">You cannot reply to this email directly. To reply, click <a href="${mailto}">here</a>.</p>
    <small>This email was sent automatically using <a href="https://mailforms.rbnu.nl/">rbnu-mailforms</a>, a service by <a href="https://rbnu.nl/">Ruben Uijtdewilligen</a>.</small>`;

    mailer.sendMail({
      from: `"${formData.get('from')}" <${env.SMTP_USERNAME}>`,
      to: token.email,
      subject: formData.get('subject'),
      html
    });

    if (formData.get('redirectTo')) {
      return new Response('Redirecting...', {
        status: 303,
        headers: new Headers({ Location: formData.get('redirectTo') })
      });
    } else {
      return json({
        status: 200,
        body: { message: 'The email was sent successfully.' }
      });
    }
  } catch (error) {
    console.log(error);

    return json({
      status: 500,
      body: { message: 'An error occurred on the server.' }
    });
  }
};
