Ur.QuickLoaders["superhero"] = (function() {

  function Superhero(components) {
    this.set = components["set"];
    this.period = parseInt(this.set.getAttribute("data-ur-superhero-period"));
    this.heroes = x$(this.set).find("*[data-ur-superhero-component='hero']");
    this.initialize();
  }

  Superhero.prototype.initialize = function() {
    var heroes = this.heroes;
    this.currentHero = 0;
    var numHeroes = this.numHeroes = heroes.length;

    this.set.style["position"] = "relative";
    for (var i = 0; i < numHeroes; i++) {
      heroes[i].style["position"] = "absolute";
      heroes[i].style["left"] = "0";
      heroes[i].style["top"] = "0";
      heroes[i].style["opacity"] = "0";
      heroes[i].style["-webkit-transition-property"] = "opacity";
      heroes[i].style["-webkit-transition-duration"] = "1s";
      heroes[i].style["-webkit-transition-timing-function"] = "linear";
    }
    heroes[0].style["opacity"] = "1";

    window.setTimeout(function (obj) { return function() { obj.advance(); }; }(this), 1000*this.period);
  }

  Superhero.prototype.advance = function() {
    var nextHero = (this.currentHero + 1) % this.numHeroes;
    this.heroes[nextHero].style["opacity"] = "1";
    this.heroes[this.currentHero].style["opacity"] = "0";
    this.currentHero = nextHero;
    window.setTimeout(function (obj) { return function() { obj.advance(); }; }(this), 1000*this.period);
  }

  function SuperheroLoader() {}

  SuperheroLoader.prototype.initialize = function(fragment) {
    var superheroes = x$(fragment).find_elements('superhero');
    for (var name in superheroes) new Superhero(superheroes[name]);
  }

  return SuperheroLoader;
})();