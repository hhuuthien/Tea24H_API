const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const cors = require('cors')({ origin: true });

const firebaseConfig = {
    apiKey: "AIzaSyA7Qn7AWRZyr_VEzeoDej2nG1hQPbk5in4",
    authDomain: "tea24hstore.firebaseapp.com",
    databaseURL: "https://tea24hstore.firebaseio.com",
    projectId: "tea24hstore",
    storageBucket: "tea24hstore.appspot.com",
    messagingSenderId: "468573818462",
    appId: "1:468573818462:web:c10553668aa73cd18b2ecf",
    measurementId: "G-ECB2WKW04W"
};

admin.initializeApp(firebaseConfig);
var db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true })

///////////////////////////
// ADMIN
///////////////////////////

exports.registerNewAdmin = functions.https.onRequest((request, response) => {
    if (request.body.uid !== 'utZL1mPAMyNiDMo5X7dfap0k9ur2') {
        response.json({ "error": "Invalid UID" });
        return 0;
    }
    if (!(request.body.email) || !(request.body.password)) {
        response.json({ "error": "Invalid Value" });
        return 0;
    }
    admin.auth().createUser({
        email: request.body.email,
        password: request.body.password
    }).then(function (userRecord) {
        //update in firestore
        let data = {
            email: userRecord.email,
            adminName: request.body.name,
            password: request.body.password,
            uid: userRecord.uid
        };
        let setData = db.collection('admins').doc(userRecord.uid).set(data)
            .then(function () {
                response.json(userRecord);
                return 1
            })
            .catch(function (error) {
                response.json({ "error": error.message });
                return 1;
            });
        return 1;
    }).catch(function (error) {
        response.json({ "error": error.message });
        return 1;
    });
    return 1;
});

exports.updateAdminName = functions.https.onRequest((request, response) => {
    if (request.body.uid !== 'utZL1mPAMyNiDMo5X7dfap0k9ur2') {
        response.json({ "error": "Invalid UID" });
        return 0;
    }
    const adminid = request.body.adminid;
    let userRef = db.collection('admins').doc(adminid);
    let data = {
        adminName: request.body.name
    };
    let updateData = userRef.update(data)
        .then(function (doc) {
            response.json({ "OK": "Cập nhật thành công" });
            return 1;
        })
        .catch(function (error) {
            response.json({ "error": error.message });
            return 1;
        });
});

exports.getAllAdmin = functions.https.onRequest((request, response) => {
    if (request.body.uid !== 'utZL1mPAMyNiDMo5X7dfap0k9ur2') {
        response.json({ "error": "Invalid UID" });
        return 0;
    }
    let ref = db.collection('admins');
    let get = ref.get()
        .then(function (snapshot) {
            if (snapshot.empty) {
                response.json({ "error": "No admin found" });
            } else {
                var list = [];
                snapshot.forEach(doc => {
                    list.push(doc.data())
                });
                response.json(list);
            }
            return 1;
        })
        .catch(function (error) {
            response.json({ "error": error.message });
            return 1;
        });
});

exports.updateAdminPassword = functions.https.onRequest((request, response) => {
    if (request.body.uid !== 'utZL1mPAMyNiDMo5X7dfap0k9ur2') {
        response.json({ "error": "Invalid UID" });
        return 0;
    }
    const adminid = request.body.adminid;
    let userRef = db.collection('admins').doc(adminid);
    let data = {
        password: request.body.password
    };
    let updateData = userRef.update(data)
        .then(function (doc) {
            response.json({ "OK": "Cập nhật thành công" });
            admin.auth().updateUser(adminid, {
                password: request.body.password,
            })
            return 1;
        })
        .catch(function (error) {
            response.json({ "error": error.message });
            return 1;
        });
});

exports.getAdminData = functions.https.onRequest((request, response) => {
    if (request.body.uid !== 'utZL1mPAMyNiDMo5X7dfap0k9ur2') {
        response.json({ "error": "Invalid UID" });
        return 0;
    }
    const adminid = request.body.adminid;
    let userRef = db.collection('admins').doc(adminid);
    let get = userRef.get()
        .then(function (doc) {
            if (!doc.exists) {
                response.json({ "error": "User Not Found" });
            } else {
                response.json(doc.data());
            }
            return 1;
        })
        .catch(function (error) {
            response.json({ "error": error.message });
            return 1;
        });
});

