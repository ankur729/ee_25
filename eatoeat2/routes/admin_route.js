var express = require('express');

var router = express.Router();
var mongojs = require('mongojs');
var bcrypt = require('bcrypt-nodejs');
var db = mongojs('mongodb://admin:root@ds127399.mlab.com:27399/eatoeat');
var fs = require('fs');
const moment = require('moment');
var dns = require('dns');
var os = require('os');
var randomstring = require("randomstring");


router

    .post('/add-user-info', function(req, res, next) {

        // res.send('Task API');

        db.user_infos.save({
            username: req.body.user_name,
            email: req.body.user_email,
            phone: req.body.user_contact_no,
            password: bcrypt.hashSync(req.body.user_password, bcrypt.genSaltSync(10)),
            joined_on: moment(new Date()).format("DD/MM/YYYY"),
            isVerified: "true",
          

        }, function(err, user) {

            if (err) throw err;

            res.send(user);
            console.log('user saved');

        })

    });

router
    .post('/fetch-user-by-id', function(req, res, next) {

        db.user_infos.find({
                "_id": mongojs.ObjectId(req.body.user_id)
            }

            ,
            function(err, user) {
                if (err || !user) console.log("No  user found");
                else {
                    console.log(user);
                    res.status(200).send(user);
                }

            }

        );

    });

router
    .post('/update-user-by-id', function(req, res, next) {

        console.log(req.body);

        db.user_infos.findAndModify({
            query: {
                '_id': mongojs.ObjectId(req.body._id)
            },
            update: {
                $set: {
                    username: req.body.username,
                    email: req.body.email,
                    phone: req.body.phone,
                    eatoeat_points: req.body.eatoeat_points,
                    status: req.body.status,
                },


            },
            new: true

        }, function(err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }

            console.log(data);
            res.status(200).send(data);
        });

        //    db.user_infos.find(
        //                           {"_id": mongojs.ObjectId(req.body.user_id)}   

        //                         ,function(err, user) {
        //                         if( err || !user) console.log("No  user found");
        //                         else 
        //                                 {     
        //                                     console.log(user);
        //                                     res.status(200).send(user);
        //                                 }     

        //                                     }

        //    );

    });


router

    .post('/delete-all-user', function(req, res, next) {

        db.user_infos.remove({}, function(err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }
            console.log('deleted');
            res.status(200).send(data);

        });
    });

router

    .post('/delete-selected-user', function(req, res, next) {

        console.log(req.body);
        for (var i = 0; i < req.body.selected_user.length; i++) {

            db.user_infos.remove({
                _id: mongojs.ObjectId(req.body.selected_user[i])
            }, function(err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }
                console.log('deleted');


            });



        }
        res.status(200).send({
            'status': 'deleted'
        });
    });



router

    .post('/active-user-by-id', function(req, res, next) {

        for (var i = 0; i < req.body.length; i++) {

            db.user_infos.update({
                    "_id": mongojs.ObjectId(req.body[i])
                },

                {
                    "$set": {
                        "status": 'Active'

                    }

                }

                ,
                function(err, user) {
                    if (err || !user) console.log("No  user found");
                    else {
                        console.log(user);

                    }

                }



            );


        }
        res.status(200).send({
            'status': 'updated'
        });
    });

router

    .post('/inactive-user-by-id', function(req, res, next) {

        for (var i = 0; i < req.body.length; i++) {

            db.user_infos.update({
                    "_id": mongojs.ObjectId(req.body[i])
                },

                {
                    "$set": {
                        "status": 'Inactive'

                    }

                }

                ,
                function(err, user) {
                    if (err || !user) console.log("No  user found");
                    else {
                        console.log(user);

                    }

                }



            );


        }
        res.status(200).send({
            'status': 'updated'
        });
    });


router

    .post('/active-all-user', function(req, res, next) {

        db.user_infos.find(

            {},
            function(err, user) {
                if (err || !user) console.log("No  user found");
                else {
                    console.log(user.length);
                    //             console.log(coupon[0].coupon_infos);

                    for (var i = 0; i < user.length; i++) {



                        db.user_infos.update({},

                            {
                                "$set": {
                                    "status": 'Active'

                                }

                            }, {
                                multi: true
                            },
                            function(err, user) {
                                if (err || !user) console.log("No  user found");
                                else {
                                    console.log('activated all');

                                }

                            }

                        );

                    }

                    res.status(200).send(user);
                }

            }

        );



    });

router

    .post('/inactive-all-user', function(req, res, next) {

        db.user_infos.find(

            {},
            function(err, user) {
                if (err || !user) console.log("No  user found");
                else {
                    console.log(user.length);
                    //             console.log(coupon[0].coupon_infos);

                    for (var i = 0; i < user.length; i++) {



                        db.user_infos.update({},

                            {
                                "$set": {
                                    "status": 'Inactive'

                                }

                            }, {
                                multi: true
                            },
                            function(err, user) {
                                if (err || !user) console.log("No  user found");
                                else {
                                    console.log('Inactivated all');

                                }

                            }

                        );

                    }

                    res.status(200).send(user);
                }

            }

        );



    });


router
    .get('/get-admin-id', function(req, res, next) {



        db.admin_infos.find(
            function(err, admin) {
                if (err || !admin) console.log("No  admin found");
                else {

                    if (admin.length < 1) {


                        db.admin_infos.save({

                            _id: mongojs.ObjectId(),


                        }, function(err, data, lastErrorObject) {
                            if (err) {
                                res.status(400);
                                res.send('error');
                                throw err;

                            }
                            res.status(200);
                            res.send(data);

                        });

                    } else {
                        if (admin[0].hasOwnProperty('_id')) {

                            db.admin_infos.find({},

                                function(err, admin) {
                                    if (err || !admin) console.log(err);
                                    else {

                                        console.log(admin);
                                        res.status(200).send(admin[0]);
                                    }
                                });



                        } else {
                            console.log('IT DOES NOT HAVE ID YET');
                        }
                    }


                    // res.status(200).send(admin);
                }
            });


    });


router
    .post('/add-cook-info', function(req, res, next) {

        // res.send('Task API');
        dns.lookup(os.hostname(), function(err, add, fam) {


            var cook_bn_img = randomstring.generate(13);


            var cook_banner_img = add + ':3000/uploads/cook_uploads/' + cook_bn_img + '.jpg';



            fs.writeFile("client/uploads/cook_uploads/" + cook_bn_img + ".jpg", new Buffer(req.body.cook_banner_img, "base64"), function(err) {

                if (err) {

                    throw err;
                    console.log(err);
                    res.send(err)
                } else {
                    console.log('cook banner Img uploaded');
                    // res.send("success");
                    // console.log("success!");
                }

            });

            db.cook_infos.save({

                cook_name: req.body.cook_company_name,
                cook_email: req.body.cook_email,
                cook_contact: req.body.cook_contact,
                cook_password: bcrypt.hashSync(req.body.cook_password, bcrypt.genSaltSync(10)),
                status: req.body.cook_isEnable,
                isApproved: req.body.cook_isApproved,
                street_address: req.body.cook_street_address,
                gender: req.body.cook_gender,
                city: req.body.cook_city,
                state: req.body.cook_state,
                pincode: req.body.cook_pincode,
                about_us: req.body.cook_about_us,
                first_name: req.body.cook_fname,
                last_name: req.body.cook_lname,
                display_email: req.body.cook_display_email,
                display_phone: req.body.cook_display_contact,
                cook_banner_img: cook_banner_img,
                cook_other_payment_info: req.body.cook_other_payment_info,
                cook_commission: req.body.cook_commission,
                food_details:[]



            }, function(err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }
                res.status(200);
                res.send({
                    'status': 'Cook Successfully Added Via Admin'
                });
                console.log('Cook Successfully Added Via Admin');
            });

        });

        // db.cook_infos.save({
        //                      cook_name:req.body.cook_name,
        //                     cook_email:req.body.cook_email,
        //                     c ook_contact:req.body.cook_contact_no,
        //                     cook_password:bcrypt.hashSync(req.body.cook_password,bcrypt.genSaltSync(10))


        //                     },function(err,cook){

        //                            if( err || !cook) console.log("err in cook");
        //                            else
        //                            {

        //                                  res.send(cook);
        //                            }
        //                         console.log('cook saved');

        //                   })

    });

