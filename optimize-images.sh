#!/bin/bash

# Script d'optimisation des images du portfolio
# Convertit les JPG en WebP pour de meilleures performances

echo "🖼️  Optimisation des images en cours..."

# Vérifier si imagemagick est installé
if ! command -v convert &> /dev/null; then
    echo "⚠️  ImageMagick n'est pas installé. Installation nécessaire:"
    echo "   Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "   macOS: brew install imagemagick"
    exit 1
fi

# Optimiser les images du dossier public/images
for img in public/images/*.jpg public/*.jpg; do
    if [ -f "$img" ]; then
        filename="${img%.*}"
        echo "📸 Optimisation de $img..."
        
        # Créer version WebP (meilleure compression)
        convert "$img" -quality 85 -define webp:method=6 "${filename}.webp"
        
        # Optimiser le JPG original (réduire la qualité sans perte visible)
        convert "$img" -quality 85 -sampling-factor 4:2:0 -strip "${filename}_optimized.jpg"
        
        echo "✅ ${filename}.webp créé"
        echo "✅ ${filename}_optimized.jpg créé"
    fi
done

echo "🎉 Optimisation terminée!"
echo ""
echo "📊 Comparaison des tailles:"
ls -lh public/images/*.jpg public/*.jpg 2>/dev/null | awk '{print $5, $9}'
echo ""
ls -lh public/images/*.webp public/*.webp 2>/dev/null | awk '{print $5, $9}'
