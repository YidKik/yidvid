
// Google Analytics utility functions
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Initialize Google Analytics
export const initGA = (measurementId: string) => {
  // Replace the placeholder in the script tag
  const scripts = document.querySelectorAll('script');
  scripts.forEach(script => {
    if (script.innerHTML.includes('GA_MEASUREMENT_ID')) {
      script.innerHTML = script.innerHTML.replace(/GA_MEASUREMENT_ID/g, measurementId);
    }
    if (script.src && script.src.includes('GA_MEASUREMENT_ID')) {
      script.src = script.src.replace('GA_MEASUREMENT_ID', measurementId);
    }
  });
};

// Track page views
export const trackPageView = (url: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', 'G-EB95XJNCCD', {
      page_path: url,
    });
  }
};

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track video interactions
export const trackVideoPlay = (videoTitle: string, videoId: string) => {
  trackEvent('play', 'video', `${videoTitle} (${videoId})`);
};

export const trackVideoLike = (videoTitle: string, videoId: string) => {
  trackEvent('like', 'video', `${videoTitle} (${videoId})`);
};

export const trackChannelSubscribe = (channelName: string) => {
  trackEvent('subscribe', 'channel', channelName);
};

export const trackSearch = (searchTerm: string) => {
  trackEvent('search', 'user_interaction', searchTerm);
};

export const trackPageNavigation = (pageName: string) => {
  trackEvent('navigate', 'page', pageName);
};
