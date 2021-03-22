const Router = require('express').Router();
const controller = require('./controller.js');
// Ratings & Reviews Controllers

/* --------------------
Ratings & Reviews: Liam
-------------------- */
// Post review by product_id
// Gets product review by product_id

Router
  .route('/reviews')
  .get(controller.getReview)
  .post(controller.postReview)

Router
  .route('/reviews/meta')
  .get(controller.getReviewMeta)

Router
  .route('/reviews/:review_id/helpful')
  .put(controller.putHelpful)

Router
  .route('/reviews/:review_id/report')
  .put(controller.putReport)

module.exports = Router;