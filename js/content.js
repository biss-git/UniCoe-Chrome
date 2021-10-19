


window.addEventListener("load", main, false);

var div = document.createElement('div');

function main(e) {
  div.style.width = '5px';
  div.style.height = '5px';
  div.style.position = 'fixed';
  div.style.padding = '8px';
  div.style.cursor = 'pointer';
  div.style.color = '#f0f0f0f0';
  div.style.top = 0;
  div.style.right = 0;
  div.style.backgroundColor = '#42495040';

  if(checkAutoPage(false)){
    document.body.appendChild(div);
    div.onmouseenter = () =>{
      div.style.width = '40px';
      div.style.height = '18px';
      div.style.backgroundColor = '#dc143cc0';

      chrome.storage.local.get(['autoActive'], (items) => {
        if(items.autoActive){
          div.innerHTML = '停止';
          div.onclick = () =>{
            chrome.storage.local.set({'autoActive': false}, () => {});
            voiceroidStop();
          }
        }
        else{
          div.innerHTML = '再生';
          div.onclick = () =>{
            checkAutoPage(true);
          }
        }
      });
    }
    div.onmouseleave = () =>{
      div.style.width = '5px';
      div.style.height = '5px';
      div.style.backgroundColor = '#42495040';
      div.innerHTML = '';
    }
  }
};


/** バックグラウンドからとんでくるメッセージを受け取る */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  if(request?.command == '範囲選択'){
    let selection = '';
    if(window.getSelection){
      selection = window.getSelection().toString();
    }
    sendResponse(selection);
    return;
  }
  if(request?.command == 'ページ選択'){

    if(checkAutoPage(true)){
      return;
    }
  
    if(location.host == 'qiita.com'){
      sendResponse(getQiitaText());
      return;
    }

    if(location.host == 'ch.nicovideo.jp'){
      sendResponse(getNicoblogText())
      return;
    }

    if(location.host == 'mail.google.com'){
      const gt = getGmailText();
      if(gt){
        sendResponse(gt);
        return;
      }
    }

    if(location.host.includes('wikipedia')){
      sendResponse(getWikipediaText())
      return;
    }

    sendResponse(document.body.textContent);
    return;
  }


});

function checkAutoPage(play){
  {
    const tyranoElement = document.getElementById('tyrano_base');
    if(tyranoElement){
      chrome.storage.local.get(['autoActive'], (items) => {
        if(items.autoActive){
          chrome.storage.local.set({'autoActive': false}, () => {});
          setTimeout(() => {
            if(play){
              startTyranoAuto(true, false);
            }
          }, 1000);
        }
        else{
          if(play){
            startTyranoAuto(true, false);
          }
        }
      });
      return true;
    }
  }
  if(location.host == 'www.pixiv.net'){
    chrome.storage.local.get(['autoActive'], (items) => {
      if(items.autoActive){
        chrome.storage.local.set({'autoActive': false}, () => {});
        setTimeout(() => {
          if(play){
            startPixivAuto(true);
          }
        }, 1000);
      }
      else{
        if(play){
          startPixivAuto(true);
        }
      }
    });
    return true;
  }
  return false;
}


/** qiita */
function getQiitaText(){
  const elements = document.body.getElementsByClassName('it-MdContent');
  let text = '';
  Array.from(elements).forEach((el) => {
    text += el.textContent;
  });
  return text;
}

/** ニコニコブログ */
function getNicoblogText(){
  const elements = document.body.getElementsByClassName('contents_list');
  let text = '';
  Array.from(elements).forEach((el) => {
    text += el.textContent;
  });
  return text;
}

/** pixiv小説 */
function getPixivText(){
  const ele = document.getElementById('gtm-novel-work-scroll-finish-reading');
  const elements = ele.parentElement.getElementsByTagName('p');
  let text = '';
  Array.from(elements).forEach((el) => {
    text += el.innerHTML.toString().replace(/<br>/g, '\n');
  });
  return text;
}

/** ティラノスクリプト */
function getTyranoText(){
  let text = '';
  const scriptElements = document.getElementsByClassName('message_inner');
  Array.from(scriptElements).forEach((el) => {
    text += el.textContent;
  });
  return text;
}

/** ティラノスクリプトのキャラクター名 */
function getTyranoChara(){
  let text = '';
  const scriptElements = document.getElementsByClassName('chara_name_area');
  Array.from(scriptElements).forEach((el) => {
    text += el.textContent;
  });
  return text;
}

/** wikipedia */
function getWikipediaText(){
  const element = document.getElementById('content');
  return element?.textContent;
}

/** 編集中のメール、無ければ表示中のメール */
function getGmailText(){
  let text = '';
  const p2 = document.getElementsByClassName('editable')
  Array.from(p2).forEach((el) => {
    text += el.textContent;
  });
  if(text){
    return text;
  }
  const p3 = document.getElementsByClassName('aiL')
  Array.from(p3).forEach((el) => {
    text += el.textContent;
  });
  return text;
}


