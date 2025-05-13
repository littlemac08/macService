// parseSpec.js

function extractSpecFromText(text) {
  const lowerText = text.toLowerCase();

  let intent = 'create';
  if (lowerText.includes('delete')) intent = 'delete';
  else if (lowerText.includes('update')) intent = 'update';
  else if (lowerText.includes('read') || lowerText.includes('get')) intent = 'read';

  let trigger = '';
  if (lowerText.includes('login')) trigger = 'user login';
  else if (lowerText.includes('register')) trigger = 'user registration';
  else if (lowerText.includes('dashboard')) trigger = 'dashboard';

  let action = '';
  if (lowerText.includes('express')) action = 'express.js route';
  else if (lowerText.includes('mongodb')) action = 'mongodb integration';
  else if (lowerText.includes('api')) action = 'api endpoint';

  return {
    intent,
    trigger,
    action
  };
}

module.exports = { extractSpecFromText };
