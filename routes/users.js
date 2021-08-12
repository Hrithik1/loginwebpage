const express = require("express")
const { route } = require(".")
const router = express.Router()
const User = require("../models/User")
const bcrypt = require('bcryptjs')
const passport = require('passport')

router.get("/login", (req, res) =>
    res.render("login")) //Login Page
router.get("/register", (req, res) =>
    res.render("register")) //Register Page
router.post("/register", (req, res) => {
    const { username, email, password, password2 } = req.body

    let errors = []

    if (!username || !email || !password || !password2) {
        errors.push({ msg: "Please fill in all fields." })
    }
    if (password != password2) {
        errors.push({ msg: "Passwords do not match." })
    }
    if (password.length < 6) {
        errors.push({ msg: "Password should be atleast six characters." })
    }
    if (errors.length > 0) {
        res.render("register", {
            errors,
            username,
            email,
            password,
            password2
        })
    } else {
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    errors.push({ msg: "Email is already registered" })
                    res.render("register", {
                        errors,
                        username,
                        email,
                        password,
                        password2
                    });
                }
                else {
                    const newUser = new User({
                        username,
                        email,
                        password
                    });
                    bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err
                        newUser.password = hash
                        newUser.save()
                            .then(user => {
                                req.flash("success_msg", "You are now registered")
                                res.redirect("/users/login")
                            })
                            .catch(err => console.log(err))
                    }))
                }

            })
    }
})
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next)
})
router.get('/logout', (req, res) => {
    req.logout()
    req.flash('success_msg', 'You are logged out')
    res.redirect('/users/login')
})
module.exports = router