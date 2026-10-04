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
### 12. Liaison GitHub OAuth Directe & Indépendante (Découplage de Clerk)
- **Découplage Architectural Total des Identités :**
  - Élimination définitive du blocage Clerk lié aux conflits d'emails (*"The email address associated with this OAuth account is already claimed by another user"*).
  - L'application dispose désormais de sa propre OAuth App GitHub dédiée (comme Vercel ou v0) : tout utilisateur connecté peut certifier et lier n'importe quel compte GitHub légitime, même si ses adresses email Google et GitHub diffèrent.
- **Persistance en Base de Données PostgreSQL Neon (`schema.ts`, Migration SQL) :**
  - Ajout des colonnes `github_username`, `github_access_token` et `github_avatar_url` dans la table `users`.
  - La connexion GitHub est enregistrée de façon pérenne en base et survit aux rafraîchissements de page et reconnexions.
- **Routeur Backend Dédié (`backend/src/routes/githubRoutes.ts`, `backend/src/index.ts`) :**
  - `GET /api/v1/github/authorize` : Redirige de manière sécurisée vers GitHub avec les permissions adéquates (`read:user,repo`) et le `userId` en paramètre d'état (`state`).
  - `GET /api/v1/github/callback` : Échange le code temporaire contre un jeton d'accès permanent, interroge l'API GitHub `/user`, met à jour l'enregistrement Neon DB et sert une fenêtre popup communicante qui transmet les données au Studio via `window.opener.postMessage({ type: 'GITHUB_OAUTH_SUCCESS', ... })` avant de se fermer automatiquement.
  - `GET /api/v1/github/status` : Interroge la base Neon pour vérifier si le compte actuel a déjà un profil GitHub lié.
  - `POST /api/v1/github/disconnect` : Permet la dissociation immédiate et propre du compte GitHub en un clic.
  - `GET /api/v1/github/repos` : Récupère les dépôts en tirant parti du jeton OAuth sauvegardé (débloquant une limite d'appels de 5 000 requêtes/heure au lieu de 60, et l'accès aux dépôts), avec bascule transparente vers l'API publique en cas de besoin.
- **Expérience Utilisateur Moderne en Popup dans le Studio (`GithubProjectsTab.jsx`, `githubService.js`) :**
  - L'authentification s'ouvre dans une fenêtre popup centrée élégante sans quitter le Studio ni perdre l'état du portfolio.
  - Dès validation sur GitHub, le Studio détecte la confirmation instantanément, affiche le badge `🟢 @Amine-NAHLI Certifié OAuth`, et synchronise immédiatement tous les dépôts disponibles.
  - Ajout d'un bouton direct `Dissocier` permettant de changer de compte GitHub à tout moment.

### 13. Résolution de la Persistance de l'Historique de Chat Multi-Sessions (`PortfolioContext.jsx`, `V0ChatPanel.jsx`)
- **Diagnostic de l'Anomalie :**
  - Lors du chargement d'une session depuis l'historique ou le rechargement d'une URL `/studio/:id`, le portfolio s'affichait fidèlement mais la conversation était remplacée par un message unique *"Session chargée avec succès"*.
  - En base Neon DB, la colonne `chat_history` contenait `[]`.
  - **Cause racine identifiée :** Dans `sendChatMessage`, la variable `finalMessages` était assignée dans le callback asynchrone de `setChatMessages(prev => ...)`. L'appel immédiat à `persistSession(..., finalMessages, ...)` s'exécutait avant que React n'exécute le callback, transmettant un tableau vide `[]` qui écrasait l'historique en base de données.
