document.addEventListener('DOMContentLoaded', (event) => {

  {
    // リセットボタン
    const element = document.querySelector('#resetButton');
    element.addEventListener('click', (e) => {
      chrome.storage.local.set({'portNumber': ''}, () => {});
      document.querySelector('#portNumber').value = '';
      chrome.storage.local.set({'pixivType': 'full-auto'}, () => {});
      document.querySelector('#pixivType').value = 'full-auto';
      chrome.storage.local.set({'tyranoType': 'full-auto'}, () => {});
      document.querySelector('#tyranoType').value = 'full-auto';
      chrome.storage.local.set({'tyranoCharaType': 'noUse'}, () => {});
      document.querySelector('#tyranoCharaType').value = 'noUse';
    }, false);
  }

  {
    // port 番号
    const element = document.querySelector('#portNumber');
    chrome.storage.local.get('portNumber', (items) => {
      if(items.portNumber){
        element.value = items.portNumber;
      }
      else{
        chrome.storage.local.set({'portNumber': '42503'}, () => {});
      }
    });
    element.onchange = ()=>{
      chrome.storage.local.set({'portNumber': element.value}, () => {});
    };
  }

  {
    // pixivの読み上げ方式
    const element = document.querySelector('#pixivType');
    chrome.storage.local.get('pixivType', (items) => {
      if(items.pixivType){
        element.value = items.pixivType;
      }
      else{
        chrome.storage.local.set({'pixivType': 'full-auto'}, () => {});
      }
    });
    element.onchange = ()=>{
      chrome.storage.local.set({'pixivType': element.value}, () => {});
    };
  }

  {
    // ティラノスクリプトの読み上げ方式
    const element = document.querySelector('#tyranoType');
    chrome.storage.local.get('tyranoType', (items) => {
      console.log(items)
      if(items.tyranoType){
        element.value = items.tyranoType;
      }
      else{
        chrome.storage.local.set({'tyranoType': 'full-auto'}, () => {});
      }
    });
    element.onchange = ()=>{
      chrome.storage.local.set({'tyranoType': element.value}, () => {});
    };
  }

  {
    // ティラノスクリプトの読み上げ方式
    const element = document.querySelector('#tyranoCharaType');
    chrome.storage.local.get('tyranoCharaType', (items) => {
      console.log(items)
      if(items.tyranoCharaType){
        element.value = items.tyranoCharaType;
      }
      else{
        chrome.storage.local.set({'tyranoCharaType': 'noUse'}, () => {});
      }
    });
    element.onchange = ()=>{
      chrome.storage.local.set({'tyranoCharaType': element.value}, () => {});
    };
  }


});
