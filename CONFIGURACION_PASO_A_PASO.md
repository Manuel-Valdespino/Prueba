# 📋 Configuración Paso a Paso - Databricks MCP

Sigue estos pasos en orden para conectar Cursor con tu workspace de Databricks.

## ✅ Lista de Verificación Previa

Antes de comenzar, asegúrate de tener:

- [ ] Cursor instalado y abierto
- [ ] Acceso a un workspace de Databricks
- [ ] Permisos para generar Personal Access Tokens
- [ ] (Opcional) Docker Desktop si usarás la opción Docker

---

## 🎯 Opción Recomendada: Conexión Nativa

### Paso 1: Obtén tu Personal Access Token

1. Abre tu navegador y ve a tu workspace de Databricks
2. Inicia sesión si no lo has hecho
3. Haz clic en tu nombre de usuario (esquina superior derecha)
4. Selecciona **"User Settings"**
5. En el menú lateral, ve a **"Developer"** o **"Access tokens"**
6. Haz clic en el botón **"Generate new token"**
7. Dale un nombre descriptivo (ej: "Cursor MCP Connection")
8. Establece una fecha de expiración (recomendado: 90 días)
9. Haz clic en **"Generate"**
10. **¡IMPORTANTE!** Copia el token inmediatamente (no podrás verlo después)

### Paso 2: Identifica tu Workspace Hostname

Tu hostname es la URL de tu workspace sin `https://`.

**Ejemplo:**
- URL completa: `https://adb-123456789012.azuredatabricks.net`
- Hostname: `adb-123456789012.azuredatabricks.net`

### Paso 3: Identifica tu Catálogo y Schema

1. En tu workspace de Databricks, ve al **Data Explorer** o **Catalog**
2. Anota el nombre de tu **Catálogo** (ej: `main`, `production`)
3. Anota el nombre del **Schema** que quieres usar (ej: `default`, `analytics`)

### Paso 4: Edita el Archivo de Configuración

1. Abre el archivo `.cursor/mcp.json` en este proyecto
2. Localiza la sección `"databricks-native"`
3. Reemplaza estos valores:

```json
"url": "https://adb-123456789012.azuredatabricks.net/api/2.0/mcp/functions/main/default"
```

Donde:
- `adb-123456789012.azuredatabricks.net` = tu hostname
- `main` = tu catálogo
- `default` = tu schema

4. Reemplaza el token:

```json
"Authorization": "Bearer dapi1234567890abcdef"
```

Donde `dapi1234567890abcdef` es tu Personal Access Token.

5. **Elimina o comenta** la sección `databricks-docker` si no la vas a usar:

```json
{
  "mcpServers": {
    "databricks-native": {
      "type": "streamable-http",
      "url": "https://TU_HOSTNAME_AQUI/api/2.0/mcp/functions/TU_CATALOGO/TU_SCHEMA",
      "headers": {
        "Authorization": "Bearer TU_TOKEN_AQUI"
      },
      "note": "Databricks Unity Catalog"
    }
    // Comentado o eliminado: "databricks-docker": { ... }
  }
}
```

6. Guarda el archivo.

### Paso 5: Reinicia Cursor

1. Cierra completamente Cursor (no solo la ventana)
2. Abre Cursor de nuevo
3. Abre este proyecto/workspace

### Paso 6: Verifica la Conexión

1. En Cursor, abre el chat del agente (Cmd/Ctrl + L)
2. Escribe: "Lista las herramientas MCP disponibles"
3. Deberías ver herramientas de Databricks en la lista

---

## 🐳 Opción Alternativa: Docker (Más Funcionalidades)

### Paso 1: Instala Docker Desktop

1. Descarga Docker Desktop desde https://www.docker.com/products/docker-desktop
2. Instala y ábrelo
3. Asegúrate de que Docker esté ejecutándose (icono en la barra de tareas/menú)

### Paso 2: Configura las Variables de Entorno

1. Copia el archivo de plantilla:
   ```bash
   cp .env.example .env
   ```

2. Abre el archivo `.env` en un editor de texto

3. Completa tus credenciales:
   ```env
   DATABRICKS_HOST=adb-123456789012.azuredatabricks.net
   DATABRICKS_TOKEN=dapi1234567890abcdef
   ```

4. Guarda el archivo

### Paso 3: Configura MCP

1. Abre `.cursor/mcp.json`
2. **Elimina o comenta** la sección `databricks-native`
3. Deja solo la sección `databricks-docker` activa:

