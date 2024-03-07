// apiのurl
const apiUrl = 'http://localhost:8000/api';


// htmlをエスケープする
function escapeHTML(text){
    let result = text;
    result = result.replaceAll("&", "&amp;");
    result = result.replaceAll("<", "&lt;");
    result = result.replaceAll(">", "&gt;");
    result = result.replaceAll('"', "&quot;");
    result = result.replaceAll("'", "&#39;");
    result = result.replaceAll("`", "&#96;");
    return result;
}

// unixTimeを YYYY-MM-DD HH-MM-SS (day) に変換
function formatTime(unixTime) {
    const date = new Date(unixTime * 1000);

    const formattedDate = date.getFullYear() + '-' +
        ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
        ('0' + date.getDate()).slice(-2);
    const formattedTime = ('0' + date.getHours()).slice(-2) + ':' +
        ('0' + date.getMinutes()).slice(-2) + ':' +
        ('0' + date.getSeconds()).slice(-2);
    const formattedDay = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    return `${formattedDate} ${formattedTime} (${formattedDay})`;
}

// 現在のunixTime
function currentUnixTime() {
    const currentDateTime = new Date();
    const unixTime = Date.parse(currentDateTime) / 1000;
    return unixTime;
}

// 秒数を DDMMHHSS に変換
function secondsToDDHHMMSS(seconds) {
    const absSeconds = Math.abs(seconds);
    const days = Math.floor(absSeconds / 86400);
    const hours = Math.floor((absSeconds % 86400) / 3600);
    const minutes = Math.floor((absSeconds % 3600) / 60);
    const remainingSeconds = absSeconds % 60;

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedHours = String(hours).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    let formattedTime;
    if (days == 0) {
        formattedTime = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }else{
        formattedTime = `${days}日と ${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }

    return seconds < 0 ? `-${formattedTime}` : formattedTime;
}

// 難易度を色に変換
function diffToColor(difficulty){
    switch (true) {
        case 2800 <= difficulty:
            return "Red";
        case 2400 <= difficulty:
            return "Orange";
        case 2000 <= difficulty:
            return "Yellow";
        case 1600 <= difficulty:
            return "Blue";
        case 1200 <= difficulty:
            return "Cyan";
        case 800 <= difficulty:
            return "Green";
        case 400 <= difficulty:
            return "Brown";
        case 0 <= difficulty:
            return "Gray";
        default:
            return "Gray";
    }
}


// 右下の時計を表示
function displayRightBottomTime(unixTime){
    const clock = document.getElementById("clock");
    clock.textContent = formatTime(unixTime);
}
displayRightBottomTime(currentUnixTime());
// 時計を定期的に更新
setInterval(() => {
    displayRightBottomTime(currentUnixTime());
    // console.log(formatTime(currentUnixTime()));
}, 200);

// 取得したデータを保存しておく
let acquiredData;
function saveData(data){
    acquiredData = data;
    console.log('Acquired Data', acquiredData);
    // コンテストリスト/コンテスト
    if (code == 'main'){
        document.getElementById("sortStart").value = "0-9";
        displayContestsList('sort', 'start');
        // setInterval(() => {
        //     displayContestsList();
        // }, 200);
    }else if (code == 'contest'){
        displayContest(acquiredData);
    }
}

let code = 'main';
// urlの#によって表示する要素を変更
window.addEventListener('hashchange', function() {
    // # を取り除く
    const hash = window.location.hash.substring(1);
    // console.log(hash);
    // #?の順の時だと#以降は全て#になってしまうので、以下が必要
    // hash = hash.split('?')[0];
    // console.log(hash);
    const list = document.getElementById("list");
    const contest = document.getElementById("contest");
    const create = document.getElementById("create");
    const tab1 = document.getElementById("tab1");
    const tab2 = document.getElementById("tab2");
    // コンテンツの表示/非表示を切り替え
    if (hash === 'list' || hash === 'running' || hash === 'upcoming' || hash === 'recent') {
        code = 'main';
        list.style.display = 'block';
        contest.style.display = 'none';
        create.style.display = 'none';
        tab1.classList.add("active-box");
        tab2.classList.remove("active-box");
        resetHeight();
        console.log('#list');
    } else if (hash === 'contest' || hash === 'problems' || hash === 'ranking') {
        code = 'contest';
        list.style.display = 'none';
        contest.style.display = 'block';
        create.style.display = 'none';
        tab1.classList.add("active-box");
        tab2.classList.remove("active-box");
        console.log('#contest');
    } else if (hash === 'create') {
        code = 'main';
        list.style.display = 'none';
        contest.style.display = 'none';
        create.style.display = 'block';
        tab1.classList.remove("active-box");
        tab2.classList.add("active-box");
        console.log('#create');
    } else {
        // デフォルト
        code = 'main';
        list.style.display = 'block';
        contest.style.display = 'none';
        create.style.display = 'none';
        tab1.classList.add("active-box");
        tab2.classList.remove("active-box");
        resetHeight();
        console.log('#none');
    }
});
// 初回読み込み時も処理を実行
window.dispatchEvent(new Event('hashchange'));

// コンテストデータをhtmlボックス(div)に
function listBox(contestData){
    const currentTime = currentUnixTime();
    const startTime = contestData.startAt;
    const endTime = contestData.startAt + contestData.durationSecond;

    const newListBox = document.createElement('div');
    newListBox.classList.add("listGroup");
    let itemClass;
    let timerClass = "";
    if (currentTime < startTime) {
        itemClass = "upcomingContest";
    } else if (currentTime <= endTime){
        itemClass = "runningContest";
        timerClass = " timerRunning";
    } else {
        itemClass = "recentContest";
    }

    let diffBox = "";
    const problems = contestData.problems;
    problems.forEach(problem => {
        diffBox += `<div class="diffBox diff${diffToColor(problem.difficulty)}"></div>`;
    });

    // ボックスのhtml
    newListBox.innerHTML = `
        <a class="listLink" href="virtual_contest.html?ID=${contestData.virtualContestID}#contest"></a>
        <div class="listItem ${itemClass}">
            <p class="title" id="contestTitle${contestData.virtualContestID}"></p>
            <p class="space"></p>
            <p class="time">${formatTime(startTime)}</p>
            <p class="space"></p>
            <p class="timer${timerClass}" id="timer${contestData.virtualContestID}"></p>
            <p class="space"></p>
            <p class="time">${formatTime(endTime)}</p>
            <p class="space"></p>
            <p class="memNum">${contestData.members.length}</p>
            <p class="space"></p>
            <div class="diff">${diffBox}</div>
        </div>
    `;
    
    // 開催中の場合、進捗を円で表示
    if(itemClass == "runningContest"){
        const timer = newListBox.querySelector(`#timer${contestData.virtualContestID}`);
        timer.style.setProperty('--percent', `${(endTime-currentUnixTime()) / contestData.durationSecond * 100}%`);
        setInterval(() => {
            timer.style.setProperty('--percent', `${(endTime-currentUnixTime()) / contestData.durationSecond * 100}%`);
        }, 200);
    }

    // 検索の一致をハイライト
    const result = newListBox.querySelector(`#contestTitle${contestData.virtualContestID}`);
    const regex = new RegExp(filterSearch.value, 'ig');
    const target = contestData.title;
    if(filterSearch.value && target.match(regex)){
        let resultString = target.replace(regex, match => `[[mark class=highlight]]${match}[[/mark]]`);
        resultString = escapeHTML(resultString);
        resultString = resultString.replaceAll('[[mark class=highlight]]', '<mark class="highlight">');
        result.innerHTML = resultString.replaceAll('[[/mark]]', '</mark>');

        // // const markRegex = new RegExp("\[\[mark class=highlight\]\]([^[]+?)\[\[/mark\]\]", "g")
        // // result.innerHTML = resultString.replace(markRegex, match => `<mark class="highlight">${match}</mark>`)


        // const text = escapeHTML(target);
        // result.innerHTML = text.replace(regex, match => `<mark class="highlight">${match}</mark>`);

        
        // let resultString = target;
        // result.innerHTML = resultString.replace(regex, match => {
        //     resultString = escapeHTML(resultString);
        //     return `<mark class="highlight">${match}</mark>`
        // });
    }else{
        result.textContent = target;
    }

    return newListBox;
}

