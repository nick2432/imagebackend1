const  router  = require("express").Router();
const {creatpost ,getPostOfFollowing,likeAndUnlikePost,deletPost,updateCaption,deleteComment,commentOnPost}=require("../controllers/post.js")
const { isAuthenticated } = require("../middlewares/auth");
router.route("/post").post(isAuthenticated,creatpost); 

router
  .route("/post/:id")
  .get(isAuthenticated, likeAndUnlikePost)
  .put(isAuthenticated, updateCaption)
  .delete(isAuthenticated, deletPost);
router.route("/posts").get(isAuthenticated,getPostOfFollowing); 
router
  .route("/post/comment/:id")
  .put(isAuthenticated, commentOnPost)
  .delete(isAuthenticated, deleteComment);
module.exports = router;