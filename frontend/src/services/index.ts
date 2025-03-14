export * from './api';
export * from './auth';
export * from './community';
export * from './user';

// Exportar servicios como objeto
import apiService from './api';
import auth from './auth';
import community from './community';
import user from './user';

const services = {
  api: apiService,
  auth,
  community,
  user
};

export default services;