const User = require('../models/usersModel');
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Register a New User
router.post('/register', async (req, res) => {
    try {

        //Check if the User Exist or Not
        const user = await User.findOne({ email : req.body.email });

        if(user) {
            return res.send({
                success: false,
                message: 'User already exist'
            })
        }

        //Create a New User - Hash Password and Store it in the DB
        const salt = await bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        req.body.password = hashedPassword;

        const newUser = new User(req.body);
        await newUser.save();

        res.send({
            success: true,
            message: 'User registered successfully'
        });
        

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
});

//Login User
router.post('/login', async (req, res) => {

    try {

        //Check if the User Exist or Not
        const user = await User.findOne({ email : req.body.email });
        if(!user) {
            return res.send({
                success: false,
                message: 'User does not exist'
            });
        }

        // Check if the password is correct
        const validPassword = await bcrypt.compare(req.body.password, user.password);

        if(!validPassword){
            return res.send({
                success: false,
                message: 'Not a valid password'
            });
        }

        // Create and assign a token
        const token = jwt.sign({
                userId: user._id
            },
            process.env.jwt_secret,
            {
                expiresIn: '1d'
            }
        );

        //Send the token to the client
        res.send({
            success: true,
            message: 'User successfully logged in',
            data: token
        });
        
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;