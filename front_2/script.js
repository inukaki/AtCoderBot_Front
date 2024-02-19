const apiUrl = 'http://localhost:8000/api';

function formatTime(unixTime) {
    const date = new Date(unixTime * 1000);
    date.setHours(date.getHours() + 9);

    const formattedDate = date.getUTCFullYear() + '-' +
        ('0' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
        ('0' + date.getUTCDate()).slice(-2);
    
    const formattedTime = ('0' + date.getUTCHours()).slice(-2) + ':' +
        ('0' + date.getUTCMinutes()).slice(-2) + ':' +
        ('0' + date.getUTCSeconds()).slice(-2);
    
    const formattedDay = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    return `${formattedDate} ${formattedTime} (${formattedDay})`;
}

function currentUnixTime() {
    const currentDateTime = new Date();
    const unixTime = Date.parse(currentDateTime) / 1000;
    return unixTime;
}

let view = 'main';
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

    // コンテンツの表示/非表示を切り替え
    if (hash === 'list') {
        view = 'main';
        list.style.display = 'block';
        contest.style.display = 'none';
        create.style.display = 'none';
        console.log("#list");
    } else if (hash === 'contest') {
        view = 'contest';
        list.style.display = 'none';
        contest.style.display = 'block';
        create.style.display = 'none';
        console.log("#contest");
    } else if (hash === 'create') {
        view = 'main';
        list.style.display = 'none';
        contest.style.display = 'none';
        create.style.display = 'block';
        console.log("#create");
    } else {
        // ハッシュが未定義の場合や対応するものがない場合のデフォルト設定
        view = 'main';
        list.style.display = 'block';
        contest.style.display = 'none';
        create.style.display = 'none';
        console.log("#none");
    }
});

// 初回読み込み時も処理を実行
window.dispatchEvent(new Event('hashchange'));

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

if (view == 'main') {
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
            .then(data => displayContestsList(data))
            .catch(error => console.error('GET Error:', error.message));
    }

    function displayContestsList(data) {
        const currentTime = Math.floor(Date.now() / 1000);
        const container1 = document.getElementById("listContainer1");
        const container2 = document.getElementById("listContainer2");
        const container3 = document.getElementById("listContainer3");

        data.sort((a, b) => a.startAt - b.startAt);

        data.forEach(item => {
            const startTime = item.startAt;
            const endTime = item.startAt + item.durationSecond;
            const displayTime = formatTime(startTime);
            const displayTime2 = formatTime(endTime);
            const displayPeople = item.members.length;

            const newListGroup = document.createElement('div');
            newListGroup.classList.add('listGroup');
            
            const newLink = document.createElement('a');
            newLink.href = `virtual_contest.html?ID=${item.virtualContestID}#contest`;
            newLink.classList.add('listLink');
            const newItem = document.createElement('div');
            newItem.classList.add('listItem');

            const newTitle = document.createElement('p');
            newTitle.classList.add('title');
            newTitle.textContent = `${item.title}`;
            newItem.appendChild(newTitle);

            const newSpace1 = document.createElement('p');
            newSpace1.classList.add('space');
            newItem.appendChild(newSpace1);

            const newInfo1 = document.createElement('p');
            newInfo1.classList.add('info');
            newInfo1.textContent = `${displayTime}`;
            newItem.appendChild(newInfo1);

            const newSpace2 = document.createElement('p');
            newSpace2.classList.add('space');
            newItem.appendChild(newSpace2);
            
            const newInfo2 = document.createElement('p');
            newInfo2.classList.add('info');
            newInfo2.textContent = `${displayTime2}`;
            newItem.appendChild(newInfo2);

            const newSpace3 = document.createElement('p');
            newSpace3.classList.add('space');
            newItem.appendChild(newSpace3);
            
            const newInfo3 = document.createElement('p');
            newInfo3.classList.add('info');
            newInfo3.textContent = `${displayPeople}`;
            newItem.appendChild(newInfo3);

            newListGroup.appendChild(newLink);
            newListGroup.appendChild(newItem);
            if (currentTime < startTime) {
                container1.appendChild(newListGroup);
            } else if (currentTime < endTime){
                container2.appendChild(newListGroup);
            } else {
                container3.appendChild(newListGroup);
            }
            
            // <div class="listGroup">
            //     <a class="listLink" href="virtual_contest.html?ID=0#contest"></a>
            //     <div class="listItem">
            //         <p class="title">Title</p>
            //         <p class="space"></p>
            //         <p class="info">Start</p>
            //         <p class="space"></p>
            //         <p class="info">End</p>
            //         <p class="space"></p>
            //         <p class="info">Members</p>
            //     </div>
            // </div>
        });
    }
    getContestsList();
}

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

