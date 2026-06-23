const Listing=require("../models/listing");
const axios = require("axios");

module.exports.index = async (req, res) => {

    let { search, category } = req.query;

    let filter = {};

    // Search functionality
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
            { country: { $regex: search, $options: "i" } }
        ];
    }

    // Category filter functionality
    if (category) {
        filter.category = category;
    }

    const allListings = await Listing.find(filter);

    res.render("listings/index.ejs", {
        allListings
    });
};

module.exports.renderNewForm=(req,res)=>{
  res.render("listings/new.ejs");
  };

module.exports.showListing=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id)
    .populate({
      path:"reviews",
      populate:{
        path:"author",
      },
      }).populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs",{listing});
};

module.exports.createListing = async(req,res,next)=>{
  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
    const query = `${newListing.location}, ${newListing.country}`;

  const response = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: {
        q: query,
        format: "json",
        limit: 1,
      },
      headers: {
        "User-Agent": "TripNest"
      }
    }
  );
console.log("Query:", query);
console.log("Response:", response.data);
console.log("Geometry:", newListing.geometry);

  if(response.data.length > 0){
    const place = response.data[0];

    newListing.geometry = {
      type: "Point",
      coordinates: [
        parseFloat(place.lon), 
        parseFloat(place.lat), 
      ]
    };
  }

  console.log("Geometry:", newListing.geometry);

  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  await newListing.save();

  req.flash("success","New Listing Created!");
  res.redirect("/listings");
};
module.exports.renderEditForm=async(req,res)=>{
  let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
    req.flash("error","Listing you requested for does not exist!");
    return res.redirect("/listings"); 
  }
  let originalImageUrl=listing.image.url;
  originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl})
};

module.exports.updateListing = async(req,res)=>{
  let { id } = req.params;

  let listing = await Listing.findById(id);

  Object.assign(listing, req.body.listing);

  // Geocode location
  const query = `${listing.location}, ${listing.country}`;

  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: query,
          format: "json",
          limit: 1,
        },
        headers: {
          "User-Agent": "TripNest"
        }
      }
    );

    if(response.data.length > 0){
      const place = response.data[0];

      listing.geometry = {
        type: "Point",
        coordinates: [
          parseFloat(place.lon),
          parseFloat(place.lat),
        ]
      };
    }
  } catch(err){
    console.log(err);
  }
  if(req.file){
    listing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  }
  await listing.save();
  req.flash("success","Listing Updated!");
  res.redirect(`/listings/${id}`);
};
module.exports.destroyListing=async(req,res)=>{
  let {id}=req.params;
  let deletedListing=await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
    req.flash("success","Listing Deleted!");
  res.redirect("/listings");
};
