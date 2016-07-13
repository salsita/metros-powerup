/* global TrelloPowerUp */

var CANONICAL_URL= 'https://trello-pointing-try.herokuapp.com';

var t = TrelloPowerUp.iframe();

var canonicalURLSelector = document.getElementById('canonicalURL');
var accessTokenSelector = document.getElementById('accessToken');

t.render(function() {
  return t
    .get('board', 'shared', 'accessToken')
    .then(function(token) {
      canonicalURLSelector.value = CANONICAL_URL;
      if (token) {
        accessTokenSelector.value = token;
      }
    })
    .then(function() {
      t.sizeTo('#content').done();
    });
});

document.getElementById('save').addEventListener('click', function() {
  return t
    .set('board', 'shared', 'accessToken', accessTokenSelector.value)
    .then(function(){
      t.closePopup();
    })
});
