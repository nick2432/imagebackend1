const express = require("express");
const app=express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan")
const axios = require('axios');
const helmet = require("helmet");
const Userrouter =require("./routes/user")
const post =require("./routes/post")
const cookieParser = require("cookie-parser");
dotenv.config();

app.use(cors({
  origin: true,
  credentials: true
}));
app.options('*', cors())
app.get('/images', async (req, res) => {
  try {
    const image = req.query.image;
    const response = await axios.get(`https://pixabay.com/api/?key=38407053-d222e14d96ceb4a030fdbc329&q=${image}&image_type=photo`);
    res.send(response.data);
  } catch (error) {
    res.status(500).send({ error: error.toString() });
  }
});


const database = (module.exports = () => {
    const connectionParams = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    try {
      mongoose.connect(
        "mongodb+srv://nik:jlMX5lI9oIcZk2jY@cluster0.wo3jiqh.mongodb.net/social-app?retryWrites=true&w=majority",
        connectionParams
      );
      console.log("Database connected succesfully");
    } catch (error) {
      console.log(error);
      console.log("Database connection failed");
    }
  });
  database();
  
app.use(express.json());
app.use(cookieParser());

app.use(helmet());
app.use(morgan("common"));
app.use('/api', Userrouter);
app.use('/api', post);
app.listen(8800,()=>{
    console.log("ready");
})