exports.deleteAdmin = functions.https.onRequest((request, response) => {
    if (request.body.uid !== 'utZL1mPAMyNiDMo5X7dfap0k9ur2') {
        response.json({ "error": "Invalid UID" });
        return 0;
    }
    admin.auth().deleteUser(request.body.adminid)
        .then(function () {
            //update in firestore
            let setData = db.collection('admins').doc(request.body.adminid).delete()
                .then(function () {
                    response.json({ "OK": "Xoá thành công" });
                    return 1;
                })
                .catch(function (error) {
                    response.json({ "error": error.message });
                    return 1;
                });
            return 1;
        })
        .catch(function (error) {
            response.json({ "error": error.message });
            return 1;
        });
    return 1;
});

///////////////////////////
// USER
///////////////////////////

exports.registerNewUser = functions.https.onRequest((request, response) => {
    if (!(request.body.email) || !(request.body.password) || !(request.body.userName)) {
        response.json({ "error": "Invalid Value" })
        return 0
    }
    admin.auth().createUser({
        email: request.body.email,
        password: request.body.password,
        displayName: request.body.userName
    }).then(function (userRecord) {
        //update in firestore
        let data = {
            email: userRecord.email,
            userName: userRecord.displayName,
            phone: null,
            sex: null,
            dateOfBirth: null,
            address: request.body.address,
            uid: userRecord.uid,
            promotion: []
        };
        let setData = db.collection('users').doc(userRecord.uid).set(data)
            .then(function () {
                response.json(userRecord)
                return 1
            })
            .catch(function (error) {
                response.json({ "error": error.message })
                return 1
            })
        return 1
    }).catch(function (error) {
        response.json({ "error": error.message })
        return 1
    });
    return 1
});

exports.getUserData = functions.https.onRequest((request, response) => {
    const uid = request.body.uid;
    let userRef = db.collection('users').doc(uid);
    let get = userRef.get()
        .then(function (doc) {
            if (!doc.exists) {
                response.json({ "error": "User Not Found" });
            } else {
                response.json(doc.data());
            }
            return 1;
        })
        .catch(function (error) {
            response.json({ "error": error.message });
            return 1;
        });
});

exports.updateUserData = functions.https.onRequest((request, response) => {
    const uid = request.body.uid

    let userRef = db.collection('users').doc(uid)

    let data = {
        userName: request.body.userName,
        phone: request.body.phone,
        sex: request.body.sex,
        dateOfBirth: request.body.dateOfBirth,
        address: request.body.address
    }

    userRef.update(data)
        .then(function () {
            response.json({ "OK": "Cập nhật thành công" })
            return 1
        })
        .catch(function (error) {
            response.json({ "error": error.message })
            return 1
        })
})

exports.getAllUser = functions.https.onRequest((request, response) => {
    let ref = db.collection('users');
    let get = ref.get()
        .then(function (snapshot) {
            if (snapshot.empty) {
                response.json({ "error": "No user found" });
            } else {
                var list = [];
                snapshot.forEach(doc => {
                    list.push(doc.data())
                });
                response.json(list);
            }
            return 1;
        })
        .catch(function (error) {
            response.json({ "error": error.message });
            return 1;
        });
});

exports.deleteUser = functions.https.onRequest((request, response) => {
    admin.auth().deleteUser(request.body.uid)
        .then(function () {
            //update in firestore
            let ref = db.collection('users').doc(request.body.uid).delete()
                .then(function () {
                    response.json({ "OK": "Xoá thành công" });
                    return 1;
                })
                .catch(function (error) {
                    response.json({ "error": error.message });
                    return 1;
                });
            return 1;
        })
        .catch(function (error) {
            response.json({ "error": error.message });
            return 1;
        });
    return 1;
});

///////////////////////////
// CATEGORY
///////////////////////////

exports.createCategory = functions.https.onRequest((request, response) => {
    let ref = db.collection('category');
    let get = ref.get()
        .then(function (snapshot) {
            var list = [];
            snapshot.forEach(doc => {
                list.push(doc.data().id)
            });
            var newID = request.body.id
            var exist = false
            list.forEach(item => {
                if (newID === item) {
                    exist = true
                    return
                }
            });
            if (exist === true) {
                response.json({ "status": "error", "message": "ID đã tồn tại" });
                return 1;
            } else {
                let newCategory = {
                    id: newID,
                    name: request.body.name
                }
                let ref2 = db.collection('category').doc(newID).set(newCategory)
                    .then(function () {
                        response.json({ "status": "ok", "message": "Tạo category thành công" });
                        return 1;
                    })
                    .catch(function (error) {
                        response.json({ "status": "error", "message": error.message });
                        return 1;
                    });
                return 1;
            }
        })
        .catch(function (error) {
            response.json({ "status": "error", "message": error.message });
            return 1;
        });
});