router
    .get('/get-all-users', function(req, res, next) {

        console.log('this is get');
        db.user_infos.find(function(err, users) {
            if (err || !users) console.log(err);
            else {
                res.header('Access-Control-Allow-Origin', '*');
                res.header('Access-Control-Allow-Methods', 'GET');

                res.status(200).send(users);
            }
        });

    });

router
    .get('/get-all-cooks', function(req, res, next) {

        // res.send('Task API');
        db.cook_infos.find({}, {
            cook_name: 1,
            cook_email: 1,
            cook_commission: 1,
            isApproved: 1,
            status: 1,
            cook_contact: 1
        }, function(err, cooks) {
            if (err || !cooks) console.log("No  cook found");
            else {
                console.log(cooks);
                res.status(200).send(cooks);
            }
        });

    });


router
    .post('/delete-cook', function(req, res, next) {


        for (var i = 0; i < req.body.length; i++) {

            db.cook_infos.remove({
                "_id": db.ObjectId(req.body[i])
            });
        }


        res.status(200).send('ooook');
    });

router
    .get('/delete-all-cook', function(req, res, next) {


        db.cook_infos.remove();
        res.status(200).send('All Deleted');
        console.log('all cook deletedddd');
    });


router
    .post('/delete-user', function(req, res, next) {


        for (var i = 0; i < req.body.length; i++) {

            db.user_infos.remove({
                "_id": db.ObjectId(req.body[i])
            });
        }

        res.status(200).send('ooook');

    });


router
    .get('/delete-all-user', function(req, res, next) {


        db.user_infos.remove();
        res.status(200).send('All Deleted');
        console.log('all user deletedddd');
    });



// res.send('Task API');

