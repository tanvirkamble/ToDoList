app.get("/:CustomListname",function(req,res){
    const CustomListname = req.params.CustomListname;
   
    List.findOne({name:CustomListname})
      .then(function(foundList){
          
            if(!foundList){
              const list = new List({
                list_name : CustomListname,
                itemname : Defaultitems 
              });
            
              list.save();
              console.log("saved");
              res.redirect("/"+CustomListname);
            }
            else{
              res.render("list",{listTitle:foundList.name, newListItems:foundList.items});
            }
      })
      .catch(function(err){});
   
   
    
    
  })