exports.getAllCategory = functions.https.onRequest((request, response) => {
    let ref = db.collection('category');
    let get = ref.get()
        .then(function (snapshot) {
            var list = [];
            snapshot.forEach(doc => {
                list.push(doc.data())
            });
            response.json({ "status": "ok", "total_results": list.length.toString(), "data": list });
            return 1;
        })
        .catch(function (error) {
            response.json({ "status": "error", "message": error.message });
            return 1;
        });
});

exports.updateCategory = functions.https.onRequest((request, response) => {
    var mId = request.body.id
    var mName = request.body.name
    let category = {
        id: mId,
        name: mName
    }
    db.collection('category').doc(mId).update(category)
        .then(function () {
            response.json({ "status": "ok", "message": "Cập nhật thành công" });
            return 1
        })
        .catch(function (error) {
            response.json({ "status": "error", "message": error.message });
            return 1;
        });
});

exports.deleteCategory = functions.https.onRequest((request, response) => {
    var id = request.body.id
    let ref = db.collection('product').get()
        .then(function (snapshot) {
            var list = [];
            snapshot.forEach(doc => {
                list.push(doc.data().category)
            });
            var hasProduct = false
            list.forEach(item => {
                if (id === item) {
                    hasProduct = true
                    return;
                }
            });
            if (hasProduct === true) {
                response.json({ "status": "error", "message": "Không thể xoá category khi còn sản phẩm" });
                return 1;
            } else {
                let ref = db.collection('category').doc(id).delete()
                    .then(function () {
                        response.json({ "status": "ok", "message": "Xoá thành công" });
                        return 1
                    })
                    .catch(function (error) {
                        response.json({ "status": "error", "message": error.message });
                        return 1;
                    });
            }
            return 1;
        })
        .catch(function (error) {
            response.json({ "status": "error", "message": error.message });
            return 1;
        });
});

///////////////////////////
// PRODUCT
///////////////////////////

exports.createProduct = functions.https.onRequest((request, response) => {
    let ref = db.collection('product').get()
        .then(function (snapshot) {
            var list = [];
            snapshot.forEach(doc => {
                list.push(doc.data().id)
            });
            var newID = request.body.id
            var exist = false
            list.forEach(item => {
                if (newID === item) {
                    exist = true
                    return
                }
            });
            if (exist === true) {
                response.json({ "status": "error", "message": "ID đã tồn tại" });
                return 1;
            } else {
                let newProduct = {
                    bestselling: request.body.bestselling,
                    category: request.body.category,
                    description: request.body.description,
                    id: newID,
                    image: request.body.image,
                    name: request.body.name,
                    price: request.body.price
                }
                let ref2 = db.collection('product').doc(newID).set(newProduct)
                    .then(function () {
                        response.json({ "status": "ok", "message": "Tạo sản phẩm thành công" });
                        return 1;
                    })
                    .catch(function (error) {
                        response.json({ "status": "error", "message": error.message });
                        return 1;
                    });
                return 1;
            }
        })
        .catch(function (error) {
            response.json({ "status": "error", "message": error.message });
            return 1;
        });
});

exports.getProduct = functions.https.onRequest((request, response) => {
    let ref = db.collection('product').get()
        .then(function (snapshot) {
            var list = [];
            snapshot.forEach(doc => {
                list.push(doc.data().id)
            });
            var mID = request.body.id
            var exist = false
            list.forEach(item => {
                if (mID === item) {
                    exist = true
                    return
                }
            });
            if (exist === false) {
                response.json({ "status": "error", "message": "ID không tồn tại" });
                return 1;
            } else {
                let ref = db.collection('product').doc(mID).get()
                    .then(function (doc) {
                        response.json({ "status": "ok", "data": doc.data() });
                        return 1;
                    })
                    .catch(function (error) {
                        response.json({ "status": "error", "message": error.message });
                        return 1;
                    });
                return 1;
            }
        })
        .catch(function (error) {
            response.json({ "status": "error", "message": error.message });
            return 1;
        });
});

