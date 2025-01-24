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
  | 'actions';

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
  }
};

export const getTranslation = (key: TranslationKey, lang: string): string => {
  return translations[key][lang as keyof typeof translations[typeof key]] || translations[key]['en'];
};