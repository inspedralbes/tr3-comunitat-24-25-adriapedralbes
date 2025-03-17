export * from './api';
export * from './auth';
export * from './community';
export * from './user';
export * from './ranking';
export * from './gamification';

// Exportar servicios como objeto
import apiService from './api';
import auth from './auth';
import community from './community';
import gamification from './gamification';
import ranking from './ranking';
import user from './user';

const services = {
  api: apiService,
  auth,
  community,
  user,
  ranking,
  gamification
};

export default services;