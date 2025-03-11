export * from './api';
export * from './auth';
export * from './community';

// Exportar servicios como objeto
import api from './api';
import authService from './auth';
import communityService from './community';

export default {
  api,
  auth: authService,
  community: communityService
};