// 時間を他の2つに合わせて自動入力
// 引数: place = ("create", "edit"), type = ('Start', 'Duration', 'End')
function timeAutoInput(place = "create", type = 'Start'){
    const startTime = document.getElementById(`${place}StartTime`).value;
    const durationTime = document.getElementById(`${place}DurationTime`).value;
    const endTime = document.getElementById(`${place}EndTime`).value;
    const unixStartTime = Date.parse(startTime) / 1000;
    const unixEndTime = Date.parse(endTime) / 1000;
    if(type == 'Start' || type == 'Duration'){
        let durationSecond;
        if(durationTime){
            durationSecond = durationTime * 60;
        }else{
            durationSecond = 0;
            document.getElementById(`${place}DurationTime`).value = 0;
        }
        const convertedDateTime = new Date((unixStartTime + durationSecond) * 1000);
        const year = convertedDateTime.getFullYear();
        const month = (convertedDateTime.getMonth() + 1).toString().padStart(2, '0');
        const day = convertedDateTime.getDate().toString().padStart(2, '0');
        const hours = convertedDateTime.getHours().toString().padStart(2, '0');
        const minutes = convertedDateTime.getMinutes().toString().padStart(2, '0');
        document.getElementById(`${place}EndTime`).value = `${year}-${month}-${day}T${hours}:${minutes}`;
    }else if(type == 'End'){
        let durationSecond = unixEndTime - unixStartTime;
        if(durationSecond >= 0){
            document.getElementById(`${place}DurationTime`).value = durationSecond / 60;
        }else{
            durationSecond = 0;
            document.getElementById(`${place}DurationTime`).value = durationSecond / 60;
            timeAutoInput(`${place}`,'Duration');
        }
    }
}

