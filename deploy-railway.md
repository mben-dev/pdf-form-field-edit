# Déployer l'API Python sur Railway

## Étapes :

### 1. Via l'interface Railway :

1. Va sur [railway.app](https://railway.app)
2. Clique sur "New Project" → "Deploy from GitHub repo"
3. Connecte ton GitHub si ce n'est pas déjà fait
4. Clique sur "Empty Project" puis "Add Service" → "GitHub Repo"
5. Sélectionne ou crée un repo avec le code Python

### 2. Via Railway CLI (plus rapide) :

```bash
# Installer Railway CLI si pas déjà fait
brew install railway

# Dans le dossier python-api
cd python-api

# Login à Railway
railway login

# Créer un nouveau projet
railway init

# Déployer
railway up

# Récupérer l'URL
railway domain
```

### 3. Une fois déployé :

1. Récupère l'URL de ton API (ex: `https://pdf-api.up.railway.app`)
2. Met à jour le fichier `.env.production` dans le frontend :
```
NEXT_PUBLIC_API_URL=https://ton-url.up.railway.app
```

3. Redéploie le frontend sur Vercel :
```bash
npx vercel --prod
```

### Configuration Railway (optionnel) :

Dans Railway, tu peux configurer :
- Variables d'environnement
- Custom domain
- Auto-deploy depuis GitHub
- Health checks

L'API sera automatiquement détectée comme une app Python et Railway installera les dépendances depuis `requirements.txt`.