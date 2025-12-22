# VPS Deployment - Note Companion Self-Hosted

**Date**: 2025-12-22
**Context**: Déploiement de Note Companion en self-hosted sur VPS Hostinger

## Configuration VPS

- **IP**: 168.231.76.105
- **SSH**: `ssh hostinger-vps` (alias configuré dans `~/.ssh/config`)
- **User**: jp
- **Clé SSH**: `~/.ssh/serveur_cursor_deploy`

## Déploiement

### Emplacement
- **Dossier**: `/opt/notecompanion/`
- **Branche**: `feature/traefik-deployment`
- **Docker Compose**: `docker-compose.traefik.yml`

### URLs
- **Production**: https://notecomp.neodromes.eu
- **DNS**: Entrée A `notecomp` → 168.231.76.105 (Hostinger)

### Configuration Traefik

Le VPS utilise Traefik 2.11 avec:
- **Cert resolver**: `mytlschallenge` (pas `letsencrypt`)
- **Réseaux**: `traefik` et `root_default` (external)
- **Entrypoints**: `web` (80) et `websecure` (443)

### Services existants sur le VPS

- neodromes.eu (site web)
- ghost.neodromes.eu (blog)
- vpn.neodromes.eu (WireGuard)
- mailu.neodromes.eu (mail)
- teleport.neodromes.eu (accès distant)
- n8n (automation)

## Configuration .env

```env
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_API_KEY=sk-xxx (DeepSeek)
OPENAI_MODEL=deepseek-chat
SOLO_API_KEY=notecomp-secret-2024
ENABLE_USER_MANAGEMENT=false
```

## Commandes utiles

```bash
# Logs
docker logs notecompanion -f

# Restart
cd /opt/notecompanion && docker compose -f docker-compose.traefik.yml restart

# Rebuild complet
cd /opt/notecompanion && git pull && docker compose -f docker-compose.traefik.yml up -d --build

# Status
docker ps --filter name=notecompanion
```

## Sécurité

- Next.js mis à jour vers 15.1.11 (CVE-2025-55184, CVE-2025-55183, CVE-2025-67779)
- Conteneur non privilégié
- Pas de volumes sensibles montés
- Communication uniquement via Traefik (HTTPS)

## Config Obsidian

Dans le plugin Note Companion:
1. Activer "Self-hosting mode"
2. Server URL: `https://notecomp.neodromes.eu`
3. API Key: valeur de SOLO_API_KEY
