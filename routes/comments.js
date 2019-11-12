var express 	= require("express"),
	router		= express.Router({mergeParams: true}), //merge params from campground and comments together so we can access :id we defined
	Campground	= require("../models/campground"),
	Comment		= require("../models/comment"),
	middleware  = require("../middleware"); //automatically directed to index.js

//NEW Comment
router.get("/new", middleware.isLoggedIn, function(req, res){
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log("ERROR!!");
		} else{
			res.render("comments/new", {campground:campground});
		}
	});
})

//CREATE Comment
router.post("/", middleware.isLoggedIn, function(req,res){
	//lookup campground using ID
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			req.flash("error", "Something went wrong");
			res.redirect("/campgrounds");
		} else{
			//create new comment
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					console.log("ERROR ADD COMMENT TO DB!");
				} else{
					//add username and id to comment
					comment.author.id = req.user.id;
					comment.author.username = req.user.username;
					comment.save();
					campground.comments.push(comment);
					campground.save();
					req.flash("success", "Successfully added comment");
					res.redirect("/campgrounds/" + campground._id)
				}
			});
		}
	});
});

//EDIT COMMENT
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
	Comment.findById(req.params.comment_id, function(err, foundComment){
		if(err){
			res.redirect("back");
		} else{
			res.render("comments/edit", {campground_id: req.params.id, comment:foundComment});
		}
	});
	
});

//UPDATE COMMENT
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
		if(err){
			res.redirect("back");
		} else{
			req.flash("success", "Comment updated");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

//DESTROY COMMENT
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		if(err){
			res.redirect("back");
		} else{
			req.flash("success", "Comment deleted");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

module.exports = router;
