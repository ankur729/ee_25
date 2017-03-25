var mongojs=require('mongojs');

var db=mongojs('mongodb://admin:root@ds127399.mlab.com:27399/eatoeat');

var bcrypt=require('bcrypt-nodejs');
var fs=require('fs');
var dns=require('dns');
var os=require('os');
var randomstring = require("randomstring");
// var jwt=require('jsonwebtoken');

module.exports.add_cook_info=function(req,res,next){

// res.send('Task API');

    db.cook_infos.find({cook_email : req.body.cook_email}, function (err,cook_details) {
        console.log(cook_details);
        if (cook_details !=""){
            

            res.status(404);
             res.send(cook_details);

        }else  if (cook_details ==""){
          
            db.cook_infos.save(
                { 
                    cook_name:req.body.cook_name,
                    cook_email:req.body.cook_email,
                    cook_contact:req.body.cook_contact_no,
                    cook_password:bcrypt.hashSync(req.body.cook_password,bcrypt.genSaltSync(10)),
                    status:"active",
                    isApproved:"new"
                  
                }
                ,function(err,cook_details){

            if(err) throw err;


             res.send(cook_details);
            console.log('COOK DETAILS saved');

            });
            
           
        }
    });
};

module.exports.cook_login_check=function(req,res,next){

// res.send('Task API');
//   console.log(req.body);
db.cook_infos.find(
                { 
                    cook_email:req.body.email,
                  
                }
                ,function(err,cook){

                            if(err || cook=="")
                            {  

                                console.log(err);
                                res.status(404);
                                res.send('cook not find');
                            }else {
                                
                            if(bcrypt.compareSync(req.body.password,cook[0].cook_password))
                            {

                                    if(cook[0].status=="inactive"){
                                            res.status(400).send('account disabled');
                                            console.log('cook is inactive');
                                    }
                                    else{
                                        console.log(cook);
                                        res.status(200).json(cook);
                        
                                    }

                     
                 }
                 else
                 {
                     res.status(401).json('unauthorized');
                    
                 }
                }
        });
};

module.exports.cook_pass_update=function(req,res,next){

//console.log('cook pass update');
  console.log(req.body);
    var flag=false;
    db.cook_infos.find(
                    { 
                        _id: mongojs.ObjectId(req.body.cook_id)
                    
                    }
                    ,function(err,cook){

                    if(err || cook=="")
                    {  

                        console.log(err);
                        res.status(404);
                        res.send('cook not find');
                    }else {

                         if(bcrypt.compareSync(req.body.old_pass,cook[0].cook_password))
                                 
                                    {
                                    //     console.log(cook);
                                    // res.status(200).json(cook);
                                        db.cook_infos.findAndModify({
                                                    query: { _id: mongojs.ObjectId(req.body.cook_id) },
                                                    update: { $set: { 
                                                    
                                                                    cook_password:bcrypt.hashSync(req.body.new_pass,bcrypt.genSaltSync(10))
                                                        } },
                                                    new: true
                                                }, function (err, data, lastErrorObject) {
                                                    if(err){
                                                           
                                                           flag=false;

                                                            }    
                                                            res.status(200);
                                                            res.send("Password Successfully Updated");
                                                            flag=true;
                                                            console.log('COOK password UPDATED');
                                                })


                                    }
                                    else
                                    {
                                        if(flag){
                                            console.log('pass updated');
                                        }
                                        else  if(!flag){
                                             res.status(400).send('err');
                                            console.log('not match');
                                        }
                                        // res.status(200).send('fine');
                                      
                                        
                                    }


                    }
            });
        
};


