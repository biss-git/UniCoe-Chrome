
function play_page(tab){
  chrome.tabs.sendMessage(tab.id, { command: 'ページ選択' }, function (response) {
    if (response){
      voiceroidPlayWithStop(response);
    }
  });
}


function getSpeachTextSub(selectedText){
  if(selectedText){
    return selectedText;
  }
  else{

  }
  return "";
}

function play_range(tab, selectedText){
  if(tab == null || tab.id < 0){
    // tab が不正ならクリップボードから読込
    text = getSpeachTextSub(selectedText);
    voiceroidPlayWithStop(text);
    return;
  }
  chrome.tabs.sendMessage(tab.id, { command: '範囲選択' }, function (response) {
    if (response){
      // まずはDOMからテキストを取得できるか
      voiceroidPlayWithStop(response);
    }
    else{
      // 何もなかったらクリップボードから文字を読む
      text = getSpeachTextSub(selectedText);
      voiceroidPlayWithStop(text);
    }
  });
}

function play_range_with_translate(tab, selectedText){
  if(tab == null || tab.id < 0){
    // tab が不正ならクリップボードから読込
    text = getSpeachTextSub(selectedText);
    voiceroidPlayWithStop_translate(text);
    return;
  }
  chrome.tabs.sendMessage(tab.id, { command: '範囲選択' }, function (response) {
    if (response){
      // まずはDOMからテキストを取得できるか
      voiceroidPlayWithStop_translate(response);
    }
    else{
      // 何もなかったらクリップボードから文字を読む
      text = getSpeachTextSub(selectedText);
      voiceroidPlayWithStop_translate(text);
    }
  });
}

function stop(){
  chrome.storage.local.set({'autoActive': false}, () => {});
  voiceroidStop();
}

chrome.contextMenus.create({
  title: 'このページを読み上げる (Alt+P)',
  type: 'normal',
  contexts: ['all'],
  onclick: function (info, tab) {
    play_page(tab);
  }
});

chrome.contextMenus.create({
  title: '選択範囲を読み上げる (Alt+C)',
  type: 'normal',
  contexts: ['all'],
  onclick: function (info, tab) {
    console.log(info)
    console.log(tab)
    play_range(tab, info.selectionText);
  }
});

chrome.contextMenus.create({
  title: '選択範囲を日本語で読み上げる',
  type: 'normal',
  contexts: ['all'],
  onclick: function (info, tab) {
    play_range_with_translate(tab, info.selectionText);
  }
});

chrome.contextMenus.create({
  title: '読み上げを停止する (Alt+S)',
  type: 'normal',
  contexts: ['all'],
  onclick: function (info, tab) {
    stop();
  }
});

chrome.commands.onCommand.addListener(function(command) {
  // console.log('Command:', command);
  switch(command){
    case 'play_page':
      chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, tabs => {
        play_page(tabs[0]);
      });
      break;
    case 'play_range':
      chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, tabs => {
        play_range(tabs[0]);
      });
      break;
    case 'stop':
      stop();
      break;
  }
});