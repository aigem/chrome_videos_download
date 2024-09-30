import { isValidUrl } from '../utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  const manualUrl = document.getElementById('manualUrl');
  const manualFormat = document.getElementById('manualFormat');
  const audioFormat = document.getElementById('audioFormat');
  const audioBitrate = document.getElementById('audioBitrate');
  const manualTestBtn = document.getElementById('manualTestBtn');
  const manualTestResult = document.getElementById('manualTestResult');
  const themeToggle = document.getElementById('themeToggle');
  const downloadBtn = document.getElementById('downloadBtn');
  const copyBtn = document.getElementById('copyBtn');
  const filenameDiv = document.getElementById('filename');

  let videoUrl = '';
  let filename = '';

  // 主题管理
  function setTheme(theme) {
    document.body.classList.remove('light-theme', 'dark-theme');
    if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  }

  themeToggle.addEventListener('click', () => {
    chrome.storage.sync.get('theme', (data) => {
      const currentTheme = data.theme || 'auto';
      const newTheme = currentTheme === 'light' ? 'dark' : (currentTheme === 'dark' ? 'auto' : 'light');
      chrome.storage.sync.set({ theme: newTheme }, () => {
        setTheme(newTheme);
      });
    });
  });

  chrome.storage.sync.get('theme', (data) => {
    setTheme(data.theme || 'auto');
  });

  manualTestBtn.addEventListener('click', async () => {
    const inputUrl = manualUrl.value.trim();
    const format = manualFormat.value;
    const audio = audioFormat.value;
    const bitrate = audioBitrate.value;

    if (!inputUrl) {
      alert('请输入视频 URL');
      return;
    }

    if (!isValidUrl(inputUrl)) {
      alert('无效的视频 URL');
      return;
    }

    manualTestBtn.disabled = true;
    manualTestBtn.textContent = '正在生成下载链接...';
    manualTestResult.classList.add('hidden');

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'fetchVideoLink',
        url: inputUrl,
        format: format,
        audioFormat: audio,
        audioBitrate: bitrate
      });

      console.log('API response:', response); // 添加日志

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.url || !response.filename) {
        throw new Error('API 返回的数据不完整');
      }

      videoUrl = response.url;
      filename = response.filename;
      filenameDiv.textContent = `文件名: ${filename}`;
      manualTestResult.classList.remove('hidden');
    } catch (error) {
      console.error('Error:', error); // 添加错误日志
      alert(`生成下载链接失败: ${error.message}`);
    } finally {
      manualTestBtn.disabled = false;
      manualTestBtn.textContent = '生成下载链接';
    }
  });

  downloadBtn.addEventListener('click', () => {
    if (videoUrl) {
      chrome.downloads.download({
        url: videoUrl,
        filename: filename,
        saveAs: true
      });
    }
  });

  copyBtn.addEventListener('click', () => {
    if (videoUrl) {
      navigator.clipboard.writeText(videoUrl).then(() => {
        alert('下载链接已复制到剪贴板');
      }).catch(err => {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制');
      });
    }
  });
});