import express from "express";
import multer from "multer";

const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  createMenuItem,
  getAllMenuItems,
  updateMenuItem,
  deleteMenuItem
} = require("../controllers/menuController");

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Routes
router.post("/", upload.single("image"), createMenuItem);
router.get("/", getAllMenuItems);
router.put("/:id", upload.single("image"), updateMenuItem);
router.delete("/:id", deleteMenuItem);

module.exports = router;