router
    .post('/save-global-setting', function(req, res, next) {


        // res.send('Task API');
        console.log(req.body.copyright);
        var web_logo_file;
        var footer_logo_file;
        var favicon_file;
        dns.lookup(os.hostname(), function(err, add, fam) {


            if (req.body.hasOwnProperty('website_logo') && req.body.website_logo != "") {
                var web_logo_temp = randomstring.generate(13);
                web_logo_file = 'uploads/global_setting_uploads/' + web_logo_temp + '.jpg';



                fs.writeFile("client/uploads/global_setting_uploads/" + web_logo_temp + ".jpg", new Buffer(req.body.website_logo, "base64"), function(err) {

                    if (err) {

                        throw err;
                        console.log(err);
                        res.send(err)
                    } else {
                        console.log('Website logo uploaded');

                    }

                });


            }

            if (req.body.hasOwnProperty('footer_logo') && req.body.footer_logo != "") {
                var footer_logo_temp = randomstring.generate(13);
                footer_logo_file = '/uploads/global_setting_uploads/' + footer_logo_temp + '.jpg';



                fs.writeFile("client/uploads/global_setting_uploads/" + footer_logo_temp + ".jpg", new Buffer(req.body.footer_logo, "base64"), function(err) {

                    if (err) {

                        throw err;
                        console.log(err);
                        res.send(err)
                    } else {
                        console.log('Footer logo uploaded');

                    }

                });


            }
            if (req.body.hasOwnProperty('favicon') && req.body.favicon != "") {
                var favicon_temp = randomstring.generate(13);
                favicon_file = '/uploads/global_setting_uploads/' + favicon_temp + '.jpg';



                fs.writeFile("client/uploads/global_setting_uploads/" + favicon_temp + ".jpg", new Buffer(req.body.favicon, "base64"), function(err) {

                    if (err) {

                        throw err;
                        console.log(err);
                        res.send(err)
                    } else {
                        console.log('Footer logo uploaded');

                    }

                });


            }


            if (req.body.favicon != "" && req.body.footer_logo != "" && req.body.website_logo != "") {

                db.global_setting_infos.findAndModify(

                    {
                        query: {

                        },
                        update: {
                            $set: {
                                site_name: req.body.site_name,
                                display_email: req.body.display_email,
                                send_from_email: req.body.send_from_email,
                                receive_on: req.body.send_from_email,
                                phone: req.body.phone,
                                alt_phn: req.body.alt_phn,
                                addrress: req.body.addrress,
                                meta_tag_title: req.body.meta_tag_title,
                                meta_tag_desc: req.body.meta_tag_desc,
                                meta_tag_keyword: req.body.meta_tag_keyword,
                                google_analytic_code: req.body.google_analytic_code,
                                google_map_code: req.body.google_map_code,
                                schema: req.body.schema,
                                copyright: req.body.copyright,
                                website_logo: web_logo_file,
                                footer_logo: footer_logo_file,
                                favicon: favicon_file
                            },


                        },
                        new: true
                    },
                    function(err, data, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send('error');
                            throw err;

                        }
                        //   console.log('SUCCESS WIth Image');
                        console.log('this is temp');
                        res.status(200);
                        res.send(data);

                    });
            } else if (req.body.favicon == "" && req.body.footer_logo != "" && req.body.website_logo != "") {
                db.global_setting_infos.findAndModify(

                    {
                        query: {

                        },
                        update: {
                            $set: {
                                site_name: req.body.site_name,
                                display_email: req.body.display_email,
                                send_from_email: req.body.send_from_email,
                                receive_on: req.body.send_from_email,
                                phone: req.body.phone,
                                alt_phn: req.body.alt_phn,
                                addrress: req.body.addrress,
                                meta_tag_title: req.body.meta_tag_title,
                                meta_tag_desc: req.body.meta_tag_desc,
                                meta_tag_keyword: req.body.meta_tag_keyword,
                                google_analytic_code: req.body.google_analytic_code,
                                google_map_code: req.body.google_map_code,
                                schema: req.body.schema,
                                copyright: req.body.copyright,
                                website_logo: web_logo_file,
                                footer_logo: footer_logo_file,

                            },


                        },
                        new: true
                    },
                    function(err, data, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send('error');
                            throw err;

                        }
                        //   console.log('SUCCESS WIth Image');
                        console.log('this is temp');
                        res.status(200);
                        res.send(data);

                    });

            } else if (req.body.favicon == "" && req.body.footer_logo == "" && req.body.website_logo != "") {

                db.global_setting_infos.findAndModify(

                    {
                        query: {

                        },
                        update: {
                            $set: {
                                site_name: req.body.site_name,
                                display_email: req.body.display_email,
                                send_from_email: req.body.send_from_email,
                                receive_on: req.body.send_from_email,
                                phone: req.body.phone,
                                alt_phn: req.body.alt_phn,
                                addrress: req.body.addrress,
                                meta_tag_title: req.body.meta_tag_title,
                                meta_tag_desc: req.body.meta_tag_desc,
                                meta_tag_keyword: req.body.meta_tag_keyword,
                                google_analytic_code: req.body.google_analytic_code,
                                google_map_code: req.body.google_map_code,
                                schema: req.body.schema,
                                copyright: req.body.copyright,
                                website_logo: web_logo_file,


                            },


                        },
                        new: true
                    },
                    function(err, data, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send('error');
                            throw err;

                        }
                        //   console.log('SUCCESS WIth Image');
                        console.log('this is temp');
                        res.status(200);
                        res.send(data);

                    });

            } else if (req.body.favicon == "" && req.body.footer_logo != "" && req.body.website_logo == "") {
                db.global_setting_infos.findAndModify(

                    {
                        query: {

                        },
                        update: {
                            $set: {
                                site_name: req.body.site_name,
                                display_email: req.body.display_email,
                                send_from_email: req.body.send_from_email,
                                receive_on: req.body.send_from_email,
                                phone: req.body.phone,
                                alt_phn: req.body.alt_phn,
                                addrress: req.body.addrress,
                                meta_tag_title: req.body.meta_tag_title,
                                meta_tag_desc: req.body.meta_tag_desc,
                                meta_tag_keyword: req.body.meta_tag_keyword,
                                google_analytic_code: req.body.google_analytic_code,
                                google_map_code: req.body.google_map_code,
                                schema: req.body.schema,
                                copyright: req.body.copyright,
                                footer_logo: footer_logo_file,


                            },


                        },
                        new: true
                    },
                    function(err, data, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send('error');
                            throw err;

                        }
                        //   console.log('SUCCESS WIth Image');
                        console.log('this is temp');
                        res.status(200);
                        res.send(data);

                    });

            } else if (req.body.favicon != "" && req.body.footer_logo == "" && req.body.website_logo == "") {
                db.global_setting_infos.findAndModify(

                    {
                        query: {

                        },
                        update: {
                            $set: {
                                site_name: req.body.site_name,
                                display_email: req.body.display_email,
                                send_from_email: req.body.send_from_email,
                                receive_on: req.body.send_from_email,
                                phone: req.body.phone,
                                alt_phn: req.body.alt_phn,
                                addrress: req.body.addrress,
                                meta_tag_title: req.body.meta_tag_title,
                                meta_tag_desc: req.body.meta_tag_desc,
                                meta_tag_keyword: req.body.meta_tag_keyword,
                                google_analytic_code: req.body.google_analytic_code,
                                google_map_code: req.body.google_map_code,
                                schema: req.body.schema,
                                copyright: req.body.copyright,
                                favicon: favicon_file


                            },


                        },
                        new: true
                    },
                    function(err, data, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send('error');
                            throw err;

                        }
                        //   console.log('SUCCESS WIth Image');
                        console.log('this is temp');
                        res.status(200);
                        res.send(data);

                    });

            } else if (req.body.favicon != "" && req.body.footer_logo != "" && req.body.website_logo == "") {
                db.global_setting_infos.findAndModify(

                    {
                        query: {

                        },
                        update: {
                            $set: {
                                site_name: req.body.site_name,
                                display_email: req.body.display_email,
                                send_from_email: req.body.send_from_email,
                                receive_on: req.body.send_from_email,
                                phone: req.body.phone,
                                alt_phn: req.body.alt_phn,
                                addrress: req.body.addrress,
                                meta_tag_title: req.body.meta_tag_title,
                                meta_tag_desc: req.body.meta_tag_desc,
                                meta_tag_keyword: req.body.meta_tag_keyword,
                                google_analytic_code: req.body.google_analytic_code,
                                google_map_code: req.body.google_map_code,
                                schema: req.body.schema,
                                copyright: req.body.copyright,
                                footer_logo: footer_logo_file,
                                favicon: favicon_file


                            },


                        },
                        new: true
                    },
                    function(err, data, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send('error');
                            throw err;

                        }
                        //   console.log('SUCCESS WIth Image');
                        console.log('this is temp');
                        res.status(200);
                        res.send(data);

                    });

            } else if (req.body.favicon != "" && req.body.footer_logo == "" && req.body.website_logo != "") {
                db.global_setting_infos.findAndModify(

                    {
                        query: {

                        },
                        update: {
                            $set: {
                                site_name: req.body.site_name,
                                display_email: req.body.display_email,
                                send_from_email: req.body.send_from_email,
                                receive_on: req.body.send_from_email,
                                phone: req.body.phone,
                                alt_phn: req.body.alt_phn,
                                addrress: req.body.addrress,
                                meta_tag_title: req.body.meta_tag_title,
                                meta_tag_desc: req.body.meta_tag_desc,
                                meta_tag_keyword: req.body.meta_tag_keyword,
                                google_analytic_code: req.body.google_analytic_code,
                                google_map_code: req.body.google_map_code,
                                schema: req.body.schema,
                                copyright: req.body.copyright,
                                website_logo: web_logo_file,
                                favicon: favicon_file


                            },


                        },
                        new: true
                    },
                    function(err, data, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send('error');
                            throw err;

                        }
                        //   console.log('SUCCESS WIth Image');
                        console.log('this is temp');
                        res.status(200);
                        res.send(data);

                    });

            } else if (req.body.favicon == "" && req.body.footer_logo == "" && req.body.website_logo == "") {
                db.global_setting_infos.findAndModify(

                    {
                        query: {

                        },
                        update: {
                            $set: {
                                site_name: req.body.site_name,
                                display_email: req.body.display_email,
                                send_from_email: req.body.send_from_email,
                                receive_on: req.body.send_from_email,
                                phone: req.body.phone,
                                alt_phn: req.body.alt_phn,
                                addrress: req.body.addrress,
                                meta_tag_title: req.body.meta_tag_title,
                                meta_tag_desc: req.body.meta_tag_desc,
                                meta_tag_keyword: req.body.meta_tag_keyword,
                                google_analytic_code: req.body.google_analytic_code,
                                google_map_code: req.body.google_map_code,
                                schema: req.body.schema,
                                copyright: req.body.copyright,



                            },


                        },
                        new: true
                    },
                    function(err, data, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send('error');
                            throw err;

                        }
                        //   console.log('SUCCESS WIth Image');
                        console.log('this is temp');
                        res.status(200);
                        res.send(data);

                    });
            }



        });




    });

router

    .get('/fetch-global-settings', function(req, res, next) {

        console.log('testing');
        db.global_setting_infos.find(

            function(err, settings) {
                if (err || !settings) console.log("No  setting found");

                else {
                    console.log(settings);
                    res.status(200).send(settings);
                }
            });

    });

router

    .get('/fetch-cuisine-name', function(req, res, next) {


        db.categories_infos.find({}, {
                category_name: 1
            },
            function(err, cuisine) {
                if (err || !cuisine) console.log("No  setting found");

                else {
                    console.log(cuisine);
                    res.status(200).send(cuisine);
                }
            });

    });

// FOR INFORMATION PAGES MANAGMENT INFO/./

router

