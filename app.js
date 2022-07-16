const express = require('express');
const app = express();

const request = require('request');

const querystring= require('querystring');

var access_token;

app.set('view engine','ejs');

const clientID = '0c464a8a738f42198c495cf06e1d75af';
const clientSCRT = 'd55b8562eb1f43899b794829810a703c';
const redirect = 'http://localhost:4000/callback';

app.get('/',(req,res,next)=>{
    res.redirect('https://accounts.spotify.com/authorize?'+
    querystring.stringify({
        client_id: clientID,
        response_type: 'code',
        scope: 'user-read-currently-playing user-top-read',
        redirect_uri: redirect,
    }));
});

app.get('/callback',(req,res)=>{
    console.log('WELCOME BACK USER');
    var code = req.query.code;
    const tokenGen ={
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: redirect,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer(clientID + ':' + clientSCRT).toString('base64'))
        },
        json: true
    };

    request.post(tokenGen,function(error,response,body){
        console.log(body);
        access_token = body.access_token;

        res.redirect('/getProfile');
    });
});

app.get('/getProfile',(req,res,next)=>{
    var profileCall ={
        url: 'https://api.spotify.com/v1/me/top/artists?limit=20&time_range=short_term',
        headers: { 'Authorization': 'Bearer ' + access_token },
        json: true
    };

    request.get(profileCall,function(error,response,body){
        console.log(body.items)

        var name = [],
            link = [],
            uri = [],
            image= [],
            followers = [];

        for(var i in body.items){
            name.push(body.items[i].name);
            link.push(body.items[i].external_urls.spotify);
            uri.push(body.items[i].uri);
            image.push(body.items[i].images[0].url);
            followers.push(body.items[i].followers.total);
        }

        res.render('top',{title:'YOUR TOP LISTENS',name: name, link: link, uri: uri, image: image, followers: followers});
    })
});


app.listen('4000');