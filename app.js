const express = require('express');
const bodyParser = require('body-parser');
const sql2 = require('mysql2')
const multer = require('multer');

const app = express()

const connection = sql2.createConnection({
    //host: 'localhost', user:'root', password: '', database:'c237_electronicstoreapp', port: 3316
    host: 'alwaysdata.com', user:'shiftlock', password: 'mquH_bTYzBy2CUY', database: 'shiftlock_website_proj'
})

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({storage: storage});


app.use(bodyParser.urlencoded({'extended': true}));

app.set('view engine', 'ejs')

app.use(express.static('public'));

app.use(express.urlencoded({extended: false}))



const PORT = 3000

/*Routes for Web application */
app.get('/', (req, res)=> {
    res.render('home')
})

app.get('/signup', (req, res)=> {
    res.render('signUp')
})

app.post('/register', (req, res)=> {
    const {userName, Address, email, contactNo, creditCardNo, image} = req.body;
    const sql = 'INSERT INTO user (userName, Address, email, contactNo, creditCardInfo, image) VALUES (?, ?, ?, ?, ?, ?)';

    connection.query(sql, [userName, Address, email, contactNo, creditCardNo, image], (error, results)=>{
        if (error) {
            console.error('Error Registering User:', error.message);
            res.status(500).send('Error Adding User');}
        else {res.redirect('/index');}
    });
});


app.get('/login', (req, res)=> {
    const sql = 'SELECT userName, image, email FROM user'

    connection.query(sql, (error, results) => {
    if (error) {
        console.error('Database query error', error.message);
        return res.status(500).send('Error retrieving details')
        }
    res.render('accounts', {users: results});
    });

})

app.get("/staffPage", (req, res)=> {
    res.render('staff')
})

app.get('/managePage', (req, res)=> {
    const sql = 'SELECT * FROM products'

    connection.query(sql, (error, results) => {
    if (error) {
        console.error('Database query error', error.message);
        return res.status(500).send('Error retrieving products')
        }
    res.render('manage', {products: results});
    });
});

app.get('/index', (req, res)=> {
    const sql = 'SELECT * FROM products'

    connection.query(sql, (error, results) => {
    if (error) {
        console.error('Database query error', error.message);
        return res.status(500).send('Error retrieving products')
        }
    res.render('index', {products: results});
    });
});

app.get('/viewProduct/:id', (req,res)=> {
    const productID = req.params.id;
    const sql = 'SELECT * FROM products WHERE productId = ?'

    connection.query(sql, [productID], (error, results) => {
        if (error) {
            console.error('Database query error', error.message);
            return res.status(500).send('Error retrieving product by ID');}
            
        if (results.length > 0) {
            res.render('viewProduct', {product: results[0]});
        }    
        
        else {
            res.status(404).send('product not found');
        }
    });
});

app.get('/addProduct', (req, res)=> {
    res.render('addProduct');
});


app.post('/product', (req, res)=> {
    const {productName, productDescription, quantity, productPrice, image} = req.body;
    const sql = 'INSERT INTO products (productName, productDescription, quantity, productPrice, image) VALUES (?, ?, ?, ?, ?)';

    connection.query(sql, [productName, productDescription, quantity, productPrice, image], (error, results)=>{
        if (error) {
            console.error('Error adding product:', error.message);
            res.status(500).send('Error adding product');}
        else {res.redirect('/index');}

    });
});

app.get('/editProduct/:id', (req, res) => {
    const productID = req.params.id;
    const sql = 'SELECT * FROM products where productID = ?';
    connection.query(sql, [productID], (error, results)=> {
        if (error) {
            console.error('Database query error', error.message);
            return res.status(500).send('Error retrieveing product');}
        if (results.length > 0) {
            res.render('editProduct', {product: results[0]});}
        else {
            res.status(400).send('Product Not Found')}
    })
})

app.post('/editProduct/:id', (req, res) => {
    const productId = req.params.id;
    const {productName, quantity, Description, price, image} = req.body;
    const sql = 'UPDATE products SET productName = ?, quantity = ?, productDescription = ?, productPrice = ?, image = ? WHERE productId = ?';
     connection.query(sql, [productName, quantity, Description, price, image, productId], (error, result)=> {
        if (error) {
            console.error('Error updating product', error);
            res.status(500).send('Error updating product');
        }

        else {
            res.redirect('/index');
        }
     });
});

app.get('/deleteProduct/:id', (req, res) => {
    const productId = req.params.id;
    const sql = 'DELETE FROM products WHERE productId = ?';
    connection.query(sql, [productId], (error, results)=> {
        if (error) {
            console.error("Error occured while deleting Product", error);
            res.status(500).send("Error occured while deleting Product")
        }
        else {
            res.redirect('/index');
        }
    })
})

app.get('/cartlist', (req, res)=> {
    const sql = 'SELECT * FROM cart'

    connection.query(sql, (error, results) => {
    if (error) {
        console.error('Database query error', error.message);
        return res.status(500).send('Error retrieving products')
        }
    res.render('cartlist', {cartItems: results});
    });
})

app.get('/addtocart/:id', (req, res)=> {
    const productID = req.params.id;
    const sql = 'SELECT productName, productPrice, image FROM products where productID = ?';
    connection.query(sql, [productID], (error, results)=> {
        if (error) {
            console.error('Database query error', error.message);
            return res.status(500).send('Error retrieving product');}
        if (results.length > 0) {
            res.render('addtocart', {product: results[0]});}
        else {
            res.status(400).send('Product Not Found')}
    })
    
})

