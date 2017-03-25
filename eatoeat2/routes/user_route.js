var express = require('express');

var router = express.Router();
var mongojs = require('mongojs');
var bcrypt = require('bcrypt-nodejs');
var db = mongojs('mongodb://admin:root@ds127399.mlab.com:27399/eatoeat');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var fs = require('fs');
var dns = require('dns');
var os = require('os');
var _ = require('underscore');
const NodeCache = require("node-cache");
const myCache = new NodeCache();
var where = require("lodash.where");
const moment = require('moment');
const moment_range = require('moment-range');
const moment_r = moment_range.extendMoment(moment);
var randomstring = require("randomstring");
// var util=require('util');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ankuridigitie@gmail.com',
        pass: 'idigitieankur'
    }
});

// setup email data with unicode symbols

router

    .post('/add-user-info', function(req, res, next) {

        // res.send('Task API');
        // res.writeHead(302, {'Location': 'http://192.168.1.101:3000/#/user_login'});
        // res.end();

        db.user_infos.find({
            email: req.body.user_email
        }, function(err, user_details) {

            if (user_details != "") {

                res.status(409);
                console.log('email already registered');
                res.json({
                    'error': 'Email Already Registered'
                });

            } else if (user_details == "") {

                db.user_infos.save({
                    username: req.body.user_name,
                    email: req.body.user_email,
                    phone: req.body.user_contact_no,
                    password: bcrypt.hashSync(req.body.user_password, bcrypt.genSaltSync(10)),
                    joined_on:moment(new Date()).format("DD/MM/YYYY"),
                    isVerified: "false",
                    status: "active",


                }, function(err, user) {

                    if (err) throw err;

                    var mailOptions = {
                        from: '"EatoEato 👻" <ankuridigitie@gmail.com>', // sender address
                        to: req.body.user_email, // list of receivers
                        subject: 'Welcome To EatoEato ', // Subject line
                        text: 'Please Activate Your EatoEato Account', // plain text body
                        html: '<b>Your Account Has Been Created by, Please Click on Below Link to Verify your Account</b> <br> <a href="http://192.168.1.157:3000/#/verify-user-params/' + user._id + '">' +randomstring.generate({length: 100,charset: 'alphabetic'}) + '</a>' // html body
                    };

                    transporter.sendMail(mailOptions, function(error, info) {
                        if (error) {
                            console.log(error);
                            res.json({
                                yo: 'error'
                            });
                        } else {
                            console.log('Message sent: ' + info.response);

                        };
                    });

                    res.send(user);
                    console.log(user._id);

                })


            }
        });



    });

router

    .get('/user-verify/:user_id', function(req, res, next) {
        // console.log(req.params['user_id']);
        // res.send('Task API');
        // res.writeHead(302, {'Location': 'http://192.168.1.101:3000/#/user_login'});
        // res.end();
        db.user_infos.findAndModify({
            query: {
                _id: mongojs.ObjectId(req.params['user_id'])
            },
            update: {
                $set: {
                    isVerified: "true"

                }
            },
            new: true
        }, function(err, user, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send(err);
                throw err;
                console.log(err);

            }

            res.status(200);
            res.send(user);
            console.log('user Verified');
        });
    });


router

    .post('/user-login', function(req, res, next) {

        // res.send('Task API');
        //  console.log(req.body);
        db.user_infos.find({

            email: req.body.email,
            isVerified: "true"
        }, function(err, user) {


            if (err || user == "") {
                res.status(404);
                res.send('Either Bad Credential Or Not Activated Yet');
            } else {

                if (bcrypt.compareSync(req.body.password, user[0].password)) {

                    if (user[0].status == "inactive") {
                        res.status(200).send('account disabled');
                        console.log('user is inactive');
                    } else {
                        console.log(user);
                        res.status(200).send(user);

                    }

                } else {
                    res.status(400).json('unauthorized');
                    
                }

            }
        });


    });


