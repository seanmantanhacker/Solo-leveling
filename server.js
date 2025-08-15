const express = require('express');
const app = express();
const PORT = process.env.PORT || 3500;
const path = require('path');

// Serve everything inside "public"
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'/frontend/views'));
app.use(express.static(path.join(__dirname, '/frontend/assets')));

app.get('/', (req, res) => {
   
    res.render('index', {
        data: "a",
        ses: "a"
    });

})

//Handle 404
app.use(function (req, res, next) {
   if (req.accepts('html') && res.status(404)) {
      res.render('pages/404')
      return;
   }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
