const User = require("../models/user.js");
const Post = require("../models/post.js");
exports.getAll = async (req,res)=>{
   try{
    const {name,email,password}=req.body;
    let user=await User.findOne({email}).select("+password");
    if(user){
        return res.status(400)
        .json({success: false,message:"User already exists"});
    }
    user = await User.create({
        name,
        email,
        password,
        avatar:{public_id:"sample_id",url:"sampleurl"}
    })
    res.status(201).json({success:true,user});
   }catch(error){
    res.status(500).json({
        success:false,
        message:error.message,
    });
   }
};
exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const user = await User.findOne({ email })
        .select("+password")
      
  
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "User does not exist",
        });
      }
  
      const isMatch = await user.matchPassword(password);
  
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Incorrect password",
        });
      }
  
      const token = await user.generateToken();
  
      const options = {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
  
      res.status(200).cookie("token", token, options).json({
        success: true,
        user,
        token,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  exports.logout = (req, res) => {
    try {
      res
        .status(200)
        .cookie('token', '', {
          // set the cookie expiration date to a past date to delete it
          expires: new Date(0),
          httpOnly: true,
          // add these if they were set when the cookie was created
          // path: '/',
          // domain: 'your-domain.com', 
          // secure: true,
          // sameSite: 'None',
        })
        .json({
          success: true,
          message: "Logged out",
        });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  
  exports.follow = async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const loggedInUser = await User.findById(req.user._id);
    
        if (!userToFollow) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }
        if (loggedInUser.following.includes(userToFollow._id)) {
            const indexfollowing = loggedInUser.following.indexOf(userToFollow._id);
            const indexfollowers = userToFollow.followers.indexOf(loggedInUser._id);
      
            loggedInUser.following.splice(indexfollowing, 1);
            userToFollow.followers.splice(indexfollowers, 1);
      
            await loggedInUser.save();
            await userToFollow.save();
      
            res.status(200).json({
              success: true,
              message: "User Unfollowed",
            });
          } 
          else {
            loggedInUser.following.push(userToFollow._id);
            userToFollow.followers.push(loggedInUser._id);
      
            await loggedInUser.save();
            await userToFollow.save();
      
            res.status(200).json({
              success: true,
              message: "User followed",
            });
    }
}
    catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
  exports.updatePassword = async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select("+password");
  
      const { oldPassword, newPassword } = req.body;
  
      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Please provide old and new password",
        });
      }
  
      const isMatch = await user.matchPassword(oldPassword);
  
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Incorrect Old password",
        });
      }
  
      user.password = newPassword;
      await user.save();
  
      res.status(200).json({
        success: true,
        message: "Password Updated",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  exports.updateProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      const { name, email } = req.body;
      if (name) {
        user.name = name;
      }
      if (email) {
        user.email = email;
      }
      await user.save();
      res.status(200).json({
        success: true,
        message: "Profile Updated",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  exports.deleteMyProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      const posts = user.post;
      const followers = user.followers;
      const following = user.following;
      const userId = user._id;
  
      // Removing Avatar from cloudinary
      
      await User.deleteOne(userId);
     
  
      // Logout user after deleting profile
  
      res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      });
  
      // Delete all posts of the user
      for (let i = 0; i < posts.length; i++) {
        const post = await Post.findById(posts[i]);
        await Post.deleteOne(post._id);
      }
  
  
      // Removing User from Followers Following
      for (let i = 0; i < followers.length; i++) {
        const follower = await User.findById(followers[i]);
  
        const index = follower.following.indexOf(userId);
        follower.following.splice(index, 1);
        await follower.save();
      }
  
      // Removing User from Following's Followers
      for (let i = 0; i < following.length; i++) {
        const follows = await User.findById(following[i]);
  
        const index = follows.followers.indexOf(userId);
        follows.followers.splice(index, 1);
        await follows.save();
      }
  
      // removing all comments of the user from all posts
      const allPosts = await Post.find();
  
      for (let i = 0; i < allPosts.length; i++) {
        const post = await Post.findById(allPosts[i]._id);
  
        for (let j = 0; j < post.comments.length; j++) {
          if (post.comments[j].user === userId) {
            post.comments.splice(j, 1);
          }
        }
        await post.save();
      }
      // removing all likes of the user from all posts
  
      for (let i = 0; i < allPosts.length; i++) {
        const post = await Post.findById(allPosts[i]._id);
  
        for (let j = 0; j < post.likes.length; j++) {
          if (post.likes[j] === userId) {
            post.likes.splice(j, 1);
          }
        }
        await post.save();
      }
  
      res.status(200).json({
        success: true,
        message: "Profile Deleted",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  exports.myProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user._id).populate(
        "post followers following"
      );
      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  exports.getUserProfile = async (req, res) => {
    try {
      const user = await User.findById(req.params.id).populate(
        "posts followers following"
      );
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
  
      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  
  exports.getAllUsers = async (req, res) => {
    try {
      const users = await User.find({});
  
      res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  exports.addDownload = async (req, res) => {
    const { downloadUrl } = req.body;
    try {
      const userId = req.user._id;
      const user = await User.findById(userId);
      user.downloads.push(downloadUrl);
      await user.save();
      res.status(200).json({ message: 'Download added successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Unable to add the download' });
    }
  };
  exports.getDownloads = async (req, res) => {
    try {
      const userId = req.user._id;
      const user = await User.findById(userId);
      res.status(200).json({ downloads: user.downloads });
    } catch (error) {
      res.status(500).json({ error: 'Unable to fetch the downloads' });
    }
  };
  
