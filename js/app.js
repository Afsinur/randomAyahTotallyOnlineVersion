const body = q_s(`body`);
let loadAyah, getOneAyah, ayahHistoryDOM, maxRePrintCount, CORS_URL;
let ayahHistory = [];
let countRePrint = 0;
let totalSurah = 114;
let activeNodejsVersion = false;

activeNodejsVersion
  ? (CORS_URL = `http://localhost:1700`)
  : (CORS_URL = `https://raw.githubusercontent.com/Afsinur/islam-app/master`);

function setMaxRePrintCount() {
  maxRePrintCount = totalSurah;

  return true;
}

function convertBanglaNumber(str) {
  let numberObj = {
    "০": 0,
    "১": 1,
    "২": 2,
    "৩": 3,
    "৪": 4,
    "৫": 5,
    "৬": 6,
    "৭": 7,
    "৮": 8,
    "৯": 9,
  };
  let replcTxt = ``;

  Array.from(str.trim()).forEach((txt) => {
    let found = 0;

    for (const k in numberObj) {
      if (Object.hasOwnProperty.call(numberObj, k)) {
        const el = numberObj[k];

        if (txt === k) {
          replcTxt += el;
          found = 1;

          break;
        }
      }
    }

    if (found === 0) {
      if (txt === ".") {
        replcTxt += txt + " ";
      } else {
        replcTxt += txt;
      }
    }
  });

  return replcTxt.trim();
}

async function GET(url) {
  let res = await fetch(url);
  return await res.json();
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * max) + min;
}

function showHistory(surahNo, ayah, i) {
  let txt = ``;
  let templete = `
    <p style="padding: 4px">
      Quran( ${surahNo}: ${ayah} )
      <button class="historyBTN showHis" data-showid="${i}">show</button>
      <button class="historyBTN copyHis" data-cpyid="${i}">copy</button>
    </p>
  `;

  surahNo && ayah && (txt = templete);

  return txt;
}

function showAayahWithTemplate(
  name,
  id,
  arabic,
  english,
  bangla,
  historyArrLen,
  fromHistory
) {
  return `
  <div>
      ${
        fromHistory
          ? "<p class='fromVerseHistory afterScrollFlashAnim'>from verse history</p>"
          : ``
      }
      <p>${convertBanglaNumber(name)}</p><br>
      <p class="atahNoStyle">
        ${id}
        <button class="historyBTN copyHis" data-cpyid="${historyArrLen}">copy</button>
      </p><br>
      <p>${arabic}</p><br>
      <p>${english}</p><br>
      <p>${bangla}</p><br>
  </div>
  `;
}

function setBody() {
  body.innerHTML = ``;

  let bodyTemplate = `
    <div class="navDiv">get random verses from the Quran</div>

    <div class="app">      
      <div class="loadAyah"></div>
      <button class="getOneAyah">Get one ayah</button>
      <div class="ayahHistoryDOM"></div>
    </div>
    `;

  body.innerHTML = bodyTemplate;

  loadAyah = q_s(`div.loadAyah`);
  getOneAyah = q_s(`button.getOneAyah`);
  ayahHistoryDOM = q_s(`div.ayahHistoryDOM`);
  on_(getOneAyah, "click", GETaRandomAyah);
}

function hasAlreadyPrinted(surahNo, ayahNo) {
  let printed = false;

  for (let i = 0; i < ayahHistory.length; i++) {
    const el = ayahHistory[i];

    if (Number(el["surahNo"]) === surahNo && Number(el["ayah"]) === ayahNo) {
      printed = true;

      break;
    }
  }

  return printed;
}