.post('/add-info-pages', function(req, res, next) {


        console.log(req.body);  

           db.admin_infos.findAndModify({
            query: {
                '_id': mongojs.ObjectId(req.body.admin_id)
            },
            update: {
                $push: {
                    'info_pages':
                        {   
                            '_id':mongojs.ObjectId(),
                            'info_title': req.body.info.info_title,
                            'info_desc': req.body.info.info_desc,
                            'info_meta_tag': req.body.info.info_meta_tag,
                            'info_meta_desc': req.body.info.info_meta_desc,
                            'info_meta_keyword': req.body.info.info_meta_keyword,
                            'info_seo_url': req.body.info.info_seo_url,
                            'info_status': req.body.info.info_status,
                            'info_sort_order': req.body.info.info_sort_order,
                        
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

            console.log(data);
            res.status(200).send(data);
        });


    });

router

.post('/fetch-info-pages', function(req, res, next) {

          db.admin_infos.find(
              {},
              {info_pages:1,_id:0,'info_pages.info_title':1,'info_pages.info_sort_order':1,'info_pages._id':1}
             ,
            function(err, info) {


                if (err) {
                    res.status(404);
                    res.send('info not found');
                } else {

                    console.log(info);
                    res.status(200).send(info[0]);
                }
            });
});


router

.post('/fetch-info_page-by-id', function(req, res, next) {

    //console.log(req.body.info_page_id);
      db.admin_infos.findOne({
                "info_pages._id": mongojs.ObjectId(req.body.info_page_id)
            },
            {
                'info_pages.$': 1
            }
            , function(err, info) {
                if (err || !info) console.log("No  info found");
                else {
                    console.log(info);
                    res.status(200).send(info);
                }

            }

        );

});

router

    .post('/delete-selected-info-pages', function(req, res, next) {

        console.log(req.body);
      
        for (var i = 0; i < req.body.selected_info_page.length; i++) {

       db.admin_infos.findAndModify({
                query: {
                    _id: mongojs.ObjectId(req.body.admin_id)
                },
                update: {
                    $pull: {
                        'info_pages': {
                            '_id': mongojs.ObjectId(req.body.selected_info_page[i])
                        }
                    }

                }

            }, function(err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }
                console.log(data);


            });


        }
  res.send({'status':'deleted'});
    });


router

    .post('/delete-all-info-pages', function(req, res, next) {


        console.log(req.body);
        db.admin_infos.findAndModify({
            query: {
                _id: mongojs.ObjectId(req.body.admin_id)
            },
            update: {
                'info_pages': []
            }



        }, function(err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }
            console.log('deleted');
            res.status(200).send(data);

        });
    });


router

    .post('/update-info-page', function(req, res, next) {


  db.admin_infos.update({
                "info_pages._id": mongojs.ObjectId(req.body._id)
            },

            {
                "$set": {
                    "info_pages.$.info_title": req.body.info_title,
                    "info_pages.$.info_desc": req.body.info_desc,
                    "info_pages.$.info_meta_tag": req.body.info_meta_tag,
                    "info_pages.$.info_meta_desc": req.body.info_meta_desc,
                    "info_pages.$.info_meta_keyword": req.body.info_meta_keyword,
                    "info_pages.$.info_seo_url": req.body.info_seo_url,
                    "info_pages.$.info_status": req.body.info_status,
                    "info_pages.$.info_title": req.body.info_title,
                    "info_pages.$.info_sort_order": req.body.info_sort_order,
                
                }

            }

            ,
            function(err, info) {
                if (err || !info) console.log("No  info found");
                else {
                   
                    res.status(200).send({'status':'updated'});
                }

            }



        );
    });

// FOR COUPON MANAGMENT/./

router

    .post('/add-coupon-info', function(req, res, next) {

        var coupon_data = [];
        coupon_data = req.body;

        coupon_data._id = mongojs.ObjectId();

        db.admin_infos.findAndModify({
            query: {
                '_id': mongojs.ObjectId(req.body.admin_id)
            },
            update: {
                $push: {
                    'coupon_infos': coupon_data

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
            res.status(200).send(data);
        });



    });


router

    .post('/fetch-coupon-info', function(req, res, next) {

        db.admin_infos.find({

                _id: mongojs.ObjectId(req.body.admin_id)

            }

            ,
            function(err, coupon) {


                if (err) {
                    res.status(404);
                    res.send('info not found');
                } else {

                    res.send(coupon[0]);

                }
            });

    });

router
    .post('/fetch-coupon-by-id', function(req, res, next) {

        console.log(req.body);

        db.admin_infos.find({
                "coupon_infos._id": mongojs.ObjectId(req.body.coupon_id)
            }, {
                'coupon_infos.$': 1
            }, function(err, coupon) {
                if (err || !coupon) console.log("No  coupon found");
                else {
                    console.log(coupon);
                    res.status(200).send(coupon);
                }

            }

        );

    });

router
    .post('/update-coupon-by-id', function(req, res, next) {

        console.log(req.body);

        var categories = [];

        for (var i = 0; i < req.body.categories.length; i++) {

            categories[i] = req.body.categories[i];
        }

        db.admin_infos.update({
                "coupon_infos._id": mongojs.ObjectId(req.body._id)
            },

            {
                "$set": {
                    "coupon_infos.$.coupon_name": req.body.coupon_name,
                    "coupon_infos.$.coupon_code": req.body.coupon_code,
                    "coupon_infos.$.coupon_discount_operation": req.body.coupon_discount_operation,
                    "coupon_infos.$.coupon_discount_amount": req.body.coupon_discount_amount,
                    "coupon_infos.$.coupon_due_start": req.body.coupon_due_start,
                    "coupon_infos.$.coupon_due_end": req.body.coupon_due_end,
                    "coupon_infos.$.coupon_voucher_limit": req.body.coupon_voucher_limit,
                    "coupon_infos.$.coupon_uses_per_customer": req.body.coupon_uses_per_customer,
                    "coupon_infos.$.coupon_status": req.body.coupon_status,
                    "coupon_infos.$.categories": categories

                }


            }

            ,
            function(err, coupon) {
                if (err || !coupon) console.log("No  coupon found");
                else {
                    console.log(coupon);
                    res.status(200).send(coupon);
                }

            }



        );

    });

router

    .post('/delete-selected-coupon', function(req, res, next) {


        for (var i = 0; i < req.body.selected_coupons.length; i++) {

            db.admin_infos.findAndModify({
                query: {
                    _id: mongojs.ObjectId(req.body.admin_id)
                },
                update: {
                    $pull: {
                        'coupon_infos': {
                            '_id': mongojs.ObjectId(req.body.selected_coupons[i])
                        }
                    }

                }

            }, function(err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }
                console.log('deleted');
                res.status(200).send(data);

            });



        }

    });


router

    .post('/delete-all-coupon', function(req, res, next) {

        console.log('delteing ALL');
        console.log(req.body);
        db.admin_infos.findAndModify({
            query: {
                _id: mongojs.ObjectId(req.body.admin_id)
            },
            update: {
                'coupon_infos': []
            }



        }, function(err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }
            console.log('deleted');
            res.status(200).send(data);

        });
    });

router

    .post('/enable-coupon-by-id', function(req, res, next) {

        console.log(req.body);

        for (var i = 0; i < req.body.length; i++) {

            db.admin_infos.update({
                    "coupon_infos._id": mongojs.ObjectId(req.body[i])
                },

                {
                    "$set": {
                        "coupon_infos.$.coupon_status": 'Enable'

                    }

                }

                ,
                function(err, coupon) {
                    if (err || !coupon) console.log("No  coupon found");
                    else {
                        console.log(coupon);

                    }

                }



            );


        }
        res.status(200).send({
            'status': 'updated'
        });

    });

router

    .post('/disable-coupon-by-id', function(req, res, next) {

        console.log(req.body);
        for (var i = 0; i < req.body.length; i++) {

            db.admin_infos.update({
                    "coupon_infos._id": mongojs.ObjectId(req.body[i])
                },

                {
                    "$set": {
                        "coupon_infos.$.coupon_status": 'Disable'

                    }

                }

                ,
                function(err, coupon) {
                    if (err || !coupon) throw err;
                    else {
                        console.log(coupon);

                    }

                }



            );


        }
        res.status(200).send({
            'status': 'updated'
        });

    });

router

    .post('/enable-all-coupon', function(req, res, next) {

        console.log('enabling all');
        console.log(req.body);
        db.admin_infos.find({
                "_id": mongojs.ObjectId(req.body.admin_id)
            }, {
                coupon_infos: 1,
                _id: 0
            }, function(err, coupon) {
                if (err || !coupon) console.log("No  coupon found");
                else {
                    console.log(coupon[0].coupon_infos);

                    for (var i = 0; i < coupon[0].coupon_infos.length; i++) {



                        db.admin_infos.update({
                                "coupon_infos._id": mongojs.ObjectId(coupon[0].coupon_infos[i]._id)
                            },

                            {
                                "$set": {
                                    "coupon_infos.$.coupon_status": 'Enable'

                                }

                            }

                            ,
                            function(err, coupon) {
                                if (err || !coupon) console.log("No  coupon found");
                                else {
                                    console.log(coupon);

                                }

                            }



                        );

                    }

                    res.status(200).send(coupon);
                }

            }

        );



    });

router

    .post('/disable-all-coupon', function(req, res, next) {

        console.log(req.body);
        db.admin_infos.find({
                "_id": mongojs.ObjectId(req.body.admin_id)
            }, {
                coupon_infos: 1,
                _id: 0
            }, function(err, coupon) {
                if (err || !coupon) console.log("No  coupon found");
                else {
                    console.log(coupon[0].coupon_infos);

                    for (var i = 0; i < coupon[0].coupon_infos.length; i++) {



                        db.admin_infos.update({
                                "coupon_infos._id": mongojs.ObjectId(coupon[0].coupon_infos[i]._id)
                            },

                            {
                                "$set": {
                                    "coupon_infos.$.coupon_status": 'Disable'

                                }

                            }

                            ,
                            function(err, coupon) {
                                if (err || !coupon) console.log("No  coupon found");
                                else {
                                    console.log(coupon);

                                }

                            }



                        );

                    }

                    res.status(200).send(coupon);
                }

            }

        );



    });


// FOR COUPON MANAGMENT /./
router

    .post('/add-social-info', function(req, res, next) {

        db.admin_infos.find({

            _id: mongojs.ObjectId(req.body.admin_id)

        }, function(err, admin) {


            if (err) {
                res.status(404);
                res.send('info not found');
            } else {

                //    res.status(200).json(user);

                // console.log(admin[0].social_info);
                var count;
                for (var i = 0; i < req.body.social.length; i++) {
                    count = 0;
                    if (admin[0].hasOwnProperty('social_info')) {
                        for (var j = 0; j < admin[0].social_info.length; j++) {

                            if (admin[0].social_info[j].social_media == req.body.social[i].social_media) {

                                count = 1;
                            }

                        }
                        if (count == 1) {

                            db.admin_infos.update({
                                    "social_info.social_media": req.body.social[i].social_media
                                },

                                {
                                    "$set": {
                                        "social_info.$.social_media": req.body.social[i].social_media,
                                        "social_info.$.social_url": req.body.social[i].social_url,
                                        "social_info.$.social_status": req.body.social[i].social_status

                                    }

                                });
                        }
                        if (count == 0) {


                            db.admin_infos.findAndModify(

                                {
                                    query: {},
                                    update: {
                                        $push: {
                                            "social_info": {
                                                'social_media': req.body.social[i].social_media,
                                                'social_url': req.body.social[i].social_url,
                                                'social_status': req.body.social[i].social_status
                                            }
                                        }
                                    },
                                    new: true
                                },
                                function(err, data, lastErrorObject) {
                                    if (err) {

                                        res.send('error');
                                        throw err;

                                    }

                                    console.log('Social Details UPDATED');

                                });

                        }

                    }
                }
                res.status(200).send({
                    'status': 'fine'
                });
            }

        });



    });



router

    .post('/get-social-infos', function(req, res, next) {

        var res_social = [];
        db.admin_infos.find({
                "_id": mongojs.ObjectId(req.body.admin_id)
            }

            ,
            function(err, social) {
                if (err || !social) console.log(err);
                else {
                    console.log(social[0].social_info);
                    res_social = social[0].social_info;
                    res.status(200).send(res_social);
                }

            }

        );

        //res.send('this is social infos');
        //  db.social_infos.find(
        //                 { 

        //                    _id: mongojs.ObjectId('58956efa325e380c1ce8c94a')

        //                 }
        //                 ,function(err,social_infos){


        //                  if(err || social_infos=="")
        //                  {  
        //                       res.status(404);
        //                       res.send('info not found');
        //                  }else {    

        //                     //    res.status(200).json(user);
        //                     res.send(social_infos[0]);  
        //                     console.log(social_infos);
        //                  }
        //         });
    });



router

    .post('/remove-social-media', function(req, res, next) {

        db.admin_infos.findAndModify({
            query: {
                _id: mongojs.ObjectId(req.body.admin_id)
            },
            update: {
                $pull: {
                    'social_info': {
                        'social_media': req.body.social_media
                    }
                }

            }

        }, function(err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }
            console.log('deleted');
            res.status(200).send({
                'status': 'deleted'
            });

        });

    });


