

let user = '';
let repoCount = 0;
let languages = {};
let colors = ["#177efe", "#b1c94e", "#ce4b99", "#263ec9", "#ec693e", "#45ee5e"];



function validate() {
  let val = searchInput.value.trim();
  if (val.length > 0 && !val.includes(' ')) {
  getRepos() };
  return false;
}

function getRepos() {
  user = searchInput.value;
  var s = document.createElement("script");
  s.type = "text/javascript";
  s.src = "https://api.github.com/users/" + user + "/repos?callback=handleRepos";
  s.innerHTML = null;
  s.id = "location_src";
  document.getElementById("repo_list").innerHTML = "";
  document.getElementById("repo_list").appendChild(s);
}

// inject script to call repo language API for all of user's repos
function getLanguages(repo) {
  var s = document.createElement("script");
  s.type = "text/javascript";
  s.src = "https://api.github.com/repos/"+ user + "/" + repo + "/languages?callback=handleLanguages";
  s.innerHTML = null;
  s.id = "location_src";
  document.getElementById("lang_list").innerHTML = "";
  document.getElementById("lang_list").appendChild(s);
}

// get languages used for each repository
// return list of repositories by name
function handleRepos(data) {
  console.log(data);
  repoCount = data.data.length;
  let repos = data.data.map(i => {
    getLanguages(i.name);
    return i.name;
  })
}

// accumulate bytes of each language from each repo
function handleLanguages(data) {
  repoCount -= 1;
  Object.entries(data.data).forEach(([key, value]) => {
    languages[key] ? languages[key] += value : languages[key] = value
  })
  // calcLanguages when handleLangs has been executed for every repo
  if (repoCount === 0) { calcLanguages(languages) }
}

// calculate percent of each language
function calcLanguages(langs) {
  let values = [];
  let total = Object.values(langs).reduce(
    (acc, cur) => acc + cur,
    0
  );
  let calculated =
    Object.entries(langs).sort(function(a, b) {
      return b[1] - a[1];
    }).map(([key, value]) => {
      let percent = (value/total)*100;
      if (percent > 1) {
        values.push([key, percent])
      }
      return `${key}: ${percent.toFixed(1)}%`
    })
  displayLanguages(calculated);
  mkSvg(values);
}

const suggestions = document.querySelector('.suggestions');

function displayLanguages(data) {
  let html = data.map(lang => {
    return `
      <li>
        <span class="name">${lang}</span>
      </li>  `
    }).join("");

  suggestions.innerHTML = html;
}

const searchInput = document.querySelector('.search');

let svgContent =
    [ `<circle class="donut-hole" cx="21" cy="21" r="16" fill="#fff"></circle>`,`<circle class="donut-ring" cx="21" cy="21" r="16" fill="transparent" stroke="#d2d3d4" stroke-width="3" role="presentation"></circle>` ];

function mkSvg(data) {
  let svg = document.querySelector(".donut");
  let offset = 0;
  svgContent.push(data.map((item, index) => {
    let dashoffset = offset;
    offset+=item[1];
    return (
      `<circle class="donut-segment" cx="21" cy="21" r="16" fill="transparent" stroke="${colors[index]}" stroke-width="3" stroke-dasharray="${item[1]} ${100-item[1]}" stroke-dashoffset="${100-dashoffset}" pointer-events="stroke" data-name="${item[0]}" data-value="${item[1].toFixed(1)}"></circle>`
    )
  }));
  svgContent.push(
    mkSvgText(100, (searchInput.value))
  )
  svg.innerHTML = (svgContent.join(""));
  svgClickListener();
}

function mkSvgText(num, label) {
  return (
  `<g class="chart-text">
    <text x="50%" y="50%" class="chart-number">
      ${num}
    </text>
    <text x="50%" y="50%" class="chart-label">
      <a href="http://www.github.com/${searchInput.value}">${label}</a>
    </text>
  </g>`
)}

function svgClickListener() {
  let segments = document.querySelectorAll('.donut-segment');
  console.log(segments);
  for (let i=0; i<segments.length; i++) {
    segments[i].addEventListener('click', updateSvgText);
  }
}

function updateSvgText() {
  document.querySelector('.chart-number').innerHTML = `${this.dataset.value}%`;
  document.querySelector('.chart-label').innerHTML = this.dataset.name;
}

// TESTING
// use for working on formatting without exhausting API limit

let example = {
  CSS: 634088,
  Crystal: 28668,
  HTML: 1108,
  Java: 40524,
  JavaScript: 88498,
  Makefile: 678,
  ObjectiveC: 1336890,
  PHP: 13212,
  Python: 3076128,
  Ruby: 2188,
  Shell: 520,
  Swift: 398572,
}

function tester() {
  calcLanguages(example);
}
