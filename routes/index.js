import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
// import FilesController from '../controllers/FilesController';

const router = express.Router();

// Define routes
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// Users routes
router.post('/users', UsersController.postNew);
router.get('/users/me', UsersController.getMe);

// Auth routes
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);

/* // file upload
router.post('/files', FilesController.postUpload);

// get file
router.get('/files/:id', FilesController.getShow);

// put file
router.put('/files/:id/publish', FilesController.putPublish);

// put file unpublish
router.put('/files/:id/unpublish', FilesController.putUnpublish);

// post data
router.post('/files/:id/data', FilesController.getFile);
 */
module.exports = router;