router
    .post('/add-product-category', function(req, res, next) {

        var date = new Date();
        var current_hour = date.getTime();

        var category_image = 'category_image' + date.getTime() + '.jpg';
        var category_banner = 'category_banner' + date.getTime() + '.jpg';


        fs.writeFile("client/uploads/admin_uploads/" + category_image + ".jpg", new Buffer(req.body.cat_img, "base64"), function(err) {

            if (err) {

                throw err;
            } else {


                fs.writeFile("client/uploads/admin_uploads/" + category_banner + ".jpg", new Buffer(req.body.cat_banner, "base64"), function(err) {

                    if (err) {

                        throw err;
                    } else {

                        db.categories_infos.save({

                            category_name: req.body.category_name,
                            meta_tag_title: req.body.meta_tag_title,
                            meta_tag_desc: req.body.meta_tag_desc,
                            cat_img: category_image,
                            cat_banner: category_banner,
                            meta_tag_keyword: req.body.meta_tag_keyword,
                            parent: req.body.parent,
                            seo_url: req.body.seo_url,
                            category_isBottom: req.body.category_isBottom,
                            category_status: req.body.category_status,
                            status: 'false'
                        }, function(err, category) {

                            if (err || !category) console.log("err in category");
                            else {

                                res.send(category);
                            }
                            console.log('category saved');

                        });



                    }

                });


            }

        });

    });



// FOR ATTRIBUTE INFO


