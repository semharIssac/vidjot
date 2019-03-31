const express = require('express');
const exphbs  = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const moment = require('moment');

const app = express();

// map global promice getrid of warnning
mongoose.Promise = global.Promise;

// Connect to mongoose
mongoose.connect('mongodb://localhost/vidjot-dev', { useNewUrlParser: true 
})
.then(()=> console.log('MongoDB connected...'))
.catch(err=> console.log(err));

// Load Idea model
require('./models/Idea');
const Idea = mongoose.model('ideas');

// handlbars middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())



//indexrout
app.get('/',(req, res)=>{
  const title = 'Welcome';
  res.render('index', {
                      title: title
                     });
});
app.get('/about', (req, res)=>{
  res.render('about');
});

//Idea index page
app.get('/ideas', (req, res)=>{
  Idea.find({})
  .sort({date:'desc'})
  .then(ideas =>{

    // console.log(moment(ideas[12].date).format("MMM Do YY") );
    ideas = ideas.map(element => {
      return {
        title: element.title,
        detail: element.detail,
        date: moment(element.date).format("MMM Do YY")
      };
    });

    res.render('ideas/index', {
      ideas:ideas
    });
  });
 
});

// add idea form
app.get('/ideas/add', (req, res)=>{
  res.render('ideas/add');
});

//Process form
app.post('/ideas', (req, res)=>{
  let errors = [];
  if(!req.body.title){
    errors.push({text:'Please add a title'})
  }
  if(!req.body.details){
    errors.push({text:'Please add some details'})
  }
  if(errors.length >0){
    res.render('ideas/add',{
    errors: errors,
    title: req.body.title,
    details:req.body.details,
    
    });
  }else {
    const newUser = {
      title: req.body.title,
      detail: req.body.details
    }
    new Idea(newUser)
    .save()
    .then(idea => {
      res.redirect('/ideas');
    }).catch(err=> console.log(err));
   // res.send('passed')
  }

});

const port = 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});