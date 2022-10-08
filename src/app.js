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

const apiOptions = {
  apiKey: "AIzaSyBHh8WHBWE8_7mHTkgfFvHoR3IbOshpJM0",
  version: "beta",
};

const mapOptions = {
  tilt: 100,
  heading: 0,
  zoom: 18,
  center: { lat: 42.354362, lng: -71.090872 },
  mapId: "15431d2b469f209e",
};

async function initMap() {
  const mapDiv = document.getElementById("map");
  const apiLoader = new Loader(apiOptions);
  await apiLoader.load();
  return new google.maps.Map(mapDiv, mapOptions);
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

    loader = new GLTFLoader();
    const source = "pin.gltf";
    loader.load(source, (gltf) => {
      gltf.scene.scale.set(25, 25, 25);
      gltf.scene.rotation.x = (180 * Math.PI) / 180;
      scene.add(gltf.scene);
    });
  };

  webGLOverlayView.onContextRestored = ({ gl }) => {
    renderer = new THREE.WebGLRenderer({
      canvas: gl.canvas,
      context: gl,
      ...gl.getContextAttributes(),
    });
    renderer.autoClear = false;
  };

  webGLOverlayView.onDraw = ({ gl, transformer }) => {
    const latLngAltitudeLiteral = {
      lat: mapOptions.center.lat,
      lng: mapOptions.center.lng,
      altitude: 80,
    };

    const matrix = transformer.fromLatLngAltitude(latLngAltitudeLiteral);
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
  console.log(ctaLayer);

  ctaLayer.addListener("click", (kmlEvent) => {
    const text = kmlEvent.featureData.description;
    console.log(kmlEvent);
    showInContentWindow(text);
  });

  function showInContentWindow(text) {
    const sidebar = document.getElementById("sidebar");

    sidebar.innerHTML = text;
  }

  // map.moveCamera({ titlt: 10, heading: 10, zoom: 180 });

  ctaLayer.setMap(map);
})();
