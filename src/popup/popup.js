document.addEventListener("DOMContentLoaded", function () {
    var chatGptBtn = document.getElementById('chatgpt');
    if(chatGptBtn) chatGptBtn.addEventListener('click', function (){
        chrome.runtime.sendMessage({type: "openChatGPTWebpage"});
    });

    var bardBtn = document.getElementById('bard');
    if(bardBtn) bardBtn.addEventListener('click', function (){
        chrome.runtime.sendMessage({type: "openBardWebpage"});
    });
});