router
    .post('/add-attribute-group', function(req, res, next) {


        console.log(req.body);
        db.attribute_infos.findAndModify(

            {
                query: {},
                update: {
                    $push: {
                        "groupname": {
                            '_id':mongojs.ObjectId(),
                            'fields': req.body.attr_group_name,
                               'sort_order':req.body.attr_group_order
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

                console.log(data.groupname);
                res.send(data.groupname);
            });

    });

router
    .post('/fetch-attribute-group', function(req, res, next) {

           
          db.attribute_infos.find(
              {},
              {"groupname":1,_id:0}
             ,
            function(err, info) {


                if (err) {
                    res.status(404);
                    res.send('info not found');
                } else {

                    console.log(info);
                    res.status(200).send(info[0]);
                }
            });

    });


router
    .get('/fetch-attr-group-name', function(req, res, next) {

        db.attribute_infos.find(function(err, attribute_infos) {

            if (err || !attribute_infos) console.log(err);
            else {
                res.status(200).send(attribute_infos);
                console.log(attribute_infos);
            }
        });



    });


router

    .post('/delete-selected-attr-group', function(req, res, next) {

        for (var i = 0; i < req.body.selected_attr_group.length; i++) {

       db.attribute_infos.findAndModify({
                query: {
                   
                },
                update: {
                    $pull: {groupname:{
                      
                            '_id': mongojs.ObjectId(req.body.selected_attr_group[i])
                        
                    }
                    }

                }

            }, function(err, data, lastErrorObject) {
                if (err) {
                    
                    throw err;

                }
                console.log('deleted');


            });


        }
  res.send({'status':'deleted'});
    });


router

    .post('/delete-all-info-pages', function(req, res, next) {


        console.log(req.body);
        db.admin_infos.findAndModify({
            query: {
                _id: mongojs.ObjectId(req.body.admin_id)
            },
            update: {
                'info_pages': []
            }



        }, function(err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }
            console.log('deleted');
            res.status(200).send(data);

        });
    });



router
    .post('/save-attr-field-name', function(req, res, next) {

        console.log(req.body);
        if (req.body.g_name == 'Occassion')

        {

            db.attribute_infos.findAndModify(

                {
                    query: {},
                    update: {
                        $push: {
                            "Occassions": {
                                'group_attr': req.body.f_name,
                                'status': 'false'
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

                    console.log(data);
                    res.send(data);
                });


        } else if (req.body.g_name == 'Vegetable type')

        {

            db.attribute_infos.findAndModify(

                {
                    query: {},
                    update: {
                        $push: {
                            "Vegetable_type": {
                                'group_attr': req.body.f_name
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

                    console.log(data);
                    res.send(data);
                });


        }



    });


router
    .post('/fetch-cook-by-id', function(req, res, next) {

        db.cook_infos.find({
            _id: mongojs.ObjectId(req.body.cook_id)
        }, {
            food_details: 0
        }, function(err, cooks) {
            if (err || !cooks) console.log("No  cook found");
            else {
                console.log(cooks);
                res.status(200).send(cooks);
            }
        });

    });

router
    .post('/update-cook-by-id', function(req, res, next) {

        //   console.log(req.body);
        if (req.body.hasOwnProperty('cook_updated_banner_img')) {

            dns.lookup(os.hostname(), function(err, add, fam) {


                var cook_bn_img = randomstring.generate(13);


                var cook_banner_img = add + ':3000/uploads/cook_uploads/' + cook_bn_img + '.jpg';



                fs.writeFile("client/uploads/cook_uploads/" + cook_bn_img + ".jpg", new Buffer(req.body.cook_updated_banner_img, "base64"), function(err) {

                    if (err) {

                        throw err;
                        console.log(err);
                        res.send(err)
                    } else {
                        console.log('cook banner Img uploaded');
                        // res.send("success");
                        // console.log("success!");
                    }

                });

                db.cook_infos.findAndModify(

                    {
                        query: {
                            _id: mongojs.ObjectId(req.body.cook_id)
                        },
                        update: {
                            $set: {
                                cook_name: req.body.cook_name,
                                cook_email: req.body.cook_email,
                                cook_contact: req.body.cook_contact,

                                status: req.body.status,
                                isApproved: req.body.isApproved,
                                street_address: req.body.street_address,
                                gender: req.body.gender,
                                city: req.body.city,
                                state: req.body.state,
                                pincode: req.body.pincode,
                                about_us: req.body.about_us,
                                first_name: req.body.first_name,
                                last_name: req.body.last_name,
                                display_email: req.body.display_email,
                                display_phone: req.body.display_contact,
                                cook_banner_img: cook_banner_img,
                                cook_other_payment_info: req.body.cook_other_payment_info,
                                cook_commission: req.body.cook_commission
                            },


                        },
                        new: true
                    },
                    function(err, data, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send('error');
                            throw err;

                        }
                        console.log('SUCCESS WIth Image');
                        res.status(200);
                        res.send(data);

                    });


            });

        } else {
            db.cook_infos.findAndModify(

                {
                    query: {
                        _id: mongojs.ObjectId(req.body.cook_id)
                    },
                    update: {
                        $set: {
                            cook_name: req.body.cook_name,
                            cook_email: req.body.cook_email,
                            cook_contact: req.body.cook_contact,

                            status: req.body.status,
                            isApproved: req.body.isApproved,
                            street_address: req.body.street_address,
                            gender: req.body.gender,
                            city: req.body.city,
                            state: req.body.state,
                            pincode: req.body.pincode,
                            about_us: req.body.about_us,
                            first_name: req.body.first_name,
                            last_name: req.body.last_name,
                            display_email: req.body.display_email,
                            display_phone: req.body.display_contact,

                            cook_other_payment_info: req.body.cook_other_payment_info,
                            cook_commission: req.body.cook_commission
                        },


                    },
                    new: true
                },
                function(err, data, lastErrorObject) {
                    if (err) {
                        res.status(400);
                        res.send('error');
                        throw err;

                    }
                    console.log('SUCCESS');
                    res.status(200);
                    res.send(data);

                });

        }



    });

//FOR BANNER OPERATIONS

router
    .post('/add-banner-details', function(req, res, next) {

console.log(req.body);
      
        var id=mongojs.ObjectId();
        // //PENDING (COMPLETE WHEN REACHED)
        db.admin_infos.findAndModify(

                                        {query:{},
                                            update: { $push:
                                                         { "banner_info" :

                                                         {'_id':id,'banner_name':req.body.banner_name, 'banner_status':req.body.banner_status ,

                                                               }}  },
                                            new:true
                                        }
                                        , function (err, data, lastErrorObject) {

                                        if(err){

                                                res.send('error');
                                                throw err;

                                                }   
                                            
                        dns.lookup(os.hostname(), function(err, add, fam) {
                                      for(var i=0;i<req.body.img.length;i++){

                                       var banner = randomstring.generate(13);

                                       var banner_file = '/uploads/global_setting_uploads/' + banner + '.jpg';

                                            fs.writeFile("client/uploads/global_setting_uploads/" + banner + ".jpg", new Buffer(req.body.img[i], "base64"), function(err) {

                                                            if (err) {

                                                                throw err;
                                                                console.log(err);
                                                                res.send(err)
                                                            } else {
                                                                console.log('Banner Img uploaded');

                                                            }

                                                        });




                                                         // 2nd
                                                    db.admin_infos.update(
                                                        { 'banner_info._id':mongojs.ObjectId(id)},
                                                        { $addToSet: { "banner_info.$.banner_details": {'banner_title':req.body.choices[i].banner_title,'banner_link':req.body.choices[i].banner_link,'banner_img':banner_file,'banner_order':req.body.choices[i].banner_order} }}
                                          
                                                    , function (err, data, lastErrorObject) {
                                                        if(err){

                                                        res.send('error');
                                                        throw err;

                                                        }

                                                       
                                                    });
                                                    //2nd


                                               }
                        }); //dns close
                         res.send({'status':'uploded'}) ;
                                   });
       
    });

    router
    .get('/fetch-all-banner-details', function(req, res, next) {
            
       db.admin_infos.find({
            
        }, {
            _id:0,
            'banner_info':1,
        }, function(err, banner) {
            if (err || !banner) console.log("No  banner found");
            else {
                console.log(banner[0]);
                res.status(200).send(banner);
            }
        });
    });

    router

    .post('/delete-selected-banner', function(req, res, next) {

        console.log(req.body);
      
        for (var i = 0; i < req.body.selected_banner.length; i++) {

       db.admin_infos.findAndModify({
                query: {
                    _id: mongojs.ObjectId(req.body.admin_id)
                },
                update: {
                    $pull: {
                        'banner_info': {
                            '_id': mongojs.ObjectId(req.body.selected_banner[i])
                        }
                    }

                }

            }, function(err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }
                console.log(data);


            });


        }
  res.send({'status':'deleted'});
    });


router

    .post('/delete-all-banners', function(req, res, next) {


        console.log(req.body);
        db.admin_infos.findAndModify({
            query: {
                _id: mongojs.ObjectId(req.body.admin_id)
            },

             update: {
                    $pull: {
                        'banner_info': {
                           
                        }
                    }

           
             }


        }, function(err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }
            console.log('deleted');
            res.status(200).send(data);

        });
    });

router

    .post('/delete-all-coupon', function(req, res, next) {

        console.log('delteing ALL');
        console.log(req.body);
        db.admin_infos.findAndModify({
            query: {
                _id: mongojs.ObjectId(req.body.admin_id)
            },
            update: {
                  $pull: {
                        'coupon_infos': {
                           
                        }
                    }

              
            }


        }, function(err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }
            console.log('deleted');
            res.status(200).send(data);

        });
    });

router

    .post('/enable-banner-by-id', function(req, res, next) {

        for (var i = 0; i < req.body.length; i++) {

            db.admin_infos.update({
                    "banner_info._id": mongojs.ObjectId(req.body[i])
                },

                {
                    "$set": {
                        "banner_info.$.banner_status": 'Enable'

                    }

                }

                ,
                function(err, coupon) {
                    if (err || !coupon) console.log("No  banner found");
                    else {
                        console.log(coupon);

                    }

                }

            );


        }
        res.status(200).send({
            'status': 'updated'
        });

    });

router

    .post('/disable-banner-by-id', function(req, res, next) {

        console.log(req.body);
        for (var i = 0; i < req.body.length; i++) {

            db.admin_infos.update({
                    "banner_info._id": mongojs.ObjectId(req.body[i])
                },

                {
                    "$set": {
                         "banner_info.$.banner_status": 'Disable'

                    }

                }

                ,
                function(err, banner) {
                    if (err || !banner) throw err;
                    else {
                        console.log(banner);

                    }

                }

            );


        }
        res.status(200).send({
            'status': 'updated'
        });

    });

    router

    .post('/enable-all-banner', function(req, res, next) {

        db.admin_infos.find({
                "_id": mongojs.ObjectId(req.body.admin_id)
            }, {
                banner_info: 1,
                _id: 0
            }, function(err, banner) {
                if (err || !banner) console.log("No  banner found");
                else {
                
                    for (var i = 0; i < banner[0].banner_info.length; i++) {



                        db.admin_infos.update({
                                "banner_info._id": mongojs.ObjectId(banner[0].banner_info[i]._id)
                            },

                            {
                                "$set": {
                                    "banner_info.$.banner_status": 'Enable'

                                }

                            }

                            ,
                            function(err, banner) {
                                if (err || !banner) console.log("No  banner found");
                                else {
                                    console.log(banner);

                                }

                            }



                        );

                    }

                    res.status(200).send(banner);
                }

            }

        );



    });

router

    .post('/disable-all-banner', function(req, res, next) {

     
        db.admin_infos.find({
                "_id": mongojs.ObjectId(req.body.admin_id)
            }, {
                banner_info: 1,
                _id: 0
            }, function(err, banner) {
                if (err || !banner) console.log("No  coupon found");
                else {
                    console.log(banner[0].banner_info);

                    for (var i = 0; i < banner[0].banner_info.length; i++) {



                        db.admin_infos.update({
                                "banner_info._id": mongojs.ObjectId(banner[0].banner_info[i]._id)
                            },

                            {
                                "$set": {
                                    "banner_info.$.banner_status": 'Disable'

                                }

                            }

                            ,
                            function(err, banner) {
                                if (err || !banner) console.log("No  banner found");
                                else {
                                    console.log(banner);

                                }

                            }



                        );

                    }

                    res.status(200).send(banner);
                }

            }

        );



    });

router

.post('/fetch-banner-by-id', function(req, res, next) {

    //console.log(req.body.info_page_id);
      db.admin_infos.findOne({
                "banner_info._id": mongojs.ObjectId(req.body.banner_id)
            },
            {
                'banner_info.$': 1
            }
            , function(err, banner) {
                if (err || !banner) console.log("No  banner found");
                else {
                    console.log(banner);
                    res.status(200).send(banner);
                }

            }

        );

});


router
    .post('/update-banner-details', function(req, res, next) {
        //BELOW CODE IS USED TO REPLACE
//    db.admin_infos.findAndModify({
//             query: {
//                 '_id': mongojs.ObjectId(req.body.admin_id)
//             },
//             update: {
//                 $push: {
//                     'layout_pages':
//                         {   
//                             '_id':mongojs.ObjectId(),
//                             'layout_type': req.body.layout.type.banner_name,
//                             'layout_name': req.body.layout.layout_name,
//                             'layout_status': req.body.layout.layout_status,
                            
                      
//                         }

//                 }
//             },
//             new: true

//console.log(req.body);
var update_id=req.body._id
console.log(update_id);
      
        var id=mongojs.ObjectId();
        // //PENDING (COMPLETE WHEN REACHED)

        db.admin_infos.findAndModify(

                                        {'banner_info._id':mongojs.ObjectId(update_id) },
                                          {  $set: 
                                                         { "banner_info.banner_name":req.body.banner_name, 'banner_status':req.body.banner_status ,

                                                        

                                          }},
                                           { new:true}
                                       
                                        , function (err, data, lastErrorObject) {

                                        if(err){

                                                res.send('error');
                                                throw err;

                                                }   
                                            console.log(data);
                        // dns.lookup(os.hostname(), function(err, add, fam) {
                        //               for(var i=0;i<req.body.img.length;i++){

                        //                var banner = randomstring.generate(13);

                        //                var banner_file = '/uploads/global_setting_uploads/' + banner + '.jpg';

                        //                     fs.writeFile("client/uploads/global_setting_uploads/" + banner + ".jpg", new Buffer(req.body.img[i], "base64"), function(err) {

                        //                                     if (err) {

                        //                                         throw err;
                        //                                         console.log(err);
                        //                                         res.send(err)
                        //                                     } else {
                        //                                         console.log('Banner Img uploaded');

                        //                                     }

                        //                                 });




                        //                                  // 2nd
                        //                             db.admin_infos.update(
                        //                                 { 'banner_info._id':mongojs.ObjectId(id)},
                        //                                 { $addToSet: { "banner_info.$.banner_details": {'banner_title':req.body.choices[i].banner_title,'banner_link':req.body.choices[i].banner_link,'banner_img':banner_file,'banner_order':req.body.choices[i].banner_order} }}
                                          
                        //                             , function (err, data, lastErrorObject) {
                        //                                 if(err){

                        //                                 res.send('error');
                        //                                 throw err;

                        //                                 }

                                                       
                        //                             });
                        //                             //2nd


                        //                        }
                        // }); //dns close
                         res.send({'status':'uploded'}) ;
                                   });
       
    });

// LAYOUT OPERATIONS//
router
    .post('/add-layout-page', function(req, res, next) {

console.log(req.body);
   
            db.admin_infos.findAndModify({
            query: {
                '_id': mongojs.ObjectId(req.body.admin_id)
            },
            update: {
                $push: {
                    'layout_pages':
                        {   
                            '_id':mongojs.ObjectId(),
                            'layout_type': req.body.layout.type.banner_name,
                            'layout_name': req.body.layout.layout_name,
                            'layout_status': req.body.layout.layout_status,
                            
                      
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

            console.log(data);
            res.status(200).send(data);
        });
    });

router

.post('/fetch-layout-detail', function(req, res, next) {

          db.admin_infos.find(
              {},
              {layout_pages:1}
             ,
            function(err, layout) {


                if (err) {
                    res.status(404);
                    res.send('layout not found');
                } else {

                    console.log(layout);
                    res.status(200).send(layout[0]);
                }
            });
});

router

    .post('/delete-selected-layout-pages', function(req, res, next) {

        console.log(req.body);
      
        for (var i = 0; i < req.body.selected_layout_page.length; i++) {

       db.admin_infos.findAndModify({
                query: {
                    _id: mongojs.ObjectId(req.body.admin_id)
                },
                update: {
                    $pull: {
                        'layout_pages': {
                            '_id': mongojs.ObjectId(req.body.selected_layout_page[i])
                        }
                    }

                }

            }, function(err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }
                console.log(data);


            });


        }
  res.send({'status':'deleted'});
    });


router

    .post('/delete-all-layout-pages', function(req, res, next) {


        console.log(req.body);
             db.admin_infos.findAndModify({
            query: {
                    _id: mongojs.ObjectId(req.body.admin_id)
                },
                update: {
                    $pull: {
                        'layout_pages': {
                           
                        }
                    }

                }

        }, function(err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }
            console.log('deleted');
            res.status(200).send(data);

        });

     });

router

    .post('/enable-layout-by-id', function(req, res, next) {

        console.log(req.body);

        for (var i = 0; i < req.body.length; i++) {

            db.admin_infos.update({
                    "layout_pages._id": mongojs.ObjectId(req.body[i])
                },

                {
                    "$set": {
                        "layout_pages.$.layout_status": 'Enable'

                    }

                }

                ,
                function(err, layout) {
                    if (err || !layout) console.log("No  layout found");
                    else {
                        console.log(layout);

                    }

                }



            );


        }
        res.status(200).send({
            'status': 'updated'
        });

    });

router

    .post('/disable-layout-by-id', function(req, res, next) {

        console.log(req.body);
        for (var i = 0; i < req.body.length; i++) {

            db.admin_infos.update({
                    "layout_pages._id": mongojs.ObjectId(req.body[i])
                },

                {
                    "$set": {
                        "layout_pages.$.layout_status": 'Disable'

                    }

                }

                ,
                function(err, coupon) {
                    if (err || !coupon) throw err;
                    else {
                        console.log(coupon);

                    }

                }



            );


        }
        res.status(200).send({
            'status': 'updated'
        });

    });

router

    .post('/enable-all-layout', function(req, res, next) {

        console.log('enabling all');
        console.log(req.body);
        db.admin_infos.find({
                "_id": mongojs.ObjectId(req.body.admin_id)
            }, {
                layout_pages: 1,
                _id: 0
            }, function(err, layout) {
                if (err || !layout) console.log("No  layout found");
                else {
                    console.log(layout[0].layout_pages);

                    for (var i = 0; i < layout[0].layout_pages.length; i++) {



                        db.admin_infos.update({
                                "layout_pages._id": mongojs.ObjectId(layout[0].layout_pages[i]._id)
                            },

                            {
                                "$set": {
                                    "layout_pages.$.layout_status": 'Enable'

                                }

                            }

                            ,
                            function(err, layout) {
                                if (err || !layout) console.log("No  layout found");
                                else {
                                    console.log(layout);

                                }

                            }



                        );

                    }

                    res.status(200).send(layout);
                }

            }

        );



    });

router

    .post('/disable-all-layout', function(req, res, next) {

        console.log(req.body);
        db.admin_infos.find({
                "_id": mongojs.ObjectId(req.body.admin_id)
            }, {
                layout_pages: 1,
                _id: 0
            }, function(err, layout) {
                if (err || !layout) console.log("No  layout found");
                else {
                    console.log(layout[0].layout_pages);

                    for (var i = 0; i < layout[0].layout_pages.length; i++) {



                        db.admin_infos.update({
                                "layout_pages._id": mongojs.ObjectId(layout[0].layout_pages[i]._id)
                            },

                            {
                                "$set": {
                                    "layout_pages.$.layout_status": 'Disable'

                                }

                            }

                            ,
                            function(err, layout) {
                                if (err || !layout) console.log("No  layout found");
                                else {
                                    console.log(layout);

                                }

                            }



                        );

                    }

                    res.status(200).send(layout);
                }

            }

        );



    });

router

.post('/fetch-layout-by-id', function(req, res, next) {

    //console.log(req.body.info_page_id);
      db.admin_infos.findOne({
                "layout_pages._id": mongojs.ObjectId(req.body.layout_id)
            },
            {
                'layout_pages.$': 1
            }
            , function(err, layout) {
                if (err || !layout) console.log("No  layout found");
                else {
                    console.log(layout);
                    res.status(200).send(layout);
                }

            }

        );

});

router

    .post('/update-layout-page', function(req, res, next) {

    console.log(req.body);
  db.admin_infos.update({
                "layout_pages._id": mongojs.ObjectId(req.body._id)
            },

            {
                "$set": {
                    "layout_pages.$.layout_type": req.body.layout_type,
                    "layout_pages.$.layout_name": req.body.layout_name,
                    "layout_pages.$.layout_status": req.body.layout_status,
                
                }

            }

            ,
            function(err, layout) {
                if (err || !layout) console.log("No  layout found");
                else {
                   
                    res.status(200).send({'status':'updated'});
                }

            }



       );
    });

//FOR TEMPLATE OPERATIONS

router

    .post('/save-sms-template', function(req, res, next) {
 var sms_template;
    
     String.prototype.replaceAll = function(target, replacement) {
            return this.split(target).join(replacement);
    };

     sms_template= req.body.sms_body.replaceAll("^","");
        

    db.admin_infos.findAndModify({
            query: {
                '_id': mongojs.ObjectId(req.body.admin_id)
            },
            update: {
                $push: {
                    'sms_template':
                        {   
                            '_id':mongojs.ObjectId(),
                            'sms_type': req.body.sms_type,
                            'sms_template': sms_template,
                        
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

            console.log(data);
            res.status(200).send(data);
        });

    });

router

.post('/fetch-template-by-type', function(req, res, next) {


          db.admin_infos.find(
              {'sms_template.sms_type':req.body.temp_view_id},
              {sms_template:1,_id:0}
             ,
            function(err, template) {

                var count=0;
                if (err) {
                    res.status(404);
                    res.send('info not found');
                } else {

                   
                    if(template.length>0){

                    for(var i=0;i<template[0].sms_template.length;i++){

                        if(template[0].sms_template[i].sms_type==req.body.temp_view_id){
                                  res.status(200).send(template[0].sms_template[i]);
                                  count++;
                                  break;
                        }
                    }
                    }
                    if(count<1){

                         res.send({'status':'no data found'});
                    }
                   
                //    if(template[0].sms_template);
                    // console.log(template[0].sms_template.length);
                  
                }
            });
});

router

    .post('/save-email-template', function(req, res, next) {
        
        console.log(req.body);
  var email_templates_subj;
  var email_template_body;
    
     String.prototype.replaceAll = function(target, replacement) {
            return this.split(target).join(replacement);
    };

      email_templates_subj= req.body.email_subj.replaceAll("^","");
      email_template_body= req.body.email_body.replaceAll("^","");
        
        console.log('subj--'+email_templates_subj);
        console.log('body--'+email_template_body);

    db.admin_infos.findAndModify({
            query: {
                '_id': mongojs.ObjectId(req.body.admin_id)
            },
            update: {
                $push: {
                    'email_template':
                        {   
                            '_id':mongojs.ObjectId(),
                            'email_type': req.body.email_type,
                            'email_subj': email_templates_subj,
                            'email_body': email_template_body,
                        
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

            console.log(data);
            res.status(200).send(data);
        });

    });


    router

.post('/fetch-email-template-by-type', function(req, res, next) {



    //console.log(req.body);
          db.admin_infos.find(
              {'email_template.email_type':req.body.temp_view_id},
              {email_template:1,_id:0}
             ,
            function(err, template) {

                var count=0;
                if (err) {
                    res.status(404);
                    res.send('info not found');
                } else {

                   
                    if(template.length>0){

                    for(var i=0;i<template[0].email_template.length;i++){

                        if(template[0].email_template[i].email_type==req.body.temp_view_id){
                                  res.status(200).send(template[0].email_template[i]);
                                  count++;
                                  break;
                        }
                    }
                    }
                    if(count<1){

                         res.send({'status':'no data found'});
                    }
                   
                //    if(template[0].sms_template);
                    // console.log(template[0].sms_template.length);
                  
                }
            });
});
module.exports = router;