exports.updateProduct = functions.https.onRequest((request, response) => {
    let ref = db.collection('product').get()
        .then(function (snapshot) {
            var list = [];
            snapshot.forEach(doc => {
                list.push(doc.data().id)
            });
            var newID = request.body.id
            var exist = false
            list.forEach(item => {
                if (newID === item) {
                    exist = true
                    return
                }
            });
            if (exist === false) {
                response.json({ "status": "error", "message": "ID không tồn tại" });
                return 1;
            } else {
                let product = {
                    bestselling: request.body.bestselling,
                    description: request.body.description,
                    image: request.body.image,
                    name: request.body.name,
                    price: request.body.price
                }
                let ref2 = db.collection('product').doc(newID).update(product)
                    .then(function () {
                        response.json({ "status": "ok", "message": "Cập nhật sản phẩm thành công" });
                        return 1;
                    })
                    .catch(function (error) {
                        response.json({ "status": "error", "message": error.message });
                        return 1;
                    });
                return 1;
            }
        })
        .catch(function (error) {
            response.json({ "status": "error", "message": error.message });
            return 1;
        });
});

exports.getByCategory = functions.https.onRequest((request, response) => {
    var catID = request.body.id
    var quantity = parseInt(request.body.quantity)
    let ref = db.collection('product').where('category', '=', catID).limit(quantity).get()
        .then(function (snapshot) {
            var list = [];
            snapshot.forEach(doc => {
                list.push(doc.data())
            });
            response.json({ "status": "ok", "total_results": list.length.toString(), "data": list });
            return 1;
        })
        .catch(function (error) {
            response.json({ "status": "error", "message": error.message });
            return 1;
        });
});

exports.deleteProduct = functions.https.onRequest((request, response) => {
    let ref = db.collection('product').doc(request.body.id).delete()
        .then(function () {
            response.json({ "status": "ok", "message": "Xoá thành công" });
            return 1;
        })
        .catch(function (error) {
            response.json({ "status": "error", "message": error.message });
            return 1;
        });
});

exports.getAllProduct = functions.https.onRequest((request, response) => {
    let ref = db.collection('product').get()
        .then(function (snapshot) {
            var list = [];
            snapshot.forEach(doc => {
                list.push(doc.data())
            });
            response.json({ "status": "ok", "total_results": list.length.toString(), "data": list });
            return 1;
        })
        .catch(function (error) {
            response.json({ "status": "error", "message": error.message });
            return 1;
        });
});

exports.getBestSelling = functions.https.onRequest((request, response) => {
    let ref = db.collection('product').get()
        .then(function (snapshot) {
            var list = [];
            snapshot.forEach(doc => {
                if (doc.data().bestselling === "1") {
                    list.push(doc.data())
                }
            });
            response.json({ "status": "ok", "total_results": list.length.toString(), "data": list });
            return 1;
        })
        .catch(function (error) {
            response.json({ "status": "error", "message": error.message });
            return 1;
        });
});

///////////////////////////
// CART2
///////////////////////////

exports.addToCart2 = functions.https.onRequest((request, response) => {
    var uid = request.body.uid
    var productId = request.body.productId

    let ref = db.collection('users').doc(uid).collection('cart').doc(productId).get()
        .then(function (doc) {
            if (!doc.exists) {
                //Chua co san pham trong gio hang --> add
                let ref = db.collection('product').doc(productId).get()
                    .then(function (doc) {
                        let newProductInCart = {
                            productId: request.body.productId,
                            quantity: request.body.quantity,
                            //thong tin san pham
                            name: doc.data().name,
                            bestselling: doc.data().bestselling,
                            category: doc.data().category,
                            description: doc.data().description,
                            image: doc.data().image,
                            price: doc.data().price
                        }
                        let ref = db.collection('users').doc(uid).collection('cart').doc(productId).set(newProductInCart)
                            .then(function () {
                                response.json({ "status": "ok", "message": "Đã thêm vào giỏ hàng" });
                                return 1;
                            })
                            .catch(function (error) {
                                response.json({ "status": "error", "message": error.message });
                                return 1;
                            });
                        return 1;
                    })
                    .catch(function (error) {
                        response.json({ "status": "error", "message": error.message });
                        return 1;
                    });
            } else {
                //San pham da co --> Cap nhat so luong
                var data = doc.data().quantity
                var newQuantity = parseInt(data) + parseInt(request.body.quantity)

                let ref = db.collection('product').doc(productId).get()
                    .then(function (doc) {
                        let newProductInCart = {
                            productId: request.body.productId,
                            quantity: newQuantity.toString(),
                            //thong tin san pham
                            name: doc.data().name,
                            bestselling: doc.data().bestselling,
                            category: doc.data().category,
                            description: doc.data().description,
                            image: doc.data().image,
                            price: doc.data().price
                        }
                        let ref = db.collection('users').doc(uid).collection('cart').doc(productId).update(newProductInCart)
                            .then(function () {
                                response.json({ "status": "ok", "message": "Đã thêm vào giỏ hàng" });
                                return 1;
                            })
                            .catch(function (error) {
                                response.json({ "status": "error", "message": error.message });
                                return 1;
                            });
                        return 1;
                    })
                    .catch(function (error) {
                        response.json({ "status": "error", "message": error.message });
                        return 1;
                    });
            }
            return 1;
        })
        .catch(function (error) {
            response.json({ "status": "error", "message": error.message });
            return 1;
        });
});

