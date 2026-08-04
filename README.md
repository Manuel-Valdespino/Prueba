# Consulta de Unity Catalog

Herramientas para consultar Unity Catalog de Databricks y listar catálogos, esquemas y tablas.

## 🚀 Inicio Rápido

```bash
# Configurar credenciales (ver INSTRUCCIONES_UNITY_CATALOG.md)
export DATABRICKS_HOST='https://tu-workspace.cloud.databricks.com'
export DATABRICKS_TOKEN='tu-token-aqui'

# Ejecutar consulta
python3 unity_catalog_query.py
```

## 📖 Documentación

Lee [`INSTRUCCIONES_UNITY_CATALOG.md`](./INSTRUCCIONES_UNITY_CATALOG.md) para:
- Instrucciones detalladas de configuración
- Cómo obtener un token de Databricks
- Ejemplos de uso
- Solución de problemas

## 🎯 Funcionalidades

- ✅ Lista todos los catálogos disponibles
- ✅ Busca el esquema 'lfp' en todos los catálogos
- ✅ Muestra todas las tablas con sus columnas y tipos
- ✅ Incluye descripciones y metadatos
