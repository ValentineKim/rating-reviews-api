// Import github config
const axios = require('axios');

// Import github headers config
const config = require('./config.js');
config.url = `${config.url}/reviews`;

// Controllers for Ratings & Reviews
const controllersRR = {

  /* ---------------
  Review API Queries
  --------------- */

  // Get reviews by product id
  getReview: (req, res) => {
    axios.get(`${config.url}?product_id=${req.params.product_id}&count=100`, config.headers)
      .then((resp) => res.status(200).send(resp.data))
      .catch((err) => res.status(400).send(err));
  },

  // Get review meta data by product id
  getReviewMeta: (req, res) => {
    axios.get(`${config.url}/meta/?product_id=${req.params.product_id}`, config.headers)
      .then((resp) => res.status(200).send(resp.data))
      .catch((err) => res.status(400).send(err));
  },

  // Post a review to a product by product_id
  postReview: (req, res) => {
    axios.post(config.url, req.body, config.headers)
      .then(() => res.status(200).send(`Posted review for ${req.body.name}`))
      .catch((err) => res.status(400).send(`Failed to post review for ${req.body.name}. Error: ${err}`));
  },

  // Adds a record to a specific review_id that indicates if the review was helpful
  putHelpful: (req, res) => {
    axios.put(`${config.url}/${req.params.review_id}/helpful`, null, config.headers)
      .then(() => res.status(204).send('You marked this review as helpful'))
      .catch((err) => res.status(400).send(`Could not mark this review as helpful. Error: ${err}`));
  },

  postInteraction: (req, res) => {
    axios.post('https://app-hrsei-api.herokuapp.com/api/fec2/hr-lax/interactions', req.body, config.headers)
      .then(() => res.status(200).send(`Posted interaction for ${req.body.widget}`))
      .catch((err) => res.status(400).send(`Failed to post review for ${req.body.widget}. Error: ${err}`));
  },

};

module.exports = controllersRR;
