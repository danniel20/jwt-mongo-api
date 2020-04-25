const Project = require('../models/Project')
const Task = require('../models/Task')

module.exports = {

  async index(req, res){
    try{
      const projects = await Project.find().populate(['user', 'tasks'])
      res.json(projects)
    }
    catch(err){
      res.status(400).json({error: "Error loading projects"})
    }
  },

  async create(req, res){
    try{
      const { title, description, tasks } = req.body

      const project = await Project.create({title, description, user: req.user.id})

      await Promise.all(
        tasks.map(async task => {
          const projectTask = new Task({...task, project: project._id})
          await projectTask.save()
          project.tasks.push(projectTask)
        })
      )

      await project.save()

      res.json(project)
    }
    catch(err){
      res.status(400).json({error: "Error creating new project!"})
    }
  },

  async show(req, res){
    try{
      const project = await Project.findById(req.params.id).populate(['user', 'tasks'])
      res.json(project)
    }
    catch(err){
      res.status(400).json({error: "Error project not found"})
    }
  },

  async update(req, res){
    try{
      const { title, description, tasks } = req.body

      const project = await Project.findByIdAndUpdate(req.params.id, {title, description}, {new: true})

      project.tasks = []
      await Task.remove({project: project._id})

      await Promise.all(
        tasks.map(async task => {
          const projectTask = new Task({...task, project: project._id})
          await projectTask.save()
          project.tasks.push(projectTask)
        })
      )

      await project.save()

      res.json(project)
    }
    catch(err){
      res.status(400).json({error: "Error updating project!"})
    }
  },

  async delete(req, res){
    try{
      await Project.findByIdAndRemove(req.params.id)
      res.sendStatus(204)
    }
    catch(err){
      res.status(400).json({error: "Error deleting project"})
    }
  }
}