// ID,problemを入力する箱を追加
let addDivIndex = {
    "createName": 0,
    "createPro": 0,
    "editName": 0,
    "editPro": 0
}
// 引数: type = ("createName", "createPro", "editName", "editPro")
function addDiv(type = "createName"){
    const container = document.getElementById(`${type}BoxContainer`);
    addDivIndex[type] ++;
    const divIndex = addDivIndex[type];
    
    const newBoxGroup = document.createElement('div');
    newBoxGroup.classList.add(`${type}BoxGroup`);
    if(type == "createName" || type == "editName"){
        newBoxGroup.innerHTML = `
            <input type="text" class="${type}" id="${type}${divIndex}" placeholder="AtCoderID">
            <button onclick="removeDiv(this, '${type}')">-</button>
        `;
    }else if(type == "createPro" || type == "editPro"){
        newBoxGroup.innerHTML = `
            <div class="switch-container">
                <label class="switch-label" for="${type}Toggle${divIndex}">
                    Color
                    <label class="switch">
                        <input type="checkbox" class="${type}Toggle" id="${type}Toggle${divIndex}" onchange="switchPro(${divIndex}, '${type}')">
                        <span class="slider"></span>
                    </label>
                    ID
                </label>
            </div>
            <div class="stringSpace"></div>
            <select class="${type}Select" id="${type}Select${divIndex}">
                <option value="Gray">Gray</option>
                <option value="Brown">Brown</option>
                <option value="Green">Green</option>
                <option value="Cyan">Cyan</option>
                <option value="Blue">Blue</option>
                <option value="Yellow">Yellow</option>
                <option value="Orange">Orange</option>
                <option value="Red">Red</option>
            </select>
            <input type="text" class="${type}Text" placeholder="abc000_a" id="${type}Text${divIndex}">
            <button onclick="removeDiv(this, '${type}')">-</button>
        `;
    }
    container.appendChild(newBoxGroup);
}

