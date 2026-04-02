#!/bin/bash

# 🎲 Soli-DM Backend — Setup Script
# Questo script installa dipendenze e configura le variabili d'ambiente locali

set -e  # Exit on error

echo "🎲 Soli-DM Backend — Setup"
echo "==========================="
echo ""

# Step 1: Verifica Node.js
echo "✓ Verificando Node.js..."
if ! command -v node &> /dev/null; then
  echo "❌ Node.js non trovato. Scaricalo da https://nodejs.org/"
  exit 1
fi
NODE_VERSION=$(node -v)
echo "  Node.js $NODE_VERSION ✓"

# Step 2: Installa dipendenze
echo ""
echo "✓ Installando dipendenze npm..."
npm install

# Step 3: Crea .env
echo ""
echo "✓ Creando .env..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "  .env creato (riempilo con i tuoi valori!)"
else
  echo "  .env già esiste (non sovrascritto)"
fi

# Step 4: Genera JWT_SECRET se non esiste
echo ""
echo "✓ Generando JWT_SECRET..."
if grep -q "^JWT_SECRET=your-random" .env; then
  JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  sed -i "s/^JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
  echo "  JWT_SECRET generato e salvato in .env ✓"
else
  echo "  JWT_SECRET già configurato ✓"
fi

# Step 5: Mostra istruzioni next steps
echo ""
echo "==========================="
echo "✅ Setup completato!"
echo ""
echo "📝 Prossimi step:"
echo "1. Apri .env e riempi le variabili Supabase:"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_SERVICE_KEY"
echo ""
echo "2. Avvia il server di sviluppo:"
echo "   npm run dev"
echo ""
echo "3. Verifica che il server funzioni:"
echo "   curl http://localhost:5000/health"
echo ""
echo "📚 Per una guida completa, vedi SETUP.md"
echo "==========================="