exports.getCart2 = functions.https.onRequest((request, response) => {
    var uid = request.body.uid

    let ref = db.collection('users').doc(uid).collection('cart').get()
        .then(function (snapshot) {
            var list = []
            var totalPrice = 0
            snapshot.forEach(doc => {
                list.push(doc.data())
                var price = parseInt(doc.data().price)
                var sl = parseInt(doc.data().quantity)
                totalPrice += (price * sl)
            });
            response.json({ "status": "ok", "total_results": list.length.toString(), "total_price": totalPrice.toString(), "data": list });
            return 1;
        })
        .catch(function (error) {
            response.json({ "status": "error", "message": error.message });
            return 1;
        });
});

exports.editCart2 = functions.https.onRequest((request, response) => {
    var uid = request.body.uid
    var productId = request.body.productId
    var newQuantity = request.body.quantity

    if (parseInt(newQuantity) === 0) {
        //xoa
        let ref = db.collection('users').doc(uid).collection('cart').doc(productId).delete()
            .then(function () {
                response.json({ "status": "ok", "message": "Đã xoá khỏi giỏ hàng" });
                return 1;
            })
            .catch(function (error) {
                response.json({ "status": "error", "message": error.message });
                return 1;
            });
    } else {
        //update
        let newProductToUpdate = {
            quantity: newQuantity
        }

        let ref = db.collection('users').doc(uid).collection('cart').doc(productId).update(newProductToUpdate)
            .then(function () {
                response.json({ "status": "ok", "message": "Đã thay đổi số lượng" });
                return 1;
            })
            .catch(function (error) {
                response.json({ "status": "error", "message": error.message });
                return 1;
            });
    }
    return 1
});

///////////////////////////
// PROMOTION
///////////////////////////

exports.createPromotion = functions.https.onRequest((request, response) => {
    let r = db.collection('promotion').get()
        .then(function (snapshot) {
            var list = [];
            snapshot.forEach(doc => {
                list.push(doc.data().id)
            });
            var newID = request.body.id
            var exist = false
            list.forEach(item => {
                if (newID === item) {
                    exist = true
                    return
                }
            });
            if (exist === true) {
                response.json({ "status": "error", "message": "ID đã tồn tại" });
                return 1;
            } else {
                let newPromotion = {
                    id: request.body.id,
                    name: request.body.name,
                    startTime: request.body.startTime,
                    endTime: request.body.endTime,
                    code: request.body.code,
                    image: request.body.image,
                    user: request.body.user,
                    discount: request.body.discount
                }
                let ref = db.collection('promotion').doc(request.body.id).set(newPromotion)
                    .then(function () {
                        // update for all users
                        let ref2 = db.collection('users').get()
                            .then(function (snapshot) {
                                snapshot.forEach(function (doc) {
                                    var oldPromotion = doc.data().promotion
                                    oldPromotion.push(request.body.id)
                                    doc.ref.update({
                                        promotion: oldPromotion
                                    })
                                })
                                return 1
                            })
                        response.json({ "status": "ok", "message": "Tạo khuyến mãi thành công" })
                        return 1
                    })
                    .catch(function (error) {
                        response.json({ "status": "error", "message": error.message })
                        return 1
                    })
                return 1
            }
        })
        .catch(function (error) {
            response.json({ "status": "error", "message": error.message });
            return 1;
        });
})

