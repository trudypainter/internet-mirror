$(document).ready(function () {
  console.log("ready!");

  let story = $("#play-by-play");

  $.ajax("./cards.json").done(function (json) {
    console.log("GETTING CARDS...");
    console.log(json);

    for (let i = 0; i < json["cards"].length; i++) {
      story.append(
        `<section id=${json["cards"][i]["id"]}> 
            <h3>${json["cards"][i]["title"]} </h3>
            <p>${json["cards"][i]["description"]} </p>
            <div class="container" id="${json["cards"][i]["id"]}-div">  </div>
        </section>`
      );

      let cardDiv = $(`#${json["cards"][i]["id"]}-div`);
      for (let j = 0; j < json["cards"][i]["browser"].length; j++) {
        cardDiv.append(
          `<div >
            ${json["cards"][i]["browser"][j]["description"]}
 
            </div>`
        );
      }
    }
  });
});

$();
