const { getJestProjects } = require('@nrwl/jest');

export default {
  projects: [
    ...getJestProjects(),
    '<rootDir>/apps/maptio',
    '<rootDir>/apps/maptio-server',
    '<rootDir>/apps/maptio-admin',
  ],
};
