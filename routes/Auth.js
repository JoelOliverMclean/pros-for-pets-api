const express = require("express")
const router = express.Router()
const { User } = require("../mongoose/models")
const bcrypt = require("bcryptjs")
const { sign } = require("jsonwebtoken")
const { validateToken } = require("../middleware/AuthMiddleware")

router.post("/", async (req, res) => {
    let { username, firstname, lastname, password } = req.body
    const existingUser = await User.findOne({username: username})
    if (!existingUser) {
      bcrypt.hash(password, 10).then(async (hashedPassword) => {
        await User.create({
          username: username,
          password: hashedPassword,
          firstname: firstname,
          lastname: lastname
        })
        res.sendStatus(200)
      })
    } else {
      res.status(400).json({error: "Username already exists"})
    }
})

router.post("/login", async (req, res) => {
  const {username, password} = req.body
  const user = await User.findOne({username: username}).select('username firstname lastname password').exec()
  if (!user) return res.status(404).json({error: "User does not exist"})
  bcrypt.compare(password, user.password).then((matches) => {
    if (!matches) return res.status(401).json({ error: "Username or password is incorrect"})
    const accessToken = sign({username: user.username}, process.env.SECRET)
    res.cookie('token', accessToken, { httpOnly: true })
    res.cookie('loggedIn', true)
    res.status(200).json({username: user.username, firstname: user.firstname, lastname: user.lastname})
  })
})

router.post("/logout", [validateToken], async (req, res) => {
  res.clearCookie("token")
  res.clearCookie('loggedIn')
  res.status(200).send("Logged out")
})

router.get("/validate", [validateToken], async (req, res) => {
  const user = await User.findOne({username: req.user.username}).select('username firstname lastname').exec()
  res.status(200).json({username: user.username, firstname: user.firstname, lastname: user.lastname})
})

module.exports = router