// 入力ボックスを消す
// 引数: button = 消す要素のボタン, type = 同上
function removeDiv(button, type = "createName"){
    const container = document.getElementById(`${type}BoxContainer`);
    const group = button.parentNode;
    container.removeChild(group);
}

// problem入力ボックスの 色,問題ID の表示を切り替え
// 引数: proBoxId = 箱のID, type = ("createPro", "editPro")
function switchPro(proBoxId, type = "createPro"){
    const togglePro = document.getElementById(`${type}Toggle${proBoxId}`).checked;
    const selectBox = document.getElementById(`${type}Select${proBoxId}`);
    const textBox = document.getElementById(`${type}Text${proBoxId}`);
    if(togglePro){
        selectBox.style.display = 'none';
        textBox.style.display = 'block';
    }else{
        selectBox.style.display = 'block';
        textBox.style.display = 'none';
    }
}

// データを作成,編集画面に自動入力
// 引数: data = 入力するデータ, place = ("create", "edit")
function autoInput(data, place = "create"){
    document.getElementById(`${place}Title`).value = data.title;

    if(place == "edit"){
        const convertedDateTime = new Date(data.startAt * 1000);
        const year = convertedDateTime.getFullYear();
        const month = (convertedDateTime.getMonth() + 1).toString().padStart(2, '0');
        const day = convertedDateTime.getDate().toString().padStart(2, '0');
        const hours = convertedDateTime.getHours().toString().padStart(2, '0');
        const minutes = convertedDateTime.getMinutes().toString().padStart(2, '0');
        document.getElementById(`${place}StartTime`).value = `${year}-${month}-${day}T${hours}:${minutes}`;
        document.getElementById(`${place}DurationTime`).value = data.durationSecond / 60;
        timeAutoInput(`${place}`, 'Start');
    }

    let nameBoxes = document.querySelectorAll(`.${place}NameBoxGroup`);
    const members = data.members;
    while(nameBoxes.length < members.length){
        addDiv(`${place}Name`);
        nameBoxes = document.querySelectorAll(`.${place}NameBoxGroup`);
    }
    const names = document.querySelectorAll(`.${place}Name`);
    names.forEach((name, index) => {
        name.value = members[index];
    });
    
    let proBoxes = document.querySelectorAll(`.${place}ProBoxGroup`);
    const problems = data.problems;
    while(proBoxes.length < problems.length){
        addDiv(`${place}Pro`);
        proBoxes = document.querySelectorAll(`.${place}ProBoxGroup`);
    }
    const toggles = document.querySelectorAll(`.${place}ProToggle`);
    const selects = document.querySelectorAll(`.${place}ProSelect`);
    const texts = document.querySelectorAll(`.${place}ProText`);
    if(place == "edit"){
        toggles.forEach((toggle, index) => {
            toggle.checked = true;
            switchPro(index, `${place}Pro`);
        });
    }
    texts.forEach((text, index) => {
        text.value = problems[index].problemID;
    });
    selects.forEach((select, index) => {
        select.value = diffToColor(problems[index].difficulty);
    });
}

// データを取得
// 引数: place = ("create", "edit")
function pickData(place = "create"){
    const startTime = document.getElementById(`${place}StartTime`).value;
    const startAt = Date.parse(startTime) / 1000;
    const durationSecond = document.getElementById(`${place}DurationTime`).value * 60;
    const title = document.getElementById(`${place}Title`).value;

    const members = [];
    const names = document.querySelectorAll(`.${place}Name`);
    names.forEach(name => {
        members.push(name.value);
    });
    const problems = [];
    const proBoxes = document.querySelectorAll(`.${place}ProBoxGroup`);
    proBoxes.forEach(proBox => {
        const togglePro = proBox.getElementsByClassName(`${place}ProToggle`)[0].checked;
        const color = proBox.getElementsByClassName(`${place}ProSelect`)[0].value;
        const text = proBox.getElementsByClassName(`${place}ProText`)[0].value;
        if(!togglePro || text == ""){
            problems.push(color);
        }else{
            problems.push(text);
        }
    });

    const data = {
        "startAt": startAt,
        "durationSecond": durationSecond,
        "title": title,
        "visible": "All",
        "serverID": "100000812800000000",
        "members": members,
        "problems": problems
    };
    console.log('Pick Data', data);
    return data;
}

