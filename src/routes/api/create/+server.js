import { json } from '@sveltejs/kit';

export const POST = async ({ request, locals }) => {
  const formData = await request.formData();

  try {
    const createdToken = await locals.pb
      .collection('tokens')
      .create({ email: formData.get('email') });

    console.log(createdToken);

    return json({
      status: 200,
      body: { message: 'The token was created successfully!', token: createdToken.id }
    });
  } catch (error) {
    console.log(error);

    return json({
      status: 500,
      body: { message: 'An unknown error occurred.' }
    });
  }
};
