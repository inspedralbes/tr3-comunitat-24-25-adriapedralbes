export * from './api';
export * from './auth';
export * from './community';

// Exportar servicios como objeto
import apiService from './api';
import auth from './auth';
import community from './community';

const services = {
  api: apiService,
  auth,
  community
};

export default services;