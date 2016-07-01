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
  return t.get('card', 'shared', 'points', '{}')
    .then(function(data) {
      return JSON.parse(data)[cardId] || pointArray[0];
    });
}

function setPoints(t, cardId, points) {
  return t.get('card', 'shared', 'points', '{}')
    .then(function(data) {
      var db = JSON.parse(data);
      db[cardId] = points;
      return t.set('card', 'shared', 'points', JSON.stringify(db));
    });
}

var getBadges = function(t) {
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
        text: points.toString()
      }
    });
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
  'card-badges': function(t){
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
  }
});