app.post('/cart', (req, res)=>{
    const {productName, productPrice, quantity, image} = req.body;
    const sql = 'INSERT INTO cart (productName, productPrice, quantity, image) VALUES (?, ?, ?, ?)';

    connection.query(sql, [productName, productPrice,  quantity, image], (error, results)=>{
        if (error) {
            console.error('Error adding product to cart:', error.message);
            res.status(500).send('Error adding product');}
        else {res.redirect('/index');}

    });
});

app.get('/editCartItem/:id', (req, res) => {
    const itemID = req.params.id
    const sql = 'SELECT * FROM cart where itemID = ?';
    connection.query(sql, [itemID], (error, results)=> {
        if (error) {
            console.error('Database query error', error.message);
            return res.status(500).send('Error retrieveing product');}
        if (results.length > 0) {
            res.render('editcart', {cartItem: results[0]});}
        else {
            res.status(400).send('Product Not Found')}
    })
});

app.post('/editCartItem/:id', (req, res)=>{
    const itemID = req.params.id;
    const {productName, quantity, productPrice, image} = req.body;
    const sql = 'UPDATE cart SET productName = ?, quantity = ?, productPrice = ?, image = ? WHERE itemID = ?';
     connection.query(sql, [productName, quantity, productPrice, image, itemID], (error, result)=> {
        if (error) {
            console.error('Error updating product', error);
            res.status(500).send('Error updating product');
        }

        else {
            res.redirect('/cartlist');
        }
     });
});

app.get('/deletecartItem/:id', (req, res) => {
    const itemID = req.params.id;
    const sql = 'DELETE FROM cart WHERE itemID = ?';
    connection.query(sql, [itemID], (error, results)=> {
        if (error) {
            console.error("Error occured while deleting item in cart", error);
            res.status(500).send("Error occured while deleting item")
        }
        else {
            res.redirect('/cartlist');
        }
    })
})
/*Extra routes for handling images*/

app.post('/signup', upload.single('image'), (req, res)=> {
    const {userName, Address, email, contactNo, creditCardNo} = req.body;
    let image;
    if (req.file) {
        image = req.file.filename;
    }
    else {
        image = null;
    }
    const sql = 'INSERT INTO user (userName, Address, email, contactNo, creditCardInfo, image) VALUES (?, ?, ?, ?, ?, ?)';

    connection.query(sql, [userName, Address, email, contactNo, creditCardNo, image], (error, results)=>{
        if (error) {
            console.error('Error Registering User:', error.message);
            res.status(500).send('Error Adding User');}
        else {res.redirect('/index');}
    });
});

app.post('/addProduct', upload.single('image'), (req, res)=> {
    const {productName, productDescription, quantity, productPrice} = req.body;
    let image;
    if (req.file) {
        image = req.file.filename;
    }
    else {
        image = null;
    }
    const sql = 'INSERT INTO products (productName, productDescription, quantity, productPrice, image) VALUES (?, ?, ?, ?, ?)';

    connection.query(sql, [productName, productDescription, quantity, productPrice, image], (error, results)=>{
        if (error) {
            console.error('Error adding product:', error.message);
            res.status(500).send('Error adding product');}
        else {res.redirect('/index');}

    });
});

app.post('/editProduct/:id', upload.single('image'), (req, res) => {
    const productId = req.params.id;
    const {productName, quantity, Description, price} = req.body;
    let image;
    if (req.file) {
        image = req.file.filename;
    }
    else {
        image = null;
    }
    const sql = 'UPDATE products SET productName = ?, quantity = ?, productDescription = ?, productPrice = ?, image = ? WHERE productId = ?';
     connection.query(sql, [productName, quantity, Description, price, image, productId], (error, result)=> {
        if (error) {
            console.error('Error updating product', error);
            res.status(500).send('Error updating product');
        }

        else {
            res.redirect('/index');
        }
     });
});

app.post('/addtocart', upload.single('image'),(req, res)=>{
    const {productName, productPrice, quantity} = req.body;
    let image;
    if (req.file) {
        image = req.file.filename;
    }
    else {
        image = null;
    }
    const sql = 'INSERT INTO cart (productName, productPrice, quantity, image) VALUES (?, ?, ?, ?)';

    connection.query(sql, [productName, productPrice,  quantity, image], (error, results)=>{
        if (error) {
            console.error('Error adding product to cart:', error.message);
            res.status(500).send('Error adding product');}
        else {res.redirect('/index');}

    });
});

app.post('/editCartItem/:id', upload.single('image'), (req, res)=>{
    const itemID = req.params.id;
    const {productName, quantity, productPrice} = req.body;
    if (req.file) {
        image = req.file.filename;
    }
    else {
        image = null;
    }
    const sql = 'UPDATE cart SET productName = ?, quantity = ?, productPrice = ?, image = ? WHERE productId = ?';
     connection.query(sql, [productName, quantity, productPrice, image, itemID], (error, result)=> {
        if (error) {
            console.error('Error updating product', error);
            res.status(500).send('Error updating product');
        }

        else {
            res.redirect('/cartlist');
        }
     });
});
app.listen(PORT, ()=> {console.log(`Server is running at http://localhost:${PORT}/`)})