router

    .post('/user-pass-update', function(req, res, next) {


        console.log(req.body);
        var flag = false;
        db.user_infos.find({
            _id: mongojs.ObjectId(req.body.user_id)
        }, function(err, user) {

            if (err || user == "") {

                console.log(err);
                res.status(404);
                res.send('user not find');
            } else {

                if (bcrypt.compareSync(req.body.old_pass, user[0].password))

                {

                    db.user_infos.findAndModify({
                        query: {
                            _id: mongojs.ObjectId(req.body.user_id)
                        },
                        update: {
                            $set: {

                                password: bcrypt.hashSync(req.body.new_pass, bcrypt.genSaltSync(10))
                            }
                        },
                        new: true
                    }, function(err, data, lastErrorObject) {
                        if (err) {

                            flag = false;

                        }
                        res.status(200);
                        res.send(data);
                        flag = true;
                        console.log('User password UPDATED');
                    })


                } else {
                    if (flag) {
                        console.log('pass updated');
                    } else if (!flag) {
                        res.status(400).send('err');
            
                    }
                    // res.status(200).send('fine');


                }


            }
        });

    });

router

    .post('/user-profile-update', function(req, res, next) {

        if (req.body.user_profile_image == '') {

            db.user_infos.findAndModify({
                query: {
                    _id: mongojs.ObjectId(req.body.user_id)
                },
                update: {
                    $set: {
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        dob: req.body.dob,
                        gender: req.body.gender

                    }
                },
                new: true
            }, function(err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }
                console.log(data);
                res.status(200);
                res.send(data);
            });

        } else {
            dns.lookup(os.hostname(), function(err, add, fam) {
                var date = new Date();
                var food_img = add + ':3000/uploads/user_uploads/' + date.getTime() + '.jpg';

                fs.writeFile("client/uploads/user_uploads/" + date.getTime() + ".jpg", new Buffer(req.body.user_profile_image, "base64"), function(err) {

                    if (err) {

                        throw err;
                        console.log(err);
                        res.send(err)
                    } else {
                        console.log('User image uploaded');
                        // res.send("success");
                        // console.log("success!");
                    }

                });

                db.user_infos.findAndModify({
                    query: {
                        _id: mongojs.ObjectId(req.body.user_id)
                    },
                    update: {
                        $set: {
                            firstname: req.body.firstname,
                            lastname: req.body.lastname,
                            dob: req.body.dob,
                            gender: req.body.gender,
                            user_profile_image: food_img
                        }
                    },
                    new: true
                }, function(err, data, lastErrorObject) {
                    if (err) {
                        res.status(400);
                        res.send('error');
                        throw err;

                    }
                    console.log(data);
                    res.status(200);
                    res.send(data);
                });

            });


        }


    });




router

    .post('/user-address-add', function(req, res, next) {

        var date = new Date();
        var timestamp_var = date.getTime();

        if (req.body.hasOwnProperty('address_default')) {

            db.user_infos.findAndModify(

                {
                    query: {
                        _id: mongojs.ObjectId(req.body.user_id),
                        'address.address_default': "true"
                    },
                    update: {
                        $set: {
                            'address.$.address_default': 'false'
                        }

                    },
                    new: true
                },
                function(err, data, lastErrorObject) {
                    if (err) {
                        res.status(400);
                        res.send('error');
                        throw err;

                    } else {

                        db.user_infos.findAndModify(

                            {
                                query: {
                                    _id: mongojs.ObjectId(req.body.user_id)
                                },
                                update: {
                                    $push: {
                                        'address': {
                                            'address_id': timestamp_var,
                                            'address_name': req.body.address_name,
                                            'address_details': req.body.address_details,
                                            'address_locality': req.body.address_locality_landmark,
                                            'address_pincode': req.body.address_pincode,
                                            'address_state': req.body.address_state,
                                            'address_city': req.body.address_city,
                                            'address_contact': req.body.address_contact_no,
                                            'address_type': req.body.address_type,
                                            'address_default': 'true'
                                        }
                                    }

                                },
                                new: true
                            },
                            function(err, data, lastErrorObject) {
                                if (err) {
                                    res.status(400);
                                    res.send('error');
                                    throw err;

                                }
                                res.status(200);
                                res.send(data);

                            });



                    }


                });


        } else {


            db.user_infos.findAndModify(

                {
                    query: {
                        _id: mongojs.ObjectId(req.body.user_id)
                    },
                    update: {
                        $push: {
                            'address': {
                                'address_id': timestamp_var,
                                'address_name': req.body.address_name,
                                'address_details': req.body.address_details,
                                'address_locality': req.body.address_locality_landmark,
                                'address_pincode': req.body.address_pincode,
                                'address_state': req.body.address_state,
                                'address_city': req.body.address_city,
                                'address_contact': req.body.address_contact_no,
                                'address_type': req.body.address_type,
                                'address_default': 'false'
                            }
                        }

                    },
                    new: true
                },
                function(err, data, lastErrorObject) {
                    if (err) {
                        res.status(400);
                        res.send('error');
                        throw err;

                    }
                    res.status(200);
                    res.send(data);


                });


        }

    });


