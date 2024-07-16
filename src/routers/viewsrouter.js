// import express from "express"

const express = require('express')

const router = express.Router()

router.get("/", (req, res) => {
    res.render("index",{
        style:'index.css'
    })
})

module.exports = router