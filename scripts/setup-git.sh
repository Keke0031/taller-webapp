#!/usr/bin/env bash
set -euo pipefail

# Script para automatizar configuración mínima de Git en el repo
# Uso:
#  GIT_USER_NAME="Tu Nombre" GIT_USER_EMAIL="tu@email" GIT_REMOTE="url" GIT_PUSH=true bash scripts/setup-git.sh

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "Repo: $REPO_ROOT"

if ! command -v git >/dev/null 2>&1; then
  echo "Error: git no está instalado en PATH" >&2
  exit 1
fi

# Configurar user.name si falta
if ! git config --get user.name >/dev/null 2>&1; then
  if [ -n "${GIT_USER_NAME:-}" ]; then
    git config user.name "$GIT_USER_NAME"
    echo "Configurado user.name = $GIT_USER_NAME"
  else
    echo "Advertencia: user.name no configurado. Exporta GIT_USER_NAME o configura con 'git config user.name'" >&2
  fi
else
  echo "user.name: $(git config --get user.name)"
fi

# Configurar user.email si falta
if ! git config --get user.email >/dev/null 2>&1; then
  if [ -n "${GIT_USER_EMAIL:-}" ]; then
    git config user.email "$GIT_USER_EMAIL"
    echo "Configurado user.email = $GIT_USER_EMAIL"
  else
    echo "Advertencia: user.email no configurado. Exporta GIT_USER_EMAIL o configura con 'git config user.email'" >&2
  fi
else
  echo "user.email: $(git config --get user.email)"
fi

# Inicializar repo si es necesario
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Ya es un repositorio Git"
else
  git init
  echo "Repositorio inicializado"
fi

# Crear commit inicial si no hay commits
if git rev-parse --verify HEAD >/dev/null 2>&1; then
  echo "Repositorio ya tiene commits"
else
  git add -A || true
  if git diff --cached --quiet; then
    echo "No hay cambios a commitear"
  else
    git commit -m "Initial commit (automated)" || true
    echo "Commit inicial creado"
  fi
fi

# Forzar rama main
git branch -M main || true

# Gestionar remoto si se pasa
if [ -n "${GIT_REMOTE:-}" ]; then
  if git remote get-url origin >/dev/null 2>&1; then
    echo "Remote origin existente: $(git remote get-url origin)"
  else
    git remote add origin "$GIT_REMOTE"
    echo "Remote origin añadido: $GIT_REMOTE"
  fi
  if [ "${GIT_PUSH:-false}" = "true" ]; then
    echo "Haciendo push a origin main..."
    git push -u origin main
  else
    echo "GIT_PUSH no es true; omitiendo push"
  fi
else
  echo "No se proporcionó GIT_REMOTE; omitiendo configuración de remoto"
fi

# Instalar githooks locales para que el pre-commit funcione
bash scripts/install-githooks.sh

# Resumen
echo "---Resumen---"
git rev-parse --show-toplevel 2>/dev/null || true
git status --branch --porcelain
git log -n1 --oneline || true

echo "Script completado"