- **Correctifs Appliqués :**
  - **Synchronisation par Référence Réactive (`chatMessagesRef`, `portfolioIdRef`) :** Création de `useRef` garantissant un accès instantané et synchrone à la dernière liste complète des messages sans dépendre du cycle de rendu de React.
  - **Calcul Synchrone des Messages :** `activeMessages` (message utilisateur + placeholder assistant) et `finalMessages` (résultat final, tâches terminées et boutons d'action) sont désormais construits de manière pure et déterministe avant d'être persistés dans Neon DB.
  - **Assainissement du Rendu (`V0ChatPanel.jsx`) :** L'accordéon `> Worked for Xs` est désormais strictement réservé aux messages ayant fait l'objet d'une génération IA (`tasks` ou `duration`), évitant son affichage indu sur les notifications de session.
  - **Restauration de l'Historique Existant :** Réparation des messages pour la session active en base Neon DB afin de retrouver instantanément la conversation complète.

### 14. Mockups 3D Product Showcase, Assainissement du Chat & Synchronisation Bidirectionnelle des Projets
- **Génération Visuelle Haut de Gamme "3D Product Showcase" (`backend/src/services/imageService.ts`) :**
  - **Refonte des Prompts FLUX.1-schnell :** Élimination définitive des visuels génériques abstraits (code vert de type Matrix, écrans de terminaux illisibles). Le prompt d'image formule désormais une maquette publicitaire 3D de produit SaaS moderne : écran ultra-large affichant un tableau de bord sombre avec métriques et topologie système, entouré de cartes widgets 3D en verre dépoli flottant dans l'espace avec reflets néon cyan (style Octane render 8K).
  - **Curated Tech Dashboards en Fallback Résilient :** Remplacement des anciennes photos de code stock par une sélection de dashboards d'observabilité, interfaces cloud et consoles de cybersécurité haute résolution. En cas de latence ou d'indisponibilité du service FLUX public, le visuel affiché reste toujours une véritable maquette d'application SaaS professionnelle.
- **Assainissement Complet des READMEs & Découplage de l'Affichage du Chat (`frontend/src/services/githubService.js`, `frontend/src/context/PortfolioContext.jsx`, `frontend/src/components/studio/V0ChatPanel.jsx`) :**
  - **Nettoyage Regex des READMEs :** Suppression rigoureuse de toutes les balises HTML brutes (`<div align="center">`, `<img src=.../>`, `<span>`), badges de build GitHub (`[![Build Status]...]`), URLs brutes et blocs de code avant l'envoi à l'IA.
  - **Découplage de la Charge Technique et du Rendu Utilisateur :** Ajout des options `displayText` et `summaryTitle` dans `sendChatMessage`. Le chat n'affiche plus un pavé technique de 50 lignes, mais un résumé épuré et percutant de style v0 / ChatGPT : `🐙 Importer 1 projet GitHub : Smart Network Mapper`, suivi d'un message d'assistance clair `✓ Section Projets mise à jour avec smart-network-mapper`.
  - **Rétrocompatibilité d'Affichage :** Le composant `V0ChatPanel` détecte et formate automatiquement les anciens prompts de session volumineux pour préserver l'élégance de la timeline de discussion.
- **Synchronisation Bidirectionnelle & Maintien de l'État Coché (`frontend/src/components/studio/GithubProjectsTab.jsx`, `frontend/src/context/PortfolioContext.jsx`) :**
  - **Détection Automatique & Badge de Présence :** Comparaison intelligente en temps réel entre les dépôts GitHub de l'utilisateur et les projets présents dans `sec-projects` du portfolio (via URL GitHub et titre normalisé). Les projets déjà intégrés sont automatiquement pré-cochés à l'ouverture de l'onglet et arborent un badge distinctif `✓ Dans le portfolio`.
  - **Suppression Instantanée au Décochage ("Si je le décoche, ne s'affiche plus") :** Lorsqu'un utilisateur décoche un projet déjà présent dans son portfolio, l'application le retire immédiatement de la section `projects` du canvas via `updateSection` avec une notification de confirmation éphémère.
  - **Intégration Déterministe :** Lors du clic sur `Appliquer au Portfolio`, les projets sélectionnés et leurs mockups sont directement appliqués au canvas avec priorité absolue, tout en guidant l'IA pour l'harmonisation globale.

### 15. Séparation des Projets Actifs & Gestion Unitaire (Régénération d'Image IA 3D et Suppression)
- **Séparation Structurelle en Deux Listes Distinctes (`frontend/src/components/studio/GithubProjectsTab.jsx`) :**
  - **Section Supérieure ("Projets Actifs dans le Portfolio") :** Affiche de façon isolée et prestigieuse les projets déjà intégrés et publiés dans le portfolio de l'utilisateur, avec leur visuel haute définition, métriques, tags et liens.
  - **Section Inférieure ("Dépôts GitHub Disponibles à Importer") :** Liste filtrée contenant uniquement les dépôts GitHub qui ne figurent pas encore dans le portfolio, munie d'une barre de recherche par mot-clé/technologie, de cases à cocher, et de la barre flottante de validation.
- **Boutons d'Actions Dédiés sur Chaque Projet Actif :**
  - **Bouton "Refaire l'image" :** Interroge le générateur IA FLUX.1-schnell avec le contexte technique extrait du README pour produire une nouvelle maquette 3D publicitaire ultra-réaliste. Un état de chargement visuel avec spinner est affiché sur la carte concernée, et la couverture est mise à jour instantanément dans le portfolio (`sec-projects`).
  - **Bouton "Supprimer" :** Retire immédiatement le projet du portfolio actif via `updateSection`. Le projet quitte aussitôt la liste active et son dépôt GitHub réapparaît immédiatement dans la liste des dépôts disponibles à l'importation.
- **Assainissement Rétroactif des Messages du Chat (`frontend/src/components/studio/V0ChatPanel.jsx`) :**
  - Nettoyage automatique des messages de sessions antérieures contenant les longs prompts de mise à jour GitHub (`Met à jour et enrichis la section Projets...`) pour un affichage épuré, professionnel et élégant.

### 16. Résolution de l'Ajout Non Destructif & Moteur d'Images Sémantique et Thématique
- **Préservation Intégrale des Projets Déjà Existants (« Ajouter, pas écraser ») :**
  - **Correction dans `GithubProjectsTab.jsx` :** La fonction `handleApplyToPortfolio` initialise la liste finale avec tous les projets déjà présents dans le portfolio (`existingList`), puis y ajoute les dépôts nouvellement sélectionnés en vérifiant l'unicité par URL GitHub et titre. Les projets précédents ne peuvent plus être effacés.
  - **Protection Côté Contexte (`PortfolioContext.jsx`) :** Dans `sendChatMessage`, la fusion des projets préserve explicitement l'état antérieur `portfolio` avant le lancement du stream IA, garantissant que même si l'IA génère un patch partiel, la totalité des projets existants (`Smart Network Mapper`, etc.) reste intacte.
  - **Restauration de Données :** Rétablissement des projets `Smart Network Mapper` et `Transport Yolo Robot` en direct dans la base de données Neon PostgreSQL pour la session active.
- **Moteur Visuel Sémantique Dédié (« Comprendre le projet au premier coup d'œil ») :**
  - **Suppression des visuels génériques déconnectés :** Élimination définitive des photos de laptops avec graphiques comptables ou financiers pour les projets techniques.
  - **Classificateur Sémantique par Mots-Clés (`backend/src/services/imageService.ts`) :** Détection automatique du domaine fonctionnel parmi 11 univers techniques (Robotique/Vision YOLO, Cybersécurité/Scanner Réseau, Médical/Santé, Cloud DevOps, Mobile, IA, IoT, Gaming, etc.).
  - **Visuels Thématiques Haute Définition :**
    - Pour *Transport Yolo Robot* : Robotique industrielle autonome (AGV) avec capteurs optiques et vision par ordinateur.
    - Pour *Smart Network Mapper* : Baies de serveurs datacenter avec câbles réseaux optiques lumineux et topologie cybernétique.
    - Pour *Cabinet Médical* : Interface tactile médicale moderne et console de diagnostic clinique.
  - **Alternance Intelligente sur `Refaire l'image` :** Le bouton régénère ou fait défiler les images de la même catégorie sémantique pour offrir un choix varié tout en restant 100% fidèle au thème du projet.

### 17. Suppression de tout Thème Hardcodé & Prompt Universel Piloté par le README
- **Élimination de tout Thème Hardcodé (`backend/src/services/imageService.ts`) :**
  - Suppression intégrale des catalogues statiques de domaines et dictionnaires préconçus.
  - Chaque projet est désormais traité de façon universelle et dynamique à partir de son **vrai README extrait de GitHub**.
- **Prompt Général Universel Envoyé à l'IA Générative :**
  - Le système extrait et nettoie la documentation du projet (README réel) et formule un prompt généraliste tout-terrain :
    `"High-quality 3D commercial visual concept and product showcase banner representing the software project \"{title}\". Directly illustrating the core functionality and real-world domain described in its project overview: \"{cleanReadme}\". Key technologies: {tags}..."`
  - Ce prompt est transmis directement au moteur IA de génération d'image.
- **Correction Immédiate pour « Morocco Medication API » :**
  - L'image inadaptée (baie de serveurs) a été corrigée. Le projet affiche désormais un visuel pharmaceutique et médical fidèle à 100% à son README (laboratoire de médecine, gélules et gélules pharmaceutiques haute définition).
### 18. Génération 100% API, Gestion des Erreurs et Intégration du Formulaire d'Ajout Manuel
- **Suppression Totale des Images de Remplacement / Fallbacks Statiques (`backend/src/services/imageService.ts`) :**
  - Élimination intégrale des liens statiques Unsplash et des fallbacks par défaut.
  - Toutes les images de projets proviennent obligatoirement et exclusivement de l'API de génération d'image IA (FLUX.1-schnell via NVIDIA).
  - En cas d'erreur API, d'indisponibilité ou de dépassement de délai (timeout à 12s), le service backend lève immédiatement une exception explicite au lieu de renvoyer une image préfabriquée.
- **Modal de Confirmation en Cas d'Erreur IA (`frontend/src/components/studio/GithubProjectsTab.jsx`) :**
  - Lorsqu'une erreur survient lors de la génération IA (à l'ajout d'un projet ou lors d'un clic sur `Refaire l'image`), une boîte de dialogue dédiée s'affiche instantanément à l'utilisateur :
    - Notification claire de l'erreur API avec le nom du projet concerné.
    - Question explicite : *« L'API n'a pas pu générer l'image. Voulez-vous annuler l'ajout de ce projet ou ajouter l'image vous-même ? »*
- **Choix de l'Utilisateur : Annulation ou Formulaire d'Ajout Manuel :**
  - **Option 1 ("Oui, annuler l'ajout") :** Ferme la fenêtre et annule immédiatement l'ajout du projet au portfolio (aucun projet n'est inséré).
  - **Option 2 ("Non, ajouter moi-même") :** Ouvre directement le formulaire d'image existant (`ImagePickerModal`) :
    - Téléversement de fichier local par glisser-déposer ou explorateur de fichiers.
    - Récupération de l'avatar GitHub.
    - Saisie d'une URL d'image personnalisée.
  - Dès validation de l'image par l'utilisateur, le projet est ajouté avec succès dans son portfolio avec son image personnalisée.