router

    .post('/get-user-address', function(req, res, next) {

        console.log(req.body);

        db.user_infos.find({

            _id: mongojs.ObjectId(req.body.user_id)

        }, function(err, user) {


            if (err || user == "") {
                res.status(404);
                res.send('user not find');
            } else {

                res.status(200).json(user);

                console.log(user);
            }
        });
    });


router

    .post('/user-account-update', function(req, res, next) {

        console.log(req.body);
        db.user_infos.findAndModify({
            query: {
                _id: mongojs.ObjectId(req.body.user_id)
            },
            update: {
                $set: {
                    email: req.body.user_email,
                    phone: req.body.user_mobile,
                }
            },
            new: true
        }, function(err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }
            res.status(200);
            res.send(data);
            console.log('user PROFILE UPDATED');
        })
    });




router
    .post('/user-account-deactivate', function(req, res, next) {

        console.log(req.body);


        db.user_infos.find({

            _id: mongojs.ObjectId(req.body.user_id),
            email: req.body.deactivate_user_email,
            phone: req.body.user_mobile
        }, function(err, user) {


            if (err || user == "") {
                res.status(404);
                res.status(404).send('details are incorrect');
            } else {


                if (bcrypt.compareSync(req.body.deactivate_user_password, user[0].password)) {
                    db.user_infos.findAndModify({
                        query: {
                            _id: mongojs.ObjectId(req.body.user_id),


                        },
                        update: {
                            $set: {

                                status: "inactive"
                            }
                        },
                        new: true
                    }, function(err, data, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send('error');

                            throw err;

                        }

                        res.status(200).send('acount deactivated');

                    });

                } else {

                    res.status(404).send('password not match');

                }
            }

        });


    });


router
    .post('/user-profile-image-upload', function(req, res, next) {



        // dns.lookup(os.hostname(), function (err, add, fam) {
        //   console.log('addr: '+add);
        // })

        var date = new Date();
        var current_hour = date.getTime();

        var user_id = req.body.user_id;

        var image_name = '192.168.1.157:3000' + '/uploads/' + current_hour + '.jpg';

        fs.writeFile("client/uploads/" + current_hour + ".jpg", new Buffer(req.body.files, "base64"), function(err) {

            if (err) {

                throw err;
            } else {

                db.user_infos.findAndModify({
                    query: {
                        _id: mongojs.ObjectId(req.body.user_id)
                    },
                    update: {
                        $set: {
                            user_profile_image: image_name

                        }
                    },
                    new: true
                }, function(err, data, lastErrorObject) {
                    if (err) {
                        res.status(400);
                        res.send('error');
                        throw err;

                    }
                    res.status(200);
                    res.send('User PROFILE IMAGE UPDATED');
                    console.log('User PROFILE IMAGE UPDATED');
                })
                // res.send("success");
                // console.log("success!");
            }

        });

    });

//Getting Details for Logged in users

router
    .post('/get-user-details', function(req, res, next) {

        db.user_infos.find({
            _id: mongojs.ObjectId(req.body.user_id),
        }, function(err, user) {

            if (err || user == "") {
                res.status(404);
                res.send('No user Found');
            } else {

                console.log(user);
                res.status(200).send(user[0]);

            }
        });

    });


router
    .post('/forget-user-password', function(req, res, next) {

        console.log(req.body);
        db.user_infos.find({
            email: req.body.user_email,
        }, function(err, user) {

            if (err || user == "") {
                res.status(404);
                res.send('Email Not Found');
            } else {

                var mailOptions = {
                    from: '"EatoEato 👻" <ankuridigitie@gmail.com>', // sender address
                    to: req.body.user_email, // list of receivers
                    subject: 'EatoEato Password Reset', // Subject line
                    text: 'Resetting your EatoEato Password', // plain text body
                    html: '<b> Please Click on Below Link to Reset your Account Password</b> <br><br><br> <a href="http://192.168.1.156:3000/#/user_login' + user._id + '">' + randomValueHex(100) + '</a>' // html body
                };

                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        console.log(error);
                        res.json({
                            yo: 'error'
                        });
                    } else {
                        console.log('Message sent: ' + info.response);
                        res.json({
                            'status': 'Email Correct',
                            'info': 'Email Sent'
                        });

                    };
                });



            }
        });

    });

