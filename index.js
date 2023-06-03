const express = require("express");
const path = require("path");
require("dotenv").config();
const MONGO_URI = process.env.MONGO_URI;
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(
  process.env.API_KEY
);
const session = require("express-session");
const app = express();
const Image = require("./models/books");
const multer = require("multer");


const fs = require("fs");
const crypto = require("crypto");
const User = require("./models/mongo");
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const BookCollection = require("./models/books");
const tempelatePath = path.join(__dirname, "./tempelates");
const publicPath = path.join(__dirname, "./public");
console.log(publicPath);
const port = process.env.PORT || 3000;
const ContactCollection = require("./models/contact");
app.set("view engine", "ejs");
app.set("views", tempelatePath);
app.use(express.static(publicPath));

// const generateSecretKey = () => {
//   return crypto.randomBytes(32).toString("hex");
// };

// const secretKey = generateSecretKey();
// console.log("Secret Key:", secretKey);

app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: true,
    saveUninitialized: true,
  })
);

app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/signup", (req, res) => {
  res.render("signup");
});

//for about page
app.get("/about", (req, res) => {
  res.render("about");
});
//for contact us page
app.get("/contactus", (req, res) => {
  res.render("contactus");
});

app.get("/", (req, res) => {
  res.render("first");
});

app.get("/home", (req, res) => {
  res.render("home");
});
app.get("/sell", (req, res) => {
  res.render("sell");
});


app.get("/buy/:productId", async (req, res) => {
  const productId = req.params.productId;
  // retrieve the product details from the database based on the product ID
  // get the product details from the database
  const product = await Image.findById(productId);
  res.render("productdetail", { product });
});

app.post("/signup", async (req, res) => {
  const { email, mob_number, password, passwordConfirm } = req.body;

  // Validate form data
  if (password !== passwordConfirm) {
    res.send("Passwords do not match");
    return;
  }

  // Check if the email already exists in the database
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.send("Email already exists");
    return;
  }

  // Create a new user
  const newUser = new User({ email, mob_number, password });
  await newUser.save();

  // Redirect to a success page or perform any other actions
  // alert("User Created")
  res.redirect("/");
});

app.post("/login", async (req, res) => {
  try {
    const check = await User.findOne({ email: req.body.email });
    req.session.check = check;

    if (check.password === req.body.password) {
      res.status(201).render("home");
    } else {
      res.send("incorrect password");
    }
  } catch (e) {
    res.send("wrong details");
  }
});

// it is for books

app.post("/contactus", async (req, res) => {
  const data2 = new ContactCollection({
    name: req.body.name,
    email: req.body.email,
    subject: req.body.subject,
    message: req.body.message,
  });
  // await data2.save()

  try {
    await ContactCollection.insertMany([data2]);
    res.render("response");
  } catch (e) {
    res.send("There Is Error To Sending Data");
  }
});

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});
var upload = multer({ storage: storage });

app.get("/books", function (req, res) {
  BookCollection.find({}, (err, items) => {
    if (err) {
      console.log(err);
    } else {
      res.render("books", { items: items });
    }
  });
});
app.get("/selectclg", function (req, res) {
  res.render("selectclg");
});
app.post("/selectclg", function (req, res) {
  const selectedCollege = req.body.college;
  const branch = req.body.bookType;
  Image.find({ college: selectedCollege , bookType:branch }, (err, items) => {
    if (err) {
      console.log(err);
    } else {
      res.render("books", { items: items });
    }
  });
});

// Uploading the image to our database. POST
app.post("/sell", upload.single("file"), function (req, res) {
  try {
    let image = req.file;
    console.log(image);
    let newImage = new Image(); // Here, we create an instance of our Item model
    newImage.title = req.body.title;
    newImage.price = req.body.price;
    newImage.mrp = req.body.mrp;
    newImage.mob_number = req.body.mob_number;
    newImage.email = req.body.email;
    newImage.college = req.body.college;
    newImage.description = req.body.description;
    newImage.priceType = req.body.priceType;
    newImage.bookCondition = req.body.bookCondition;
    newImage.bookType = req.body.bookType;
    // process.cwd() -> Project directory
    // __dirname -> Current directory
    newImage.img.data = fs.readFileSync(
      path.join(__dirname + "/uploads/" + image.filename)
    );

    newImage.img.contentType = "image/jpg";
    newImage.save();

    res.redirect("/books");
  } catch (error) {
    console.error(error);
    res.send("ERROR!");
  }
});

// Assuming you have a user collection in MongoDB

app.get("/account", (req, res) => {
  const userId = req.session.check;
  if (!userId) {
    return res.redirect("/login");
  }
  User.findById(userId, (err, user) => {
    if (err || !user) {
      return res.redirect("/login");
    }
    // res.render("account", { user });
    BookCollection.find({ email: user.email }, (err, books) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
      }
      res.render("account", { books, user });
    });
  });
});

// Discard book route
app.post("/account/discard/:bookId", (req, res) => {
  const bookId = req.params.bookId;

  // Remove the book from the database
  BookCollection.findByIdAndRemove(bookId, (err, discardedBook) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }

    // Check if the book was found and discarded
    if (!discardedBook) {
      return res.status(404).send("Book not found");
    }

    res.redirect("/account");
  });
});

app.post("/buy/:productId", async (req, res) => {
  const userId = req.session.check;
  const productId = req.params.productId;
  const product = await BookCollection.findById(productId);
  const msg1 = req.body.msg;
  if (!userId) {
    return res.redirect("/login");
  }
  User.findById(userId, (err, user) => {
    if (err || !user) {
      return res.redirect("/login");
    }

    if (!product) {
      res.status(404).send("Product not found");
      return;
    }

    // Send email using SendGrid
    const msg = {
      to: product.email,
      from: "bookshelf34614@gmail.com", // your email address
      subject: "Product Purchase",
      text:
        msg1 +
        "\n my Email is :  " +
        user.email +
        "\n My Mobile Number is :" +
        user.mob_number,
    };

    try {
      sgMail.send(msg);
      console.log("Email sent successfully");
    } catch (error) {
      console.error("Error sending email:", error);
    }

    // Redirect or render a thank you page
    // res.redirect("/response");
    res.send("Email Sent Successfully");
  });
});

app.get("/logout", (req, res) => {
  // Clear the session or token
  req.session.destroy(); // Example for session-based authentication
  res.redirect("/"); // Replace with your actual login page URL

  // Redirect the user to the login page or any other desired page
});

let wishlist = [];



app.listen(port, () => {
  console.log("port connected");
});
