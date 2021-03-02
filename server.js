const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');



//configure cors
app.use(cors());

//configure express to receive data from client
app.use(express.json());

//dotenv configuration
dotenv.config({path:'./.env'});

const port = process.env.PORT || 6000;

//mongoose Configuration
mongoose.connect(process.env.MONGOBD_CLOUDE_URL,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useFindAndModify:false,
    useCreateIndex:true
}).then(()=>{
    console.log('Concted to Mongo DB Cloud Successfully');
}).catch((err)=>{
    console.error(err);
    process.exit(1); //stop process if unable to connect to mongodb
});

//simple url
if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname , 'client' , 'build')));
    app.get('/', (request,response) => {
        response.sendFile(path.join(__dirname , 'client' , 'build' , 'index.html'));
    });
}
//router configuration
app.use('/api/users',require('./router/userRouter'));
app.use('/api/posts',require('./router/postRouter'));
app.use('/api/profiles',require('./router/profileRouter'));


app.listen(port,()=>{
   console.log(`Express server is statred at Port: ${port}`);
});