var express 	= require("express"),
	router		= express.Router(),
	Campground	= require("../models/campground"),
	middleware  = require("../middleware"); //automatically directed to index.js
	
//INDEX route - show all campgrounds
router.get("/", function(req, res){ 
	//Get all campgrounds from DB
	Campground.find({}, function(err, allCampgrounds){
		if(err){
			console.log(err);
		} else{
			res.render("campgrounds/index", {campgrounds:allCampgrounds, currentUser: req.user}); 
		}
	});
});

//NEW route - show from to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new");
});

//SHOW route - show more info about the campground
router.get("/:id", function(req, res){
	//find the camground with provided ID
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){ //there's only id inside comments. populate it with text and author
		if (err || !foundCampground){
			req.flash("error", "Campground not found");
			res.redirect("/campgrounds");
		} else{
			//render show template with that camprgound
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});	
});

//CREATE route - add new campground to database
router.post("/", middleware.isLoggedIn, function(req, res){ 
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	var newCampground = {
		name: req.body.name,
		price: req.body.price,
		image: req.body.image, 
		description: req.body.description, 
		author: author
	};
	
	//Create a new campground and save to DB
	Campground.create(newCampground, function(err, newlyCreated){
		if(err){
			console.log(err); 
		} else{
			res.redirect("/campgrounds");	
		}
	});
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		res.render("campgrounds/edit", {campground: foundCampground})
	});
});


//UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
		if(err){
			req.flash("error", "Campground not found");
			res.redirect("/campgrounds");
		} else{
			req.flash("success", "Campground updated");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});	
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			req.flash("error", "Campground not found");
			res.redirect("/campgrounds");
		} else{
			req.flash("success", "Campground deleted");
			res.redirect("/campgrounds");
		}
	});
});


module.exports = router;