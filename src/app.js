// Copyright 2021 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Loader } from "@googlemaps/js-api-loader";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import ThreejsOverlayView from "@ubilabs/threejs-overlay-view";

const apiOptions = {
  apiKey: "AIzaSyBHh8WHBWE8_7mHTkgfFvHoR3IbOshpJM0",
  version: "beta",
};

// ⭐️ PULL IN GEOJSON HISTORY
let geoJson;
$.ajax("./history-2022-10-07.kml").done(function (xml) {
  console.log("getting...");
  geoJson = toGeoJSON.kml(xml);
  // console.log(JSON.stringify(geoJson));
});

$.ajax("./spotify-10-07-2022.json").done(function (json) {
  console.log("getting spotufy...");
  let songs = json["songs"];
  let newSongs = songs.map((elm) => {
    elm["time_sec"] = Date.parse(elm["timestamp"]);
    return elm;
  });
  json["songs"] = newSongs;
  // console.log(JSON.stringify(json));
});

$.ajax("./location-10-07-2022.json").done(function (json) {
  console.log("getting location...");
  let features = json["features"];
  let newFeatures = features.map((elm) => {
    elm["timespan_sec"] = {
      begin: Date.parse(elm["properties"]["timespan"]["begin"]),
      end: Date.parse(elm["properties"]["timespan"]["end"]),
    };
    return elm;
  });
  json["features"] = newFeatures;
  // console.log(JSON.stringify(json));
});

const mapOptions = {
  tilt: 10,
  heading: 10,
  zoom: 16,
  center: { lat: 42.354362, lng: -71.090872 },
  mapId: "15431d2b469f209e",
  disableDefaultUI: true,
};

// const overlay = new ThreejsOverlayView({
//   lat: 53.554486,
//   lng: 10.007479,
// });

async function initMap() {
  const mapDiv = document.getElementById("map");
  const apiLoader = new Loader(apiOptions);
  await apiLoader.load();

  return new google.maps.Map(mapDiv, mapOptions);
}

function moveToMIT(map) {
  map.moveCamera({
    center: {
      lng: -71.09416,
      lat: 42.360091,
    },
    heading: 160,
    zoom: 17,
    tilt: 96,
  });
}
function moveToHome(map) {
  map.moveCamera({
    center: {
      lng: -71.093812,
      lat: 42.349391499999996,
    },
    heading: 10,
    zoom: 18,
    tilt: 96,
  });
}

function moveToNewbury(map) {
  map.moveCamera({
    center: {
      lng: -71.0852936,
      lat: 42.349012699999996,
    },
    heading: 340,
    zoom: 18,
    tilt: 96,
  });
}

function initWebGLOverlayView(map) {
  let scene, renderer, camera, loader;
  const webGLOverlayView = new google.maps.WebGLOverlayView();

  webGLOverlayView.onAdd = () => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera();
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75); // soft white light
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.25);
    directionalLight.position.set(0.5, -1, 0.5);
    scene.add(directionalLight);

    // adds pin
    loader = new GLTFLoader();
    const source = "pin.gltf";
    loader.load(source, (gltf) => {
      gltf.scene.scale.set(5, 5, 5);
      gltf.scene.rotation.x = (180 * Math.PI) / 180;
      scene.add(gltf.scene);
    });

    // adds green box
    const geometry = new THREE.BoxGeometry(80, 80, 80);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

    const mitCube = new THREE.Mesh(geometry, material);
    // set position at center of map
    // cube.position.copy(latLngToVector3({ lat: 42.354362, lng: -71.090872 }));
    // // set position vertically
    // console.log(latLngToVector3("⭐️", { lat: 42.354362, lng: -71.090872 }));
    mitCube.position.setY(1300);
    mitCube.position.setX(-10);
    scene.add(mitCube);

    const homeCube = new THREE.Mesh(geometry, material);
    homeCube.position.setY(0);
    homeCube.position.setX(0);
    scene.add(homeCube);

    const newburyCube = new THREE.Mesh(geometry, material);
    newburyCube.position.setY(-100);
    newburyCube.position.setX(800);
    scene.add(newburyCube);

    camera.position.z = 5;
  };

  webGLOverlayView.onContextRestored = ({ gl }) => {
    renderer = new THREE.WebGLRenderer({
      canvas: gl.canvas,
      context: gl,
      ...gl.getContextAttributes(),
    });
    renderer.autoClear = false;

    // click 1 to start the day
    $("#popup-close").on("click", function () {
      $("#popup").hide();
    });

    $("#overview").on("click", function () {
      renderer.setAnimationLoop(() => {
        map.moveCamera({
          tilt: mapOptions.tilt,
          heading: mapOptions.heading,
          zoom: mapOptions.zoom,
        });

        if (mapOptions.tilt < 90.5) {
          mapOptions.tilt += 0.7;
        } else {
          mapOptions.heading += 0.1;
        }
      });
    });

    $("#1").on("click", function () {
      renderer.setAnimationLoop(null);
      moveToHome(map);
    });

    $("#2").on("click", function () {
      renderer.setAnimationLoop(null);
      moveToNewbury(map);
    });

    $("#3").on("click", function () {
      renderer.setAnimationLoop(null);
      moveToMIT(map);
    });

    $("#4").on("click", function () {
      renderer.setAnimationLoop(null);
      moveToHome(map);
    });

    $("#5").on("click", function () {
      renderer.setAnimationLoop(null);
      moveToMIT(map);
    });

    $("#6").on("click", function () {
      renderer.setAnimationLoop(null);
      moveToHome(map);
    });

    $("#7").on("click", function () {
      renderer.setAnimationLoop(null);
      moveToNewbury(map);
    });

    $("#8").on("click", function () {
      renderer.setAnimationLoop(null);
      moveToHome(map);
    });

    // step 0 intro
    loader.manager.onLoad = () => {
      renderer.setAnimationLoop(() => {
        map.moveCamera({
          tilt: mapOptions.tilt,
          heading: mapOptions.heading,
          zoom: mapOptions.zoom,
        });

        if (mapOptions.tilt < 90.5) {
          mapOptions.tilt += 0.7;
        } else {
          mapOptions.heading += 0.1;
          mapOptions.heading;
        }
        // else {
        //   renderer.setAnimationLoop(null);
        // }
      });
    };
  };

  webGLOverlayView.onDraw = ({ gl, transformer }) => {
    let latLngAltitudeLiteral = {
      lat: 42.349391499999996,
      lng: -71.093812,
      altitude: 10,
    };
    let matrix = transformer.fromLatLngAltitude(latLngAltitudeLiteral);
    camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);

    webGLOverlayView.requestRedraw();
    renderer.render(scene, camera);
    renderer.resetState();
  };

  webGLOverlayView.setMap(map);
}

(async () => {
  const map = await initMap();
  initWebGLOverlayView(map);

  const ctaLayer = new google.maps.KmlLayer({
    url: "https://raw.githubusercontent.com/trudypainter/internet-mirror/main/src/history-2022-10-07.kml",
    suppressInfoWindows: true,
    map: map,
  });

  ctaLayer.setMap(map);
})();
