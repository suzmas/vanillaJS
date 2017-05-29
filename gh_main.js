


let repoCount = 0;
let languages = {};
let colors = ["#177efe", "#b1c94e", "#ce4b99", "#263ec9", "#ec693e", "#45ee5e"];


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
  console.log(data.meta.X-RateLimit-Remaining);
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
        values.push(percent)
      }
      return `${key}: ${percent.toFixed(2)}%`
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

const searchButton = document.querySelector('.searchButton');
const searchInput = document.querySelector('.search');
// searchButton.addEventListener('click', getRepos, false);

let svgContent =
    [ `<circle class="donut-hole" cx="21" cy="21" r="16" fill="#fff"></circle>`,`<circle class="donut-ring" cx="21" cy="21" r="16" fill="transparent" stroke="#d2d3d4" stroke-width="3" role="presentation"></circle>` ]

function mkSvg(data) {
  let svg = document.querySelector(".donut");
  let offset = 0;
  svgContent.push(data.map((item, index) => {
    let dashoffset = offset;
    offset+=item;
    return (
      `<circle class="donut-segment" cx="21" cy="21" r="16" fill="transparent" stroke="${colors[index]}" stroke-width="3" stroke-dasharray="${item} ${100-item}" stroke-dashoffset="${100-dashoffset}"></circle>`
    )
  }));
  svgContent.push(
    `<g class="chart-text">
      <text x="50%" y="50%" class="chart-number">
        ${Math.round(data[0])}
      </text>
      <text x="50%" y="50%" class="chart-label">
        <a href="http://www.github.com/${searchInput.value}">${searchInput.value}</a>
      </text>
    </g>`
  )
  svg.innerHTML = (svgContent.join(""));
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

searchButton.addEventListener('click', tester, false);
function tester() {
  calcLanguages(example);
}
