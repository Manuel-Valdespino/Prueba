# Conexión Cursor con Databricks via MCP

Este proyecto contiene la configuración necesaria para conectar agentes de Cursor con Databricks utilizando el **Model Context Protocol (MCP)**.

## 📋 Requisitos Previos

- **Cursor IDE** instalado
- **Workspace de Databricks** activo
- **Personal Access Token** de Databricks
- **Docker Desktop** (solo si usas la opción Docker)

## 🚀 Configuración Rápida

### Opción 1: Conexión Nativa (Streamable HTTP) - Recomendada

Esta opción se conecta directamente a los servidores MCP nativos de Databricks.

**Paso 1:** Edita el archivo `.cursor/mcp.json` y reemplaza los siguientes valores en la sección `databricks-native`:

```json
"url": "https://<TU_WORKSPACE_HOSTNAME>/api/2.0/mcp/functions/{CATALOG_NAME}/{SCHEMA_NAME}"
"Authorization": "Bearer <TU_PERSONAL_ACCESS_TOKEN>"
```

Reemplaza:
- `<TU_WORKSPACE_HOSTNAME>`: El hostname de tu workspace (ej: `adb-123456789012.azuredatabricks.net`)
- `{CATALOG_NAME}`: Nombre de tu catálogo en Unity Catalog (ej: `main`)
- `{SCHEMA_NAME}`: Nombre del schema (ej: `default`)
- `<TU_PERSONAL_ACCESS_TOKEN>`: Tu token de acceso personal

**Paso 2:** Comenta o elimina la sección `databricks-docker` del archivo `mcp.json` si no la vas a usar.

**Paso 3:** Reinicia Cursor.

### Opción 2: Servidor MCP Docker (Más Funcionalidades)

Esta opción usa un servidor MCP de código abierto que corre en Docker y proporciona más herramientas.

**Paso 1:** Asegúrate de tener Docker Desktop instalado y ejecutándose.

**Paso 2:** Copia el archivo de ejemplo de variables de entorno:

```bash
cp .env.example .env
```

**Paso 3:** Edita el archivo `.env` y completa tus credenciales:

```env
DATABRICKS_HOST=adb-123456789012.azuredatabricks.net
DATABRICKS_TOKEN=dapi1234567890abcdef
```

**Paso 4:** En `.cursor/mcp.json`, comenta la sección `databricks-native` y deja activa solo `databricks-docker`.

**Paso 5:** Reinicia Cursor.

## 🔑 Cómo Obtener tu Personal Access Token

1. Inicia sesión en tu workspace de Databricks
2. Haz clic en tu nombre de usuario (esquina superior derecha)
3. Selecciona **"User Settings"**
4. Ve a la sección **"Access tokens"** o **"Developer" > "Access tokens"**
5. Haz clic en **"Generate new token"**
6. Copia el token (no podrás verlo de nuevo después)

## ✅ Verificación

Para verificar que la conexión funciona:

1. Abre Cursor
2. Inicia un chat con el agente
3. Pregunta: "¿Qué herramientas de Databricks están disponibles?"
4. El agente debería listar las herramientas MCP conectadas

## 🛠️ Capacidades Disponibles

Una vez conectado, los agentes de Cursor pueden:

- ✅ Consultar tablas de Unity Catalog
- ✅ Ejecutar funciones SQL de Databricks
- ✅ Acceder a índices vectoriales
- ✅ Inspeccionar jobs y pipelines
- ✅ Obtener metadatos de catálogos, schemas y tablas
- ✅ Ejecutar consultas y análisis de datos

## 📁 Estructura de Archivos

```
.
├── .cursor/
│   └── mcp.json              # Configuración MCP con ambas opciones
├── .env.example              # Plantilla de variables de entorno
├── .env                      # Tu archivo con credenciales (no incluir en git)
├── .gitignore                # Archivos excluidos de git
└── README.md                 # Esta documentación
```

## 🔒 Seguridad

- ⚠️ **NUNCA** subas el archivo `.env` a git (ya está en `.gitignore`)
- ⚠️ **NUNCA** compartas tu Personal Access Token
- 🔄 Rota tus tokens periódicamente
- 👥 Usa tokens con los permisos mínimos necesarios

## 🐛 Troubleshooting

### Error: "MCP server not responding"
- Verifica que el hostname y el token sean correctos
- Asegúrate de que tu token no haya expirado
- Revisa los logs de Cursor: `Help > Toggle Developer Tools > Console`

### Error: "Docker container failed to start"
- Verifica que Docker Desktop esté ejecutándose
- Asegúrate de que las variables `DATABRICKS_HOST` y `DATABRICKS_TOKEN` estén en el archivo `.env`
- Comprueba que el archivo `.env` esté en la raíz del proyecto

### Error: "Unauthorized"
- Verifica que tu Personal Access Token sea válido
- Asegúrate de incluir el prefijo `Bearer ` en la autorización (ya está en la plantilla)

## 📚 Recursos Adicionales

- [Documentación oficial de Databricks MCP](https://docs.databricks.com/aws/en/agents/mcp/connect-clients)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Cursor MCP Documentation](https://cursor.com/docs/context/mcp)

## 📝 Notas

- Databricks no soporta OAuth con Dynamic Client Registration para MCP
- Se recomienda usar Personal Access Tokens para autenticación
- La opción Docker proporciona más herramientas pero requiere Docker Desktop
- La opción nativa es más ligera y directa
