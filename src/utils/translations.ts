export type TranslationKey = 
  | 'settings'
  | 'customizeColors'
  | 'backgroundColor'
  | 'textColor'
  | 'buttonColor'
  | 'otherColors'
  | 'saveChanges'
  | 'resetDefaults'
  | 'accountInformation'
  | 'userId'
  | 'uniqueIdentifier'
  | 'signOut'
  | 'signIn'
  | 'deleteAccount'
  | 'accessibility'
  | 'highContrastMode'
  | 'increaseContrast'
  | 'subtitles'
  | 'playbackSettings'
  | 'defaultVolume'
  | 'defaultPlaybackSpeed'
  | 'autoplay'
  | 'autoplayNextVideo'
  | 'languageSettings'
  | 'interfaceLanguage'
  | 'notificationSettings'
  | 'emailNotifications'
  | 'receiveUpdates'
  | 'pushNotifications'
  | 'browserNotifications'
  | 'privacySettings'
  | 'privateAccount'
  | 'showActivityFollowers'
  | 'dataCollection'
  | 'allowDataCollection'
  | 'autoHideComments'
  | 'adminControls'
  | 'dashboardAccess'
  | 'manageChannels'
  | 'openDashboard'
  | 'manageAdmins'
  | 'email'
  | 'adminStatus'
  | 'actions'
  | 'allChannels'
  | 'search'
  | 'noNotifications'
  | 'welcomeToJewTube'
  | 'jewTubeDescription'
  | 'whatYouCanDo'
  | 'browseCuratedContent'
  | 'searchTopics'
  | 'subscribeToChannels'
  | 'createAccount'
  | 'interactWithVideos'
  | 'customizeExperience'
  | 'whetherLooking';

type Translations = {
  [key in TranslationKey]: string;
};

export const translations: Translations = {
  settings: 'Settings',
  customizeColors: 'Customize Colors',
  backgroundColor: 'Background Color',
  textColor: 'Text Color',
  buttonColor: 'Button Color',
  otherColors: 'Other Colors',
  saveChanges: 'Save Changes',
  resetDefaults: 'Reset to Defaults',
  accountInformation: 'Your Account Information',
  userId: 'User ID',
  uniqueIdentifier: 'This is your unique identifier in the system. You might need this when requesting admin access.',
  signOut: 'Sign Out',
  signIn: 'Sign In',
  deleteAccount: 'Delete Account',
  accessibility: 'Accessibility',
  highContrastMode: 'High Contrast Mode',
  increaseContrast: 'Increase contrast for better visibility',
  subtitles: 'Subtitles',
  playbackSettings: 'Playback Settings',
  defaultVolume: 'Default Volume',
  defaultPlaybackSpeed: 'Default Playback Speed',
  autoplay: 'Autoplay',
  autoplayNextVideo: 'Automatically play next video',
  languageSettings: 'Language Settings',
  interfaceLanguage: 'Interface Language',
  notificationSettings: 'Notification Settings',
  emailNotifications: 'Email Notifications',
  receiveUpdates: 'Receive updates via email',
  pushNotifications: 'Push Notifications',
  browserNotifications: 'Receive browser notifications',
  privacySettings: 'Privacy Settings',
  privateAccount: 'Private Account',
  showActivityFollowers: 'Only show your activity to followers',
  dataCollection: 'Data Collection',
  allowDataCollection: 'Allow us to collect usage data to improve your experience',
  autoHideComments: 'Auto-hide Comments',
  adminControls: 'Admin Controls',
  dashboardAccess: 'Dashboard Access',
  manageChannels: 'Access the admin dashboard to manage channels and videos',
  openDashboard: 'Open Dashboard',
  manageAdmins: 'Manage Admins',
  email: 'Email',
  adminStatus: 'Admin Status',
  actions: 'Actions',
  allChannels: 'All Channels',
  search: 'Search...',
  noNotifications: 'No notifications',
  welcomeToJewTube: 'Welcome to YidVid!',
  jewTubeDescription: 'YidVid is your dedicated platform for discovering and engaging with Jewish content from various YouTube channels. Our mission is to create a centralized hub where you can easily find, watch, and interact with meaningful Jewish content.',
  whatYouCanDo: 'What you can do here:',
  browseCuratedContent: 'Browse curated Jewish content from various YouTube channels',
  searchTopics: 'Search for specific topics or channels',
  subscribeToChannels: 'Subscribe to your favorite channels to stay updated',
  createAccount: 'Create an account to personalize your experience',
  interactWithVideos: 'Interact with videos through likes and comments',
  customizeExperience: 'Customize your viewing experience with theme settings',
  whetherLooking: 'Whether you\'re looking for Torah lessons, Jewish music, cultural content, or educational materials, JewTube makes it easy to find exactly what you\'re looking for in one place.'
};

export const getTranslation = (key: TranslationKey): string => {
  const translation = translations[key];
  if (!translation) {
    console.warn(`Translation missing for key: ${key}`);
    return key;
  }
  return translation;
};
