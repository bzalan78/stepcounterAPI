const express =require('express')
const mysql = require('mysql')

const app = express()
const port = 3000

var pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: '',
  port: 3307,
  database: 'stepcounter'

})
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/', (_req, res) => {
  res.send('Welcome to the step counter API')
})

//users endpoint


//registration
app.post('/users/register', (req, res) => {
    const {name, password, email, confirm} = req.body
    console.log(name, password, email, confirm)
    //validate input
    if(!name || !password || !email || !confirm) {
      return res.status(400).json({ error: 'All fields are required' })
    }
    if(password !== confirm) {
      return res.status(400).json({ error: 'Passwords do not match' })
    }
    
    //TODO: implement password strength check
    //check if email already exists
    pool.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Internal server error' })
        }
        if (results.length > 0) {
            return res.status(400).json({ error: 'Email already exists' })
        }
        //register user
        pool.query('INSERT INTO users (name, password, email, role) VALUES (?, SHA1(?), ? ,"user")', [name, password, email], (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Internal server error' })
            }
            res.status(200).json({ message: 'User registered successfully' })
        })
    })

})

//login
app.post('/users/login', (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' })
    }
    pool.query('SELECT * FROM users WHERE email = ? AND password =SHA1(?)', [email, password], (error, results) => {
      console.log(results)  
      if (error) {
            return res.status(500).json({ error: 'Internal server error' })
        }
        if (results.length == 0) {
            return res.status(400).json({ error: 'Invalid credentials' })
        }
        //check user is active?
        if (results[0].is_active == 0) {
            return res.status(400).json({ error: 'User is not active' })
        }
        // update last login and login_count fields timestamp
        const loggedUser={
            ID: results[0].ID,
            name: results[0].name,
            email: results[0].email,
            role: results[0].role
        }
        pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP, login_count = login_count + 1 WHERE ID = ?', [loggedUser.ID], (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Internal server error' })
            }
            //TODO: send logged in data to frontend
            res.status(200).json({ message: 'Login successful', loggedUser})
        })
    })
})

//logout ?

//password change

//get profile

//update profile

//delete profile





//steps endpoint


//create step

//get step

//update step

//delete step


//admin endpoint


//get all users
app.get('/admin/users', (_req, res) => {
  pool.query('SELECT * FROM users', (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Internal server error' })
    }
    else{
      res.status(200).json(results)
    }
   
  })
})

//deny user

//statistics

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})