/** ピクシブ小説の読み上げを開始 */
function startPixivAuto(isFirst){
  chrome.storage.local.set({'autoActive': true}, () => {});
  if(isFirst){
    chrome.storage.local.set({'lastVoiceroid': null}, () => {});
  }
  setTimeout(() => {
    chrome.storage.local.get(['pixivType', 'lastVoiceroid'], (items) => {
      voiceroidPlayWithStop(getPixivText(), items.lastVoiceroid);
      if(items.pixivType == 'full-auto' || items.pixivType == null){
        setTimeout(() => {
          waitTalkFinish(clickPixivNext);
        }, 2000); // ボイスロイドがちゃんと読み上げを始めるまでまつ
      }
      else if(items.pixivType == 'manual'){
        chrome.storage.local.set({'autoActive': false}, () => {});
      }
    });
  }, 10);
}

/** 次へボタンを押して読み上げを再開 */
function clickPixivNext(){
  const elements = document.body.getElementsByClassName('gtm-novel-work-footer-pager-next');
  if(elements.length > 0){
    Array.from(elements).forEach((el) => {
      el.click();
    });
    setTimeout(() => {
      startPixivAuto(false);
    }, 1000); // ページの読み込みにかかる時間
  }
  else{
    chrome.storage.local.set({'autoActive': false}, () => {});
  }
}


let tyranoLastText = '';
let tyranoLastTalkText = '';

/** ティラノスクリプトの読み上げを開始 */
function startTyranoAuto(isFirst, isReTry){
  if(isFirst && isReTry == false){
    chrome.storage.local.set({'lastVoiceroid': null}, () => {});
    chrome.storage.local.set({'autoActive': true}, () => {});
    tyranoLastText = '';
    tyranoLastTalkText = '';
  }
  chrome.storage.local.get(['autoActive', 'tyranoType', 'tyranoCharaType', 'lastVoiceroid'], (items) => {
    if(items.autoActive == false){ return;}
    if(isFirst == false && isReTry == false && tyranoLastText == getTyranoText()){
      // 選択しなど、クリックしても画面の表示が変わらないとき用のwait
      setTimeout(() => {
        startTyranoAuto(false, false);
      }, 1000);
      return;
    }
    if(tyranoLastText != getTyranoText()){
      // テキスト描画中のwait
      tyranoLastText = getTyranoText()
      setTimeout(() => {
        startTyranoAuto(isFirst, true);
      }, 300);
      return;
    }
    if(getTyranoText()){
      let talkText = getTyranoText();
      const text = getTyranoText();
      if(text.length > (tyranoLastTalkText.length + 2) && text.startsWith(tyranoLastTalkText)){
        talkText = talkText.slice(tyranoLastTalkText.length);
      }
      tyranoLastTalkText = getTyranoText();
      const charaName = getTyranoChara();
      if( charaName && items.tyranoCharaType == 'addFirst' &&(items.lastVoiceroid == null || items.lastVoiceroid == 'Voiceroid2' || items.lastVoiceroid == 'GynoidTalk')){
        talkText = charaName + "＞\n" + talkText;
      }
      if(isFirst){
        voiceroidPlayWithStop(talkText, items.lastVoiceroid);
      }
      else{
        voiceroidPlay(talkText, items.lastVoiceroid);
      }
      if(items.tyranoType == 'full-auto' || items.tyranoType == null){
        setTimeout(() => {
          waitTalkFinish(clickTyranoNext);
        }, 1000); // ボイスロイドがちゃんと読み上げを始めるまでまつ
      }
      else if(items.tyranoType == 'manual'){
        chrome.storage.local.set({'autoActive': false}, () => {});
      }
    }
    else{
      // アニメーションなどの演出でしばらく空白文字になる場合のwait
      setTimeout(() => {
        startTyranoAuto(isFirst, true);
      }, 300);
    }
  });

}

/** 次へボタンを押して読み上げを再開 */
function clickTyranoNext(){
  const tyranoElement = document.getElementById('tyrano_base');
  if(tyranoElement){
    const clickElements = tyranoElement.getElementsByClassName('layer_event_click');
    Array.from(clickElements).forEach((el) => {
      el.click();
    });
    setTimeout(() => {
      startTyranoAuto(false, false);
    }, 1000);
  }
  else{
    chrome.storage.local.set({'autoActive': false}, () => {});
  }
}


/** ボイスロイドの読み上げが終わるのをまつ */
function waitTalkFinish(callback){
  setTimeout(() => {
    chrome.storage.local.get(['autoActive', 'lastVoiceroid'], (items) => {
      if(items.autoActive != true) {return; }
      if(items.lastVoiceroid == null){ waitTalkFinish(callback); return;}
      axios.get('http://localhost:51008/api/voiceroid/process?voiceroidName=' + items.lastVoiceroid)
      .then(response => {
        const p = response.data.processes[0];
        if(p.IsStartup==false && p.IsRunning==true && p.IsPlaying==false && p.IsSaving==false && p.DialogShowing==false){
          callback();
        }
        else{
          waitTalkFinish(callback);
        }
      });
    });
  }, 500); // 読み上げ完了を確認にいく周期
}