exports.getPromotionForUser = functions.https.onRequest((request, response) => {
    var listOfUserPromo = [] //tat ca promo user dang co
    var list = []
    var uid = request.body.uid

    let ref = db.collection('users').doc(uid).get()
        .then(function (doc) {
            listOfUserPromo = doc.data().promotion
            let ref2 = db.collection('promotion').get()
                .then(function (snapshot) {
                    snapshot.forEach(doc => {
                        var start = parseInt(doc.data().startTime)
                        var end = parseInt(doc.data().endTime)
                        var now = Date.now()
                        if (now > start && now < end && listOfUserPromo.includes(doc.data().id)) {
                            //kiem tra khuyen mai con thoi gian, va co trong danh sach km của user
                            let newPromotion = {
                                id: doc.data().id,
                                name: doc.data().name,
                                startTime: doc.data().startTime,
                                endTime: doc.data().endTime,
                                code: doc.data().code,
                                image: doc.data().image,
                                user: doc.data().user,
                                discount: doc.data().discount
                            }
                            list.push(newPromotion)
                        }
                    });
                    response.json({ "status": "ok", "message": list })
                    return 1
                })
            return 1
        })
        .catch(function (error) {
            response.json({ "status": "error", "message": error.message });
            return 1;
        });
})

exports.editPromotion = functions.https.onRequest((request, response) => {
    var promoID = request.body.id

    let promotion = {
        name: request.body.name,
        code: request.body.code,
        image: request.body.image,
        discount: request.body.discount
    }

    let ref = db.collection('promotion').doc(promoID).update(promotion)
        .then(function () {
            response.json({ "status": "ok", "message": "Cập nhật thành công" })
            return 1
        })
        .catch(function (error) {
            response.json({ "status": "error", "message": error.message })
            return 1
        })
})

exports.getPromotion = functions.https.onRequest((request, response) => {
    var promoID = request.body.id

    let ref = db.collection('promotion').doc(promoID).get()
        .then(function (doc) {
            response.json(doc.data())
            return 1
        })
        .catch(function (error) {
            response.json({ "status": "error", "message": error.message })
            return 1
        })
})

exports.getAllPromotion = functions.https.onRequest((request, response) => {
    var mode = request.body.mode
    var list = []

    let ref = db.collection('promotion').get()
        .then(function (snapshot) {
            if (mode === 1 || mode === "1") {
                snapshot.forEach(doc => {
                    list.push(doc.data())
                });
                response.json({ "status": "ok", "total_results": list.length.toString(), "message": list })
                return 1
            } else if (mode === 2 || mode === "2") {
                snapshot.forEach(doc => {
                    var start = parseInt(doc.data().startTime)
                    var end = parseInt(doc.data().endTime)
                    var now = Date.now()
                    if (now > start && now < end) {
                        list.push(doc.data())
                    }
                });
                response.json({ "status": "ok", "total_results": list.length.toString(), "message": list })
                return 1
            } else {
                response.json({ "status": "error", "message": "Invalid mode" })
                return 1
            }
        })
        .catch(function (error) {
            response.json({ "status": "error", "message": error.message })
            return 1
        })
})

exports.deletePromotion = functions.https.onRequest((request, response) => {
    var promoID = request.body.id

    let ref = db.collection('promotion').doc(promoID).delete()
        .then(function () {
            let ref2 = db.collection('users').get()
                .then(function (snapshot) {
                    snapshot.forEach(function (doc) {
                        var oldPromotion = doc.data().promotion
                        var i = oldPromotion.indexOf(promoID)
                        console.log(oldPromotion)
                        if (i >= 0) oldPromotion.splice(i, 1)
                        console.log(oldPromotion)
                        doc.ref.update({
                            promotion: oldPromotion
                        })
                    })
                    response.json({ "status": "ok", "message": "Xoá thành công" })
                    return 1
                })
            return 1
        })
        .catch(function (error) {
            response.json({ "status": "error", "message": error.message })
            return 1
        })
})

exports.sendMail = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'tea24hstore@gmail.com',
                pass: '1q2w3e4r5t6y7u.'
            }
        })

        // const subject = request.body.subject
        // const content = request.body.content

        var listDestination = []
        db.collection('users').get()
            .then(function (snapshot) {
                // user co khuyen mai (du chi 1)
                snapshot.forEach(doc => {
                    if (doc.data().promotion.length > 0) {
                        listDestination.push(doc.data().email)
                    }
                })
                var list = listDestination.toString()

                const mailOptions = {
                    from: 'Tea24H <tea24hstore@gmail.com>',
                    to: list,
                    subject: 'Khuyến mãi',
                    html: '<p>Ch&agrave;o bạn!</p><p>Bạn vừa nhận được khuyến m&atilde;i mới từ Tea24H.</p>'
                }

                return transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return response.json({ "status": "error", "message": error.toString() })
                    }
                    return response.json({ "status": "ok", "message": "Đã gửi email", "total_recipients": listDestination.length.toString(), "recipients": list })
                })
            })
            .catch(function (error) {
                response.json({ "status": "error", "message": error.message })
                return 1
            })
    })
})

