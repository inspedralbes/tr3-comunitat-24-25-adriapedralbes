export * from './api';
export * from './auth';
export * from './community';
export * from './user';
export * from './ranking';

// Exportar servicios como objeto
import apiService from './api';
import auth from './auth';
import community from './community';
import user from './user';
import ranking from './ranking';

const services = {
  api: apiService,
  auth,
  community,
  user,
  ranking
};

export default services;