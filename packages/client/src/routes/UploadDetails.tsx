import { createRoute } from '@tanstack/react-router';
import UploadDetails from '../pages/UploadDetails';
import { uploadsRoute } from './Uploads';

export const uploadDetailsRoute = createRoute({
    getParentRoute: () => uploadsRoute,
    path: ':id',
    component: UploadDetails,
  });