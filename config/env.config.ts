export const ENV = {
  // This is to get the email from the environment variable and protect it.
  VALID_EMAIL: process.env.VALID_EMAIL ?? '', 

  // same thing here, but for the password
  VALID_PASSWORD: process.env.VALID_PASSWORD ?? '',
  
}

// This is so we fail fast if the environment variables are not set. 
if (!ENV.VALID_EMAIL || !ENV.VALID_PASSWORD) {
  throw new Error('VALID_EMAIL and VALID_PASSWORD must be set!!');
}