router
    .post('/delete-user-address', function(req, res, next) {

        console.log(req.body);

        db.user_infos.findAndModify({
            query: {
                _id: mongojs.ObjectId(req.body.user_id)
            },
            update: {
                $pull: {
                    'address': {
                        'address_id': req.body.address_id
                    }
                }

            },
            new: true

        }, function(err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }
            res.status(200).send(data);

        });
    });


router
    .get('/get-listing-foods', function(req, res, next) {

        console.log('this is for Listing');
        var listing = [];
        var count = 0;
        var filter_cuisine = [];
        var filter_cuisine_obj = [];

        var filter_occ = [];
        var filter_occ_obj = [];

        var total_cuisine = 0;
        var total_occ = 0;

        var veg_type = [];

        var price_list = [];
        var price_data = {};

        var time_list=[];
        var time_data={};
        
        var filter = {};

        db.cook_infos.find({}, {
            'food_details': 1,
            _id: 0
        }, function(err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                console.log(err);

                throw err;

            }

            //  console.log(data);

            for (var i = 0; i < data.length; i++) {

                for (var j = 0; j < data[i].food_details.length; j++) {



                    listing[count] = data[i].food_details[j];


                    count++;

                }


                // filter.listing=listing;
                //   console.log(listing);
            }
            var c = 0;
            for (var i = 0; i < listing.length; i++) {

                for (j = 0; j < listing[i].cuisine_list.length; j++) {

                    if (listing[i].cuisine_list[j].status == 'true' && filter_cuisine.indexOf(listing[i].cuisine_list[j].category_name) < 0) {

                        filter_cuisine.push(listing[i].cuisine_list[j].category_name);
                        filter_cuisine_obj[c] = listing[i].cuisine_list[j];
                        c++;
                        // filter.filter_cuisine=filter_cuisine;
                        //    total_cuisine++;
                        // filter.total_cuisine=total_cuisine;



                    }

                }
            }

            var o = 0;
            for (var i = 0; i < listing.length; i++) {

                for (j = 0; j < listing[i].occassion_list.length; j++) {

                    if (listing[i].occassion_list[j].status == 'true' && filter_occ.indexOf(listing[i].occassion_list[j].group_attr) < 0) {

                        filter_occ.push(listing[i].occassion_list[j].group_attr);
                        filter_occ_obj[o] = listing[i].occassion_list[j];
                        o++;
                        // filter.filter_cuisine=filter_cuisine;
                        //    total_cuisine++;
                        // filter.total_cuisine=total_cuisine;



                    }

                }
            }
            var i, j;
            for (i = 0; i < listing.length; i++) {

                if (veg_type.length < 1) {

                    veg_type.push({
                        'veg_type': listing[i].food_type
                    });

                } else {



                    for (j = 0; j < veg_type.length; j++) {

                        if (veg_type[j].veg_type == listing[i].food_type) {
                            break;
                        } else {
                            veg_type.push({
                                'veg_type': listing[i].food_type
                            });
                        }

                    }
                }

            }

            for (i = 0; i < listing.length; i++) {


                price_list.push(parseInt(listing[i].food_price_per_plate));
            }
           
            var min = Math.min.apply(null, price_list);
            var max = Math.max.apply(null, price_list);

            price_data.min_price = min;
            price_data.max_price = max;


//For Getting min hours and max hours

      

             for (i = 0; i < listing.length; i++) {


                    if(listing[i].available_hours.hasOwnProperty('sun_from') &&  listing[i].available_hours.sun_from!=""){

                        
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                        time_list.push(parseInt(listing[i].available_hours.sun_from.slice(0,2)));
                    }
                    if(listing[i].available_hours.hasOwnProperty('mon_from') &&  listing[i].available_hours.mon_from!=""){

                        
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                        time_list.push(parseInt(listing[i].available_hours.mon_from.slice(0,2)));
                    }
                    if(listing[i].available_hours.hasOwnProperty('tue_from') &&  listing[i].available_hours.tue_from!=""){

                        
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                        time_list.push(parseInt(listing[i].available_hours.tue_from.slice(0,2)));
                    }
                    if(listing[i].available_hours.hasOwnProperty('wed_from') &&  listing[i].available_hours.wed_from!=""){

                        
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                        time_list.push(parseInt(listing[i].available_hours.wed_from.slice(0,2)));
                    }
                    if(listing[i].available_hours.hasOwnProperty('thu_from') &&  listing[i].available_hours.thu_from!=""){

                        
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                        time_list.push(parseInt(listing[i].available_hours.thu_from.slice(0,2)));
                    }
                    if(listing[i].available_hours.hasOwnProperty('fri_from') &&  listing[i].available_hours.fri_from!=""){

                        
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                        time_list.push(parseInt(listing[i].available_hours.fri_from.slice(0,2)));
                    }
                    if(listing[i].available_hours.hasOwnProperty('sat_from') &&  listing[i].available_hours.sat_from!=""){

                        
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                        time_list.push(parseInt(listing[i].available_hours.sat_from.slice(0,2)));
                    }

                    if(listing[i].available_hours.hasOwnProperty('sun_to') &&  listing[i].available_hours.sun_to!=""){

                        
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                        time_list.push(parseInt(listing[i].available_hours.sun_to.slice(0,2)));
                    }
                    if(listing[i].available_hours.hasOwnProperty('mon_to') &&  listing[i].available_hours.mon_to!=""){

                        
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                        time_list.push(parseInt(listing[i].available_hours.mon_to.slice(0,2)));
                    }
                    if(listing[i].available_hours.hasOwnProperty('tue_to') &&  listing[i].available_hours.tue_to!=""){

                        
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                        time_list.push(parseInt(listing[i].available_hours.tue_to.slice(0,2)));
                    }
                    if(listing[i].available_hours.hasOwnProperty('wed_to') &&  listing[i].available_hours.wed_to!=""){

                        
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                        time_list.push(parseInt(listing[i].available_hours.wed_to.slice(0,2)));
                    }
                    if(listing[i].available_hours.hasOwnProperty('thu_to') &&  listing[i].available_hours.thu_to!=""){

                        
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                        time_list.push(parseInt(listing[i].available_hours.thu_to.slice(0,2)));
                    }
                    if(listing[i].available_hours.hasOwnProperty('fri_to') &&  listing[i].available_hours.fri_to!=""){

                        
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                        time_list.push(parseInt(listing[i].available_hours.fri_to.slice(0,2)));
                    }
                    if(listing[i].available_hours.hasOwnProperty('sat_to') &&  listing[i].available_hours.sat_to!=""){

                        
                    //    console.log(listing[i].available_hours.sun_from.slice(0,2));
                        time_list.push(parseInt(listing[i].available_hours.sat_to.slice(0,2)));
                    }
                
            }
           
            var min = Math.min.apply(null, time_list);
            var max =  Math.max.apply(null, time_list);
        
            console.log(time_list);
            time_data.min_time = min;
            time_data.max_time = max;
          

            filter.listing = listing;
            filter.cuisine_list = filter_cuisine_obj;
            filter.occasion_list = filter_occ_obj;
            filter.veg_type = veg_type;
            filter.price_data = price_data;
            filter.time_data = time_data;
            filter.food_count=listing.length;
            
            myCache.set("myKey", listing, 0, function(err, success) {
                if (!err && success) {
                   
                    // true
                    // ... do something ...
                }
            });
          

            res.status(200).send(filter);

        });
    });