///////////////////////////
// CART
///////////////////////////

exports.addCart = functions.https.onRequest((request, response) => {
    var uid = request.body.uid

    db.collection('users').doc(uid).get()
        //get thong tin user
        .then(function (doc) {
            var address = doc.data().address
            var email = doc.data().email
            var name = doc.data().userName
            var promo = doc.data().promotion
            var time = Date.now().toString()

            let c = {
                uid: request.body.uid,
                defaultAddress: address,
                email: email,
                name: name,
                time: time,
                productList: request.body.productList.split(","),
                quantityList: request.body.quantityList.split(","),
                priceList: request.body.priceList.split(","),
                address: request.body.address,
                totalPrice1: request.body.totalPrice1,
                totalPrice2: request.body.totalPrice2,
                promotion: request.body.promotion,
                status: request.body.status,
                id: time,
                discount: request.body.discount
            }

            db.collection('users').doc(uid).collection('cart').doc(time).set(c)
                .then(function () {
                    db.collection('cart').doc(time).set(c)
                        .then(function () {
                            //Kiểm tra đã dùng khuyến mãi chưa, nếu đã dùng thì xoá
                            if (promo.includes(request.body.promotion)) {
                                var i = promo.indexOf(request.body.promotion)
                                if (i >= 0) promo.splice(i, 1)
                                doc.ref.update({
                                    promotion: promo
                                })
                            }
                            response.json({ "status": "ok", "message": "Thành công" })
                            return 1
                        })
                        .catch(function (error) {
                            response.json({ "status": "error", "message": error.message })
                            return 1
                        })
                    return 1
                })
                .catch(function (error) {
                    response.json({ "status": "error", "message": error.message })
                    return 1
                })
            return 1
        })
        .catch(function (error) {
            response.json({ "status": "error", "message": error.message })
            return 1
        })
})

exports.getCart = functions.https.onRequest((request, response) => {
    var listProduct = [] //chua thong tin san pham
    var result = [] //tong hop: thong tin san pham, so luong, gia

    db.collection('cart').doc(request.body.id).get()
        .then(function (doc) {
            var productList = doc.data().productList
            var quantityList = doc.data().quantityList
            var priceList = doc.data().priceList

            var myList = [] //chua id, so luong, gia
            for (i = 0; i < productList.length; i++) {
                let temp = {
                    id: productList[i],
                    qu: quantityList[i],
                    pr: priceList[i]
                }
                myList.push(temp)
            }

            db.collection('product').get()
                .then(function (snapshot) {
                    snapshot.forEach(shot => {
                        if (productList.includes(shot.data().id)) {
                            let pro = {
                                name: shot.data().name,
                                description: shot.data().description,
                                id: shot.data().id,
                                category: shot.data().category,
                                image: shot.data().image
                            }
                            listProduct.push(pro)
                        }
                    })

                    listProduct.forEach(pro1 => {
                        myList.forEach(pro2 => {
                            if (pro1.id === pro2.id) {
                                let pro = {
                                    name: pro1.name,
                                    description: pro1.description,
                                    id: pro1.id,
                                    category: pro1.category,
                                    image: pro1.image,
                                    quantity: pro2.qu,
                                    price: pro2.pr
                                }
                                result.push(pro)
                            }
                        })
                    })

                    let cart = {
                        address: doc.data().address,
                        defaultAddress: doc.data().defaultAddress,
                        email: doc.data().email,
                        promotion: doc.data().promotion,
                        status: doc.data().status,
                        totalPrice1: doc.data().totalPrice1,
                        totalPrice2: doc.data().totalPrice2,
                        uid: doc.data().uid,
                        name: doc.data().name,
                        product: result,
                        time: doc.data().time,
                        id: doc.data().id,
                        discount: doc.data().discount
                    }

                    response.json(cart)
                    return 1
                })
                .catch(function (error) {
                    response.json({ "status": "error", "message": error.message })
                    return 1
                })
            return 1
        })
        .catch(function (error) {
            response.json({ "status": "error", "message": error.message })
            return 1
        })
})

