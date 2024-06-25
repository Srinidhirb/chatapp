const { Database } = require('sqlite3')
const { open } = require('sqlite')

// Sign In form for authenticating an existing account
const signInPage = (req, res, next) => {
    res.render('sign-in.html')
} 

// Sign Up form for creating a new account
const signUpPage = (req, res, next) => {
    res.render('sign-up.html')
}

// Homepage displayed to signed in users with their first and last name
const homePage = async (req, res, next) => {
    const session = req.cookies.session // Get session stored in cookie

    const { username } = await getUserDetails(session)

    if (!username) { // Session does not exist in database
        res.clearCookie('session') // Clear cookie because session is invalid
        res.redirect('/sign-in')
        return
    }

    res.end(`
        <!DOCTYPE html>
        <html>
            <head lang="en">
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Web-Chat</title>
                <link rel="stylesheet" href="/styles.css">
         

            </head>
            <body>
                <div class="home">
                    <div class="home__container">
                        <div class="home__container__users-view">
                            <h2 class="home__header"> <img src="/online.png" alt="" width="30px"> Active Users</h2>
                            <div class="home__container__users-view__list"></div>
                            <div class="home__container__users-view__bottom">
                                <p class="home__container__users-view__bottom__username"><strong>Signed in as:</strong> ${username}</p>
                                <button type="button" class="home__container__users-view__bottom__btn" id="editaccount-button"><img src="/edit.png" alt="" width="25px">Edit Account</button>
                                <button type="button" class="home__container__users-view__bottom__btn" id="deleteaccount-button"> <img src="/delet.png" alt="" width="25px">Delete Account</button>
                                <button type="button" class="home__container__users-view__bottom__btn" id="signout-button"> <img src="/logout.png" alt="" width="25px">Sign Out</button>
                            </div>
                        </div>
                        <div class="home__container__chat-view">
                            <h2 class="home__header">Chat</h2>
                            <div class="home__container__chat-view__chatlog"></div>
                            <div class="home__container__chat-view__message">
                                <input type="text" class="home__container__chat-view__message__body" placeholder="Type message here..." required>
                                <button type="button" class="home__container__chat-view__message__send">    <img src="/paper-plane.png" alt="" width="30px"> </button>
                                <div class="home__container__chat-view__message__char-count">0/250</div>
                            </div>
                        </div>
                    </div>
                </div>
                <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.4/jquery.min.js"></script>
                <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
                <script>
                    const myUsername = "${username}"
                </script>
                <script src="scripts/home.js"></script>
            </body>
        </html>
    `)
}

// Function to get user details corresponding to ID from database
const getUserDetails = async (session) => {
    const db = await open({
        filename: "accounts.db",
        driver: Database
    })

    const sessionRow = await db.get("SELECT id FROM sessions WHERE session = ?", session)

    if (!sessionRow) {
        return false
    }

    const id = sessionRow.id

    const userRow = await db.get("SELECT * FROM users WHERE id = ?", id) // Get user information corresponding to given ID

    if (!userRow) { // No entry found
        return false
    }

    await db.close()

    return userRow
}

// Form for editing account details
const editPage = async (req, res, next) => {
    const session = req.cookies.session // Get session stored in cookie

    const { username } = await getUserDetails(session)

    if (!username) {
        res.clearCookie('session')
        res.redirect('/sign-in')
        return
    }

    res.end(`
       <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Account Details</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        
        .container {
            display: flex;
            background: white;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            width: 80%;
            max-width: 1000px;
            margin: auto;
        }
        
        .image-container {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .image-container img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
        }
        
        .form-container {
            flex: 1;
            padding: 20px;
        }
        
        .form-container h2 {
            margin-bottom: 20px;
            font-size: 24px;
        }
        
        .input-group {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .input-group label {
            margin-right: 10px;
            font-size: 18px;
            color: #333;
        }
        
        .input-group input {
            flex: 1;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
        }
        
        .remember-me {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .remember-me input {
            margin-right: 10px;
        }
        
        .remember-me label {
            font-size: 14px;
        }
        
        .button {
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        
        .button:hover {
            background-color: #0056b3;
        }
        
        .create-account {
            margin-top: 20px;
        }
        
        .create-account a {
            color: #007bff;
            text-decoration: none;
        }
        
        .create-account a:hover {
            text-decoration: underline;
        }
        
        .social-login {
            margin-top: 20px;
            text-align: center;
        }
        
        .social-login p {
            margin-bottom: 10px;
            font-size: 14px;
            color: #666;
        }
        
        .social-btn {
            display: inline-block;
            width: 40px;
            height: 40px;
            line-height: 40px;
            border-radius: 50%;
            background-color: #eee;
            color: #333;
            text-align: center;
            margin: 0 5px;
            transition: background-color 0.3s;
        }
        
        .social-btn:hover {
            background-color: #ddd;
        }
        
        .social-btn.fb {
            color: #3b5998;
        }
        
        .social-btn.twitter {
            color: #1da1f2;
        }
        
        .social-btn.google {
            color: #db4437;
        }
        
    </style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body>
    <div class="container">
        <div class="image-container">
            <img src="/3.png" alt="Illustration">
        </div>
        <div class="form-container">
            <h2>Edit Account Details</h2>
            <form action="/api/edit" method="POST">
                <div class="input-group">
                    <label for="username">Username</label>
                    <input type="text"  id="username" name="username" placeholder="${username}">
                </div>
                <div class="input-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" placeholder="Password" >
                </div>
                <div class="input-group">
                    <label for="verifypassword">Enter current password</label>
                    <input type="password"  id="verifypassword" name="verifypassword" required >
                </div>
                
                <input class="button" type="submit"  value="UPDATE DETAILS"></input>
            </form>
           
        </div>
        
    </div>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.4/jquery.min.js"></script>
</body>
</html>

    `)
}

// Form for deleting account
const deletePage = (req, res, next) => {
    const session = req.cookies.session

    if (!session) {
        res.redirect('/sign-in')
        return
    }

    res.render('delete.html')
}

module.exports = { 
    signInPage, 
    signUpPage, 
    homePage,
    editPage,
    deletePage,
    getUserDetails
}