module.exports.cook_deactivate=function(req,res,next){


console.log(req.body);

    
 db.cook_infos.find(
                { 
              
                   _id: mongojs.ObjectId(req.body.cook_id),
                    cook_email:req.body.cook_email,
                    cook_contact:req.body.cook_contact_no      
                }
                ,function(err,cook){

                      
                 if(err || cook=="")
                 {  
                      res.status(404);
                      res.status(404).send('details are incorrect');
                 }else {    
                    
                     
                      if(bcrypt.compareSync(req.body.cook_password,cook[0].cook_password))
                     {
                                db.cook_infos.findAndModify({
                                        query: { _id: mongojs.ObjectId(req.body.cook_id),
                                                
                                                
                                                },
                                        update: { $set: { 

                                                        status:"inactive"
                                            } },
                                        new: true
                                    }, function (err, data, lastErrorObject) {
                                        if(err){
                                                res.status(400);
                                                res.send('error');
                                                console.log('err');
                                                throw err;

                                                }    
                                               
                                                res.status(200).send('acount deactivated');
                                              
                                    });
                                        
                     }
                     else{

                         res.status(404).send('password not match');
                         console.log('password not match');
                     }
            }

        });

};

module.exports.cook_profile_update=function(req,res,next){


console.log(req.body);
/**********************NOTES
 * Make a array subdocument in cook_infos which stores  available hours
 * 
 * 
 * ********** */
 db.cook_infos.findAndModify({
                                            query: { _id: mongojs.ObjectId(req.body.cook_id) ,
                                                        },
                                            update: { $unset: { 
                                                
                                                      'available_hours':null
                                                      
                                            
                                                 } },
                                            new: true
                                        }, function (err, data, lastErrorObject) {
                                            if(err){
                                                    res.status(400);
                                                    res.send('error');
                                                     throw err;

                                                    }    
                                                  
                                                    console.log('cook UPDATED');
                                        });

  db.cook_infos.findAndModify({
                query: { _id: mongojs.ObjectId(req.body.cook_id)    },
                update: { $set: { 
                    cook_name:req.body.cook_name,
                    cook_email:req.body.cook_email,
                    cook_contact:req.body.cook_contact,
                    additional_phone:req.body.additional_phone,
                    street_address:req.body.street_address,
                    gender:req.body.gender,
                    landmark:req.body.landmark,
                    city:req.body.city,
                    pincode:req.body.pincode,
                    state:req.body.user_lastname,
                    longitude:req.body.longitude,
                    latitude:req.body.latitude,
           
                  }
                
                     }
                     ,
                new: true
            }, function (err, data, lastErrorObject) {
                if(err){
                        res.status(400);
                        res.send('error');
                         throw err;

                        }    

                        else{
                           
                           if(req.body.available_hours.hasOwnProperty('mon_from'))
                           {
                              
                                   db.cook_infos.findAndModify({
                                            query: { _id: mongojs.ObjectId(req.body.cook_id) ,
                                                        },
                                            update: { $set: { 
                                                
                                                          'available_hours.mon_from':req.body.available_hours.mon_from,
                                                      'available_hours.mon_to':req.body.available_hours.mon_to,
                                            
                                                 } },
                                            new: true
                                        }, function (err, data, lastErrorObject) {
                                            if(err){
                                                    res.status(400);
                                                    res.send('error');
                                                     throw err;

                                                    }    
                                                  
                                                    console.log('cook MON UPDATED');
                                        });
                           }
                            if(req.body.available_hours.hasOwnProperty('tue_from'))
                           {
                                   db.cook_infos.findAndModify({
                                            query: { _id: mongojs.ObjectId(req.body.cook_id) ,
                                                        },
                                            update: { $set: { 
                                                
                                                      'available_hours.tue_from':req.body.available_hours.tue_from,
                                                      'available_hours.tue_to':req.body.available_hours.tue_to,
                                            
                                                 } },
                                            new: true
                                        }, function (err, data, lastErrorObject) {
                                            if(err){
                                                    res.status(400);
                                                    res.send('error');
                                                     throw err;

                                                    }    
                                                  
                                                    console.log('cook UPDATED');
                                        });
                           }

                            if(req.body.available_hours.hasOwnProperty('wed_from'))
                           {
                                   db.cook_infos.findAndModify({
                                            query: { _id: mongojs.ObjectId(req.body.cook_id) ,
                                                        },
                                            update: { $set: { 
                                                
                                                      'available_hours.wed_from':req.body.available_hours.wed_from,
                                                      'available_hours.wed_to':req.body.available_hours.wed_to,
                                            
                                                 } },
                                            new: true
                                        }, function (err, data, lastErrorObject) {
                                            if(err){
                                                    res.status(400);
                                                    res.send('error');
                                                     throw err;

                                                    }    
                                                  
                                                    console.log('cook UPDATED');
                                        });
                           }

                            if(req.body.available_hours.hasOwnProperty('thu_from'))
                           {
                                   db.cook_infos.findAndModify({
                                            query: { _id: mongojs.ObjectId(req.body.cook_id) ,
                                                        },
                                            update: { $set: { 
                                                
                                                      'available_hours.thu_from':req.body.available_hours.thu_from,
                                                      'available_hours.thu_to':req.body.available_hours.thu_to,
                                            
                                                 } },
                                            new: true
                                        }, function (err, data, lastErrorObject) {
                                            if(err){
                                                    res.status(400);
                                                    res.send('error');
                                                     throw err;

                                                    }    
                                                  
                                                    console.log('cook UPDATED');
                                        });
                           }

                            if(req.body.available_hours.hasOwnProperty('fri_from'))
                           {
                                   db.cook_infos.findAndModify({
                                            query: { _id: mongojs.ObjectId(req.body.cook_id) ,
                                                        },
                                            update: { $set: { 
                                                
                                                      'available_hours.fri_from':req.body.available_hours.fri_from,
                                                      'available_hours.fri_to':req.body.available_hours.fri_to,
                                            
                                                 } },
                                            new: true
                                        }, function (err, data, lastErrorObject) {
                                            if(err){
                                                    res.status(400);
                                                    res.send('error');
                                                     throw err;

                                                    }    
                                                  
                                                    console.log('cook UPDATED');
                                        });
                           }

                            if(req.body.available_hours.hasOwnProperty('sat_from'))
                           {
                                   db.cook_infos.findAndModify({
                                            query: { _id: mongojs.ObjectId(req.body.cook_id) ,
                                                        },
                                            update: { $set: { 
                                                
                                                      'available_hours.sat_from':req.body.available_hours.sat_from,
                                                      'available_hours.sat_to':req.body.available_hours.sat_to,
                                            
                                                 } },
                                            new: true
                                        }, function (err, data, lastErrorObject) {
                                            if(err){
                                                    res.status(400);
                                                    res.send('error');
                                                     throw err;

                                                    }    
                                                  
                                                    console.log('cook UPDATED');
                                        });
                           }

                            if(req.body.available_hours.hasOwnProperty('sun_from'))
                           {
                                   db.cook_infos.findAndModify({
                                            query: { _id: mongojs.ObjectId(req.body.cook_id) ,
                                                        },
                                            update: { $set: { 
                                                
                                                      'available_hours.sun_from':req.body.available_hours.sun_from,
                                                      'available_hours.sun_to':req.body.available_hours.sun_to,
                                            
                                                 } },
                                            new: true
                                        }, function (err, data, lastErrorObject) {
                                            if(err){
                                                    res.status(400);
                                                    res.send('error');
                                                     throw err;

                                                    }    
                                                  
                                                    console.log('cook UPDATED');
                                        });
                           }

                        
                        }

                         res.status(200).send('success');
  });

}
module.exports.get_cook_profile_data=function(req,res,next){


db.cook_infos.find(
                { 
                    _id: mongojs.ObjectId(req.body.cook_id)
                  
                }
                ,function(err,cook){

                 if(err || cook=="")
                 {  

                      console.log(err);
                      res.status(404);
                      res.send('cook not find');
                 }else {
                    
                    res.status(200).send(cook);
                     
                }
        });
    }

