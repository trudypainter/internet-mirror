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
        </section>`
      );
    }
  });
});
