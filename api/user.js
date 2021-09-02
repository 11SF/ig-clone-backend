let router = require('express').Router()
let bcrypt = require('bcryptjs')
let User = require('../models/User');
let jwt = require('jsonwebtoken')

router.post('/login', async (req,res) => {
    try {
        let {email, password} = req.body;
        const user = await User.findOne({ email })
        if(user && bcrypt.compare(password, user.password)) {
            const token = jwt.sign({
                id: user._id,
                username,
                email
            },process.env.TOKEN_KEY,{ expiresIn: "24h"})

            return res.status(200).json({token})
        }
        res.status(401).json({ msg: "email or password incorrect. please try again."})
    }
    catch(err) {
       res.status(500).send(err.message);
    }
})

router.post('/register', async (req,res) => {
   try {
        let {username, password, email} = req.body;
        if(username && password && email) {
            const checkUser = await User.findOne({email})
            if(checkUser) {
                return res.status(400).send("email is already registered");
            }

            const hashPassword = await bcrypt.hash(password, 10)

            const user = await User.create({
                username, 
                password: hashPassword, 
                email: email.toLowerCase()
            })

            const token = jwt.sign({
                id: user._id,
                username,
                email
            },process.env.TOKEN_KEY,{ expiresIn: "24h"})

            return res.status(201).json({token})
        }
        res.status(400).send("All input is required");
   }
   catch (err) {
       res.status(500).send(err.message);
   }
})
module.exports = router