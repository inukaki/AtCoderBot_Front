const apiUrl = 'http://localhost:8000/api';

let acquiredData;
function saveData(data){
    acquiredData = data;
    console.log("Acquired Data", acquiredData);

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

function escapeHTML(target){
    let result = target;
    result = result.replaceAll("&", "&amp;");
    result = result.replaceAll("<", "&lt;");
    result = result.replaceAll(">", "&gt;");
    result = result.replaceAll('"', "&quot;");
    result = result.replaceAll("'", "&#39;");
    result = result.replaceAll("`", "&#96;");
    return result;
}

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

function currentUnixTime() {
    const currentDateTime = new Date();
    const unixTime = Date.parse(currentDateTime) / 1000;
    return unixTime;
}

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

function displayRightBottomTime(unixTime){
    const clock = document.getElementById("clock");
    clock.textContent = formatTime(unixTime);
}
displayRightBottomTime(currentUnixTime());

setInterval(() => {
    displayRightBottomTime(currentUnixTime());
    // console.log(formatTime(currentUnixTime()));
}, 200);


let code = 'main';
// urlの#によって表示する要素を変更
window.addEventListener('hashchange', function() {
    var hash = window.location.hash.substring(1); // # を取り除く
    // console.log(hash);
    // #?の順の時だと#以降は全て#になってしまうので、これが必要
    // hash = hash.split('?')[0];
    // console.log(hash);
    var list = document.getElementById('list');
    var contest = document.getElementById('contest');
    var create = document.getElementById('create');

    const tab1 = document.getElementById("tab1");
    const tab2 = document.getElementById("tab2");

    // コンテンツの表示/非表示を切り替え
    if (hash === 'list') {
        code = 'main';
        list.style.display = 'block';
        contest.style.display = 'none';
        create.style.display = 'none';
        tab1.classList.add("active-box");
        tab2.classList.remove("active-box");
        console.log("#list");
    } else if (hash === 'contest') {
        code = 'contest';
        list.style.display = 'none';
        contest.style.display = 'block';
        create.style.display = 'none';
        tab1.classList.add("active-box");
        tab2.classList.remove("active-box");
        console.log("#contest");
    } else if (hash === 'create') {
        code = 'main';
        list.style.display = 'none';
        contest.style.display = 'none';
        create.style.display = 'block';
        tab1.classList.remove("active-box");
        tab2.classList.add("active-box");
        console.log("#create");
    } else {
        // ハッシュが未定義の場合や対応するものがない場合のデフォルト設定
        code = 'main';
        list.style.display = 'block';
        contest.style.display = 'none';
        create.style.display = 'none';
        tab1.classList.add("active-box");
        tab2.classList.remove("active-box");
        console.log("#none");
    }
});

// 初回読み込み時も処理を実行
window.dispatchEvent(new Event('hashchange'));


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


function listBox(contestData){
    const currentTime = currentUnixTime();
    const startTime = contestData.startAt;
    const endTime = contestData.startAt + contestData.durationSecond;

    const newListBox = document.createElement('div');
    newListBox.classList.add('listGroup');
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
    
    if(itemClass == "runningContest"){
        const timer = newListBox.querySelector(`#timer${contestData.virtualContestID}`);
        timer.style.setProperty('--percent', `${(endTime-currentUnixTime()) / contestData.durationSecond * 100}%`);
        setInterval(() => {
            timer.style.setProperty('--percent', `${(endTime-currentUnixTime()) / contestData.durationSecond * 100}%`);
        }, 200);
    }

    const result = newListBox.querySelector(`#contestTitle${contestData.virtualContestID}`);
    const regex = new RegExp(filterSearch.value, "ig");
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


function timeAutoInput(place = "create", type = "Start"){
    const startTime = document.getElementById(`${place}StartTime`).value;
    const durationTime = document.getElementById(`${place}DurationTime`).value;
    const endTime = document.getElementById(`${place}EndTime`).value;
    const unixStartTime = Date.parse(startTime) / 1000;
    const unixEndTime = Date.parse(endTime) / 1000;
    if(type == "Start" || type == "Duration"){
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
    }else if(type == "End"){
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
let addDivIndex = {
    "createName": 0,
    "createPro": 0,
    "editName": 0,
    "editPro": 0
}
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
function removeDiv(button, type = "createName"){
    const container = document.getElementById(`${type}BoxContainer`);
    const group = button.parentNode;
    container.removeChild(group);
}
function switchPro(proBoxId = 0, type = "createPro"){
    const togglePro = document.getElementById(`${type}Toggle${proBoxId}`).checked;
    const selectBox = document.getElementById(`${type}Select${proBoxId}`);
    const textBox = document.getElementById(`${type}Text${proBoxId}`);
    if(togglePro){
        selectBox.style.display = "none";
        textBox.style.display = "block";
    }else{
        selectBox.style.display = "block";
        textBox.style.display = "none";
    }
}
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
    console.log("Pick Data", data);
    return data;
}


let sortTag = 'start';
function convertData(data, method = 'filter', keyword = ''){
    const sortTitle = document.getElementById("sortTitle");
    const sortStart = document.getElementById("sortStart");
    const sortEnd = document.getElementById("sortEnd");
    const filterSearch = document.getElementById("filterSearch");
    const filterVisible = document.getElementById("filterVisible");

    if(method == 'sort'){
        sortTag = keyword;
    }

    let newData = data;
    // newData = newData.filter(item => item.visible == "All");
    // newData = newData.filter(item => item.title.includes(filterSearch.value));
    const regex = new RegExp(filterSearch.value, "ig");
    newData = newData.filter(item => JSON.stringify(item.title).match(regex));

    if(filterVisible.value != "none"){
        newData = newData.filter(item => item.visible == filterVisible.value);
    }

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

function displayContestsList(method = 'filter', keyword = '') {
    const container1 = document.getElementById("listContainer1");
    const container2 = document.getElementById("listContainer2");
    const container3 = document.getElementById("listContainer3");
    container1.innerHTML = "<h3>Upcoming Contests</h3>";
    container2.innerHTML = "<h3>Running Contests</h3>";
    container3.innerHTML = "<h3>Recent Contests</h3>";
    const currentTime = currentUnixTime();

    convertData(acquiredData, method, keyword).forEach(item => {
        // console.log(item);

        const startTime = item.startAt;
        const endTime = item.startAt + item.durationSecond;

        const newListBox = listBox(item);

        if (currentTime < startTime) {
            container1.appendChild(newListBox);
        } else if (currentTime <= endTime){
            container2.appendChild(newListBox);
        } else {
            container3.appendChild(newListBox);
        }
    });
    resetHeight();
}

function resetHeight(){
    const timers = document.querySelectorAll(".timerRunning");
    timers.forEach(timer => {
        const width = window.getComputedStyle(timer).width;
        timer.style.height = width;
    });
}


//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

if (code == 'main') {
    console.log("#list2");
    
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

if (code == 'contest') {
    console.log("#contest2");

    // クエリパラメータを取得する関数
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

    const virtualContestID = getQueryParameter("ID");
    console.log(virtualContestID);

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
    
    function displayContest(data) {
        const startTime = data.startAt;
        const endTime = data.startAt + data.durationSecond;
        
        document.getElementById("contestTimes").innerHTML =`
            <h2 id="titleContent"></h2>
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
        document.getElementById("titleContent").textContent = data.title;

        displayLimit(acquiredData);
        setInterval(() => {
            displayLimit(acquiredData);
        }, 200);

        const membersContent = document.getElementById("membersContent");
        membersContent.textContent = "";
        data.members.forEach(member => {
            const newLi = document.createElement("li");
            newLi.textContent = member;
            membersContent.appendChild(newLi);
        });

        const problemsBody = document.getElementById("problemsBody");
        const resultHeadRow = document.getElementById("resultHeadRow");
        problemsBody.textContent = "";
        resultHeadRow.innerHTML = "<th></th><th>Name</th><th>Score</th>";

        const problems = data.problems;
        problems.forEach((problem, index) => {
            const url = `https://atcoder.jp/contests/${problem.contestID}/tasks/${problem.problemID}`;
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <th class="diff${diffToColor(problem.difficulty)}">
                    <a href="${url}" rel="noopener" target="_blank" class="proLink">${index + 1}</a>
                </th>
                <td>
                    <a href="${url}" rel="noopener" target="_blank" id="problemName${index + 1}"></a>
                </td>
                <td>${problem.point}</td>
            `;
            newRow.querySelector(`#problemName${index + 1}`).textContent = problem.name;
            
            problemsBody.appendChild(newRow);

            const newHead = document.createElement('th');
            newHead.textContent = index + 1;
            resultHeadRow.appendChild(newHead);
        });
        autoInput(data, 'edit');
    }

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
    function displayResult(data) {
        console.log(`Result at ${formatTime(currentUnixTime())}`, data);

        const resultBody = document.getElementById("resultBody");
        resultBody.innerHTML = "";

        data.sort((a, b) => b.point - a.point);
        data.forEach((member, index) => {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <th>${index + 1}</th>
                <td id="atcoderID${index + 1}"></td>
                <td>${member.point}</td>
            `;
            newRow.querySelector(`#atcoderID${index + 1}`).textContent = member.atcoderID;
            
            const problems = member.problems;
            problems.forEach(problem => {
                const newEachScore = document.createElement('td');
                if (problem.accepted) {
                    newEachScore.textContent = problem.point;
                }
                newRow.appendChild(newEachScore);
            });
            resultBody.appendChild(newRow);
        });

        document.getElementById("reloadTime").textContent = `${formatTime(currentUnixTime())} 最終更新`;
    }
    
    getContest();
    getResult();
    setInterval(() => {
        getResult();
    }, 10000);

    function switchEdit(){
        const toggleEdit = document.getElementById("toggleEdit").checked;
        if(toggleEdit){
            document.documentElement.style.setProperty('--displayView',"none");
            document.documentElement.style.setProperty('--displayEdit',"block");
        }else{
            document.documentElement.style.setProperty('--displayView',"block");
            document.documentElement.style.setProperty('--displayEdit',"none");
        }
    }
    setTimeout(() => {
        switchEdit();
    }, 8);

    // const dummyData = [
    //     {
    //         "atcoderID": "inukaki",
    //         "point": 600,
    //         "problems": [
    //             {
    //             "point": 100
    //             },
    //             {
    //             "point": 200
    //             },
    //             {
    //             "point": 300
    //             }
    //         ]
    //     },
    //     {
    //         "atcoderID": "maisuma",
    //         "point": 900,
    //         "problems": [
    //             {
    //             "point": 150
    //             },
    //             {
    //             "point": 300
    //             },
    //             {
    //             "point": 450
    //             }
    //         ]
    //     },
    //     {
    //         "atcoderID": "eskrmc",
    //         "point": 300,
    //         "problems": [
    //             {
    //             "point": 50
    //             },
    //             {
    //             "point": 100
    //             },
    //             {
    //             "point": 150
    //             }
    //         ]
    //     }
    // ];
    // displayResult(dummyData);

    
    function editContest(){
        // POSTリクエストを送信
        fetch(`${apiUrl}/virtual_contests/${virtualContestID}`, {
            // mode: 'no-cors',
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pickData('edit')),
        })
            .then(response => response.json())
            .then(data => editSuccess(data))
            .catch(error => console.error('POST Error:', error));
    }
    function editSuccess(data){
        window.location.reload();
    }
}

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

if (code == 'main') {
    console.log("#create2");


    function saveContestData(data){
        console.log("Save Data:", data);
        sessionStorage.setItem('myContestData', JSON.stringify(data));
    }

    function loadContestData(){
        var myContestData = JSON.parse(sessionStorage.getItem('myContestData'));
        console.log("Load Data:", myContestData);
        if(myContestData){
            autoInput(myContestData, 'create');
        }else{
            addDiv('createName');
            addDiv('createName');
            addDiv('createPro');
            addDiv('createPro');
        }
    }
    loadContestData();

    //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

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
        timeAutoInput('create', 'Start');
    };
    
    //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

    function createContest(){
        // POSTリクエストを送信
        fetch(`${apiUrl}/virtual_contests`, {
            // mode: 'no-cors',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pickData('create')),
        })
            .then(response => response.json())
            // .then(data => console.log('POST Response:', data))
            .then(data => createSuccess(data))
            .catch(error => {
                createError();
                console.error('POST Error:', error);
            });
    }

    function createSuccess(data) {
        saveContestData(data);
        const notice = document.getElementById('createDisplay');
        const newP = document.createElement('p');
        newP.textContent = 'Create Successfully!';
        notice.appendChild(newP);
        notice.appendChild(listBox(data));
        resetHeight();
    }

    function createError(){
        const notice = document.getElementById('createDisplay');
        const newP = document.createElement('p');
        newP.textContent = 'Create Failed';
        notice.appendChild(newP);
    }

}
