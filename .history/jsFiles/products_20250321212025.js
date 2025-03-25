const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const app = express();

const dbFilePath = path.join(__dirname, "../jsonFiles/db.json");