async function GETaRandomAyah() {
  if (window.navigator.onLine) {
    setBody();

    loadAyah.innerHTML = `<p style="text-align: center;color: #4070ef">loading..</p>`;
    let surahNo = randomNumber(1, totalSurah);

    try {
      let allSurahInfoRes = await GET(
        `${CORS_URL}/json/quran/surah_Index.json`
      );
      let allSurahInfoData = allSurahInfoRes[surahNo - 1];

      try {
        let data = await GET(`${CORS_URL}/json/quran/surahs/${surahNo}.json`);
        let selectedAyahNo = randomNumber(0, data.length);
        let ayahData = data[selectedAyahNo];
        let ifPrinted = hasAlreadyPrinted(surahNo, selectedAyahNo + 1);

        if (ifPrinted) {
          let settedMaxPrintCounter = setMaxRePrintCount();

          if (settedMaxPrintCounter) {
            countRePrint++;

            if (maxRePrintCount >= countRePrint) {
              GETaRandomAyah();
            } else {
              loadAyah.innerHTML = `<div>Please reload the page</div>`;
            }
          }
        } else {
          countRePrint = 0;

          loadAyah.innerHTML = showAayahWithTemplate(
            allSurahInfoData["bangla"],
            ayahData["id"],
            ayahData["arabic"],
            ayahData["english"],
            ayahData["bangla"],
            0,
            0
          );

          //add a history
          let cpyTXT = `Quran( ${surahNo}: ${ayahData["id"]} )\n\n${ayahData["arabic"]}\n\n${ayahData["english"]}\n\n${ayahData["bangla"]}`;

          ayahHistory.unshift({
            surahNo,
            ayah: ayahData["id"],
            cpyTXT: {
              txt: cpyTXT,
              name: allSurahInfoData["bangla"],
              id: ayahData["id"],
              arabic: ayahData["arabic"],
              english: ayahData["english"],
              bangla: ayahData["bangla"],
            },
          });

          //show history
          await setHistoryDOM();
        }
      } catch (error) {
        console.log(error);
        handleNetworkErrors(`fetch`);
      }
    } catch (error) {
      console.log(error);
      handleNetworkErrors(`fetch`);
    }
  } else {
    handleNetworkErrors(`offline_network`);
  }
}

async function handleNetworkErrors(errorType) {
  let errorMSG = ``;

  if (errorType === `fetch`) {
    errorMSG = `fetch error! please try again`;
  }

  if (errorType === `offline_network`) {
    setBody();
    errorMSG = `network error! you are currently offline`;
  }

  if (errorType === `online_network`) {
    setBody();
    errorMSG = `network restored! you are currently online`;
  }

  loadAyah.innerHTML = `<p style="padding: 4px;text-align: center;color: #4070ef">${errorMSG}</p>`;
  await setHistoryDOM();
}

async function setHistoryDOM() {
  let setHistoryDOMfirst = new Promise((resolve, reject) => {
    ayahHistory.length > 0
      ? (ayahHistoryDOM.innerHTML += `<p>verse history:</p>`)
      : null;

    ayahHistory.forEach(({ surahNo, ayah }, i) => {
      ayahHistoryDOM.innerHTML += `${showHistory(surahNo, ayah, i)}`;
    });

    resolve(1);
  });

  await setHistoryDOMfirst;
}

//init
window.navigator.onLine
  ? GETaRandomAyah()
  : handleNetworkErrors(`offline_network`);
//event listeners
on_(body, "click", (e) => {
  let classArr = Array.from(e.target.classList);

  if (classArr.includes(`copyHis`)) {
    let historyArrIndex = Number(e.target.dataset.cpyid);
    navigator.clipboard.writeText(
      ayahHistory[historyArrIndex]["cpyTXT"]["txt"]
    );

    a_class(e.target, "copiedAnim");
    on_(e.target, "animationend", () => r_class(e.target, "copiedAnim"));
  }

  if (classArr.includes(`showHis`)) {
    let historyArrIndex = Number(e.target.dataset.showid);
    let { name, id, arabic, english, bangla } =
      ayahHistory[historyArrIndex]["cpyTXT"];

    loadAyah.innerHTML = showAayahWithTemplate(
      name,
      id,
      arabic,
      english,
      bangla,
      historyArrIndex,
      1
    );

    //reset color
    Array.from(e.target.parentNode.parentNode.children).forEach((cld, i) => {
      //hilight current history color
      if (cld === e.target.parentNode) {
        _css(cld, { color: "#4070ef" });
      } else {
        _css(cld, { color: "#454545" });
      }
    });

    q_s(`p.fromVerseHistory`).scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  }
});
on_(window, "online", () => {
  handleNetworkErrors(`online_network`);
});
on_(window, "offline", () => {
  handleNetworkErrors(`offline_network`);
});
