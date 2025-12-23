# Guía de Configuración en Vercel (Video IA)

Para que la generación de video funcione con **Veo 3.1** y **Fal.ai**, necesitas configurar las siguientes variables de entorno en tu proyecto de Vercel.

## 1. Variables Necesarias

Ve a tu proyecto en Vercel -> **Settings** -> **Environment Variables** y agrega las siguientes claves:

| Nombre de la Variable | Valor (Ejemplo) | Descripción |
|-----------------------|-----------------|-------------|
| `VITE_API_KEY` | `YOUR_GOOGLE_API_KEY` | **Google AI Studio Key**. Debe tener acceso a los modelos **Veo**. Si recibes un error 404, es porque esta key no tiene acceso al modelo o el modelo no está habilitado en tu cuenta de Google Cloud/AI Studio. |
| `VITE_FAL_KEY` | `fal_...` | **Fal.ai API Key**. Necesaria para generar videos con Fal.ai. |
| `VITE_ELEVENLABS_API_KEY` | `sk_...` | **ElevenLabs API Key**. Para la clonación de voz (ya deberías tenerla). |
| `VITE_HUGGINGFACE_API_KEY` | `hf_...` | **Hugging Face Token**. Para otros modelos de IA si se usan. |

> [!IMPORTANT]
> **Sobre el Error 404 en Veo (Google):**
> El error que mostraste (`Requested entity was not found`) indica que aunque la API Key es válida, **no encuentra el modelo Veo**. Asegúrate de que tu cuenta de Google AI Studio tenga acceso a la beta de Veo o al modelo específico que intenta usar el código.

## 2. Dónde ponerlas

1. Entra a [vercel.com](https://vercel.com) y selecciona tu proyecto `apptextoavoz`.
2. Haz clic en la pestaña **Settings** (arriba).
3. En el menú lateral izquierdo, haz clic en **Environment Variables**.
4. En "Key", escribe el nombre (ej. `VITE_FAL_KEY`).
5. En "Value", pega tu clave secreta.
6. Deja seleccionados todos los entornos (Production, Preview, Development).
7. Haz clic en **Save**.

## 3. Nota sobre el Código

> [!WARNING]
> **Código No Encontrado**
> He actualizado tu configuración local para soportar `VITE_FAL_KEY`, pero **no encuentro el código de la interfaz de video** ("Rodar Escena", "Estudio Video IA") en la carpeta actual.
>
> Asegúrate de subir los cambios de tu código local a GitHub para que Vercel pueda desplegar la versión que tiene esas pantallas. Si esas pantallas están en otra rama (branch), asegúrate de fusionarlas a `main` o configurar Vercel para desplegar esa rama.