// データを並び替え,絞り込み
// 引数: data = コンテストリスト, method = ('sort', 'filter'), keyword = sortの時に、参照するセレクトボックス('title', 'start', 'end')
let sortTag = 'start';
function convertData(data, method = 'filter', keyword = ''){
    const sortTitle = document.getElementById("sortTitle");
    const sortStart = document.getElementById("sortStart");
    const sortEnd = document.getElementById("sortEnd");
    const filterSearch = document.getElementById("filterSearch");
    const filterVisible = document.getElementById("filterVisible");
    
    // 並び替え方法を保存
    if(method == 'sort'){
        sortTag = keyword;
    }

    let newData = data;
    
    // visibleで絞り込み
    if(filterVisible.value != "none"){
        newData = newData.filter(item => item.visible == filterVisible.value);
    }
    // newData = newData.filter(item => item.visible == "All");
    
    // 検索
    const regex = new RegExp(filterSearch.value, 'ig');
    newData = newData.filter(item => JSON.stringify(item.title).match(regex));

    // 並べ替える
    // noneを選択すると自動で開始時刻昇順になる
    if(sortTag == 'title'){
        // sortTitle.value = "none";
        sortStart.value = "none";
        sortEnd.value = "none";
        if(sortTitle.value == "a-z"){
            newData.sort((a, b) => a.title.localeCompare(b.title));
        }else if(sortTitle.value == "z-a"){
            newData.sort((a, b) => b.title.localeCompare(a.title));
        }else if(sortTitle.value == "none"){
            sortStart.value = "0-9";
            newData.sort((a, b) => a.startAt - b.startAt);
        }
    }else if(sortTag == 'start'){
        sortTitle.value = "none";
        // sortStart.value = "none";
        sortEnd.value = "none";
        if(sortStart.value == "0-9"){
            newData.sort((a, b) => a.startAt - b.startAt);
        }else if(sortStart.value == "9-0"){
            newData.sort((a, b) => b.startAt - a.startAt);
        }else if(sortStart.value == "none"){
            sortStart.value = "0-9";
            newData.sort((a, b) => a.startAt - b.startAt);
        }
    }else if(sortTag == 'end'){
        sortTitle.value = "none";
        sortStart.value = "none";
        // sortEnd.value = "none";
        if(sortEnd.value == "0-9"){
            newData.sort((a, b) => (a.startAt + a.durationSecond) - (b.startAt + b.durationSecond));
        }else if(sortEnd.value == "9-0"){
            newData.sort((a, b) => (b.startAt + b.durationSecond) - (a.startAt + a.durationSecond));
        }else if(sortEnd.value == "none"){
            sortStart.value = "0-9";
            newData.sort((a, b) => a.startAt - b.startAt);
        }
    }
    console.log('NewData', newData);
    return newData;
}

// コンテストのリストを表示
// 引数: 同上
function displayContestsList(method = 'filter', keyword = '') {
    const upcoming = document.getElementById("upcoming");
    const running = document.getElementById("running");
    const recent = document.getElementById("recent");
    upcoming.innerHTML = '<h3>Upcoming Contests<a href="virtual_contest.html#upcoming"></a></h3>';
    running.innerHTML = '<h3>Running Contests<a href="virtual_contest.html#running"></a></h3>';
    recent.innerHTML = '<h3>Recent Contests<a href="virtual_contest.html#recent"></a></h3>';
    const currentTime = currentUnixTime();

    convertData(acquiredData, method, keyword).forEach(item => {
        // console.log(item);
        const startTime = item.startAt;
        const endTime = item.startAt + item.durationSecond;

        const newListBox = listBox(item);

        if (currentTime < startTime) {
            upcoming.appendChild(newListBox);
        } else if (currentTime <= endTime){
            running.appendChild(newListBox);
        } else {
            recent.appendChild(newListBox);
        }
    });
    resetHeight();
}