```json
{
  "mcpServers": {
    "databricks-docker": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "DATABRICKS_HOST",
        "-e",
        "DATABRICKS_TOKEN",
        "ghcr.io/revodatanl/databricks-mcp-server:latest"
      ],
      "env": {
        "DATABRICKS_HOST": "${env:DATABRICKS_HOST}",
        "DATABRICKS_TOKEN": "${env:DATABRICKS_TOKEN}"
      }
    }
  }
}
```

4. Guarda el archivo

### Paso 4: Reinicia Cursor

Igual que en la Opción 1.

### Paso 5: Verifica la Conexión

Igual que en la Opción 1.

---

## 🔍 Comandos de Prueba

Una vez conectado, prueba estos comandos en el chat de Cursor:

### Listar Herramientas
```
¿Qué herramientas de Databricks están disponibles?
```

### Consultar Catálogos
```
Lista todos los catálogos disponibles en Unity Catalog
```

### Consultar Tablas
```
¿Qué tablas hay en el schema [TU_SCHEMA]?
```

### Consultar Datos
```
Muéstrame las primeras 10 filas de la tabla [NOMBRE_TABLA]
```

---

## 🆘 Solución de Problemas

### ❌ "No se pueden encontrar herramientas MCP"

**Posibles causas:**
1. Cursor no se reinició después de cambiar la configuración
2. Hay un error de sintaxis en el archivo `.cursor/mcp.json`
3. El archivo está en la ubicación incorrecta

**Solución:**
- Reinicia Cursor completamente
- Valida que el JSON sea válido (usa un validador online)
- Verifica que el archivo esté en `.cursor/mcp.json` dentro del proyecto

### ❌ "Unauthorized" o "Authentication failed"

**Posibles causas:**
1. El token es incorrecto o ha expirado
2. Falta el prefijo `Bearer ` en la autorización
3. El token no tiene los permisos necesarios

**Solución:**
- Genera un nuevo token en Databricks
- Verifica que el formato sea: `"Authorization": "Bearer TU_TOKEN"`
- Asegúrate de que el token tenga permisos de lectura sobre Unity Catalog

### ❌ "Connection timeout" o "Cannot reach host"

**Posibles causas:**
1. El hostname es incorrecto
2. Tu red bloquea la conexión
3. El workspace está en una región diferente

**Solución:**
- Verifica el hostname copiándolo directamente de tu navegador
- Prueba desde otra red (ej: sin VPN corporativa)
- Asegúrate de que el workspace esté activo

### ❌ Docker: "Container failed to start"

**Posibles causas:**
1. Docker Desktop no está ejecutándose
2. El archivo `.env` no existe o está mal ubicado
3. Las variables de entorno no están configuradas

**Solución:**
- Abre Docker Desktop y asegúrate de que esté corriendo
- Verifica que `.env` esté en la raíz del proyecto (mismo nivel que `README.md`)
- Abre `.env` y confirma que las variables están sin espacios extras

### ❌ "Catalog or Schema not found"

**Posibles causas:**
1. El nombre del catálogo o schema es incorrecto
2. No tienes permisos para acceder a ese catálogo/schema
3. El catálogo/schema no existe

**Solución:**
- Verifica los nombres exactos en el Data Explorer de Databricks
- Los nombres distinguen mayúsculas/minúsculas
- Pide acceso al administrador si es necesario

---

## 📞 ¿Necesitas Ayuda?

Si después de seguir estos pasos aún tienes problemas:

1. Revisa los logs de Cursor:
   - Ve a `Help > Toggle Developer Tools`
   - Abre la pestaña `Console`
   - Busca mensajes de error relacionados con "mcp" o "databricks"

2. Verifica los logs de Docker (si usas esa opción):
   ```bash
   docker logs $(docker ps -q --filter ancestor=ghcr.io/revodatanl/databricks-mcp-server:latest)
   ```

3. Consulta la documentación oficial:
   - [Databricks MCP Docs](https://docs.databricks.com/aws/en/agents/mcp/connect-clients)
   - [Cursor MCP Docs](https://cursor.com/docs/context/mcp)

---

## ✅ Checklist Final

Antes de empezar a usar tu conexión, verifica:

- [ ] El archivo `.cursor/mcp.json` tiene tus credenciales correctas
- [ ] (Opción Docker) El archivo `.env` existe y está configurado
- [ ] Reiniciaste Cursor después de la configuración
- [ ] El agente de Cursor puede listar herramientas MCP de Databricks
- [ ] Puedes ejecutar una consulta simple de prueba

¡Listo! Ahora puedes usar agentes de Cursor para trabajar con tus datos de Databricks. 🎉