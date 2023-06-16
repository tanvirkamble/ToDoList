

const express = require("express");
const bodyParser = require('body-parser');
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
//const { name } = require("ejs");
const _ = require('lodash');

//   
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
 

//mongoose.connect('mongodb://127.0.0.1:27017/ToDoListDB')
mongoose.connect('mongodb+srv://tanvirkamble:tanvir123@todolist.6gjeztn.mongodb.net/ToDoListDB')//password:tanvir123

.then( () => {
    console.log('database connected');
    })
  .catch( (err) => {
    console.log('OH NO ERROR IN DB CONNECTION');
    console.log(err);
    });
 
 // ----list items schema---   
  const itemSchema = {
    name : String
  } 

  const Item = mongoose.model('item',itemSchema);
  
  const item1 = new Item({name : 'Welcomme to your todolist'});
  const item2 = new Item({name : 'Hit the + button to add new item'});
  const item3 = new Item({name : '<-- hit the check box to cancel out a item'});

  const Defaultitems = [item1,item2,item3];
  // ---- custom list items schema-----

  const CustomItemSchema = {
    list_name : String,
    itemname : [itemSchema]

  };
  const CustomItem = mongoose.model('customitem', CustomItemSchema);

  //const items = [];
// app.get("/", async function(req, res) {
//   const day = date.getdate();
  
//   await Item.find({})
//   .then( async (items) => {
//      if (items.length === 0) {
//         await Item.insertMany(Defaultitems)
        //  .then( () => console.log('SUCCESFULLY ADDED DEFAULT ITEMS IN DB'))
        //  .catch(err => {
        //  console.log('OH NO ERROR WHILE ADDING DEFAULT ITEMS');
        //  console.log(err);
//          }),
//          res.redirect('/')  
//       } else {
//          res.render("list", {listTitle: day, newListItems: items}); 
//         }
//    }) 
// });

app.get("/", async function (req, res) {
  const foundItems = await Item.find({});
  const day = date.getdate();
  if (!(await Item.exists())) {
    await Item.insertMany(Defaultitems);
    
    res.redirect("/");
  } else {
    // Item.findByIdAndDelete([Defaultitems._id]);
    res.render("list", { listTitle: day , newListItems: foundItems });
  }
});





// app.get('/:CustomListname', (req,res) => {
//   // res.send(req.params.newList);
//   const CustomListname = req.params.CustomListname;
 


//   CustomItem.findOne({listTitle : CustomListname})
//   .then( function(foundlist) {
//     if (!foundlist) {

//          // create a list
//          console.log('DOESNT EXISTS!!');
        
//         const customlistitem = new CustomItem({
//           list_name : CustomListname,
//           itemname : Defaultitems  
//         });
//         //CustomItem.insertMany(customlistitem)
//         //CustomItem.collection.insertOne(customlistitem);
//         //CustomItem.create(customlistitem)
//         customlistitem.save()
//         .then(console.log('saved!'))
   
//         res.redirect('/'+ CustomListname);
//       }
//       else {
//         //show list
//         console.log('EXISTS!!');
//         console.log(x);
//         //res.render("list", {listTitle: CustomListname , newListItems: customlistitem.itemname});
//         res.render("list", {listTitle:foundlist.list_name , newListItems:  foundlist.itemname});    
//         // res.redirect('/'+ CustomListname);
//       }
//     })
//   .catch( (err) => {
//     console.log('ERROR!!');
//     console.log(err);
//   }) 
// })

app.get("/:CustomListname",async function(req,res){
  const CustomListname = _.capitalize(req.params.CustomListname);
 
 await  CustomItem.findOne({list_name:CustomListname}).exec()

    .then(function(foundList){
          if( !foundList ){
            // create a list

            const list = new CustomItem({
              list_name : CustomListname,
              itemname : Defaultitems 
            });
          
            list.save().then( (x)=>{console.log("saved");
             console.log(x.list_name);
            }) 
      
            res.redirect("/"+ CustomListname);
                    
          }
          else{
            console.log('list exist');
            res.render("list",{listTitle:foundList.list_name, newListItems:foundList.itemname});
          }
    })
    .catch(function(err){console.log(err);});  
  
})


app.post("/", async function(req, res){

  const itemName = req.body.newItem;
  // new item to be added useing the '+' in our pg 
  const listName = req.body.list
  const newitem = new Item({
    name : itemName
  });

   const day = date.getdate();

   if ( listName === day) {
    //Item.insertMany(newitem);
    await Item.create(newitem)
    res.redirect('/');
   } 
   else {
    // await CustomItem.findOne({name : listName}).then((foundList) => {
    //   //foundList.items.push(newitem);
    //   foundList.itemname.push(newitem);  
    //   foundList.save();
    //   res.redirect('/' + listName) })
   //----------------------------------

    // Item is to be added to a custom list
    try {
      let foundList = await CustomItem.findOne({ list_name: listName }).exec();

      if (!foundList) {
          // If the custom list doesn't exist, create a new one and save the new item to it
        foundList = new CustomItem({
          list_name: listName,
          itemname: [newitem]
        });

        await foundList.save();
        res.redirect('/' + listName);
      } else {
          // If the custom list already exists, add the new item to it

        foundList.itemname.push(newitem);
        await foundList.save();
        res.redirect('/' + listName);// Redirect the user to the custom list page
      }
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }

  } 


});

app.post('/delete', async (req,res) => {
try {
    //console.log(req.body.checkedbox);
    const checkedItem = req.body.checkedbox;
    const listName = req.body.listName
    const day = date.getdate();
  
    if (listName === day ) {
  
      await Item.findByIdAndDelete(checkedItem)
      .then( () =>{ 
        console.log('SUCCESFULLY DELETED CHECKED ITEM FROM DB');
        console.log('id:'+ checkedItem); 
      })
      .catch(err => {
      console.log('OH NO ERROR WHILE DELETING CHECKED ITEM');
      console.log(err);
    });
    res.redirect('/')
  
    } else {
      const x = await CustomItem.findOne({list_name : listName});
  
      x.itemname.pull({_id: checkedItem});
  
      await x.save()
      .then( () =>{ 
        console.log('SUCCESFULLY DELETED CHECKED ITEM FROM DB');
        console.log(listName);
        console.log('id:'+ checkedItem); 
        
      })
      .catch( err => {
        console.log('OH NO ERROR WHILE DELETING CHECKED ITEM');
        console.log(err);
      })
  
      res.redirect('/' + listName);
     } 
} catch (error) {
  console.log(error);
  res.status(500).send("Internal Server Error")
}
     
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
