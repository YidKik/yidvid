type TranslationKey = 
  | 'settings'
  | 'customizeColors'
  | 'backgroundColor'
  | 'textColor'
  | 'buttonColor'
  | 'logoColor'
  | 'saveChanges'
  | 'resetDefaults'
  | 'accountInformation'
  | 'userId'
  | 'uniqueIdentifier'
  | 'signOut'
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
  [key in TranslationKey]: {
    en: string;
    yi: string;
  };
};

export const translations: Translations = {
  settings: {
    en: 'Settings',
    yi: 'איינשטעלונגען'
  },
  customizeColors: {
    en: 'Customize Colors',
    yi: 'קאָלירן צופּאַסן'
  },
  backgroundColor: {
    en: 'Background Color',
    yi: 'הינטערגרונט קאָליר'
  },
  textColor: {
    en: 'Text Color',
    yi: 'טעקסט קאָליר'
  },
  buttonColor: {
    en: 'Button Color',
    yi: 'קנעפּל קאָליר'
  },
  logoColor: {
    en: 'Logo Color',
    yi: 'לאָגאָ קאָליר'
  },
  saveChanges: {
    en: 'Save Changes',
    yi: 'היט ענדערונגען'
  },
  resetDefaults: {
    en: 'Reset to Defaults',
    yi: 'צוריקשטעלן צו פאַרויסגעזעצט'
  },
  accountInformation: {
    en: 'Your Account Information',
    yi: 'דײַן קאָנטע אינפֿאָרמאַציע'
  },
  userId: {
    en: 'User ID',
    yi: 'באַניצער ID'
  },
  uniqueIdentifier: {
    en: 'This is your unique identifier in the system. You might need this when requesting admin access.',
    yi: 'דאָס איז דײַן יחיד אידענטיפיצירער אין דער סיסטעם. איר קענט דאַרפֿן דאָס ווען איר בעט אַדמין צוטריט.'
  },
  signOut: {
    en: 'Sign Out',
    yi: 'אַרויסשרײַבן'
  },
  deleteAccount: {
    en: 'Delete Account',
    yi: 'אויסמעקן קאָנטע'
  },
  accessibility: {
    en: 'Accessibility',
    yi: 'צוטריטלעכקייט'
  },
  highContrastMode: {
    en: 'High Contrast Mode',
    yi: 'הויך קאָנטראַסט מאָדע'
  },
  increaseContrast: {
    en: 'Increase contrast for better visibility',
    yi: 'פארגרעסערן קאָנטראַסט פֿאַר בעסער זעעוודיקייט'
  },
  subtitles: {
    en: 'Subtitles',
    yi: 'אונטערטיטלען'
  },
  playbackSettings: {
    en: 'Playback Settings',
    yi: 'אָפּשפּילן איינשטעלונגען'
  },
  defaultVolume: {
    en: 'Default Volume',
    yi: 'פֿאַרויסגעזעצט קול'
  },
  defaultPlaybackSpeed: {
    en: 'Default Playback Speed',
    yi: 'פֿאַרויסגעזעצט אָפּשפּילן געשווינדיקייט'
  },
  autoplay: {
    en: 'Autoplay',
    yi: 'אויטאָמאַטיש שפּילן'
  },
  autoplayNextVideo: {
    en: 'Automatically play next video',
    yi: 'אויטאָמאַטיש שפּילן נעקסט ווידעא'
  },
  languageSettings: {
    en: 'Language Settings',
    yi: 'שפּראַך איינשטעלונגען'
  },
  interfaceLanguage: {
    en: 'Interface Language',
    yi: 'אינטערפֿייס שפּראַך'
  },
  notificationSettings: {
    en: 'Notification Settings',
    yi: 'מעלדונג איינשטעלונגען'
  },
  emailNotifications: {
    en: 'Email Notifications',
    yi: 'בליצפּאָסט מעלדונגען'
  },
  receiveUpdates: {
    en: 'Receive updates via email',
    yi: 'באַקומען דערהײַנטיקונגען דורך בליצפּאָסט'
  },
  pushNotifications: {
    en: 'Push Notifications',
    yi: 'פּוש מעלדונגען'
  },
  browserNotifications: {
    en: 'Receive browser notifications',
    yi: 'באַקומען בלעטערער מעלדונגען'
  },
  privacySettings: {
    en: 'Privacy Settings',
    yi: 'פּריוואַטקייט איינשטעלונגען'
  },
  privateAccount: {
    en: 'Private Account',
    yi: 'פּריוואַט קאָנטע'
  },
  showActivityFollowers: {
    en: 'Only show your activity to followers',
    yi: 'בלויז ווײַזן דײַן אַקטיוויטעט צו נאָכפֿאָלגער'
  },
  dataCollection: {
    en: 'Data Collection',
    yi: 'דאַטן זאַמלונג'
  },
  allowDataCollection: {
    en: 'Allow us to collect usage data to improve your experience',
    yi: 'דערלויבן אונדז צו זאַמלען ניצן דאַטן צו פֿאַרבעסערן דײַן דערפֿאַרונג'
  },
  autoHideComments: {
    en: 'Auto-hide Comments',
    yi: 'אויטאָמאַטיש באַהאַלטן קאָמענטאַרן'
  },
  adminControls: {
    en: 'Admin Controls',
    yi: 'אַדמין קאָנטראָלן'
  },
  dashboardAccess: {
    en: 'Dashboard Access',
    yi: 'דאַשבאָרד צוטריט'
  },
  manageChannels: {
    en: 'Access the admin dashboard to manage channels and videos',
    yi: 'צוטריט צו דער אַדמין דאַשבאָרד צו פֿאַרוואַלטן קאַנאַלן און ווידעאס'
  },
  openDashboard: {
    en: 'Open Dashboard',
    yi: 'עפֿן דאַשבאָרד'
  },
  manageAdmins: {
    en: 'Manage Admins',
    yi: 'פֿאַרוואַלטן אַדמינס'
  },
  email: {
    en: 'Email',
    yi: 'בליצפּאָסט'
  },
  adminStatus: {
    en: 'Admin Status',
    yi: 'אַדמין סטאַטוס'
  },
  actions: {
    en: 'Actions',
    yi: 'אַקציעס'
  },
  allChannels: {
    en: 'All Channels',
    yi: 'אַלע קאַנאַלן'
  },
  search: {
    en: 'Search...',
    yi: 'זוכן...'
  },
  noNotifications: {
    en: 'No notifications',
    yi: 'קיין מעלדונגען'
  },
  welcomeToJewTube: {
    en: 'Welcome to JewTube!',
    yi: 'ברוכים הבאים צו דזשוטוב!'
  },
  jewTubeDescription: {
    en: 'JewTube is your dedicated platform for discovering and engaging with Jewish content from various YouTube channels. Our mission is to create a centralized hub where you can easily find, watch, and interact with meaningful Jewish content.',
    yi: 'דזשוטוב איז דײַן געווידמעט פּלאַטפאָרמע פֿאַר אַנטדעקן און אַרײַננעמען מיט אידישע אינהאַלט פֿון פֿאַרשידענע יוטוב קאַנאַלן. אונדזער מיסיע איז צו שאַפֿן אַ צענטראַליזירט צענטער ווו איר קענט גרינג געפֿינען, קוקן און אינטעראַקטירן מיט באַטײַטיק אידישע אינהאַלט.'
  },
  whatYouCanDo: {
    en: 'What you can do here:',
    yi: 'וואָס איר קענט טאָן דאָ:'
  },
  browseCuratedContent: {
    en: 'Browse curated Jewish content from various YouTube channels',
    yi: 'בלעטערן קוראַטעד אידישע אינהאַלט פֿון פֿאַרשידענע יוטוב קאַנאַלן'
  },
  searchTopics: {
    en: 'Search for specific topics or channels',
    yi: 'זוכן פֿאַר ספּעציפֿישע טעמעס אָדער קאַנאַלן'
  },
  subscribeToChannels: {
    en: 'Subscribe to your favorite channels to stay updated',
    yi: 'אַבאָנירן צו דײַן באַליבטע קאַנאַלן צו בלײַבן דערהײַנטיקט'
  },
  createAccount: {
    en: 'Create an account to personalize your experience',
    yi: 'שאַפֿן אַ קאָנטע צו פּערסאַנאַליזירן דײַן דערפֿאַרונג'
  },
  interactWithVideos: {
    en: 'Interact with videos through likes and comments',
    yi: 'אינטעראַקטירן מיט ווידעאס דורך לייקס און קאָמענטאַרן'
  },
  customizeExperience: {
    en: 'Customize your viewing experience with theme settings',
    yi: 'צופּאַסן דײַן קוקן דערפֿאַרונג מיט טעמע שטעלונגען'
  },
  whetherLooking: {
    en: 'Whether you\'re looking for Torah lessons, Jewish music, cultural content, or educational materials, JewTube makes it easy to find exactly what you\'re looking for in one place.',
    yi: 'צי איר זוכט תּורה לעקציעס, אידישע מוזיק, קולטור אינהאַלט, אָדער בילדונג מאַטעריאַלן, דזשוטוב מאַכט עס גרינג צו געפֿינען פּונקט וואָס איר זוכט אין איין אָרט.'
  }
};

export const getTranslation = (key: TranslationKey, lang: string): string => {
  return translations[key][lang as keyof typeof translations[typeof key]] || translations[key]['en'];
};
