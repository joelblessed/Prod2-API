
const router = express.Router();
router.put('/updateProfile/:id', authenticateToken, (req, res) => {
  const db = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
  const userIndex = db.users.findIndex(u => u.id === parseInt(req.params.id));
  if (userIndex !== -1) {
    db.users[userIndex] = { ...db.users[userIndex], ...req.body };
    fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2));
    res.json(db.users[userIndex]);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});



module.exports =router