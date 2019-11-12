//YELPCAMP V12
var express 		= require("express"),
	app 			= express(),
	bodyParser  	= require("body-parser"),
	mongoose 		= require("mongoose"),
	methodOverride	= require("method-override"),
	flash			= require("connect-flash"),
	passport		= require("passport"),
	localStrategy	= require("passport-local"),
	passportLocalMongoose	= require("passport-local-mongoose"),
	User			= require("./models/user"),
	Campground  	= require("./models/campground"),
	Comment			= require("./models/comment"),
	seedDB			= require("./seeds");
	
var commentsRoutes 	= require("./routes/comments"),
	campgroundRoutes= require("./routes/campgrounds"),
	indexRoutes		= require("./routes/index.js");

//APP and DB CONFIG
mongoose.connect("mongodb://localhost:27017/yelpcamp_v12")
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use(flash());
//seedDB(); //Seed the DB

// PASSPORT CONFIG
app.use(require("express-session")({
	secret: "struggling to find excellent realm name",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){ //pass req.user under object named 'currentUser' to all route ejs
	res.locals.currentUser = req.user;
	res.locals.success 	   = req.flash("success");
	res.locals.error	   = req.flash("error");
	next();
});

//Requiring Routes
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments/",commentsRoutes);

app.get("*", function(req, res){
	req.flash("error", "Invalid URL");
	res.redirect("/");
});

// app.listen(3000, function(){
// 	console.log("WELCOME TO YELPCAMP SEVER");
// });

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("YELPCAMP APP START!!");
});