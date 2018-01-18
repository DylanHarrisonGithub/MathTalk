const User = require('../models/user');
const Post = require('../models/post');
const jwt = require('jsonwebtoken');
const config = require('../config/database');

module.exports = (router) => {

    // find one post by id
    router.get('/id/:postId', (req, res) => {
      if (!req.params.postId) {
        res.json({ success: false, message: 'Could not get by id because no id was provided'});
      } else {
        Post.findById(req.params.postId).exec((err, post) => {
          if (err) {
            res.json({ success: false, message: err });
          } else {
            if (!post) {
              res.json({ success: false, message: 'Post could not be found by provided id' });
            } else {
              res.json({ success: true, post: post });
            }
          }
        });
      }
    });

    // find replies by parent id
    router.get('/replies/:postId', (req, res) => {
      if (!req.params.postId) {
        res.json({ success: false, message: 'Could not get replies by id because no id was provided'});
      } else {
        //console.log(req.params.postId);
        Post.find({ 'parentID': req.params.postId }).sort('timeStamp').exec((err, replies) => {
          if (err) {
            res.json({ success: false, message: err });
          } else {
            if (!replies) {
              res.json({ success: true, replies: [] });
            } else {
              res.json({ success: true, replies: replies });
            }
          }
        });
      }
    });

    // get next ten posts by oldest timestamp and query filter
    router.post('/nextquery', (req, res) => {
      if (req.body.timestamp) {
        var mongoQuery = {
          'parentID': '',
          timeStamp: { $lt: req.body.timestamp }
        }
        if (req.body.query) {
          if (req.body.query != '') {
            mongoQuery['meta'] = "#"+req.body.query
          }
        }
        Post.find(mongoQuery).sort('-timeStamp').limit(10).exec((err, posts) => {
          if (err) {
            res.json({ success: false, message: err });
          } else {
            if (!posts) {
              res.json({ success: false, message: 'No recent posts' });
            } else {
              res.json({ success: true, posts: posts });
            }
          } 
        });   
      } else {
        res.json({ success: false, message: 'Could not retrieve posts. Timestamp was not defined' });
      }
    });

    // routes that dont need token go above here
/*     router.use((req, res, next) => {
      const token = req.headers['authorization'];
      if (!token) {
        res.json({ success: false, message: 'No token provided' });
      } else {
        jwt.verify(token, config.secret, (err, decoded) => {
          if (err) {
            res.json({ success: false, message: 'Token invalid: ' + err });
          } else {
            req.decoded = decoded;
            next();
          }
        });
      }
    }); */

    router.post('/newpost', (req, res) => {
      if (!req.body.username) {
        res.json({ success: false, message: 'No username provided' });
      } else {
        // verify username is registered??
/*         if (!usernameisregistered) {
          res.json({ success: false, message: 'username is not recognized'})
        } */
        if (!req.body.title) {
          res.json({ success: false, message: 'Post has no title' });
        } else {
          if (!req.body.body) {
            res.json( {success: false, message: 'Post has no body' });
          } else {
            var hashtags = [];
            if (req.body.meta) {
              hashtags = req.body.meta;
            }

            var parent = '';
            if (req.body.parentID) {
              // verify parentID exists?             
              parent = req.body.parentID;
            }
            // create new Post object
            const newPost =  new Post({
              username: req.body.username.toLowerCase(),
              timeStamp: Date.now().toString(),
              title: req.body.title,
              body: req.body.body,
              meta: hashtags,
              likes: 0,
              parentID: parent,
              replies: []
            });

            //save to database
            newPost.save((err) => {
              if (err) {
                res.json({ success: false, message: 'Error creating post: ' + err });
              } else {
                res.json({ success: true, message: 'Post created' });
              }
            });

          }
        }
      }
    });

    return router;
}