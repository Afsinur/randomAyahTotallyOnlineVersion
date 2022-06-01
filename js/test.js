const q_s = (el) => document.querySelector(el);
const on_ = (el, ev, f) => {
  el.addEventListener(ev, f);
};
const body = q_s(`body`);
let loadAyah;
let getOneAyah;

async function GET(url) {
  let res = await fetch(url);
  return await res.json();
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * max) + min;
}

function setBody() {
  body.innerHTML = ``;

  let bodyTemplate = `
    <div class="app">
      <div class="loadAyah"></div>
      <button class="getOneAyah">Get one ayah</button>
    </div>
    `;

  body.innerHTML = bodyTemplate;

  loadAyah = q_s(`div.loadAyah`);
  getOneAyah = q_s(`button.getOneAyah`);
  on_(getOneAyah, "click", GETaRandomAyah);
}

//https://raw.githubusercontent.com/Afsinur/islam-app/master/json/quran/surah_Index.json
//https://raw.githubusercontent.com/Afsinur/islam-app/master/json/quran/surahs/1.json
async function GETaRandomAyah() {
  setBody();

  loadAyah.innerHTML = "loading..";
  let surahNo = randomNumber(1, 114);

  try {
    let allSurahInfoRes = await GET(
      `https://raw.githubusercontent.com/Afsinur/islam-app/master/json/quran/surah_Index.json`
    );
    let allSurahInfoData = allSurahInfoRes[surahNo - 1];

    try {
      let data = await GET(
        `https://raw.githubusercontent.com/Afsinur/islam-app/master/json/quran/surahs/${surahNo}.json`
      );
      let ayahData = data[randomNumber(1, data.length - 1)];

      loadAyah.innerHTML = `
             <div>
                  <p>${allSurahInfoData["bangla"]}</p><br>
                  <p>${ayahData["id"]}</p><br>
                  <p>${ayahData["arabic"]}</p><br>
                  <p>${ayahData["english"]}</p><br>
                  <p>${ayahData["bangla"]}</p><br>
             </div>
            `;
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
}

//init
setBody();