exports.getCartUser = functions.https.onRequest((request, response) => {
    //get all carts of a user
    var uid = request.body.uid
    var list = [] //kết quả trả về
    var listProduct = [] //list sản phẩm

    db.collection('users').doc(uid).collection('cart').get()
        .then(function (snapshot) {
            db.collection('product').get()
                .then(function (productShot) {
                    productShot.forEach(product => {
                        listProduct.push(product.data())
                    })

                    snapshot.forEach(shot => {
                        var productList = shot.data().productList
                        var pName = []
                        productList.forEach(p1 => {
                            listProduct.forEach(p2 => {
                                if (p1 === p2.id) {
                                    pName.push(p2.name)
                                }
                            })
                        })

                        let c = {
                            uid: shot.data().uid,
                            defaultAddress: shot.data().defaultAddress,
                            email: shot.data().email,
                            name: shot.data().name,
                            time: shot.data().time,
                            productList: shot.data().productList,
                            quantityList: shot.data().quantityList,
                            priceList: shot.data().priceList,
                            address: shot.data().address,
                            totalPrice1: shot.data().totalPrice1,
                            totalPrice2: shot.data().totalPrice2,
                            promotion: shot.data().promotion,
                            status: shot.data().status,
                            id: shot.data().id,
                            discount: shot.data().discount,
                            nameList: pName
                        }

                        list.push(c)
                    })
                    response.json({
                        "status": "ok",
                        "total_results": list.length.toString(),
                        "data": list
                    })
                    return 1
                })
                .catch(function (error) {
                    response.json({ "status": "error", "message": error.message })
                    return 1
                })
            return 1
        })
        .catch(function (error) {
            response.json({ "status": "error", "message": error.message })
            return 1
        })
})

exports.getAllCart = functions.https.onRequest((request, response) => {
    var number = parseInt(request.body.number)
    var list = [] //kết quả trả về
    var listProduct = [] //list sản phẩm

    db.collection('cart').orderBy('time', 'desc').limit(number).get()
        .then(function (snapshot) {
            db.collection('product').get()
                .then(function (productShot) {
                    productShot.forEach(product => {
                        listProduct.push(product.data())
                    })

                    snapshot.forEach(shot => {
                        var productList = shot.data().productList
                        var pName = []
                        productList.forEach(p1 => {
                            listProduct.forEach(p2 => {
                                if (p1 === p2.id) {
                                    pName.push(p2.name)
                                }
                            })
                        })

                        let c = {
                            uid: shot.data().uid,
                            defaultAddress: shot.data().defaultAddress,
                            email: shot.data().email,
                            name: shot.data().name,
                            time: shot.data().time,
                            productList: shot.data().productList,
                            quantityList: shot.data().quantityList,
                            priceList: shot.data().priceList,
                            address: shot.data().address,
                            totalPrice1: shot.data().totalPrice1,
                            totalPrice2: shot.data().totalPrice2,
                            promotion: shot.data().promotion,
                            status: shot.data().status,
                            id: shot.data().id,
                            discount: shot.data().discount,
                            nameList: pName
                        }

                        list.push(c)
                    })
                    response.json({
                        "status": "ok",
                        "total_results": list.length.toString(),
                        "data": list
                    })
                    return 1
                })
                .catch(function (error) {
                    response.json({ "status": "error", "message": error.message })
                    return 1
                })
            return 1
        })
        .catch(function (error) {
            response.json({ "status": "error", "message": error.message })
            return 1
        })
})

exports.updateStatus = functions.https.onRequest((request, response) => {
    var status = request.body.status.toString()
    var uid = request.body.uid
    var id = request.body.id

    if (status === "1" || status === "2" || status === "3") {
        db.collection('users').doc(uid).collection('cart').doc(id).update({
            status: request.body.status.toString()
        })
            .then(function () {
                db.collection('cart').doc(id).update({
                    status: request.body.status.toString()
                })
                    .then(function () {
                        response.json({ "status": "ok", "message": "Cập nhật thành công" })
                        return 1
                    })
                    .catch(function (error) {
                        response.json({ "status": "error", "message": error.message })
                        return 1
                    })
                return 1
            })
            .catch(function (error) {
                response.json({ "status": "error", "message": error.message })
                return 1
            })
    } else {
        response.json({ "status": "error", "message": "Invalid status" })
        return 1
    }
})