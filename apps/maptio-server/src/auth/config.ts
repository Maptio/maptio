const authConfig = {
  domain: process.env.AUTH0_DOMAIN,
  audience: process.env.AUTH0_AUDIENCE,
  clientId: process.env.AUTH0_MAPTIO_API_CLIENT_ID,
  clientSecret: process.env.AUTH0_MAPTIO_API_CLIENT_SECRET,
};

export default authConfig;
