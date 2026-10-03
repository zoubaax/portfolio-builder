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
    - `PortfolioRenderer.jsx` a remplacé la syntaxe CSS invalide `rgba(var(--theme-bg), 0.8)` par `color-mix(in srgb, var(--theme-bg) 85%, transparent)`, assurant un flou d'en-tête parfait quel que soit le format de la couleur de fond (hex ou nom).
    - `PortfolioContext.jsx` traite désormais `data.error` en dehors du bloc `try/catch` du parser JSON afin de ne plus jamais avaler une erreur API.

