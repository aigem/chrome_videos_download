import { isSupportedSite } from './utils.js';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['apiUrl'], (data) => {
    if (!data.apiUrl) {
      chrome.runtime.openOptionsPage();
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (isSupportedSite(tab.url)) {
      chrome.action.setTitle({ title: "视频下载助手 - 支持的网站", tabId: tabId });
      chrome.action.setBadgeText({ text: "✓", tabId: tabId });
      chrome.action.setBadgeBackgroundColor({ color: "#4CAF50", tabId: tabId });
    } else {
      chrome.action.setTitle({ title: "视频下载助手 - 不支持的网站", tabId: tabId });
      chrome.action.setBadgeText({ text: "", tabId: tabId });
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchVideoLink') {
    chrome.storage.sync.get(['apiUrl'], async (data) => {
      if (!data.apiUrl) {
        sendResponse({ error: '请先配置 API 地址' });
        return;
      }

      try {
        const response = await fetch(data.apiUrl, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: request.url,
            videoQuality: request.format,
            audioFormat: request.audioFormat,
            audioBitrate: request.audioBitrate,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('API result:', result);
        sendResponse(result);
      } catch (error) {
        console.error('Fetch error:', error);
        sendResponse({ error: error.message });
      }
    });
    return true;
  }
});