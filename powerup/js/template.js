var Promise = TrelloPowerUp.Promise;

var CANONICAL_URL= 'https://trello-pointing-try.herokuapp.com';

var ICON = './images/icon.svg';

var pointArray = [
   0,
   1,
   2,
   3,
   5,
   8,
  13,
  21
];

function getPoints(t, cardId) {
  return t
    .get('board', 'shared', 'accessToken')
    .then(function(token) {
      if (!token) {
        return Promise.reject('Access token is not set');
      }

      var deferred = Promise.pending();

      var req = new XMLHttpRequest();
      req.onload = function() {
        var code = this.status;
        if (code < 200 || code >= 300) {
          deferred.reject(this.responseText);
        } else {
          var payload = JSON.parse(this.responseText);
          deferred.resolve(payload.points);
        }
      };
      req.open('GET', CANONICAL_URL + '/api/cards/' + cardId + '?access_token=' + token);
      req.send();

      return deferred.promise;
    });
}

function setPoints(t, cardId, points) {
  return t
    .get('board', 'shared', 'accessToken')
    .then(function(token) {
      if (!token) {
        return Promise.reject('Access token is not set');
      }

      var deferred = Promise.pending();

      var req = new XMLHttpRequest();
      req.onload = function() {
        var code = this.status;
        if (code < 200 || code >= 300) {
          deferred.reject(this.responseText);
        } else {
          deferred.resolve();
        }
      };
      req.open('POST', CANONICAL_URL + '/api/cards/' + cardId + '?access_token=' + token);
      req.setRequestHeader('Content-Type', 'application/json')
      req.send(JSON.stringify({points: points}));

      return deferred.promise;
    });
}

var getBadges = function(t) {
  return {
    dynamic: function() {
      return t.card('id').get('id')
        // Get points.
        .then(function(cardId) {
          return getPoints(t, cardId);
        })
        // Render the badge.
        .then(function(points) {
          return {
            title: 'Points',
            icon: ICON,
            text: points.toString(),
            refresh: 30
          }
        });
    }
  }
};

var cardButtonCallback = function(t) {
  var items = pointArray.map(function(points) {
    return {
      text: points.toString(),
      callback: function(t) {
        var cardId;

        return t.card('id').get('id')
          // Set points.
          .then(function(cardId) {
            return setPoints(t, cardId, points);
          })
          // Close the popup.
          .then(function() {
            t.closePopup();
          });
      }
    };
  });

  return t.popup({
    title: 'Card Points',
    items: items
  });
};

TrelloPowerUp.initialize({
  'card-badges': function(t) {
    return getBadges(t);
  },
  'card-buttons': function(t) {
    return [{
      text: 'Points',
      icon: ICON,
      callback: cardButtonCallback
    }];
  },
  'card-detail-badges': function(t) {
    return getBadges(t);
  },
	'show-settings': function(t) {
    return t.popup({
      title: 'Settings',
      url: './settings.html'
    });
  }
});
