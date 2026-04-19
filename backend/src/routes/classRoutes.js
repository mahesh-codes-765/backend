const express = require('express');
const router = express.Router();
const { createClass, getClasses, getClassById, updateClass, deleteClass } = require('../controllers/classController');
const { protect, trainer } = require('../middlewares/authMiddleware');

router.route('/')
  .get(getClasses)
  .post(protect, trainer, createClass);

router.route('/:id')
  .get(getClassById)
  .put(protect, trainer, updateClass)
  .delete(protect, trainer, deleteClass);

module.exports = router;
