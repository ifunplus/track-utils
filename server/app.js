const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const router = express.Router();
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.text());

app.use(cors());//设置跨域访问
app.use("/",router);


router.get("/",(req, res) => {
    res.sendfile("index.html");
});

router.post("/saveLog",(req, res) => {
    console.log("saveLog......",req.body,req.params,req.query);
    res.end(JSON.stringify(req.body))
});

app.listen(3000,() => {
    console.log("Started on PORT 3000");
})