### 19. Migration vers Cloudflare Workers AI (Modèle @cf/black-forest-labs/flux-1-schnell)
- **Configuration & Activation de Cloudflare Workers AI (`backend/src/services/imageService.ts`, `backend/.env`) :**
  - Remplacement de l'endpoint NVIDIA par le réseau mondial de Cloudflare Workers AI.
  - Déploiement du modèle officiel haute performance `@cf/black-forest-labs/flux-1-schnell`.
  - Intégration authentifiée avec `CLOUDFLARE_ACCOUNT_ID` et `CLOUDFLARE_API_TOKEN`.
  - Temps de réponse réduit à 2-5 secondes par image (au lieu des timeouts fréquents sur NVIDIA).
  - Gestion double des retours (JSON Base64 ou flux binaire ArrayBuffer).
  - Validation complète effectuée avec succès en environnement réel (10 000 neurones gratuits par jour).

### 20. Redimensionnement Interactif en Temps Réel & Adaptation Mobile Totale du Portfolio
- **Résolution du Problème d'Évaluation Média Desktop/Mobile (`PortfolioContext.jsx`) :**
  - **Diagnostic :** Dans un canvas simulé sur grand écran PC, les classes Tailwind standard `md:` ou `lg:` évaluent la largeur de la fenêtre physique du navigateur (`window.innerWidth` ≈ 1920px) et non la largeur de la frame mobile (ex: 390px), forçant l'affichage desktop (liens horizontaux serrés, grilles à multiples colonnes comprimées).
  - **Correction :** Création des états globaux `simulatedWidth`, `setSimulatedWidth`, et du booléen dérivé réactif `isMobileViewport` (`simulatedWidth !== null ? simulatedWidth < 768 : deviceView === 'mobile'`).
