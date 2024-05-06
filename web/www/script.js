// import { loadHostsFile, parseHostsFile } from './hosts.js';



function openTab(tabName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  event.currentTarget.className += " active";
}

function loadHostsFile() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      parseHostsFile(this.responseText);
      // Добавляем обработчики событий для раскрытия/скрытия списка хостов
      var groupHeaders = document.querySelectorAll(".groupHeader");
      groupHeaders.forEach(function(header) {
        header.addEventListener("click", function() {
          var groupContainer = this.parentElement;
          groupContainer.classList.toggle("open");
        });
      });
    }
  };
  xhttp.open("GET", "hosts.ini", true);
  xhttp.send();
}

function parseHostsFile(fileContent) {
  var lines = fileContent.split('\n');
  var currentGroup = '';
  var hostsContainer = document.getElementById("hostsContainer");
  hostsContainer.innerHTML = '';

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();

    if (line === '' || line.startsWith('#') || line.includes('all:vars')) {
      continue;
    }

    if (line.startsWith('[')) {
      // Ищем комментарий перед блоком, который начинается с "#"
      var commentIndex = i - 1;
      // отладка
      //console.log("Comment index:", commentIndex, "Line:", lines[commentIndex]);

      // Получаем комментарий перед блоком
      var comment = lines[commentIndex].trim().replace('#', '');
      // отладка
      //console.log("Comment:", comment);
      currentGroup = line.substring(1, line.length - 1);

      // Создаем контейнер для группы хостов
      var groupContainer = document.createElement("div");
      groupContainer.className = "group";
      groupContainer.setAttribute("data-group", currentGroup);

      // Создаем заголовок группы хостов
      var groupHeader = document.createElement("div");
      groupHeader.className = "groupHeader";
      groupHeader.innerHTML = "<h4>" + currentGroup + "</h4>";
      var commentDiv = document.createElement("div");
      commentDiv.className = "comment";
      commentDiv.textContent = comment;
      groupHeader.appendChild(commentDiv);
      groupContainer.appendChild(groupHeader);

      // Создаём контейнер основного содержимого
      var hostsManager = document.createElement("div");
      hostsManager.className = "hostsManager"
      groupContainer.appendChild(hostsManager);

      // Создаем контейнер для списка хостов
      var hostsList = document.createElement("div");
      hostsList.className = "hostsList";
      hostsManager.appendChild(hostsList);

      // Создаем кнопку "Добавить хост"
      var addHostBtn = document.createElement("button");
      addHostBtn.className = "btn add-host-btn";
      addHostBtn.innerText = "Добавить хост";
      hostsManager.appendChild(addHostBtn);

      // Добавляем контейнер для группы хостов в общий контейнер
      hostsContainer.appendChild(groupContainer);

      continue;
    }

    if (currentGroup !== '') {
      var hostData = line.split(/\s+/);
      var hostName = hostData[0];
      var hostIp = hostData[hostData.length - 1].split("=")[1];

      // Создаем хост и добавляем его в список хостов текущей группы
      createHost(hostName, hostIp, currentGroup, hostsContainer);
    }
  }
}

function createHost(hostName, hostIp, group, container) {
  // Находим контейнер для хостов текущей группы
  var groupContainer = container.querySelector(".group[data-group='" + group + "']");
  if (!groupContainer) {
    console.error("Group container not found for group: " + group);
    return;
  }

  // Находим список хостов в текущем контейнере
  var hostsList = groupContainer.querySelector(".hostsList");

  // Создаем элемент хоста и добавляем его в список хостов
  var hostDiv = document.createElement("div");
  hostDiv.className = "host";
  hostDiv.innerHTML = "<span class='hostName'>" + hostName + "</span><span class='hostIP'>" + hostIp + "</span><button class='btn delete-btn'>Удалить</button>";
  hostsList.appendChild(hostDiv);
}





document.addEventListener("DOMContentLoaded", function() {
  // Открываем вкладку по умолчанию
  document.getElementById("defaultOpen").click();
  loadHostsFile();
});