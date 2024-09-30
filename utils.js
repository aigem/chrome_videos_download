export function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export function sanitizeFilename(filename) {
  // 移除或替换不允许的字符
  return filename
}

export function isSupportedSite(url) {
  const supportedSites = [
    'bilibili.com', 'bluesky.com', 'dailymotion.com', 'instagram.com', 'facebook.com',
    'loom.com', 'ok.ru', 'pinterest.com', 'reddit.com', 'rutube.ru', 'snapchat.com',
    'soundcloud.com', 'streamable.com', 'tiktok.com', 'tumblr.com', 'twitch.tv',
    'twitter.com', 'x.com', 'vimeo.com', 'vine.co', 'vk.com', 'youtube.com'
  ];
  return supportedSites.some(site => url.includes(site));
}