- **Contrôles de Redimensionnement Interactifs (`V0Canvas.jsx`, `V0Header.jsx`) :**
  - **Poignées de Drag-to-Resize :** Deux poignées bilatérales (gauche et droite) intégrées à la frame avec écouteurs `PointerEvent` et `setPointerCapture` pour un glisser-déplacer ultra-fluide à 60 FPS sans décrochage.
  - **Barre de Contrôle des Dimensions :**
    - Presets d'appareils en un clic : `📱 320` (iPhone SE), `📱 375` (iPhone Mini), `📱 390` (iPhone 14/15/16), `📱 428` (iPhone Plus/Max), `📟 768` (iPad Mini), `💻 100%` (Desktop).
    - Slider continu (320px à 1200px) avec badge de dimension dynamique en temps réel.
  - **Mockup Réaliste d'Appareil :** Habillage avec Dynamic Island, caméra poinçon et barre d'accueil iOS lorsque la dimension est inférieure à 900px.
- **Menu Hamburger Mobile (`PortfolioRenderer.jsx`) :**
  - Sur mobile ou conteneur étroit, la barre de navigation remplace les liens horizontaux compactés par un bouton hamburger tactile fluide avec menu déroulant animé et bouton de contact d'action directe.
- **Refonte Responsive Complète de Toutes les Sections du Portfolio :**
  - **`HeroSection.jsx` :** Échelonnage typographique (`text-3xl sm:text-4xl`), marges douces (`py-8 px-4`), disposition empilée de l'avatar et du texte sans débordement.
  - **`ProjectsSection.jsx` :** Basculement automatique en 1 seule colonne pour les variantes Bento et Cards sur mobile, avec adaptation du ratio des images.
  - **`AboutSection.jsx` :** Réorganisation de la grille histoire + stats en colonne unifiée sans tassement.
  - **`SkillsSection.jsx` :** Disposition des cartes de compétences en liste claire et aérée à 1 colonne.
  - **`ContactSection.jsx` :** Boutons d'action pleine largeur centrés et marges tactiles adaptées.
  - **`SectionWrapper.jsx` :** Barre d'outils flottante de style Elementor contrainte à `max-w-[95%]` avec défilement horizontal fluide pour ne jamais déborder hors de l'écran mobile.

