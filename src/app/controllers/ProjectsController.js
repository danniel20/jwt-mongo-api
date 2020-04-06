module.exports = {

  index(req, res){
    res.json({msg: 'ok', user_id: req.id})
  }
}