module.exports.cook_company_details_update=function(req,res,next){

if(req.body.cook_profile_img=="" && req.body.cook_banner_img==""){

        db.cook_infos.findAndModify({
                query: { _id: mongojs.ObjectId(req.body.cook_id) },
                update: { $set: {
                   
                    about_us:req.body.about_us,
                    first_name:req.body.first_name,
                    last_name:req.body.last_name,
                    display_email:req.body.display_email,
                    display_phone:req.body.display_phone,
                    bank_type:req.body.bank_type,
                    bank_account_no:req.body.bank_account_no,
                    bank_ifsc:req.body.bank_ifsc
                    

                  } },
                new: true
            }, function (err, data, lastErrorObject) {
                if(err){
                        res.status(400);
                        res.send('error');
                         throw err;

                        }    
                        res.status(200);
                         res.send(data);
                        console.log('cook PROFILE UPDATED');
            });
}
else if(req.body.cook_profile_img=="" && req.body.cook_banner_img!="")
{
             dns.lookup(os.hostname(), function (err, add, fam) {


var cook_bn_img=randomstring.generate(13);


var cook_banner_img=add+':3000/uploads/cook_uploads/'+cook_bn_img+'.jpg';

        

          fs.writeFile("client/uploads/cook_uploads/"+cook_bn_img+".jpg", new Buffer(req.body.cook_banner_img, "base64"), function(err) {

                                                                    if (err){

                                                                        throw err;
                                                                        console.log(err);
                                                                        res.send(err)
                                                                    }
                                                                    else{
                                                                           console.log('cook banner Img uploaded');
                                                                        // res.send("success");
                                                                        // console.log("success!");
                                                                    }

                                                                });

        db.cook_infos.findAndModify({
                query: { _id: mongojs.ObjectId(req.body.cook_id) },
                update: { $set: {
                   
                    cook_banner_img:cook_banner_img,
                    about_us:req.body.about_us,
                    first_name:req.body.first_name,
                    last_name:req.body.last_name,
                    display_email:req.body.display_email,
                    display_phone:req.body.display_phone,
                    bank_type:req.body.bank_type,
                    bank_account_no:req.body.bank_account_no,
                    bank_ifsc:req.body.bank_ifsc
                    

                  } },
                new: true
            }, function (err, data, lastErrorObject) {
                if(err){
                        res.status(400);
                        res.send('error');
                         throw err;

                        }    
                        res.status(200);
                         res.send(data);
                        console.log('cook PROFILE UPDATED');
            });

    });

}
else if(req.body.cook_profile_img!="" && req.body.cook_banner_img=="")
{
                  dns.lookup(os.hostname(), function (err, add, fam) {

var cook_pr_img=randomstring.generate(13);


 var cook_profile_img=add+':3000/uploads/cook_uploads/'+cook_pr_img+'.jpg';


           fs.writeFile("client/uploads/cook_uploads/"+cook_pr_img+".jpg", new Buffer(req.body.cook_profile_img, "base64"), function(err) {

                                                                    if (err){

                                                                        throw err;
                                                                        console.log(err);
                                                                        res.send(err)
                                                                    }
                                                                    else{
                                                                           console.log('cook profile Img uploaded');
                                                                        // res.send("success");
                                                                        // console.log("success!");
                                                                    }

                  
                                                              });


        db.cook_infos.findAndModify({
                query: { _id: mongojs.ObjectId(req.body.cook_id) },
                update: { $set: {
                    cook_profile_img:cook_profile_img,
                   
                    about_us:req.body.about_us,
                    first_name:req.body.first_name,
                    last_name:req.body.last_name,
                    display_email:req.body.display_email,
                    display_phone:req.body.display_phone,
                    bank_type:req.body.bank_type,
                    bank_account_no:req.body.bank_account_no,
                    bank_ifsc:req.body.bank_ifsc
                    

                  } },
                new: true
            }, function (err, data, lastErrorObject) {
                if(err){
                        res.status(400);
                        res.send('error');
                         throw err;

                        }    
                        res.status(200);
                         res.send(data);
                        console.log('cook PROFILE UPDATED');
            });

    });

}
else if(req.body.cook_profile_img!="" && req.body.cook_banner_img!="")
{
          dns.lookup(os.hostname(), function (err, add, fam) {

var cook_pr_img=randomstring.generate(13);
var cook_bn_img=randomstring.generate(13);

 var cook_profile_img=add+':3000/uploads/cook_uploads/'+cook_pr_img+'.jpg';
var cook_banner_img=add+':3000/uploads/cook_uploads/'+cook_bn_img+'.jpg';

           fs.writeFile("client/uploads/cook_uploads/"+cook_pr_img+".jpg", new Buffer(req.body.cook_profile_img, "base64"), function(err) {

                                                                    if (err){

                                                                        throw err;
                                                                        console.log(err);
                                                                        res.send(err)
                                                                    }
                                                                    else{
                                                                           console.log('cook profile Img uploaded');
                                                                        // res.send("success");
                                                                        // console.log("success!");
                                                                    }

                  
                                                              });

          fs.writeFile("client/uploads/cook_uploads/"+cook_bn_img+".jpg", new Buffer(req.body.cook_banner_img, "base64"), function(err) {

                                                                    if (err){

                                                                        throw err;
                                                                        console.log(err);
                                                                        res.send(err)
                                                                    }
                                                                    else{
                                                                           console.log('cook banner Img uploaded');
                                                                        // res.send("success");
                                                                        // console.log("success!");
                                                                    }

                                                                });

        db.cook_infos.findAndModify({
                query: { _id: mongojs.ObjectId(req.body.cook_id) },
                update: { $set: {
                    cook_profile_img:cook_profile_img,
                    cook_banner_img:cook_banner_img,
                    about_us:req.body.about_us,
                    first_name:req.body.first_name,
                    last_name:req.body.last_name,
                    display_email:req.body.display_email,
                    display_phone:req.body.display_phone,
                    bank_type:req.body.bank_type,
                    bank_account_no:req.body.bank_account_no,
                    bank_ifsc:req.body.bank_ifsc
                    

                  } },
                new: true
            }, function (err, data, lastErrorObject) {
                if(err){
                        res.status(400);
                        res.send('error');
                         throw err;

                        }    
                        res.status(200);
                         res.send(data);
                        console.log('cook PROFILE UPDATED');
            });

    });

}







}




