import { Router } from 'express';
import { init } from './database/init';
import siteRoutes from './modules/site/site.routes';
import projectsRoutes from './modules/projects/projects.routes';
import experiencesRoutes from './modules/experiences/experiences.routes';
import skillsRoutes from './modules/skills/skills.routes';
import contactRoutes from './modules/contact/contact.routes';
import mediaRoutes from './modules/media/media.routes';
import adminRoutes from './modules/admin/admin.routes';
import settingsRoutes from './modules/settings/settings.routes';
import messagesRoutes from './modules/messages/messages.routes';

const router = Router();

// Before the first request is handled, make sure the tables exist (runs once).
router.use((req, res, next) => init().then(() => next(), next));

// One line per feature. To add a feature: create src/modules/<name>/ and register its routes here.
router.use(siteRoutes);
router.use(projectsRoutes);
router.use(experiencesRoutes);
router.use(skillsRoutes);
router.use(contactRoutes);
router.use(mediaRoutes);
router.use(adminRoutes);
router.use(settingsRoutes);
router.use(messagesRoutes);

export default router;
