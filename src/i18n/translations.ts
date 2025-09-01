import { Translation } from '../types';

export const translations = {
  // Navigation
  issues: { ENGLISH: 'Issues', KINYARWANDA: 'Ibibazo', FRENCH: 'Problèmes' },
  topics: { ENGLISH: 'Topics', KINYARWANDA: 'Insanganyamatsiko', FRENCH: 'Sujets' },
  announcements: { ENGLISH: 'Announcements', KINYARWANDA: 'Amatangazo', FRENCH: 'Annonces' },
  
  // Common actions
  follow: { ENGLISH: 'Follow', KINYARWANDA: 'Kurikirana', FRENCH: 'Suivre' },
  following: { ENGLISH: 'Following', KINYARWANDA: 'Urakurikirana', FRENCH: 'Suivi' },
  upvote: { ENGLISH: 'Upvote', KINYARWANDA: 'Tora hejuru', FRENCH: 'Vote positif' },
  downvote: { ENGLISH: 'Downvote', KINYARWANDA: 'Tora hasi', FRENCH: 'Vote négatif' },
  reply: { ENGLISH: 'Reply', KINYARWANDA: 'Subiza', FRENCH: 'Répondre' },
  comment: { ENGLISH: 'Comment', KINYARWANDA: 'Igitekerezo', FRENCH: 'Commentaire' },
  share: { ENGLISH: 'Share', KINYARWANDA: 'Sangira', FRENCH: 'Partager' },
  
  // Issue specific
  createIssue: { ENGLISH: 'Create Issue', KINYARWANDA: 'Kurema Ikibazo', FRENCH: 'Créer un Problème' },
  issueTitle: { ENGLISH: 'Issue Title', KINYARWANDA: 'Umutwe w\'Ikibazo', FRENCH: 'Titre du Problème' },
  issueDescription: { ENGLISH: 'Describe your issue...', KINYARWANDA: 'Sobanura ikibazo cyawe...', FRENCH: 'Décrivez votre problème...' },
  category: { ENGLISH: 'Category', KINYARWANDA: 'Icyiciro', FRENCH: 'Catégorie' },
  status: { ENGLISH: 'Status', KINYARWANDA: 'Imiterere', FRENCH: 'Statut' },
  priority: { ENGLISH: 'Priority', KINYARWANDA: 'Ubwihangane', FRENCH: 'Priorité' },
  
  // Status
  open: { ENGLISH: 'Open', KINYARWANDA: 'Gifunguye', FRENCH: 'Ouvert' },
  inProgress: { ENGLISH: 'In Progress', KINYARWANDA: 'Mu Rwego', FRENCH: 'En Cours' },
  resolved: { ENGLISH: 'Resolved', KINYARWANDA: 'Byakemuwe', FRENCH: 'Résolu' },
  closed: { ENGLISH: 'Closed', KINYARWANDA: 'Byfunze', FRENCH: 'Fermé' },
  
  // Priority
  low: { ENGLISH: 'Low', KINYARWANDA: 'Buke', FRENCH: 'Faible' },
  medium: { ENGLISH: 'Medium', KINYARWANDA: 'Hagati', FRENCH: 'Moyen' },
  high: { ENGLISH: 'High', KINYARWANDA: 'Hejuru', FRENCH: 'Élevé' },
  urgent: { ENGLISH: 'Urgent', KINYARWANDA: 'Byihutirwa', FRENCH: 'Urgent' },
  
  // Topic specific
  createTopic: { ENGLISH: 'Create Topic', KINYARWANDA: 'Kurema Ingingo', FRENCH: 'Créer un Sujet' },
  whatHappening: { ENGLISH: 'What\'s happening?', KINYARWANDA: 'Habaye iki?', FRENCH: 'Que se passe-t-il ?' },
  
  // Time
  justNow: { ENGLISH: 'Just now', KINYARWANDA: 'Ubu', FRENCH: 'À l\'instant' },
  minutesAgo: { ENGLISH: 'minutes ago', KINYARWANDA: 'iminota ishize', FRENCH: 'il y a minutes' },
  hoursAgo: { ENGLISH: 'hours ago', KINYARWANDA: 'amasaha ashize', FRENCH: 'il y a heures' },
  daysAgo: { ENGLISH: 'days ago', KINYARWANDA: 'iminsi ishize', FRENCH: 'il y a jours' },
  
  // Categories
  infrastructure: { ENGLISH: 'Infrastructure', KINYARWANDA: 'Ibikorwa Remezo', FRENCH: 'Infrastructure' },
  healthcare: { ENGLISH: 'Healthcare', KINYARWANDA: 'Ubuvuzi', FRENCH: 'Santé' },
  education: { ENGLISH: 'Education', KINYARWANDA: 'Uburezi', FRENCH: 'Éducation' },
  transport: { ENGLISH: 'Transport', KINYARWANDA: 'Ubwikorezi', FRENCH: 'Transport' },
  environment: { ENGLISH: 'Environment', KINYARWANDA: 'Ibidukikije', FRENCH: 'Environnement' },
  security: { ENGLISH: 'Security', KINYARWANDA: 'Umutekano', FRENCH: 'Sécurité' },
  
  // Departments
  ministryHealth: { ENGLISH: 'Ministry of Health', KINYARWANDA: 'Minisitiri w\'Ubuzima', FRENCH: 'Ministère de la Santé' },
  ministryEducation: { ENGLISH: 'Ministry of Education', KINYARWANDA: 'Minisitiri w\'Uburezi', FRENCH: 'Ministère de l\'Éducation' },
  ministryTransport: { ENGLISH: 'Ministry of Transport', KINYARWANDA: 'Minisitiri y\'Ubwikorezi', FRENCH: 'Ministère des Transports' },
  localGovernment: { ENGLISH: 'Local Government', KINYARWANDA: 'Ubutegetsi Bwibanze', FRENCH: 'Gouvernement Local' },
  
  // Authentication
  signIn: { ENGLISH: 'Sign in to your account', KINYARWANDA: 'Injira kuri konti yawe', FRENCH: 'Connectez-vous à votre compte' },
  signInSubtitle: { ENGLISH: 'Access your civic engagement dashboard', KINYARWANDA: 'Kugera kuri dashboard yawe y\'ubugenzuzi', FRENCH: 'Accédez à votre tableau de bord d\'engagement civique' },
  emailOrPhone: { ENGLISH: 'Email or Phone Number', KINYARWANDA: 'Imeyili cyangwa Telefoni', FRENCH: 'E-mail ou numéro de téléphone' },
  emailAddress: { ENGLISH: 'Email Address', KINYARWANDA: 'Imeyili', FRENCH: 'Adresse e-mail' },
  password: { ENGLISH: 'Password', KINYARWANDA: 'Ijambo banga', FRENCH: 'Mot de passe' },
  signInButton: { ENGLISH: 'Sign in', KINYARWANDA: 'Injira', FRENCH: 'Se connecter' },
  signingIn: { ENGLISH: 'Signing in...', KINYARWANDA: 'Uraza...', FRENCH: 'Connexion en cours...' },
  dontHaveAccount: { ENGLISH: 'Don\'t have an account?', KINYARWANDA: 'Niba utarafungura konti?', FRENCH: 'Vous n\'avez pas de compte ?' },
  createOneHere: { ENGLISH: 'Create one here', KINYARWANDA: 'Fungura hano', FRENCH: 'Créez-en un ici' },
  
  // Registration
  createAccount: { ENGLISH: 'Create your account', KINYARWANDA: 'Fungura konti yawe', FRENCH: 'Créez votre compte' },
      createAccountSubtitle: { ENGLISH: 'Join Citizen Engagement Platform to engage with your community', KINYARWANDA: 'Wiyunge na Citizen Engagement Platform kugirango ufatanye na mugenzuzi wawe', FRENCH: 'Rejoignez Citizen Engagement Platform pour vous engager avec votre communauté' },
  firstName: { ENGLISH: 'First Name', KINYARWANDA: 'Izina rya Mbere', FRENCH: 'Prénom' },
  lastName: { ENGLISH: 'Last Name', KINYARWANDA: 'Izina rya Nyuma', FRENCH: 'Nom de famille' },
  middleName: { ENGLISH: 'Middle Name', KINYARWANDA: 'Izina rya Hagati', FRENCH: 'Nom du milieu' },
  phoneNumber: { ENGLISH: 'Phone Number', KINYARWANDA: 'Telefoni', FRENCH: 'Numéro de téléphone' },
  createAccountButton: { ENGLISH: 'Create Account', KINYARWANDA: 'Fungura Konti', FRENCH: 'Créer un compte' },
  creatingAccount: { ENGLISH: 'Creating account...', KINYARWANDA: 'Urafungura konti...', FRENCH: 'Création du compte...' },
  alreadyHaveAccount: { ENGLISH: 'Already have an account?', KINYARWANDA: 'Urafungura konti?', FRENCH: 'Vous avez déjà un compte ?' },
  signInHere: { ENGLISH: 'Sign in here', KINYARWANDA: 'Injira hano', FRENCH: 'Connectez-vous ici' },
  
  // Form validation
  required: { ENGLISH: 'Required', KINYARWANDA: 'Bikenewe', FRENCH: 'Requis' },
  optional: { ENGLISH: 'Optional', KINYARWANDA: 'Bihitse', FRENCH: 'Optionnel' },
  
  // Issue creation form
  issueType: { ENGLISH: 'Issue Type', KINYARWANDA: 'Ubwoko bw\'Ikibazo', FRENCH: 'Type de Problème' },
  language: { ENGLISH: 'Language', KINYARWANDA: 'Ururimi', FRENCH: 'Langue' },
  description: { ENGLISH: 'Description', KINYARWANDA: 'Ibisobanura', FRENCH: 'Description' },
  location: { ENGLISH: 'Location', KINYARWANDA: 'Aho', FRENCH: 'Localisation' },
  attachments: { ENGLISH: 'Attachments', KINYARWANDA: 'Inyongeramagambo', FRENCH: 'Pièces Jointes' },
  useCurrentLocation: { ENGLISH: 'Use current location', KINYARWANDA: 'Koresha aho uheruka', FRENCH: 'Utiliser l\'emplacement actuel' },
  district: { ENGLISH: 'District', KINYARWANDA: 'Akarere', FRENCH: 'District' },
  sector: { ENGLISH: 'Sector', KINYARWANDA: 'Umurenge', FRENCH: 'Secteur' },
  cell: { ENGLISH: 'Cell', KINYARWANDA: 'Akagari', FRENCH: 'Cellule' },
  village: { ENGLISH: 'Village', KINYARWANDA: 'Umudugudu', FRENCH: 'Village' },
  latitude: { ENGLISH: 'Latitude', KINYARWANDA: 'Latitude', FRENCH: 'Latitude' },
  longitude: { ENGLISH: 'Longitude', KINYARWANDA: 'Longitude', FRENCH: 'Longitude' },
  
  // Leader assignment
  assignLeader: { ENGLISH: 'Assign to Leader', KINYARWANDA: 'Guhagarika Umuyobozi', FRENCH: 'Assigner à un Leader' },
  searchLeader: { ENGLISH: 'Search Leader', KINYARWANDA: 'Shakisha Umuyobozi', FRENCH: 'Rechercher un Leader' },
  enterLeaderName: { ENGLISH: 'Enter leader name to search...', KINYARWANDA: 'Andika izina rya umuyobozi kugirango ushakishe...', FRENCH: 'Entrez le nom du leader à rechercher...' },
  searchingLeaders: { ENGLISH: 'Searching leaders', KINYARWANDA: 'Ushakisha abayobozi', FRENCH: 'Recherche de leaders...' },
  searchResults: { ENGLISH: 'Search Results', KINYARWANDA: 'Ibisubizo byo Gushakisha', FRENCH: 'Résultats de recherche' },
  noLeadersFound: { ENGLISH: 'No leaders found', KINYARWANDA: 'Nta bayobozi babashije kuboneka', FRENCH: 'Aucun leader trouvé' },
  assignedLeader: { ENGLISH: 'Assigned Leader', KINYARWANDA: 'Umuyobozi Wahagaritswe', FRENCH: 'Leader Assigné' },
  clearAssignment: { ENGLISH: 'Clear Assignment', KINYARWANDA: 'Siba Igihagarika', FRENCH: 'Effacer l\'assignation' },
  addAttachment: { ENGLISH: 'Add Attachment', KINYARWANDA: 'Ongeraho Inyongeramagambo', FRENCH: 'Ajouter une Pièce Jointe' },
  fileUrl: { ENGLISH: 'File URL', KINYARWANDA: 'URL y\'Inyandiko', FRENCH: 'URL du Fichier' },

  makePrivate: { ENGLISH: 'Make this issue private', KINYARWANDA: 'Reba ikibazo nk\'ibyihishe', FRENCH: 'Rendre ce problème privé' },
  creatingIssue: { ENGLISH: 'Creating Issue...', KINYARWANDA: 'Urarema Ikibazo...', FRENCH: 'Création du Problème...' },
  
  // Placeholder texts
  enterIssueTitle: { ENGLISH: 'Enter issue title...', KINYARWANDA: 'Andika umutwe w\'ikibazo...', FRENCH: 'Entrez le titre du problème...' },
  enterIssueDescription: { ENGLISH: 'Describe your issue in detail...', KINYARWANDA: 'Sobanura ikibazo cyawe mu buryo bwuzuye...', FRENCH: 'Décrivez votre problème en détail...' },
  enterDistrict: { ENGLISH: 'Enter district', KINYARWANDA: 'Andika akarere', FRENCH: 'Entrez le district' },
  enterSector: { ENGLISH: 'Enter sector', KINYARWANDA: 'Andika umurenge', FRENCH: 'Entrez le secteur' },
  enterCell: { ENGLISH: 'Enter cell', KINYARWANDA: 'Andika akagari', FRENCH: 'Entrez la cellule' },
  enterVillage: { ENGLISH: 'Enter village', KINYARWANDA: 'Andika umudugudu', FRENCH: 'Entrez le village' },
  enterLatitude: { ENGLISH: 'Enter latitude', KINYARWANDA: 'Andika latitude', FRENCH: 'Entrez la latitude' },
  enterLongitude: { ENGLISH: 'Enter longitude', KINYARWANDA: 'Andika longitude', FRENCH: 'Entrez la longitude' },
  selectCategory: { ENGLISH: 'Select category', KINYARWANDA: 'Hitamo icyiciro', FRENCH: 'Sélectionnez la catégorie' },
  
  // Profile completion
  profileIncomplete: { ENGLISH: 'Profile Incomplete', KINYARWANDA: 'Umwirondoro Ntuzuzuye', FRENCH: 'Profil Incomplet' },
      profileIncompleteMessage: { ENGLISH: 'Please complete your profile by adding your location information to get the full Citizen Engagement Platform experience.', KINYARWANDA: 'Uzuza umwirondoro wawe ukongeramo amakuru y\'ahantu kugirango ubone uburambe bwose bwa Citizen Engagement Platform.', FRENCH: 'Veuillez compléter votre profil en ajoutant vos informations de localisation pour obtenir l\'expérience complète de Citizen Engagement Platform.' },
  completeProfile: { ENGLISH: 'Complete Profile', KINYARWANDA: 'Uzuza Umwirondoro', FRENCH: 'Compléter le Profil' },
};

export const getTranslation = (key: keyof typeof translations, language: string): string => {
  const translation = translations[key];
  if (!translation) return key;
  return translation[language as keyof Translation] || translation.ENGLISH;
};