// Import github config
const axios = require('axios');
const client = require('../db/index.js')
// Import github headers config

// Controllers for Ratings & Reviews
const controller = {
  getReview: (req, res) => {
    let {product_id, page, count,sort} = req.query;
    let limit = count ? +count :5;
    let offset = page ? +page:0;
    let sorting = 'reviews.helpfulness DESC,review_date DESC'
    switch (sort) {
      case 'newest':
        sorting = 'review_date DESC'
        break;
      case 'helpful':
        sorting = 'reviews.helpfulness DESC'
        break;
    }
    let queryStr = `WITH photos AS  (
                    SELECT review_id, COALESCE(json_build_object('id',photos_id, 'url',url))
                    FROM reviewsPhotos
                    INNER JOIN reviews
                    ON reviewsPhotos.review_id = reviews.reviews_id
                    WHERE product_id = ${product_id}
                    GROUP BY reviews.reviews_id, reviewsPhotos.photos_id
                    )
                    SELECT reviews.reviews_id, rating, summary, recommend, response, body, review_date, reviewer_name, helpfulness, COALESCE(photos,'[]') AS photos
                    FROM reviews
                    LEFT JOIN photos
                    ON photos.review_id = reviews.reviews_id
                    WHERE product_id = ${product_id} AND reported = FALSE
                    GROUP BY reviews.reviews_id ORDER BY ${sorting}`

    client.query(queryStr, (err,results) => {
      if(err) { res.status(404).send(err) }
      else {
        res.status(200).send({
          product: product_id,
          page: page,
          count: count,
          results: results.rows
        })
      }
    })
  },
  getReviewMeta: (req, res) => {
    let queryRecommended = `WITH recommended AS (
                            SELECT COUNT(recommend) filter(where recommend = True) as Tr, COUNT(recommend) filter(where recommend = False) AS fal
                            FROM reviews
                            WHERE product_id = ${req.query.product_id}
                            GROUP BY product_id
                            )
                            SELECT json_build_object('0', Tr, '1', fal) AS recommended
                            FROM recommended`
    let queryRatings = `WITH reviewRatings AS (
                        SELECT rating, COUNT(rating)
                        FROM reviews
                        WHERE product_id = ${req.query.product_id}
                        GROUP BY rating
                        ORDER BY rating ASC
                        )
                        SELECT json_object_agg(rating, count) AS reviewRatings
                        FROM reviewRatings;`
    let queryCharacteristics =`
                              WITH characteristics AS  (
                                SELECT characteristics.char_name, characteristics.char_id, AVG(reviews_char_value)
                                FROM characteristics
                                INNER JOIN reviewschar
                                ON characteristics.char_id = reviewschar.characteristic_id
                                INNER JOIN reviews
                                ON reviewsChar.review_id = reviews.reviews_id
                                WHERE characteristics.product_id=${req.query.product_id}
                                GROUP BY characteristics.char_name, characteristics.char_id
                              )
                              SELECT jsonb_build_object(char_name, jsonb_build_object('id',char_id, 'value', avg))
                              FROM characteristics`
    client.query(queryRatings, (err,results) =>{
      if(err) {console.log(err)}
      client.query(queryRecommended, (err,results2) => {
        client.query(queryCharacteristics, (err,results3)=> {
          res.status(200).send( Object.assign({'product_id':req.query.product_id}, results.rows[0], results2.rows[0], results3.rows[0]))
        })
      })
  })
},
  postReview: (req, res) => {
    let queryStr = `INSERT INTO reviews(product_id, rating, summary, body, recommend, reviewer_name, reviewer_email,review_date,reported,helpfulness )
                    VALUES(${req.body.product_id}, ${req.body.rating}, '${req.body.summary}', $$'${req.body.body}'$$, ${req.body.recommend}, '${req.body.name}' , '${req.body.email}', '${new Date().toISOString()}', false, 0)`
    let queryStrPhoto =`INSERT INTO reviewsPhotos(review_id,url)
                        VALUES((SELECT MAX(reviews_id) FROM reviews), null)`
    let queryStr2 = ``
    let queryStr3 = ``
    let values = ''
    let reviewCharacteristicsValues =''
    let characteristisValue = ''

    if(req.body.photos.length) {
    (req.body.photos).forEach((item,i)=> {
      if(i === req.body.photos.length-1) {
        values += `((SELECT MAX(reviews_id) FROM reviews), '${item}');`
      }
      else {values += `((SELECT MAX(reviews_id) FROM reviews), '${item}'),`}
    })
    queryStrPhoto= `INSERT INTO reviewsPhotos(review_id, url)
    VALUES${values}`
  }
  if(req.body.characteristics) {
    for (var key in req.body.characteristics) {
      if (Object.keys(req.body.characteristics)[Object.keys(req.body.characteristics).length-1]=== key) {
        reviewCharacteristicsValues += `((SELECT MAX(char_id) FROM characteristics), (SELECT MAX(reviews_id) FROM reviews), ${req.body.characteristics[key]});`
        characteristisValue += `(${req.body.product_id}, '${key}');`
      }
      else {
        reviewCharacteristicsValues += `((SELECT MAX(char_id) FROM characteristics), (SELECT MAX(reviews_id) FROM reviews),${req.body.characteristics[key]}),`
        characteristisValue += `(${req.body.product_id}, '${key}'),`
      }
    }

    queryStr2= `INSERT INTO reviewschar(characteristic_id,review_id,reviews_char_value)
    VALUES${reviewCharacteristicsValues}`
    queryStr3 = `INSERT INTO characteristics(product_id,char_name)
    VALUES${characteristisValue}`
  }

    client.query(queryStr, (err,results)=> {
      if(err) {console.log(err)}
      client.query(queryStr3, (err,results2)=> {
        if(err){console.log(err)}
        client.query(queryStr2,(err,results3) => {
          if(err){console.log(err)}
          client.query(queryStrPhoto, (err,results3)=> {
            res.status(201).send(results3)
          })
        })
      })
    })
  },
  putHelpful: (req, res) => {
    let queryStr = `UPDATE reviews SET helpfulness = helpfulness +1 WHERE reviews_id= ${req.params.review_id}`
    client.query(queryStr, (err,results)=>{
      if(err) {console.log(err)}
      res.status(200).send(results)
    })
  },
  putReport: (req,res) => {
    let queryStr = `UPDATE reviews SET reported = TRUE where reviews_id = ${req.params.review_id}`
    client.query(queryStr, (err,results)=>{
      if(err) {console.log(err)}
      res.status(200).send(results)
    })
  }

};

module.exports =controller
