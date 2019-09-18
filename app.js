const express = require("express");
const fs = require("fs");
const multer = require("multer");
var exphbs = require("express-handlebars");
const { TesseractWorker } = require("tesseract.js");
const worker = new TesseractWorker();
const app = express();

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./actualimages");
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  }
});

const fileUpload = multer({ storage: storage }).single("image");
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home");
});

app.post("/upload", (req, res) => {
  fileUpload(req, res, err => {
    fs.readFile(`./actualimages/${req.file.originalname}`, (err, data) => {
      if (err) return console.log(err);

      worker
        .recognize(data, "eng", { tessjs_create_pdf: "1" })
        .progress(progress => {
          console.log(progress);
        })
        .then(data => {
          res.redirect("/download/pdf");
        });
    });
  });
});
app.get("/download/pdf", (req, res) => {
  res.download(`${__dirname}/tesseract.js-ocr-result.pdf`, "result.pdf");
});
app.listen(process.env.PORT, () => {
  console.log("app is running");
});
