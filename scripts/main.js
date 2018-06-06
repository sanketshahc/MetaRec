console.log('this is javascript');

// this is the url for the autocomplete place api, to be used in conjunction with the places library, linked to in the html
// var GooglePlaceUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?key=AIzaSyD4LMyFRC81mK6dnBXiyeynSEdN3TREPTQ';
const key = 'AIzaSyAtG1TS4IQZwExreX22pNhrI5MApTtNTaA';
const visionURL = 'https://vision.googleapis.com/v1/images:annotate?key='+ key;
const languageURL = 'https://language.googleapis.com/v1/documents:analyzeSentiment?key=' + key;

var $input = $('[data-searchbox]')[0];
var searchBox = new google.maps.places.SearchBox($input);

var places;
var arrPhotos;
var dimPhoto;
var arrPhotosURLs;
var arrLabels;
var bubbleArray;
var histogram;
searchBox.addListener('places_changed', function() {
    $('[data-placecontent]').empty();
    $('svg').empty();
    places = searchBox.getPlaces();
    console.log(places);
    arrPhotos = places[0]["photos"]
    dimPhoto = {
        'maxHeight' : 300,
        'maxWidth' : 300
    }
    arrPhotosURLs = arrPhotos.map(photo=>photo.getUrl(dimPhoto));
    var arrPhotoPromises = arrPhotosURLs.map(url => {
        $('[data-placecontent]').append($('<img>',{
            'class': 'card',
            'src': url}))

        var visionRequest = {
            "requests": [
            {
                "image": {
                "source": {
                    "imageUri": url,
                }
                },
                "features": [
                {
                    "type": "LABEL_DETECTION",
                }
                ]
            }
            ]
        }
        // bubbleArray = [];
        histogram = {};
        return $.ajax({
            url: visionURL,
            method: 'post',
            data: JSON.stringify(visionRequest),
            contentType: "application/json"
        })
        .then(response => {
            arrLabels = response['responses'][0]['labelAnnotations'];
            arrLabels.forEach(label => {
                var word = label.description;
                // bubbleArray.push(label.description)
                if (!(Object.keys(histogram).includes(word))) {
                    histogram[word] = 1;
                } 
                else { 
                    histogram[word] += 1 }
                })
                console.log(histogram)
            })        
    });
    Promise.all(arrPhotoPromises)
        .then(() => {
            var arrHistogram = [];
            Object.keys(histogram).forEach(key=>{
                var miniObj = {};
                miniObj['id'] = key;
                miniObj['value'] = histogram[key];
                arrHistogram.push(miniObj);
            })
            return arrHistogram;
        })
        .then(bubbleTwo)

});



var languageRequest = {
    "document": {
        "content": "THis is literally god's gift to earth. I love this API",
        "type": "PLAIN_TEXT"
        }
    }

$.ajax({
    url: languageURL,
    method: 'post',
    data: JSON.stringify(languageRequest),
    contentType: "application/json"
  }).then(response=>{console.log(response)})