// 進捗円の高さを調整
function resetHeight(){
    const timers = document.querySelectorAll(".timerRunning");
    timers.forEach(timer => {
        const width = window.getComputedStyle(timer).width;
        timer.style.height = width;
    });
}

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

// メインページの時のみ実行する関数
if (code == 'main') {
    console.log('#list2');
    
    // コンテストリストを取得
    function getContestsList(){
        console.log(`${apiUrl}/virtual_contests`);
        fetch(`${apiUrl}/virtual_contests`, {
            // mode: 'no-cors',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => saveData(data))
            .catch(error => console.error('GET Error:', error.message));
    }
    getContestsList();
}

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

// コンテストページの時のみ実行する関数
if (code == 'contest') {
    console.log('#contest2');

    // クエリパラメータを取得
    function getQueryParameter(parameterName) {
        const queryString = window.location.search;
        // console.log(queryString);
        const urlParams = new URLSearchParams(queryString);
        if (urlParams.get(parameterName)) {
            return urlParams.get(parameterName);
        } else {
            return '1';
        }
    }
    const virtualContestID = getQueryParameter('ID');
    console.log(virtualContestID);
    document.getElementById("problems").innerHTML = `Problems<a href="virtual_contest.html?ID=${virtualContestID}#problems"></a>`;
    document.getElementById("ranking").innerHTML = `Problems<a href="virtual_contest.html?ID=${virtualContestID}#ranking"></a>`;

    // コンテストの情報を取得
    function getContest(){
        console.log(`${apiUrl}/virtual_contests/${virtualContestID}`);
        fetch(`${apiUrl}/virtual_contests/${virtualContestID}`, {
            // mode: 'no-cors',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => saveData(data))
            .catch(error => console.error('GET Error:', error.message));
    }

    // コンテストの状態を表示
    function displayLimit(data){
        const currentTime = currentUnixTime();
        const startTime = data.startAt;
        const endTime = data.startAt + data.durationSecond;

        let limitContent;
        if (currentTime < startTime) {
            limitContent = `<p class="timeS">開始まで:</p><p>${secondsToDDHHMMSS(startTime-currentTime)}</p>`;
        } else if (currentTime <= endTime){
            limitContent = `<p class="timeS">終了まで:</p><p>${secondsToDDHHMMSS(endTime-currentTime)}</p>`;
        } else {
            limitContent = `<p class="timeS">終了から:</p><p>${secondsToDDHHMMSS(currentTime-endTime)}</p>`;
        }
        document.getElementById("limitTime").innerHTML = `${limitContent}`;
    }
    
    let contestStartTime;
    // コンテストの情報を表示
    function displayContest(data) {
        const startTime = data.startAt;
        contestStartTime = startTime;
        const endTime = data.startAt + data.durationSecond;
        
        document.getElementById("contestTimes").innerHTML =`
            <h2 id="titleContent">
                <a href="virtual_contest.html?ID=${data.virtualContestID}#contest"></a>
            </h2>
            <div>
                <div class="time">
                    <p class="timeS">Start:</p><p>${formatTime(startTime)}</p>
                </div>
                <div class="time">
                    <p class="timeS">End:</p><p>${formatTime(endTime)}</p>
                </div>
                <div id="limitTime" class="time"></div>
            </div>
        `;
        const titleContent =  document.getElementById("titleContent");
        titleContent.textContent = data.title;
        const newA = document.createElement('a');
        newA.href = `virtual_contest.html?ID=${data.virtualContestID}#contest`;
        titleContent.appendChild(newA);

        displayLimit(acquiredData);
        setInterval(() => {
            displayLimit(acquiredData);
        }, 200);

        const membersContent = document.getElementById("membersContent");
        membersContent.textContent = "";
        data.members.forEach(member => {
            const newLi = document.createElement('li');
            newLi.textContent = member;
            membersContent.appendChild(newLi);
        });

        // problemのtable 2つに問題の情報を表示
        const problemsBody = document.getElementById("problemsBody");
        const resultHeadRow = document.getElementById("resultHeadRow");
        problemsBody.textContent = "";
        resultHeadRow.innerHTML = '<th class="index"></th><th class="name">Name</th><th class="totalScore">Score</th>';

        const problems = data.problems;
        problems.forEach((problem, index) => {
            const url = `https://atcoder.jp/contests/${problem.contestID}/tasks/${problem.problemID}`;
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <th class="index diffBox diff${diffToColor(problem.difficulty)}">
                    <a href="${url}" rel="noopener" target="_blank" class="proLink">${index + 1}</a>
                </th>
                <td>
                    <a href="${url}" rel="noopener" target="_blank" id="problemName${index + 1}" class="title"></a>
                </td>
                <td class="point">${problem.point}</td>
            `;
            newRow.querySelector(`#problemName${index + 1}`).textContent = problem.name;
            
            problemsBody.appendChild(newRow);

            const newHead = document.createElement('th');
            newHead.classList.add("scores");
            newHead.classList.add("diffBox");
            newHead.classList.add(`diff${diffToColor(problem.difficulty)}`);
            newHead.innerHTML = `<a href="${url}" rel="noopener" target="_blank" class="proLink">${index + 1}</a>`;
            resultHeadRow.appendChild(newHead);
        });
        // 背景色を透過
        const diffBoxes = document.querySelectorAll(".diffBox");
        diffBoxes.forEach(diffBox => {
            const currentColor = window.getComputedStyle(diffBox).backgroundColor;
            const newColor = currentColor.replace("rgb", "rgba").replace(")", ", " + 0.6 + ")");
            diffBox.style.backgroundColor = newColor;
        });

        autoInput(data, "edit");
    }

    // コンテスト結果を取得
    function getResult(){
        // console.log(`${apiUrl}/virtual_contests/standings/${virtualContestID}`);
        fetch(`${apiUrl}/virtual_contests/standings/${virtualContestID}`, {
            // mode: 'no-cors',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => displayResult(data))
            .catch(error => console.error('GET Error:', error.message));
    }
    // コンテスト結果を表示
    function displayResult(data) {
        const resultBody = document.getElementById("resultBody");
        resultBody.innerHTML = "";
        // スコア順に並べ替え
        data.sort((a, b) => b.point - a.point);
        data.forEach((member, index) => {
            const newRow = document.createElement('tr');
            let timeString = "";
            if(member.time >= contestStartTime){
                timeString = secondsToDDHHMMSS(member.time-contestStartTime);
            }
            newRow.innerHTML = `
                <th>${index + 1}</th>
                <td id="atcoderID${index + 1}"></td>
                <td>
                    <div class="score" id="totalScore${index + 1}">${member.point}</div>
                    <div class="time">${timeString}</div>
                </td>
            `;
            newRow.querySelector(`#atcoderID${index + 1}`).textContent = member.atcoderID;
            
            const problems = member.problems;
            let penalties = 0;
            problems.forEach(problem => {
                const penalty = problem.penalty;
                penalties += penalty;
                let penaltyString = "";
                if(penalty > 0){
                    penaltyString = `<span class="penalty">(${penalty})</span>`;
                }
                const newEachScore = document.createElement('td');
                if (problem.accepted) {
                    newEachScore.innerHTML = `
                        <div class="score">${problem.point}${penaltyString}</div>
                        <div class="time">${secondsToDDHHMMSS(problem.time-contestStartTime)}</div>
                    `;
                }
                newRow.appendChild(newEachScore);
            });

            if(penalties > 0){
                newRow.querySelector(`#totalScore${index + 1}`).innerHTML += `<span class="penalty">(${penalties})</span>`;
            }

            resultBody.appendChild(newRow);
        });
        // 更新時刻を表示
        console.log(`Result at ${formatTime(currentUnixTime())}`, data);
        document.getElementById("reloadTime").textContent = `${formatTime(currentUnixTime())} 最終更新`;
    }
    getContest();
    getResult();
    // 定期的に結果を更新
    setInterval(() => {
        getResult();
    }, 10000);

    // コンテストの表示,編集を切り替え
    function switchEdit(){
        const toggleEdit = document.getElementById("toggleEdit").checked;
        if(toggleEdit){
            document.documentElement.style.setProperty('--displayView','none');
            document.documentElement.style.setProperty('--displayEdit','block');
        }else{
            document.documentElement.style.setProperty('--displayView','block');
            document.documentElement.style.setProperty('--displayEdit','none');
        }
    }
    // ページを表示して少ししたら確認
    // "戻る"でedit状態に移行した際に反映させる為
    setTimeout(() => {
        switchEdit();
    }, 8);

    // コンテスト編集を送信
    function editContest(){
        // PUTリクエストを送信
        fetch(`${apiUrl}/virtual_contests/${virtualContestID}`, {
            // mode: 'no-cors',
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pickData("edit")),
        })
            .then(response => response.json())
            .then(data => editSuccess(data))
            .catch(error => console.error('PUT Error:', error));
    }
    // 編集成功したらページをリロード
    function editSuccess(data){
        window.location.reload();
    }
}

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

// メインページの時のみ実行する関数
if (code == 'main') {
    console.log('#create2');

    // コンテストをセッションに保存
    function saveContestData(contestData){
        console.log('Save Data:', contestData);
        sessionStorage.setItem('myContestData', JSON.stringify(data));
    }

    // セッションのデータを取得して自動入力
    function loadContestData(){
        const myContestData = JSON.parse(sessionStorage.getItem('myContestData'));
        console.log('Load Data:', myContestData);
        if(myContestData){
            autoInput(myContestData, "create");
        }else{
            addDiv("createName");
            addDiv("createName");
            addDiv("createPro");
            addDiv("createPro");
        }
    }
    loadContestData();

    // ページ読み込み時に現在時刻を設定
    window.onload = function() {
        const currentDateTime = new Date();
        console.log(currentDateTime);
        const year = currentDateTime.getFullYear();
        const month = (currentDateTime.getMonth() + 1).toString().padStart(2, '0');
        const day = currentDateTime.getDate().toString().padStart(2, '0');
        const hours = currentDateTime.getHours().toString().padStart(2, '0');
        const minutes = currentDateTime.getMinutes().toString().padStart(2, '0');
        // 現在時刻をフォーマットして設定
        document.getElementById("createStartTime").value = `${year}-${month}-${day}T${hours}:${minutes}`;
        timeAutoInput("create", 'Start');
    };
    
    // コンテスト作成を送信
    function createContest(){
        // POSTリクエストを送信
        fetch(`${apiUrl}/virtual_contests`, {
            // mode: 'no-cors',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pickData("create")),
        })
            .then(response => response.json())
            .then(data => createSuccess(data))
            // .then(data => console.log('POST Response:', data))
            .catch(error => {
                createError();
                console.error('POST Error:', error);
            });
    }
    // 作成したコンテストを表示
    function createSuccess(data) {
        // 最後に作成したコンテストをセッションに保存
        saveContestData(data);
        const notice = document.getElementById("createDisplay");
        const newP = document.createElement('p');
        newP.textContent = 'Create Successfully!';
        notice.appendChild(newP);
        notice.appendChild(listBox(data));
        resetHeight();
    }
    // 作成失敗時のアラート
    function createError(){
        const notice = document.getElementById("createDisplay");
        const newP = document.createElement('p');
        newP.textContent = 'Create Failed';
        notice.appendChild(newP);
    }
}