module.exports.get_cusines_list=function(req,res,next){
  
db.categories_infos.find({}
                ,{
                   _id:false,
                    category_name:true,
                    status:true
                }
                ,
                function(err,category){

                 if(err || category=="")
                 {  

                      console.log(category);
                      res.status(404);
                      res.send('category not find');
                 }else {
                     
                     console.log(category);
                      res.status(200).send(category);
                  
                }
        });

}


module.exports.get_occ_veg_list=function(req,res,next){
  

  
   db.attribute_infos.find(function(err, attribute_infos) {
 
  if( err || !attribute_infos) console.log(err);
  else 
      {
            res.status(200).send(attribute_infos);
            console.log(attribute_infos);
      }     
});


}      


module.exports.add_food_details=function(req,res,next){
  
var ip_details;
dns.lookup(os.hostname(), function (err, add, fam) {

    var occ_len=req.body.food_details.occassion_list.length;
  var cuss_len=req.body.food_details.cuisine_types.length;
  var occ_data=[];
  var cuss_data=[];
  var available_hours=req.body.food_details.available_hours;
  
   for(var i=0;i<occ_len;i++)
    {
            occ_data.push(req.body.food_details.occassion_list[i]);
    }
     for(var i=0;i<cuss_len;i++)
    {
            cuss_data.push(req.body.food_details.cuisine_types[i]);
    }
    

                 var date = new Date();
                var food_img=add+':3000/uploads/cook_uploads/'+date.getTime()+'.jpg';

                  fs.writeFile("client/uploads/cook_uploads/"+date.getTime()+".jpg", new Buffer(req.body.files, "base64"), function(err) {

                                                                    if (err){

                                                                        throw err;
                                                                        console.log(err);
                                                                        res.send(err)
                                                                    }
                                                                    else{
                                                                           console.log('FOod image uploaded');
                                                                        // res.send("success");
                                                                        // console.log("success!");
                                                                    }

                                                                });

          db.cook_infos.findAndModify(
                                                
                     {query:{_id: mongojs.ObjectId(req.body.cook_id)},
                             update: {
                                          $push:{'food_details': { _id:mongojs.ObjectId(),'food_selection':req.body.food_details.food_selection,'food_name':req.body.food_details.food_name,'food_desc':req.body.food_details.food_desc,'food_price_per_plate':req.body.food_details.food_price_per_plate,              'food_total_qty':req.body.food_details.food_total_qty,'food_min_qty':req.body.food_details.food_min_qty,'occassion_list':occ_data,'cuisine_list': cuss_data,'food_type':req.body.food_details.food_type,'selected_date_from':req.body.food_details.selected_date_from,'selected_date_to':req.body.food_details.selected_date_to,'available_hours':available_hours,'food_img':food_img   },
                                            
                                        }
                                                  },
                                                new:true
                                            }   
                                            , function (err, food, lastErrorObject) {
                                            if(err){
                                                    res.status(400);
                                                    res.send('error');
                                                    throw err;

                                                    }
                                                    else{
                                                                
                                                                                                         
                                                     console.log('food adds');
                                                    res.status(200);
                                                    res.send(food);
                                                   
                                                        
                                        }    
                                                   
                                                    
                                        });

});


// // //    db.attribute_infos.find(function(err, attribute_infos) {
 
//   if( err || !attribute_infos) console.log(err);
//   else 
//       {
//             res.status(200).send(attribute_infos);
//             console.log(attribute_infos);
//       }     
// });

}  
module.exports.get_cook_details=function(req,res,next){

console.log(req.body);
  db.cook_infos.find({_id: mongojs.ObjectId(req.body.cook_id)}, function (err,cook_details) {
        
        if( err) console.log(err);

        else {
            res.status(200).send(cook_details[0].food_details)
            console.log(cook_details[0].food_details);
        }
    });

}      



