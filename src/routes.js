const { Router } = require('express')

const authMiddleware = require('./app/middlewares/auth')

const AuthController = require('./app/controllers/AuthController')
const ProjectsController = require('./app/controllers/ProjectsController')

const router = Router()

router.post('/register', AuthController.register)
router.post('/authenticate', AuthController.authenticate)
router.post('/forgot_password', AuthController.forgotPassword)
router.post('/reset_password', AuthController.resetPassword)

router.route('/projects')
  .all(authMiddleware.authenticate())
  .get(ProjectsController.index)
  .post(ProjectsController.create)
  
router.route('/projects/:id')
  .all(authMiddleware.authenticate())
  .get(ProjectsController.show)
  .put(ProjectsController.update)
  .delete(ProjectsController.delete)

module.exports = router