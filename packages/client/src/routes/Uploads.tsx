import { createRoute } from '@tanstack/react-router';
import { authenticatedRoute } from '.';
import PastUploadsPage from '../pages/PastUploadsPage';

export const uploadsRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: '/uploads',
    component: PastUploadsPage,
}); 