module.exports.remove_food_details=function(req,res,next){

console.log(req.body);

db.cook_infos.findAndModify({
                                             query:{_id: mongojs.ObjectId(req.body.cook_id)},
                                                update: {
                                                        $pull:{'food_details': {_id:mongojs.ObjectId(req.body.food_id)}}
                                                        
                                                    }
                                            
                                        }, function (err, data, lastErrorObject) {
                                            if(err){
                                                    res.status(400);
                                                    res.send('error');
                                                     throw err;

                                                    }    
                                                    console.log('deleted');
                                                    res.status(200).send(data);
                                                   
                                        });

}  

module.exports.edit_food_details=function(req,res,next){


console.log(req.body);
  db.cook_infos.find({'food_details._id' :mongojs.ObjectId(req.body.food_id) }, function (err,cook_details) {
            
             if(err){
                              res.status(400);
                              res.send('error');
                              throw err;
                     }  

                    //   console.log(cook_details[0]);
                     var len=cook_details[0].food_details.length;
                     console.log(len);
                     for(var i=0;i<len;i++){

                         if(cook_details[0].food_details[i]._id==req.body.food_id){

                            res.status(200).send(cook_details[0].food_details[i]);
                         }
                         else{
                            
                         }
                    }
                    //  res.status(200).send(cook_details[0].food_details);

        
    });


}  


