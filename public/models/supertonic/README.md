# Supertonic Models Setup

## Descargar Modelos ONNX

Los modelos de Supertonic deben descargarse manualmente desde Hugging Face.

### Opción 1: Descarga Manual (Recomendada)

1. Ve a: https://huggingface.co/Supertone/supertonic/tree/main/web
2. Descarga estos archivos:
   - `encoder.onnx` (~8MB)
   - `decoder.onnx` (~15MB)
   - `vocoder.onnx` (~7MB)
3. Colócalos en: `public/models/supertonic/`

### Opción 2: Git LFS (Automática)

```bash
# Desde la raíz del proyecto
cd public/models
git clone https://huggingface.co/Supertone/supertonic supertonic-temp
mv supertonic-temp/web/* supertonic/
rm -rf supertonic-temp
```

## Verificar Instalación

Los archivos deben estar en:
```
public/
└── models/
    └── supertonic/
        ├── encoder.onnx
        ├── decoder.onnx
        └── vocoder.onnx
```

## Uso

Una vez descargados los modelos, Supertonic estará disponible como opción en el selector de voces del AudioController.

**Nota:** Los modelos se cargan lazy (solo cuando se selecciona Supertonic por primera vez) y se cachean en memoria para uso posterior.
