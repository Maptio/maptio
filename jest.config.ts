const { getJestProjects } = require('@nx/jest');

export default {
  projects: [
    ...getJestProjects(),
    '<rootDir>/apps/maptio',
    '<rootDir>/apps/maptio-server',
    '<rootDir>/apps/maptio-admin',
  ],
};
