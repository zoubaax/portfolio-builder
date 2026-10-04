# Journal des Modifications du Projet

## 📝 Résumé des Actions
Suite à l'analyse de la vidéo décrivant les problèmes d'expérience utilisateur (UX) et de logique métier (l'URL qui restait figée sur `/`), nous avons établi un plan d'action en 4 étapes et nous avons complété la première étape.

## 🛠️ Modifications Techniques Effectuées

### 1. Installation de Dépendance
- **Action :** Exécution de `npm install react-router-dom` dans le dossier `frontend/`.
- **Raison :** Permettre la gestion de l'historique de navigation et le partage de liens directs.

### 2. Configuration Globale du Routage (`frontend/src/main.jsx`)
- **Action :** Importation de `BrowserRouter` depuis `react-router-dom`.
- **Action :** Englobement du composant racine `<App />` (à l'intérieur du `<ClerkProvider>`) avec le `<BrowserRouter>`.
- **Raison :** Permettre l'utilisation des hooks de routing (comme `useNavigate` ou `useParams`) dans toute l'application.

### 3. Refonte Architecturale de l'Application (`frontend/src/App.jsx`)
- **Action :** Suppression des variables d'état locales (`hasCompletedOnboarding`, `guestMode`) qui géraient l'affichage des vues de façon conditionnelle.
- **Action :** Implémentation du composant `<Routes>` avec les routes suivantes :
  - `<Route path="/" element={<LandingPage />} />` : La page d'accueil marketing.
  - `<Route path="/onboarding" element={<AgentOnboarding />} />` : L'écran de chargement/onboarding après soumission du prompt.
  - `<Route path="/studio" element={<StudioRoute />} />` : L'espace de travail v0 (Chat + Canvas).
  - `<Route path="/studio/:id" element={<StudioRoute />} />` : Route dynamique pour charger un portfolio spécifique à l'avenir.
  - `<Route path="/preview/:slug" element={<PreviewRoute />} />` : Route dédiée à l'affichage plein écran public (Canvas uniquement).
- **Raison :** Permettre le rafraîchissement de la page sans perdre l'état (ex: rester sur `/studio`) et partager l'URL.

### 4. Fix Navigation et UI (`frontend/src/components/landing/LandingPage.jsx`)
- **Action :** Importation de `UserButton` depuis `@clerk/react`.
- **Action :** Ajout de l'image de profil de l'utilisateur (`<UserButton />`) à côté du bouton "Open Studio" dans la barre de navigation lorsque l'utilisateur est connecté.
- **Raison :** Rétablir un élément visuel (l'avatar) qui manquait dans la header de la Landing Page.

### 5. Optimisation de l'IA : Delta Patching (`backend/src/services/aiService.ts`)
- **Action :** Installation de la librairie `fast-json-patch` sur le backend.
- **Action :** Modification du prompt système dans `streamAiEdit` pour exiger un tableau de patchs JSON (RFC 6902) au lieu du schéma JSON complet.
- **Action :** Implémentation de l'application du patch `jsonpatch.applyPatch()` côté serveur avant de renvoyer le résultat mis à jour au frontend.
- **Raison :** Réduire drastiquement le nombre de tokens générés par l'IA lors des requêtes de modification mineures (ex: changement de couleur ou d'un titre), ce qui accélère la réponse (latence réduite) et réduit les coûts.

## 🚀 Prochaines Étapes Prévues
1. **Étape 3 : Tokens de Thèmes** (Amélioration du design system et synchronisation entre IA et UI).
2. **Étape 4 : UI/UX du Chat** (Raffinement des interactions et animations du panneau).

### 🐛 Correctifs Appliqués (Bugs Signalés)
- **Bug de l'affichage du code initial :** Dans `V0Canvas.jsx`, l'affichage `streamingCode || JSON.stringify(...)` a été remplacé par `isGenerating ? streamingCode : JSON.stringify(...)` pour empêcher l'ancien JSON de "flasher" (s'afficher d'un coup) au début d'une nouvelle génération. L'écran de code démarre désormais vide comme attendu.
- **Bug du format du code généré :** L'IA minifiant le tableau de patches sur une seule ligne interminable, le prompt système (`aiService.ts`) a été mis à jour pour exiger un formatage lisible avec 2 espaces d'indentation (pretty-print) afin de garantir une apparence propre et structurée dans le panneau "Code".
- **Bug "Zoubaa" (Logique métier du Fallback) :** L'application remplaçait brutalement le prénom de l'utilisateur par "Zoubaa" en cas d'erreur de l'IA (ou si le nom n'était pas précisé). Correction apportée dans `PortfolioContext.jsx` en utilisant le hook `@clerk/react` `useUser` pour récupérer le vrai prénom de l'utilisateur. Le Fallback respecte désormais le nom déjà existant dans le portfolio.
- **Tolérance de JSON Patch :** L'IA hallucinant parfois des opérations `"replace"` sur des chemins inexistants, ce qui faisait planter `fast-json-patch` (qui respecte strictement la norme RFC 6902), le code dans `aiService.ts` a été modifié pour convertir à la volée les `"replace"` en `"add"`. De plus, les patches sont désormais appliqués individuellement dans une boucle `try...catch` : si un patch est invalide, il est ignoré et les autres sont tout de même appliqués, évitant un crash complet.
- **Bug de suppression totale du portfolio (Écran Noir) :** Si l'utilisateur demandait une seule modification (ex: "change la couleur"), l'IA générait un objet JSON unique au lieu d'un tableau. La fonction `extractJson` a été corrigée pour ne plus détruire la structure des tableaux `[...]` et pour envelopper automatiquement un objet unique dans un tableau. Ainsi, le frontend ne reçoit plus un unique patch comme étant "le nouveau portfolio complet", ce qui causait l'écran noir.
- **Traitement des erreurs silencieuses (Silent Failures) :** Le frontend ne traitait pas correctement les erreurs renvoyées par l'API (ex: Limite de taux dépassée "Rate Limit 429"). Au lieu d'afficher un message de succès factice depuis le Fallback, `PortfolioContext.jsx` lit désormais `data.error` et affiche un vrai message rouge `❌ API Error: ...` dans le chat du Studio.
- **Bug Critique d'Application des Patchs (Profil figé en "Senior Full-Stack" & Fond inchangé) :**
  - **Erreur identifiée :** Dans un environnement Node ESM, l'import `import * as jsonpatch from 'fast-json-patch'` plaçait les fonctions utilitaires sur `default`. Ainsi, `jsonpatch.applyOperation` était `undefined`, provoquant un crash silencieux `TypeError: jsonpatch.applyOperation is not a function` à chaque tentative d'application de patch. Le bloc `catch` du backend renvoyait alors par sécurité le template mock initial intact (`Alex Vance - Senior Full-Stack & AI Engineer` avec fond sombre). Le frontend appliquait ensuite une regex de nom (`Amine`) sur ce mock non modifié, créant l'illusion trompeuse que le profil était "hardcodé" et empêchant tout changement de fond ("yellow").
  - **Correctif Backend (`aiService.ts`) :** Normalisation de l'import ESM via `const jsonpatch = (jsonpatchModule as any).default || jsonpatchModule`. L'application de patch tente l'opération demandée puis bascule intelligemment sur `add` en cas d'élément inexistant. Propagation réelle des erreurs au lieu de renvoyer le mock silencieusement.
  - **Contrat de Schéma Enrichi (`SYSTEM_PORTFOLIO_PROMPT`) :** Le prompt système explicite désormais la structure exacte attendue pour chaque section (`projects.projects` avec `tags`, `skills.categories` avec `skills`, etc.) pour éviter que le LLM n'invente des clés incompatibles (`items`, `tech`, `label`).
  - **Tolérance & Résilience Frontend (`SkillsSection.jsx`, `ProjectsSection.jsx`, `PortfolioRenderer.jsx`) :**
    - `SkillsSection.jsx` supporte désormais `cat.name || cat.label` et `cat.skills || cat.items`.
    - `ProjectsSection.jsx` supporte `projects || items`, `tags || tech`, et normalise les variantes non répertoriées (`cards-detailed` vers `card-grid`).
    - `PortfolioContext.jsx` traite désormais `data.error` en dehors du bloc `try/catch` du parser JSON afin de ne plus jamais avaler une erreur API.

### 6. Gestionnaire Interactif de Contacts & Réseaux Sociaux (`HeroSection`)
- **Composant d'Icônes Vectorielles (`BrandIcons.jsx`) :**
  - Ajout d'icônes SVG optimisées et légères sans dépendances lourdes pour 11 plateformes majeures : GitHub, LinkedIn, X (Twitter), WhatsApp, Instagram, Telegram, Discord, Email, Téléphone, YouTube, Site web / Lien externe.
  - Implémentation du helper exporté `getSocialIcon(platform, className)` avec normalisation insensible à la casse.
- **Modal de Configuration Dédiée (`SocialLinksModal.jsx`) :**
  - Grille visuelle de sélection de plateforme avec badges thématiques (Social, Messaging, Contact, Media, Web).
  - Formatage intelligent automatique des saisies : conversion automatique des numéros WhatsApp en lien `https://wa.me/<digits>`, des emails en `mailto:<email>`, des numéros de téléphone en `tel:<number>`, et suppression intelligente du `@` pour les identifiants GitHub / X / Telegram.
  - Prévisualisation dynamique de l'URL finale en direct au cours de la frappe.
  - Liste de gestion des liens actifs avec suppression en un clic, modification rapide et confirmation via `onSave`.
  - Design studio sombre épuré synchronisé avec les variables de thèmes du portfolio (`var(--theme-surface)`, `var(--theme-border)`, `var(--theme-accent)`).
- **Intégration dans le Hero (`HeroSection.jsx`) :**
  - Barre de contact interactive visible dès que des liens sont présents ou en mode édition (`isEditMode`).
  - En mode édition : bouton direct `+ Add Contact` / `Edit Contacts` et clic sur un lien existant pour éditer instantanément.
  - Prise en charge native et responsive sur les 3 variantes de design (`split-portrait`, `terminal-dev` style console bash, et `minimal-centered`).
  - Sauvegarde instantanée dans le schéma de données via `updateSectionField(sectionId, 'socials', newSocials)`.

### 7. Import Automatique GitHub & Génération d'Images IA (`FLUX.1-schnell`)
- **Configuration & Clé d'API (`backend/.env`) :**
  - Ajout de la clé NVIDIA NIM dédiée à la génération visuelle : `NVIDIA_IMAGE_API_KEY`.
- **Service Backend de Génération d'Images (`imageService.ts`) & Route (`POST /api/v1/ai/generate-project-image`) :**
  - Connecteur vers le modèle de pointe `black-forest-labs/flux.1-schnell` sur NVIDIA NIM pour générer des mockups 3D et d'interfaces logicielles modernes.
  - Système de secours intelligent (*smart tech fallback*) : en cas de latence ou de file d'attente élevée sur l'API d'inférence, attribution contextuelle et instantanée de visuels haute définition adaptés aux technologies du projet (DevOps, Cloud, IA, Web, Mobile).
- **Service Frontend GitHub (`githubService.js`) :**
  - Récupération des dépôts publics GitHub avec statistiques (stars, forks, langage, topics, URLs de démo et code source).
  - Détection automatique du pseudo GitHub depuis le compte Clerk connecté (`user.externalAccounts`).
  - Extraction automatique du contenu des fichiers `README.md` pour alimenter le contexte de l'IA.
- **Nouvel Onglet Studio "Projets" (`GithubProjectsTab.jsx`, `V0Canvas.jsx`, `V0Header.jsx`) :**
  - Onglet dédié `[ 🐙 Projets ]` positionné directement à côté de `Preview` et `Code` dans la barre supérieure du Studio.
  - Interface complète avec barre de recherche en temps réel, cartes interactives avec sélection par case à cocher (*checkbox*).
  - Barre d'action flottante avec compteur de projets sélectionnés, toggle d'activation de la génération visuelle IA, et bouton de synchronisation automatique.
  - Injection automatique du prompt enrichi vers le chat de l'IA pour générer et formater instantanément la section `projects` du portfolio avec retour direct sur la prévisualisation.

### 8. Raffinement du Cycle de Vie Initial & Guidage Conversationnel
- **Nettoyage de l'État Zéro du Code (`V0Canvas.jsx`) :**
  - Avant la saisie du premier prompt (`!hasGeneratedFirstPortfolio && !isGenerating`), l'onglet Code n'affiche plus le template JSON mock par défaut ("Alex Vance"). À la place, un écran d'attente terminal épuré indique clairement à l'utilisateur de décrire son projet dans le chat.
- **Affichage Conditionnel de l'Onglet Projets (`V0Canvas.jsx`, `V0Header.jsx`) :**
  - L'onglet `[ 🐙 Projets ]` est désormais masqué à l'ouverture initiale de l'application et n'apparaît avec une animation fluide qu'après que le premier portfolio a été généré avec succès par l'IA (`hasGeneratedFirstPortfolio === true`).
- **Guidage Conversationnel & Bouton Interactif (`PortfolioContext.jsx`, `V0ChatPanel.jsx`) :**
  - À la fin de la première génération, l'assistant IA envoie un message de félicitations explicite guidant l'utilisateur vers l'étape suivante (lier son GitHub et importer ses projets).
  - Intégration d'un bouton d'action directe cliquable directement dans la bulle de chat (`[ 🐙 Ouvrir l'onglet Projets & Importer GitHub ]`) permettant de basculer instantanément sur l'onglet Projets en un clic.

### 9. Résolution du Streaming SSE & Intégration Robuste des Projets GitHub
- **Résilience du Flux SSE (`PortfolioContext.jsx`) :**
  - Remplacement de l'ancien découpage rigide `.split('\n\n')` par une boucle de parsing résiliente par ligne avec buffer glissant.
  - Vidage systématique et obligatoire du `streamBuffer` résiduel lors de la fermeture du flux (`done: true`). Cela garantit que les paquets finaux contenant `updatedPortfolio` ne sont plus jamais perdus ou tronqués, évitant tout faux basculement vers le fallback.
- **Raccordement du Service de Chat dans l'Onglet Projets (`PortfolioContext.jsx`, `GithubProjectsTab.jsx`) :**
  - Export de l'alias `sendMessage: sendChatMessage` dans le `PortfolioContext` et mise à jour de `GithubProjectsTab.jsx` pour utiliser `sendChatMessage || sendMessage`.
  - Résolution de l'exception `TypeError: sendMessage is not a function` qui bloquait l'envoi du prompt d'enrichissement et déclenchait le bandeau rouge d'erreur lors du clic sur `Appliquer au Portfolio`.

### 10. Authentification Stricte GitHub OAuth & Protection Anti-Usurpation
- **Suppression Totale de la Saisie Manuelle de Liens (`GithubProjectsTab.jsx`) :**
  - Élimination définitive de tout champ de saisie de lien/pseudo manuel afin d'empêcher qu'un utilisateur n'importe des dépôts d'un tiers dont il n'est pas le propriétaire légitime.
- **Certification Cryptographique OAuth par Clerk :**
  - Seuls les comptes authentifiés via le protocole officiel GitHub OAuth (`user.externalAccounts` avec `provider: 'oauth_github'`) sont autorisés à charger et synchroniser leurs dépôts.
  - Le pseudo GitHub est directement certifié par les serveurs de GitHub et Clerk, garantissant une intégrité à 100%.
- **Expérience Utilisateur Sécurisée & Liée à Vie :**
  - Si l'utilisateur est connecté via GitHub : détection automatique instantanée, affichage du badge `🟢 Certifié OAuth`, et chargement direct de ses projets (zéro formulaire).
### 11. Système Multi-Sessions & Historique Persistant PostgreSQL (Style ChatGPT / v0)
- **Migration & Persistance Schéma PostgreSQL Neon (`schema.ts`, `ALTER TABLE`) :**
  - Ajout de la colonne `chat_history` de type `jsonb DEFAULT '[]'::jsonb` à la table `portfolios`.
  - Prise en charge native de la persistance de l'historique complet des messages (rôles `user` et `assistant`, horodatage, étapes de travail et checklists d'exécution).
- **Couche Backend Sécurisée Multi-Tenant (`portfolioRoutes.ts`, `portfolioService.ts`, `portfolioController.ts`) :**
  - Validation Zod étendue avec `chatHistory: z.array(z.any()).optional()` sur la création (`POST /`) et la mise à jour (`PUT /:id`).
  - Isolation stricte par tenant : chaque opération de lecture, création, modification et suppression est filtrée de façon inviolable par `userId` extrait du JWT Clerk.
- **Gestionnaire d'État Multi-Sessions Frontend (`PortfolioContext.jsx`) :**
  - **Auto-persistance automatique (`persistSession`) :** Dès qu'un prompt est exécuté par l'IA (ou via le fallback intelligent), l'état du portfolio et l'historique des messages sont immédiatement synchronisés dans la base PostgreSQL Neon sans nécessiter de clic manuel.
  - Si la session est nouvelle (`portfolioId === null`), création automatique du portfolio en base avec génération d'un slug conforme et mise à jour transparente de l'URL vers `/studio/:id` sans rechargement.
  - Fonctions complètes de gestion : `fetchUserSessions()`, `loadPortfolioSession(id)`, `createNewSession()`, `deleteSession(id)` et `renameSession(id, newTitle)`.
- **Composant Tiroir d'Historique (`ChatHistoryDrawer.jsx`) :**
  - Slide-over design v0 / Vercel épuré avec recherche en temps réel, tri chronologique (`updatedAt DESC`), badge de session active (`🟢 Actif`), horodatage relatif ("Il y a 5 min", "Hier", etc.) et compteur de messages.
  - Actions rapides interactives : renommage en ligne (inline edit), suppression sécurisée avec double confirmation anti-clic accidentel, et bouton `+ Nouveau` pour démarrer un nouveau chat instantanément.
- **Intégration Studio & Navigation Dynamique (`V0ChatPanel.jsx`, `V0Header.jsx`, `App.jsx`) :**
  - Le titre du projet `☆ Project Name ▾` et l'icône d'historique dans `V0ChatPanel` et `V0Header` ouvrent le tiroir d'historique d'un simple clic.
  - Le bouton `New` réinitialise proprement le canvas et le chat pour une nouvelle session vierge sans perdre les sessions précédentes.
  - Support natif du rechargement (`F5`) et des liens partagés sur `/studio/:id` : le composant `StudioRoute` recharge instantanément le portfolio et tout l'historique de chat associé depuis PostgreSQL Neon.