router
    .post('/filter-cook-listing', function(req, res, next) {
        var filtered_data = [];
        var dates = [];


        console.log(req.body);
        // res.send({'val':'asfd'});
        myCache.get("myKey", function(err, value) {
            if (!err) {
                if (value == undefined) {
                    console.log('key not found');
                } else {

                    var len = req.body.length;
                    console.log(len);

                    for (var i = 0; i < len; i++) {

                        if (req.body[i].category_name) {

                            var tt = _.filter(value, function(data) {

                                return _.some(data.cuisine_list, {
                                    category_name: req.body[i].category_name,
                                    'status': 'true'
                                });


                            });


                            for (j = 0; j < tt.length; j++) {
                                var count = 0;

                                if (filtered_data.length < 1) {
                                    filtered_data.push(tt[j]);
                                } else {

                                    for (k = 0; k < filtered_data.length; k++) {

                                        if (filtered_data[k]._id == tt[j]._id) {
                                            count = 1;
                                            break;

                                        }

                                    }
                                    if (count != 1) {
                                        filtered_data.push(tt[j]);

                                    }
                                    count = 0;
                                }

                            }

                        }
                        if (req.body[i].group_attr) {

                            console.log('THIS IS FILTERED ONE');

                            if (filtered_data != "") {

                                var tt = _.filter(filtered_data, function(data) {


                                    return _.some(data.occassion_list, {
                                        group_attr: req.body[i].group_attr,
                                        'status': 'true'
                                    });


                                });
                                filtered_data = [];
                                for (j = 0; j < tt.length; j++) {

                                    filtered_data.push(tt[j]);


                                }

                            } else {
                                var tt = _.filter(value, function(data) {

                                    return _.some(data.occassion_list, {
                                        group_attr: req.body[i].group_attr,
                                        'status': 'true'
                                    });


                                });
                                //        console.log(tt);
                                for (j = 0; j < tt.length; j++) {
                                    var count = 0;

                                    if (filtered_data.length < 1) {
                                        filtered_data.push(tt[j]);
                                    } else {

                                        for (k = 0; k < filtered_data.length; k++) {

                                            if (filtered_data[k]._id == tt[j]._id) {
                                                count = 1;
                                                break;

                                            }

                                        }
                                        if (count != 1) {
                                            filtered_data.push(tt[j]);

                                        }
                                        count = 0;
                                    }

                                }
                            }
                            // console.log('this is group attr');


                        }

                        if (req.body[i].veg_type) {

                            //  console.log(filtered_data);
                            console.log(req.body[i].veg_type);
                            if (filtered_data != "") {


                                var tt = _.filter(filtered_data, {
                                    'food_type': req.body[i].veg_type
                                });


                                filtered_data = [];

                                for (j = 0; j < tt.length; j++) {

                                    filtered_data.push(tt[j]);


                                }

                            } else {
                                var tt = _.filter(value, {
                                    'food_type': req.body[i].veg_type
                                });
                                //        console.log(tt);
                                for (j = 0; j < tt.length; j++) {
                                    var count = 0;

                                    if (filtered_data.length < 1) {
                                        filtered_data.push(tt[j]);
                                    } else {

                                        for (k = 0; k < filtered_data.length; k++) {

                                            if (filtered_data[k]._id == tt[j]._id) {
                                                count = 1;
                                                break;

                                            }

                                        }
                                        if (count != 1) {
                                            filtered_data.push(tt[j]);

                                        }
                                        count = 0;
                                    }

                                }
                            }


                        }

                        if (req.body[i].date) {

                            if (filtered_data != "") {

                                dates = [];
                                var incoming_date = new Date(req.body[i].date);


                                for (var j = 0; j < value.length; j++) {

                                    dates.push(new Date(value[j].selected_date_from));
                                    dates.push(new Date(value[j].selected_date_to));
                                }

                                var maxDate = new Date(Math.max.apply(null, dates));
                                var minDate = new Date(Math.min.apply(null, dates));

                                const range = moment_r.range(minDate, maxDate);
                                var v = range.contains(incoming_date);


                                if (v == true) {



                                } else if (v == false) {
                                    filtered_data = [];

                                }


                            } else {
                                filtered_data = value;
                            }


                        } //main if ends

                        if (req.body[i].min_price) {



                            if (filtered_data != "") {
                                var arr = [];
                                for (k = 0; k < filtered_data.length; k++) {

                                    // console.log(parseInt(filtered_data[k].food_price_per_plate));      
                                    if (parseInt(filtered_data[k].food_price_per_plate) >= req.body[i].min_price && parseInt(filtered_data[k].food_price_per_plate) <= req.body[i].max_price) {


                                        arr.push(filtered_data[k]);

                                        console.log('FOOD FOUND');
                                    } else {

                                    }
                                }

                                filtered_data = arr;

                            } else {
                                var arr = [];
                                for (k = 0; k < value.length; k++) {

                                    // console.log(parseInt(filtered_data[k].food_price_per_plate));      
                                    if (parseInt(value[k].food_price_per_plate) >= req.body[i].min_price && parseInt(value[k].food_price_per_plate) <= req.body[i].max_price) {


                                        arr.push(value[k]);

                                        console.log('FOOD FOUND');
                                    } else {

                                    }
                                }

                                filtered_data = arr;
                            }


                        }

                        if (req.body[i].min_time || req.body[i].max_time) {

                            if (filtered_data != "") {
                                

                            var arr = [];
                            var dt = moment(new Date(), "YYYY-MM-DD HH:mm:ss"); //IT SHOULD BE CURRENT DATE AND CHANGABLE ACC TO USER
                            var day=dt.format('dddd').slice(0, 3).toLowerCase().concat('_from');

                            for (var m = 0; m < filtered_data.length; m++) {

                                      if(filtered_data[m].available_hours.hasOwnProperty(day)){

                                           
                                             if(day=="sun_from"){
                                                
                                                var tmp=parseInt(filtered_data[m].available_hours.sun_from);
                                                console.log(tmp);
                                                
                                                if(tmp> parseInt(req.body[i].min_time) && tmp< parseInt(req.body[i].max_time)){

                                                   arr.push(filtered_data[m]);
                                                   
                                               
                                                  
                                                }
                                                else{
                                                    console.log('NOT LIES');
                                                }
                                            }
                                              else if(day=="mon_from"){
                                                
                                                   var tmp=parseInt(filtered_data[m].available_hours.mon_from);
                                             
                                                
                                                if(tmp> parseInt(req.body[i].min_time) && tmp< parseInt(req.body[i].max_time)){

                                                   arr.push(filtered_data[m]);

                                                }
                                                else{
                                                    console.log('NOT LIES');
                                                }
                                            }
                                             else if(day=="tue_from"){
                                                
                                                    var tmp=parseInt(filtered_data[m].available_hours.tue_from);
                                               
                                                
                                                if(tmp> parseInt(req.body[i].min_time) && tmp< parseInt(req.body[i].max_time)){

                                                   arr.push(filtered_data[m]);

                                                }
                                                else{
                                                    console.log('NOT LIES');
                                                }
                                            }
                                             else if(day=="wed_from"){
                                                
                                                    var tmp=parseInt(filtered_data[m].available_hours.wed_from);
                                               
                                                
                                                if(tmp> parseInt(req.body[i].min_time) && tmp< parseInt(req.body[i].max_time)){

                                                   arr.push(filtered_data[m]);

                                                }
                                                else{
                                                    console.log('NOT LIES');
                                                }
                                            }
                                             else if(day=="thu_from"){
                                                
                                                    var tmp=parseInt(filtered_data[m].available_hours.thu_from);
                                             
                                                if(tmp> parseInt(req.body[i].min_time) && tmp< parseInt(req.body[i].max_time)){

                                                   arr.push(filtered_data[m]);

                                                }
                                                else{
                                                    console.log('NOT LIES');
                                                }
                                            }
                                             else if(day=="fri_from"){
                                                
                                                    var tmp=parseInt(filtered_data[m].available_hours.fri_from);
                                             
                                                
                                                if(tmp> parseInt(req.body[i].min_time) && tmp< parseInt(req.body[i].max_time)){

                                                   arr.push(filtered_data[m]);

                                                }
                                                else{
                                                    console.log('NOT LIES');
                                                }
                                            }
                                             else if(day=="sat_from"){
                                                 
                                                    var tmp=parseInt(filtered_data[m].available_hours.sat_from);
                                               
                                                
                                                if(tmp> parseInt(req.body[i].min_time) && tmp< parseInt(req.body[i].max_time)){

                                                   arr.push(filtered_data[m]);

                                                }
                                                else{
                                                    console.log('NOT LIES');
                                                }
                                                
                                            }



                                      }

                                      else{
                                          console.log('not found');
                                      }
        //                          

                            }
                            // console.log(req.body);
                               filtered_data = arr;

                            }
                    else
                            {


                            var arr = [];
                            var dt = moment(new Date(), "YYYY-MM-DD HH:mm:ss"); //IT SHOULD BE CURRENT DATE AND CHANGABLE ACC TO USER
                            var day=dt.format('dddd').slice(0, 3).toLowerCase().concat('_from');
                            var dte;
                            for (var i = 0; i < value.length; i++) {

                                // for (var j = 0; j <Object.keys(value[i].available_hours).length; j++) {
                                    //console.log(typeof(day));
                                    if(value[i].available_hours.hasOwnProperty(day)){


        //  
                                            if(day=="sun_from"){
                                                
                                                var tmp=parseInt(value[i].available_hours.sun_from);
                                                console.log(tmp);
                                                
                                                if(tmp> parseInt(req.body[i].min_time) && tmp< parseInt(req.body[i].max_time)){

                                                   arr.push(value[i]);

                                                }
                                                else{
                                                    console.log('NOT LIES');
                                                }
                                            }
                                            else if(day=="mon_from"){
                                                
                                                   var tmp=parseInt(value[i].available_hours.mon_from);
                                                console.log(tmp);
                                                
                                                if(tmp> parseInt(req.body[i].min_time) && tmp< parseInt(req.body[i].max_time)){

                                                   arr.push(value[i]);

                                                }
                                                else{
                                                    console.log('NOT LIES');
                                                }
                                            }
                                             else if(day=="tue_from"){
                                                
                                                    var tmp=parseInt(value[i].available_hours.tue_from);
                                                console.log(tmp);
                                                
                                                if(tmp> parseInt(req.body[i].min_time) && tmp< parseInt(req.body[i].max_time)){

                                                   arr.push(value[i]);

                                                }
                                                else{
                                                    console.log('NOT LIES');
                                                }
                                            }
                                             else if(day=="wed_from"){
                                                
                                                    var tmp=parseInt(value[i].available_hours.wed_from);
                                                console.log(tmp);
                                                
                                                if(tmp> parseInt(req.body[i].min_time) && tmp< parseInt(req.body[i].max_time)){

                                                   arr.push(value[i]);

                                                }
                                                else{
                                                    console.log('NOT LIES');
                                                }
                                            }
                                             else if(day=="thu_from"){
                                                
                                                    var tmp=parseInt(value[i].available_hours.thu_from);
                                                console.log(tmp);
                                                
                                                if(tmp> parseInt(req.body[i].min_time) && tmp< parseInt(req.body[i].max_time)){

                                                   arr.push(value[i]);

                                                }
                                                else{
                                                    console.log('NOT LIES');
                                                }
                                            }
                                             else if(day=="fri_from"){
                                                
                                                    var tmp=parseInt(value[i].available_hours.fri_from);
                                                console.log(tmp);
                                                
                                                if(tmp> parseInt(req.body[i].min_time) && tmp< parseInt(req.body[i].max_time)){

                                                   arr.push(value[i]);

                                                }
                                                else{
                                                    console.log('NOT LIES');
                                                }
                                            }
                                             else if(day=="sat_from"){
                                                 
                                                    var tmp=parseInt(value[i].available_hours.sat_from);
                                                console.log(tmp);
                                                
                                                if(tmp> parseInt(req.body[i].min_time) && tmp< parseInt(req.body[i].max_time)){

                                                   arr.push(value[i]);

                                                }
                                                else{
                                                    console.log('NOT LIES');
                                                }
                                                
                                            }
                                            //console.log(value[i].available_hours.day);

        //  console.log(dt.format('dddd').slice(0, 3).toLowerCase().concat('_from'));
                                        //  arr.push(value[i]);
                                        //  console.log( value[i].available_hours);
                                         
                                        break;
                                       
                                    }

                              //  }

                            }
                            // console.log(req.body);
                               filtered_data = arr;
                            }

                        }

                    }


                    console.log(filtered_data.length);
                    res.send(filtered_data);
                    // var filtered = _.filter(value, {"food_name": "Palak Paneer"});
                    // console.log(value);
                    // res.send(value);
                    // var len=value.length;
                    // for(var i=0;i<len;i++){

                    //     if(value[i].food_name=="Palak Paneer"){
                    //         console.log('FOUND');
                    //     }

                    // }


                    //{ my: "Special", variable: 42 }
                    // ... do something ...
                }
            }
        });




        //                 db.cook_infos.find({    'food_details.cuisine_list':{"$elemMatch" :{'category_name':'Italian'
        //                 ,'status':'false'}}

        //                                         }, function (err, data, lastErrorObject) {


        //                                             if(err){
        //                                                     res.status(400);
        //                                                     res.send('error');
        //                                                      throw err;

        //                                                     }    
        //                                                     res.status(200).send(data);
        //                                                     console.log(data);
        //                                         });

    });

module.exports = router;