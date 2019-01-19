const passport = require('passport');

const { Strategy } = require('passport-google-oauth20');


fs = require('fs')
readline = require('readline')
google = require('googleapis')
googleAuth = require('google-auth-library')

SCOPES = ['https://www.googleapis.com/auth/drive']# scope for everything : D
TOKEN_PATH = './token.json'
CLIENT_SECRET = <your client secret here>
  CLIENT_ID = <your client id here>
    REDIRECT = <your redirect url here>

      authorize = (callback) ->
          auth = new googleAuth
          oauth2Client = new auth.OAuth2(CLIENT_ID, CLIENT_SECRET,REDIRECT)
          # Read the Token at ./token.json or get a new one
          fs.readFile TOKEN_PATH, (err, token) ->
              if err
                  getNewToken oauth2Client, callback
              else
                  oauth2Client.credentials = JSON.parse(token)
                  callback oauth2Client
      
      getNewToken = (oauth2Client, callback) ->
    authUrl = oauth2Client.generateAuthUrl({access_type: 'offline', scope: SCOPES})
      console.log 'Authorize this app by visiting this url: ', authUrl
  
    rl = readline.createInterface({input: process.stdin,output: process.stdout})
    rl.question 'Enter the code in the address bar without the "#"(?code=<code>#)', (code) ->
          rl.close()
          oauth2Client.getToken code, (err, token) ->
              oauth2Client.credentials = token
              fs.writeFile TOKEN_PATH, JSON.stringify(token) # store token for later
              callback oauth2Client
  
  authorize (auth)->
      service = google.drive('v3')
      # get ids of the 10 most recent photos
      # every request needs the auth:auth
    service.files.list {auth: auth,pageSize: 10,orderBy: 'createdTime desc',q:"mimeType = 'image/jpeg'"},(err,response)->
            for file in response.files
                dest = fs.createWriteStream(file.name)
                # you have to add the alt:"media" option to get the file contents
            # if you want a link to the file that can be used in an <img src=''> tag: add fields:"webContentLink"
            service.files.get({auth:auth,fileId:file.id,alt:"media"}).pipe(dest)
passport.use(
new GoogleStrategy(
    {
      clientID:
        '723298503773-aago97jk72iq87mch9f0onda3v633rot.apps.googleusercontent.com',
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://www.example.com/auth/google/callback',
    },
    function(accessToken, refreshToken, profile, cb) {
      User.findOrCreate({ googleId: profile.id }, function(err, user) {
        return cb(err, user);
      });
    }
  )
);

console.log('updating google account');
