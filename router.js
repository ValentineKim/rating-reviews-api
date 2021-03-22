const router = require('express').Router();
const controller = require('./controller');
// Ratings & Reviews Controllers
const controllersRR = require('./controllers-rr.js');
const controllerRelated = require('./controllerRelated.js');

/* --------------------
Ratings & Reviews: Liam
-------------------- */
// Post review by product_id
router
  .route('/reviews')
  .post(controllersRR.postReview);

// Gets product review by product_id
router
  .route('/reviews/:product_id')
  .get(controllersRR.getReview);

// Gets product review meta data by product_id
router
  .route('/reviews/meta/:product_id')
  .get(controllersRR.getReviewMeta);

// Puts record in reivews that the review was helpful (by review_id)
router
  .route('/reviews/:review_id/helpful')
  .put(controllersRR.putHelpful);


module.exports = router;