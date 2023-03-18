const User = require("../models/User")
const router = require("express").Router()
const bcrypt = require("bcrypt")


//update user
router.put("/:id", async (req, res)=>{
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10)
                req.body.password = await bcrypt.hash(req.body.password, salt)
            } catch(err){
                return res.status(500).json(err)
            }
        }
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {$set:req.body})
            res.status(200).json("Account updated successfully")
        } catch(err){
            return res.status(500).json(err)
        }
    } else {
        return res.status(403).json("Update your account only")
    }
})

//delte user
router.delete("/:id", async (req, res)=>{
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            const user = await User.findByIdAndDelete(req.params.id)
            res.status(200).json("Account deleted successfully")
        } catch(err){
            return res.status(500).json(err)
        }
    } else {
        return res.status(403).json("Delete your account only")
    }
})

//get a user
router.get("/:id", async (req, res)=>{
    try {
        const user = await User.findById(req.params.id)
        const {password, updatedAt, ...other} = user._doc
        res.status(200).json(other)
    } catch(err) {
        res.status(500).json(err)
    } 
}) 

//folow a user
router.put("/:id/follow", async (req, res)=>{
    if (req.body.userId !== req.params.id){
        try {
            const user = await User.findById(req.params.id)
            const currentUser = await User.findById(req.body.userId)
            if (!user.followers.includes(req.body.userId)){
                await user.updateOne({$push: {followers: req.body.userId}})
                await currentUser.updateOne({$push: {followings: req.params.id}})
                res.status(200).json("user followed")
            }else {
                res.status(403).json("You alredy following the user")
            }
        } catch(err){
            res.status(500).json(err)
        } 
    }else {
        res.status(403).json("You can't follow yourself")
    }
})

//unfollow a user
router.put("/:id/unfollow", async (req, res)=>{
    if (req.body.userId !== req.params.id){
        try {
            const user = await User.findById(req.params.id)
            const currentUser = await User.findById(req.body.userId)
            if (user.followers.includes(req.body.userId)){
                await user.updateOne({$pull: {followers: req.body.userId}})
                await currentUser.updateOne({$pull: {followings: req.params.id}})
                res.status(200).json("user unfollowed")
            }else {
                res.status(403).json("You alredy unfollowed the user")
            }
        } catch(err){
            res.status(500).json(err)
        } 
    }else {
        res.status(403).json("You can't unfollow yourself")
    }
})


module.exports = router