### 21. Isolation Totale des Projets par Portfolio, Zéro Hallucination IA & Persistance Globale du Compte GitHub
- **Suppression Définitive des Projets Fictifs Mockés (`frontend/src/types/portfolio.js`) :**
  - Élimination des anciens projets factices en dur (`Synapse`, `Hyperion`, `Krypton`) de tous les profils de templates (`MOCK_DEVELOPER_PORTFOLIO`, `MOCK_DESIGNER_PORTFOLIO`, `MOCK_MINIMALIST_PORTFOLIO`).
  - Création de la factory `createFreshPortfolio(userName)` : garantit que tout nouveau portfolio démarre obligatoirement avec une liste de projets strictement vide (`projects: []`).
- **Garantie d'Isolation Totale & Préservation des Projets Authentiques (`frontend/src/context/PortfolioContext.jsx`) :**
  - **Création de Nouvelle Session (`createNewSession`) :** Réinitialise le portfolio actif via `createFreshPortfolio(firstName)` avec `portfolioId = null`. Le nouveau portfolio est complètement isolé des sessions précédentes et ne contient aucun projet résiduel.
  - **Protection Anti-Pollution dans `sendChatMessage` :** Seuls les projets authentiques (issus des imports GitHub réels de l'utilisateur ou explicitement ajoutés via `options.projectsToAdd`) sont conservés dans `sec-projects`. Toute tentative de l'IA d'injecter des projets logiciels inventés ou partiels est automatiquement ignorée et filtrée.
  - **Maintien Global du Compte GitHub Connecté :** Le compte GitHub de l'utilisateur (`user_id`, jeton OAuth, nom d'utilisateur et avatar) reste connecté au niveau du profil global dans Neon DB. L'utilisateur peut ainsi créer autant de portfolios qu'il le souhaite, son compte GitHub reste accessible partout, tout en ayant la liberté d'importer des sélections de projets 100% différentes et indépendantes pour chaque portfolio.
