const  router  = require("express").Router();
const {getAll,login,follow,logout,updatePassword,updateProfile,deleteMyProfile,myProfile,getUserProfile,getAllUsers,addDownload,getDownloads}=require("../controllers/user.js")
const { isAuthenticated } = require("../middlewares/auth");
router.route("/download").post(isAuthenticated,addDownload);
router.route("/download").get(isAuthenticated,getDownloads);
router.route("/user").post(getAll); 
router.route("/login").post(login); 
router.route("/logout").post(logout); 
router.route("/update/password").put(isAuthenticated, updatePassword);
router.route("/update/profile").put(isAuthenticated, updateProfile);
router.route("/delete/me").delete(isAuthenticated, deleteMyProfile);
router.route("/me").get(isAuthenticated, myProfile);
router.route("/user/:id").get(isAuthenticated, getUserProfile);
router.route("/users").get(isAuthenticated, getAllUsers);
router.route("/follow/:id").get(isAuthenticated,follow); 
router.route("/")
module.exports = router;