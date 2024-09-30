import { isValidUrl } from '../utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  const apiUrlInput = document.getElementById('apiUrl');
  const saveBtn = document.getElementById('saveBtn');
  const testBtn = document.getElementById('testBtn');
  const status = document.getElementById('status');
  const themeToggle = document.getElementById('themeToggle');
  const testPostBtn = document.getElementById('testPostBtn');
  const manualUrl = document.getElementById('manualUrl');
  const manualFormat = document.getElementById('manualFormat');

  // 加载保存的设置
  chrome.storage.sync.get(['apiUrl', 'theme'], (data) => {
    if (data.apiUrl) apiUrlInput.value = data.apiUrl;
    setTheme(data.theme || 'auto');
  });

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

   // 保存设置
  saveBtn.addEventListener('click', () => {
    const apiUrl = apiUrlInput.value.trim();

    if (!apiUrl) {
      status.textContent = '请填写 API 地址';
      status.style.color = 'var(--error-color)';
      return;
    }

    if (!isValidUrl(apiUrl)) {
      status.textContent = '无效的 URL';
      status.style.color = 'var(--error-color)';
      return;
    }

    chrome.storage.sync.set({ apiUrl }, () => {
      if (chrome.runtime.lastError) {
        status.textContent = '保存失败: ' + chrome.runtime.lastError.message;
        status.style.color = 'var(--error-color)';
      } else {
        status.textContent = '设置已保存';
        status.style.color = 'var(--success-color)';
        setTimeout(() => {
          status.textContent = '';
        }, 2000);
      }
    });
  });
});