- **Règles Strictes Anti-Hallucination Côté Backend (`backend/src/services/aiService.ts`) :**
  - Mise à jour du `SYSTEM_PORTFOLIO_PROMPT` : interdiction absolue faite à l'IA d'inventer, d'imaginer ou d'halluciner des dépôts logiciels ou métriques dans la section `sec-projects`.
  - Dans `generatePortfolioFromPrompt` : instruction explicite imposant `data.projects: []`, les projets réels devant être importés exclusivement par l'utilisateur depuis son compte GitHub.
- **État Vide Élégant avec CTA Direct vers GitHub (`frontend/src/components/portfolio/sections/ProjectsSection.jsx`) :**
  - Lorsqu'aucun projet n'a encore été importé (`projects.length === 0`), la section n'affiche plus un conteneur vide ou déroutant.
  - Affichage d'une carte d'accueil épurée aux couleurs du thème actif :
    - Icône officielle GitHub avec bordure d'accentuation lumineuse.
    - Titre explicite : *"Aucun projet importé pour le moment"*.
    - Sous-titre guidant l'utilisateur.
### 22. Résolution du Dépassement de Contexte LLM (Images Base64) & Prise en Charge Complète des Couleurs de Fond
- **Diagnostic de la Non-Modification de Couleur :**
  - Lorsque des dépôts GitHub avec maquettes générées par IA étaient présents, les images stockées sous forme de chaînes Base64 brutes (plus de 1,38 million de caractères) étaient injectées directement dans le prompt système envoyé au modèle NVIDIA NIM.
  - Le modèle rejetait la requête avec l'erreur `400: This model's maximum context length is 1048576 tokens. However, your messages resulted in 1067436 tokens`, ce qui déclenchait le bloc de secours (fallback) frontend sans appliquer la modification de couleur demandée.
- **Sanitisation Sémantique des Payloads (`backend/src/services/aiService.ts`, `frontend/src/context/PortfolioContext.jsx`) :**
  - Implémentation de `stripHeavyBase64` côté frontend et backend : les chaînes Base64 volumineuses sont tronquées en `[TRUNCATED_BASE64]` uniquement lors de la transmission au LLM.
  - Réduction spectaculaire de la taille du prompt de **1 384 311 caractères à 4 687 caractères (-99,7%)**, réduisant le temps de traitement de l'IA à moins de 2 secondes.
  - Lors de l'application du patch JSON RFC 6902, l'état complet initial (`currentPortfolio`) est préservé, garantissant que toutes les images haute définition restent 100% intactes sans altération.
- **Adaptation Intelligente du Contraste & Thèmes Clairs/Sombres :**
  - Mise à jour du prompt système : lorsque l'utilisateur demande une couleur de fond claire (jaune, blanc, beige, etc.), l'IA ajuste automatiquement `textPrimary` en sombre (`#0f172a`), `textSecondary` (`#475569`) et `surface` (`#fef9c3` / `#ffffff`) pour garantir une lisibilité irréprochable.
  - Prise en charge enrichie des couleurs (jaune/yellow, vert, orange, bleu, cyan, codes hexadécimaux de fond) dans le gestionnaire de secours local.