module.exports.update_food_details=function(req,res,next){

console.log(req.body.update_food_details);
dns.lookup(os.hostname(), function (err, add, fam) {
 
    if(req.body.files==""){

    
        var occ_len=req.body.update_food_details.occassion_list.length;
        var cuss_len=req.body.update_food_details.cuisine_list.length;
        var occ_data=[];
        var cuss_data=[];

        var available_hours=req.body.update_food_details.available_hours;

            console.log(available_hours);
        for(var i=0;i<occ_len;i++)
            {
                    occ_data.push(req.body.update_food_details.occassion_list[i]);
            }
            for(var i=0;i<cuss_len;i++)
            {
                    cuss_data.push(req.body.update_food_details.cuisine_list[i]);
            }
        
        
        db.cook_infos.findAndModify({
                        query: { 'food_details._id': mongojs.ObjectId(req.body.food_id)    },
                        update: { $set: { 
                        'food_details.$.food_selection':req.body.update_food_details.food_selection,'food_details.$.food_name':req.body.update_food_details.food_name,'food_details.$.food_desc':req.body.update_food_details.food_desc,'food_details.$.food_price_per_plate':req.body.update_food_details.food_price_per_plate,'food_details.$.food_total_qty':req.body.update_food_details.food_total_qty,'food_details.$.food_min_qty':req.body.update_food_details.food_min_qty,
                        'food_details.$.occassion_list':occ_data,'food_details.$.cuisine_list':cuss_data,'food_details.$.available_hours':available_hours,
                          'food_details.$.selected_date_from':req.body.update_food_details.selected_date_from, 'food_details.$.selected_date_to':req.body.update_food_details.selected_date_to,           
                        
                        }
                        
                            }
                            ,
                        new: true
                    }, function (err, data, lastErrorObject) {
                        if(err){
                                res.status(400);
                                res.send('error');
                                throw err;

                                }    

                                else{
                                    console.log(data);
                                console.log('Name UPdated');
                            
                                
                                }

                                res.status(200).send('success');
        });
}
else{

                 var date = new Date();
                var food_img=add+':3000/uploads/cook_uploads/'+date.getTime()+'.jpg';

                  fs.writeFile("client/uploads/cook_uploads/"+date.getTime()+".jpg", new Buffer(req.body.files, "base64"), function(err) {

                                                                    if (err){

                                                                        throw err;
                                                                    }
                                                                    else{
                                                                           console.log('FOod image uploaded');
                                                                        // res.send("success");
                                                                        // console.log("success!");
                                                                    }

                                                                });


        var occ_len=req.body.update_food_details.occassion_list.length;
        var cuss_len=req.body.update_food_details.cuisine_list.length;
        var occ_data=[];
        var cuss_data=[];

        var available_hours=req.body.update_food_details.available_hours;

            console.log(available_hours);

        for(var i=0;i<occ_len;i++)
            {
                    occ_data.push(req.body.update_food_details.occassion_list[i]);
            }
            for(var i=0;i<cuss_len;i++)
            {
                    cuss_data.push(req.body.update_food_details.cuisine_list[i]);
            }
        
        db.cook_infos.findAndModify({
                        query: { 'food_details._id': mongojs.ObjectId(req.body.update_food_details._id)    },
                        update: { $set: { 
                        'food_details.$.food_selection':req.body.update_food_details.food_selection,'food_details.$.food_name':req.body.update_food_details.food_name,'food_details.$.food_desc':req.body.update_food_details.food_desc,'food_details.$.food_price_per_plate':req.body.update_food_details.food_price_per_plate,'food_details.$.food_total_qty':req.body.update_food_details.food_total_qty,'food_details.$.food_min_qty':req.body.update_food_details.food_min_qty,
                        'food_details.$.occassion_list':occ_data,'food_details.$.cuisine_list':cuss_data,'food_details.$.available_hours':available_hours,'food_details.$.food_img':food_img,
                           'food_details.$.selected_date_from':req.body.update_food_details.selected_date_from, 'food_details.$.selected_date_to':req.body.update_food_details.selected_date_to,
                        
                        }
                        
                            }
                            ,
                        new: true
                    }, function (err, data, lastErrorObject) {
                        if(err){
                                res.status(400);
                                res.send('error');
                                throw err;

                                }    

                                else{
                                    console.log(data);
                                console.log('Name UPdated');
                            
                                
                                }

                                res.status(200).send('success');
        });
}


});


}  
