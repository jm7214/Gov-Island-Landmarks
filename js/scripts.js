mapboxgl.accessToken = 'pk.eyJ1Ijoiam03MjE0IiwiYSI6ImNrNnNwdjFmYTBodTczbXF4bnJzaGR1Z2oifQ.Jl92KHVxrXt33RDS85IXAg';

  // we want to return to this point and zoom level after the user interacts
// with the map, so store them in variables
var initialCenterPoint = [-74.019054,40.687873]
var initialZoom = 15



var initOptions ={
    container: 'govisland-map', // container id
    style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
    center: initialCenterPoint, // starting position [lng, lat]
    zoom: initialZoom, // starting zoom
}


// set the default text for the feature-info div
var defaultText = '<p>Move the mouse over the map to get more info on a property</p>'
$('#feature-info').html(defaultText)

//create an object to hold the initialization options for a mapboxGL map
var initOptions ={
    container: 'govisland-map', // container id
    style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
    center: initialCenterPoint, // starting position [lng, lat]
    zoom: initialZoom, // starting zoom
}
// create the new map
var map = new mapboxgl.Map(initOptions);

// add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

// wait for the initial style to Load
map.on('style.load', function() {

// add a geojson source to the map using our external geojson file
map.addSource('Gov-Island', {
  type: 'geojson',
  data: './data/geojson_gov_island.gpkg.geojson',
});

// let's make sure the source got added by logging the current map state to the console
 console.log(map.getStyle().sources)

})

// add a layer for our custom source
map.addLayer({
  id: 'fill-Gov-Island',
  type: 'fill',
  source: 'Gov-Island',

})

// listen for the mouse moving over the map and react when the cursor is over our data

map.on('mousemove', function (e) {
  // query for the features under the mouse, but only in the lots layer
  var features = map.queryRenderedFeatures(e.point, {
      layers: ['fill-Gov-Island'],
  });

  // if the mouse pointer is over a feature on our layer of interest
  // take the data for that feature and display it in the sidebar
  if (features.length > 0) {
    map.getCanvas().style.cursor = 'pointer';  // make the cursor a pointer

    var hoveredFeature = features[0]
    var featureInfo = `
      <h4>${hoveredFeature.properties.Address}</h4>
      <p><strong>Landmark:</strong> ${LandUseLookup(parseInt(hoveredFeature.properties.LandUse)).description}</p>
      <p><strong>Zoning:</strong> ${hoveredFeature.properties.ZoneDist1}</p>
    `
    $('#feature-info').html(featureInfo)

    // set this lot's polygon feature as the data for the highlight source
    map.getSource('highlight-feature').setData(hoveredFeature.geometry);
  } else {
    // if there is no feature under the mouse, reset things:
    map.getCanvas().style.cursor = 'default'; // make the cursor default

    // reset the highlight source to an empty featurecollection
    map.getSource('highlight-feature').setData({
      type: 'FeatureCollection',
      features: []
    });

    // reset the default message
    $('#feature-info').html(defaultText)
  }
})

})