if (view == 'contest') {
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

    let isDisplayProblem = false;

    console.log(`${apiUrl}/virtual_contests/${virtualContestID}`);
    function getContest(){
        fetch(`${apiUrl}/virtual_contests/${virtualContestID}`, {
            // mode: 'no-cors',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => displayProblem(data))
            .catch(error => console.error('GET Error:', error.message));
    }

    function displayInfo(data) {
        const startTime = data.startAt;
        const endTime = data.startAt + data.durationSecond;
        const limitTime = endTime - currentUnixTime();
        const displayStartTime = formatTime(startTime);
        const displayEndTime = formatTime(endTime);
        const displayLimitTime = formatTime(limitTime);
        const members = data.members.map((listItem, index) => `<li>${listItem}</li>`).join('');
        info.innerHTML =`
            <h2>${data.title}</h2>
            <div id="status"><div>
            <div class="time">
                <p class="timeS">Start:</p><p>${displayStartTime}</p>
            </div>
            <div class="time">
                <p class="timeS">End:</p><p>${displayEndTime}</p>
            </div>
            <div class="time">
                <p class="timeS">Limit:</p><p>${displayLimitTime}</p>
            </div>
            <h4>Member</h4>
            <ul class="members">${members}</ul>
        `;
    }
    
    function displayProblem(data) {
        displayInfo(data);

        if(!isDisplayProblem){
            const problemsBody = document.getElementById("problemsBody");
            const problems = data.problems;

            problems.forEach((problem, index) => {
                const url = `https://atcoder.jp/contests/${problem.contestID}/tasks/${problem.problemID}`;
                const newRow = document.createElement('tr');

                const newNum = document.createElement('th');
                const newLink1 = document.createElement('a');
                newLink1.href = url;
                newLink1.rel = 'noopener';
                newLink1.target = '_blank';
                newLink1.textContent = index + 1;
                newNum.appendChild(newLink1);

                const newTitle = document.createElement('td');
                const newLink2 = document.createElement('a');
                newLink2.href = url;
                newLink2.rel = 'noopener';
                newLink2.target = '_blank';
                newLink2.textContent = problem.name;
                newTitle.appendChild(newLink2);

                const newPoint = document.createElement('td');
                newPoint.textContent = problem.point;

                newRow.appendChild(newNum);
                newRow.appendChild(newTitle);
                newRow.appendChild(newPoint);
                
                problemsBody.appendChild(newRow);

                const resultHeadRow = document.getElementById("resultHeadRow");
                const newHead = document.createElement('th');
                newHead.textContent = index + 1;
                resultHeadRow.appendChild(newHead);
            });
            isDisplayProblem = true;
        }
    }

    console.log(`${apiUrl}/virtual_contests/standings/${virtualContestID}`);
    function getResult(){
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
        const resultBody = document.getElementById("resultBody");
        data.sort((a, b) => b.point - a.point);

        data.forEach((member, index) => {
            const newRow = document.createElement('tr');

            const newNum = document.createElement('th');
            newNum.textContent = index + 1;
            const newName = document.createElement('td');
            newName.textContent = member.atcoderID;
            const newScore = document.createElement('td');
            newScore.textContent = member.point;

            newRow.appendChild(newNum);
            newRow.appendChild(newName);
            newRow.appendChild(newScore);
            
            const problems = member.problems;
            
            problems.forEach(problem => {
                const newEachScore = document.createElement('td');
                if (problem.accepted) {
                    newEachScore.textContent = problem.point;
                } else {
                    newEachScore.textContent = "";
                }
                newRow.appendChild(newEachScore);
            });
            resultBody.appendChild(newRow);
        });
    }
    getContest();
    getResult();

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

}

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

if (view == 'main') {
    console.log("#create2");

    function addTextBox() {
        const textBoxContainer = document.getElementById('textBoxContainer');
        const textBoxGroups = document.querySelectorAll('.textBoxGroup');

        // Create a new text box group
        const newTextBoxGroup = document.createElement('div');
        newTextBoxGroup.classList.add('textBoxGroup');
        // Create a new text box
        const newTextBox = document.createElement('input');
        newTextBox.type = 'text';
        newTextBox.classList.add('nameInput');
        const textBoxId = 'textBox' + textBoxGroups.length;
        newTextBox.id = textBoxId;
        // Create a new remove button
        const removeButton = document.createElement('button');
        removeButton.textContent = '-';
        removeButton.onclick = function() { removeTextBox(this); };
        // Append the new text box and remove button to the new text box group
        newTextBoxGroup.appendChild(newTextBox);
        newTextBoxGroup.appendChild(removeButton);
        // Append the new text box group to the container
        textBoxContainer.appendChild(newTextBoxGroup);
    }
    addTextBox();
    addTextBox();

    function removeTextBox(button) {
        const textBoxContainer = document.getElementById('textBoxContainer');
        const textBoxGroup = button.parentNode;
        // Remove the text box group
        textBoxContainer.removeChild(textBoxGroup);
    }

    function fillTextBoxes(values) {
        let textBoxes = document.querySelectorAll('.nameInput');
    
        // Ensure there are enough text boxes
        while (textBoxes.length < values.length) {
        addTextBox();
        textBoxes = document.querySelectorAll('.nameInput');
        }
    
        // Fill text boxes with values
        textBoxes.forEach((textBox, index) => {
        // Set the value from the array or use an empty string if the array is undefined
        textBox.value = values ? values[index] || '' : '';
        });
    }

    function pickNameList() {
        const textBoxes = document.querySelectorAll('.nameInput');
        const values = [];

        textBoxes.forEach(textBox => {
        values.push(textBox.value);
        });
        console.log("Pick Values:", values);
        return values;
    }
    function saveNameList() {
        const values = pickNameList();
        console.log("Save Values:", values);
        sessionStorage.setItem('myNameList', JSON.stringify(values));
    }

    function loadNameList(){
        var myNameValues = JSON.parse(sessionStorage.getItem('myNameList'));
        console.log("Load Values:", myNameValues);
        if(myNameValues){
            fillTextBoxes(myNameValues);
        }
    }
    loadNameList();

    //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    
    function addSelectBox() {
        const selectBoxContainer = document.getElementById('selectBoxContainer');
        const selectBoxGroups = document.querySelectorAll('.selectBoxGroup');

        // Create a new select box group
        const newSelectBoxGroup = document.createElement('div');
        newSelectBoxGroup.classList.add('selectBoxGroup');
        // Create a new select box
        const newSelectBox = document.createElement('select');
        newSelectBox.classList.add('selectDiff');
        const selectBoxId = 'selectBox' + selectBoxGroups.length;
        newSelectBox.id = selectBoxId;
        difficulties = ["Gray", "Brown", "Green", "Cyan", "Blue", "Yellow", "Orange", "Red"];
        difficulties.forEach(diff => {
            const initialOption = document.createElement('option');
            initialOption.value = diff;
            initialOption.textContent = diff;
            newSelectBox.appendChild(initialOption);
        })

        // Create a new remove button
        const removeButton = document.createElement('button');
        removeButton.textContent = '-';
        removeButton.onclick = function() { removeSelectBox(this); };
        // Append the new select box and remove button to the new select box group
        newSelectBoxGroup.appendChild(newSelectBox);
        newSelectBoxGroup.appendChild(removeButton);
        // Append the new select box group to the container
        selectBoxContainer.appendChild(newSelectBoxGroup);
    }

    function removeSelectBox(button) {
        const selectBoxContainer = document.getElementById('selectBoxContainer');
        const selectBoxGroup = button.parentNode;
        // Remove the select box group
        selectBoxContainer.removeChild(selectBoxGroup);
    }

    function pickDiffList() {
        const selectBoxes = document.querySelectorAll('.selectDiff');
        const values = [];

        selectBoxes.forEach(selectBox => {
            values.push(selectBox.value);
        });
        console.log("Pick Values:", values);
        return values;
    }
    addSelectBox();
    addSelectBox();

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
        document.getElementById("datetime").value = `${year}-${month}-${day}T${hours}:${minutes}`;
        displayTime2();
    };

    function unixTimeInput() {
        const selectedDateTime = document.getElementById("datetime").value;
        const unixTime = Date.parse(selectedDateTime) / 1000;
        
        return unixTime;
    }

    function displayDuration(){
        // 日付時刻を取得
        const selectedDateTime1 = document.getElementById("datetime").value;
        const selectedDateTime2 = document.getElementById("datetime2").value;
        // Unix Timeに変換
        const unixTime1 = Date.parse(selectedDateTime1) / 1000;
        const unixTime2 = Date.parse(selectedDateTime2) / 1000;

        // 終了時刻が開始時刻よりも前とならないように
        let durationSecond = unixTime2 - unixTime1;
        if(durationSecond >= 0){
            document.getElementById("duration").value = durationSecond / 60;
        }else{
            durationSecond = 0;
            document.getElementById("duration").value = durationSecond / 60;
            displayTime2();
        }
    }

    function displayTime2(){
        const durationMinute = document.getElementById("duration").value;
        if (durationMinute) {
            durationSecond = durationMinute * 60
        }else{
            durationSecond = 0;
            document.getElementById("duration").value = 0;
        }
        // 1. 日付時刻を取得
        const changedDateTime = document.getElementById("datetime").value;
        // 2. Unix Timeに変換
        const unixTime = (Date.parse(changedDateTime) / 1000) + durationSecond;
        // 4. Unix Timeを日付時刻に変換
        const convertedDateTime = new Date(unixTime * 1000);
        // console.log(convertedDateTime);
        const year = convertedDateTime.getFullYear();
        const month = (convertedDateTime.getMonth() + 1).toString().padStart(2, '0');
        const day = convertedDateTime.getDate().toString().padStart(2, '0');
        const hours = convertedDateTime.getHours().toString().padStart(2, '0');
        const minutes = convertedDateTime.getMinutes().toString().padStart(2, '0');
        document.getElementById("datetime2").value = `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    
    //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

    function createContest(){
        const startAt = unixTimeInput();
        const durationSecond = document.getElementById("duration").value * 60;
        const title = document.getElementById("titleInput").value;
        const members = pickNameList();
        const problems = pickDiffList();

        // JSONオブジェクトを組み立て
        const requestData = {
            "startAt": startAt,
            "durationSecond": durationSecond,
            "title": title,
            "visible": "All",
            "serverID": "100000888800000000",
            "members": members,
            "problems": problems
        };

        console.log(requestData);

        // POSTリクエストを送信
        fetch(`${apiUrl}/virtual_contests`, {
            // mode: 'no-cors',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        })
            .then(response => response.json())
            // .then(data => console.log('POST Response:', data))
            .then(createSuccess())
            .catch(error => console.error('POST Error:', error));
    }

    function createSuccess() {
        notice = document.getElementById('createDisplay');
        notice.textContent = "Create Successfully!"
    }
}
