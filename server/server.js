var path = require('path');
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const bsLayer = require('./lib/BussinessLayer');

const VALID_EXT = ['jpg', 'jpeg', 'gif', 'png'];
const UPLOAD_DIR = path.join(__dirname, '../uploads')

const app = express();

app.use(bodyParser.json())
app.use(express.static('public'));

app.use('/uploads', express.static(UPLOAD_DIR));

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const ext = file.originalname.split('.').pop().toLowerCase();

    if(VALID_EXT.indexOf(ext) == -1){
      cb(new Error('Invalid file type!'))
    } else {
      cb(null, UPLOAD_DIR)
    }
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split('.').pop();
    cb(null, file.fieldname + '-' + Date.now() + '.' + ext)
  }
})
var upload = multer({ storage: storage }).single('file');


app.get('/api/getAll', function(req, res){
      bsLayer.getAllItems(function(err, items){
      if(err) { handleError(err, res); return}
      res.set('Content-Type', 'application/json');
      res.send(items).end();
    });
  });

  app.get('/api/get/:id', function(req, res){
    const id = req.params.id
    bsLayer.getItem(id, function(err, item){
      if(err) { handleError(err, res); return}
      res.set('Content-Type', 'application/json');
      res.send(item).end();
    });
    
  });

app.post('/api/save', function(req, res){
  upload(req, res, function (err) {
    if(err) { handleError(err, res); return}

    const item = { img: req.file.filename, desc: req.body.desc, order: req.body.order };
    
    if(!req.body.id){
      bsLayer.saveItem(item, function(err, result){
        if(err) { handleError(err, res); return}
  
        res.set('Content-Type', 'application/json');
        res.send(item).end();
      })
    } else {
      bsLayer.updateItem(req.body.id, item, function(err, result){
        if(err) { handleError(err, res); return}
  
        res.set('Content-Type', 'application/json');
        item._id = req.body.id;
        res.send(item).end();
      })
    }
  });
    
});

app.post('/api/saveOrder', function(req, res){
    const ids = req.body.data;
    bsLayer.updateItems(ids)
});

app.post('/api/delete', function(req, res){
  const id = req.body.data;
  bsLayer.deleteItem(id, function(err, result){
    if(err) { handleError(err, res); return}

    res.set('Content-Type', 'application/json');
    res.send({ msg: 'item deleted' });
  })
});

app.listen(3000, () => {
  console.log("live on port 3000");
})


function handleError(err, res){
  console.error(err);
  res.status(200).send({error : err.message});
}
