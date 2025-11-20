#!/usr/bin/env python3
"""
Generador de iconos PWA para la aplicación de audiolibros
"""

from PIL import Image, ImageDraw, ImageFont
import os

def crear_icono_pwa():
    """Crea iconos PWA de diferentes tamaños"""
    
    # Colores principales
    color_fondo = "#1A1A1A"  # Negro
    color_primario = "#4A90E2"  # Azul
    color_secundario = "#FFFFFF"  # Blanco
    
    tamaños = [72, 96, 128, 144, 152, 192, 384, 512]
    
    for tamaño in tamaños:
        # Crear imagen
        img = Image.new('RGB', (tamaño, tamaño), color_fondo)
        draw = ImageDraw.Draw(img)
        
        # Dibujar círculo principal
        margen = tamaño // 20
        circle_center = tamaño // 2
        circle_radius = tamaño // 3
        
        # Círculo exterior
        draw.ellipse([
            circle_center - circle_radius,
            circle_center - circle_radius,
            circle_center + circle_radius,
            circle_center + circle_radius
        ], fill=color_primario)
        
        # Círculo interior
        inner_radius = circle_radius * 0.8
        draw.ellipse([
            circle_center - inner_radius,
            circle_center - inner_radius,
            circle_center + inner_radius,
            circle_center + inner_radius
        ], fill=color_secundario)
        
        # Dibujar símbolo de play
        play_size = circle_radius // 3
        triangle_points = [
            (circle_center - play_size//2, circle_center - play_size),
            (circle_center - play_size//2, circle_center + play_size),
            (circle_center + play_size//2, circle_center)
        ]
        draw.polygon(triangle_points, fill=color_fondo)
        
        # Guardar
        filename = f"icon-{tamaño}.png"
        img.save(filename)
        print(f"✅ Creado: {filename}")
    
    print(f"\n🎨 Iconos PWA creados exitosamente!")

if __name__ == "__main__":
    try:
        crear_icono_pwa()
    except ImportError:
        print("⚠️  PIL no disponible. Creando iconos SVG alternativos...")
        # Crear iconos SVG como alternativa
        crear_iconos_svg()

def crear_iconos_svg():
    """Crea iconos SVG como alternativa"""
    tamaños = [192, 512]
    
    for tamaño in tamaños:
        svg_content = f'''<svg width="{tamaño}" height="{tamaño}" viewBox="0 0 {tamaño} {tamaño}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="{tamaño}" height="{tamaño}" rx="{tamaño//4}" fill="#1A1A1A"/>
  <circle cx="{tamaño//2}" cy="{tamaño//2}" r="{tamaño//3}" fill="#4A90E2"/>
  <circle cx="{tamaño//2}" cy="{tamaño//2}" r="{tamaño//4}" fill="#FFFFFF"/>
  <path d="M{tamaño//3} {tamaño//3}V{tamaño//2}{tamaño//3}V{tamaño//3}H{tamaño//2}{tamaño//3}V{tamaño//2}H{tamaño//3}Z" fill="#1A1A1A"/>
</svg>'''
        
        filename = f"icon-{tamaño}.svg"
        with open(filename, 'w') as f:
            f.write(svg_content)
        print(f"✅ Creado: {filename}")
