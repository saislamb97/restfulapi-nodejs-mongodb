const router = require("express").Router()


router.get("/", (req, res)=>{
    res.send("Its user route")
})


module.exports = router