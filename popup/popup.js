import { isValidUrl, sanitizeFilename, isSupportedSite } from '../utils.js';


document.addEventListener('DOMContentLoaded', () => {
  const videoUrlDisplay = document.getElementById('videoUrlDisplay');
  const downloadBtn = document.getElementById('downloadBtn');
  const directDownloadBtn = document.getElementById('directDownloadBtn');
  const copyLinkBtn = document.getElementById('copyLinkBtn');
  const themeToggle = document.getElementById('themeToggle');
  const formatSelect = document.getElementById('format');
  const audioFormatSelect = document.getElementById('audioFormat');
  const audioBitrateSelect = document.getElementById('audioBitrate');
  const loading = document.getElementById('loading');
  const error = document.getElementById('error');
  const content = document.getElementById('content');
  const result = document.getElementById('result');
  const filenameDiv = document.getElementById('filename');
  const openOptionsPage = document.getElementById('openOptionsPage');
  const manualTestBtn = document.getElementById('manualTestBtn');

  let currentTab = null;
  let videoUrl = '';
  let filename = '';

  function showLoading(show = true) {
    loading.classList.toggle('hidden', !show);
    content.classList.toggle('hidden', show);
    result.classList.toggle('hidden', show);
    error.classList.add('hidden');
  }

  function showError(message) {
    if (error) {
      error.textContent = message;
      error.classList.remove('hidden');
    }
    if (content) content.classList.add('hidden');
    if (result) result.classList.add('hidden');
  }

  function showResult(url, name) {
    if (loading) loading.classList.add('hidden');
    if (error) error.classList.add('hidden');
    if (result) result.classList.remove('hidden');
    videoUrl = url;
    filename = name;
    if (filenameDiv) filenameDiv.textContent = `文件名: ${filename}`;
  }

  function getErrorMessage(error) {
    if (error.message.includes('Failed to fetch')) {
      return '网络错误，请检查您的网络连接';
    }
    if (error.message.includes('HTTP error')) {
      return `服务器错误: ${error.message}`;
    }
    return `未知错误: ${error.message}`;
  }

  async function fetchVideoLink(url, apiUrl) {
    showLoading();
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          videoQuality: formatSelect ? formatSelect.value : 'max',
          audioFormat: audioFormatSelect ? audioFormatSelect.value : 'best',
          audioBitrate: audioBitrateSelect ? audioBitrateSelect.value : '320',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'error') {
        throw new Error(data.error.code);
      }

      showResult(data.url, data.filename);
    } catch (error) {
      showError(getErrorMessage(error));
    }
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    currentTab = tabs[0];
    if (currentTab && isSupportedSite(currentTab.url)) {
      videoUrlDisplay.textContent = currentTab.url;
      videoUrlDisplay.classList.remove('hidden');
    } else {
      showError('当前页面不支持下载视频');
    }
  });

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentUrl = tabs[0].url;
        chrome.storage.sync.get(['apiUrl'], (data) => {
          if (data.apiUrl) {
            fetchVideoLink(currentUrl, data.apiUrl);
          } else {
            showError('请先配置 API 地址');
          }
        });
      });
    });
  }

  if (directDownloadBtn) {
    directDownloadBtn.addEventListener('click', () => {
      if (videoUrl) {
        chrome.downloads.download({
          url: videoUrl,
          filename: sanitizeFilename(filename),
          saveAs: true
        }, (downloadId) => {
          if (chrome.runtime.lastError) {
            console.error('Download failed:', chrome.runtime.lastError);
            showError('下载失败: ' + chrome.runtime.lastError.message);
          }
        });
      }
    });
  }

  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', () => {
      if (videoUrl) {
        navigator.clipboard.writeText(videoUrl).then(() => {
          alert('下载链接已复制到剪贴板');
        }).catch(err => {
          console.error('Failed to copy:', err);
          alert('复制失败，请手动复制');
        });
      }
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      const isDarkTheme = document.body.classList.contains('dark-theme');
      chrome.storage.sync.set({ theme: isDarkTheme ? 'dark' : 'light' });
    });
  }

  if (openOptionsPage) {
    openOptionsPage.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.runtime.openOptionsPage();
    });
  }

  if (manualTestBtn) {
    manualTestBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('manual/manual_test.html') });
    });
  }

  // 初始化主题
  chrome.storage.sync.get('theme', (data) => {
    if (data.theme === 'dark') {
      document.body.classList.add('dark-theme');
    }
  });
});