# Consultar Unity Catalog de Databricks

Este repositorio contiene herramientas para consultar Unity Catalog y listar catálogos, esquemas y tablas.

## 📋 Requisitos Previos

Para usar este script necesitas:

1. **Acceso a un workspace de Databricks** con Unity Catalog habilitado
2. **Token de acceso personal** de Databricks
3. **Permisos adecuados** para leer catálogos y esquemas en Unity Catalog

## 🔧 Configuración

### Opción 1: Configurar en Cursor Dashboard (Recomendado para Cloud Agents)

1. Ve a [Cursor Dashboard](https://cursor.com/settings)
2. Navega a **Cloud Agents > Secrets**
3. Agrega los siguientes secretos:
   - `DATABRICKS_HOST`: URL de tu workspace (ejemplo: `https://tu-workspace.cloud.databricks.com`)
   - `DATABRICKS_TOKEN`: Tu token de acceso personal

### Opción 2: Variables de Entorno Locales

```bash
export DATABRICKS_HOST='https://tu-workspace.cloud.databricks.com'
export DATABRICKS_TOKEN='dapi1234567890abcdef'
```

## 📝 Cómo Obtener un Token de Databricks

1. Inicia sesión en tu workspace de Databricks
2. Ve a **Settings** (⚙️) en la esquina superior derecha
3. Selecciona **User Settings**
4. Ve a la pestaña **Access Tokens**
5. Haz clic en **Generate New Token**
6. Dale un nombre descriptivo y establece un tiempo de expiración
7. Copia el token (¡solo se muestra una vez!)

## 🚀 Uso

### Ejecutar el Script

```bash
python3 unity_catalog_query.py
```

### Qué Hace el Script

1. **Lista todos los catálogos** disponibles en Unity Catalog
2. **Busca el esquema 'lfp'** en todos los catálogos
3. **Muestra todas las tablas** en el esquema 'lfp' con:
   - Nombre de la tabla
   - Tipo (TABLE, VIEW, etc.)
   - Descripción (si está disponible)
   - Primeras 5 columnas con sus tipos de datos

## 📊 Ejemplo de Salida

```
🔗 Conectando a: https://tu-workspace.cloud.databricks.com

=== CATÁLOGOS DISPONIBLES ===

📚 main
   Descripción: Catálogo principal de producción

📚 dev
   Descripción: Catálogo de desarrollo

=== BUSCANDO ESQUEMA 'lfp' ===

✅ Esquema 'lfp' encontrado en catálogo 'main'

=== TABLAS EN ESQUEMA 'main.lfp' ===

📊 equipos (TABLE)
   Descripción: Tabla de equipos de fútbol
   Columnas: 5
      - equipo_id: INT
      - nombre: STRING
      - ciudad: STRING
      - estadio: STRING
      - fundacion: DATE

📊 jugadores (TABLE)
   Descripción: Jugadores de la liga
   Columnas: 8
      - jugador_id: INT
      - nombre: STRING
      - apellido: STRING
      - equipo_id: INT
      - posicion: STRING
      ... y 3 columnas más
```

## 🔍 Consultas Personalizadas

Para buscar en un catálogo y esquema específico, puedes modificar el script o usar el SDK de Databricks directamente:

```python
from databricks.sdk import WorkspaceClient

w = WorkspaceClient()

# Listar tablas en un esquema específico
tables = w.tables.list(catalog_name="main", schema_name="lfp")
for table in tables:
    print(f"{table.name}: {table.table_type}")
```

## ⚠️ Solución de Problemas

### Error: "Credenciales no configuradas"
- Verifica que `DATABRICKS_HOST` y `DATABRICKS_TOKEN` estén configurados
- Asegúrate de que el host incluya `https://` y no tenga `/` al final

### Error: "Authentication failed"
- Verifica que tu token sea válido y no haya expirado
- Confirma que tienes acceso al workspace

### Error: "Schema not found"
- Verifica que el esquema 'lfp' exista en alguno de tus catálogos
- Confirma que tienes permisos de lectura en ese esquema

## 📚 Recursos Adicionales

- [Documentación de Unity Catalog](https://docs.databricks.com/data-governance/unity-catalog/index.html)
- [Databricks SDK para Python](https://docs.databricks.com/dev-tools/sdk-python.html)
- [Gestión de Tokens de Acceso](https://docs.databricks.com/dev-tools/auth.html#personal-access-tokens)
