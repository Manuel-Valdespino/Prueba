#!/usr/bin/env python3
"""
Script para consultar Unity Catalog de Databricks
Muestra los catálogos disponibles y las tablas en un esquema específico
"""

from databricks.sdk import WorkspaceClient
from databricks.sdk.service.catalog import CatalogInfo, SchemaInfo
import os
import sys

def list_catalogs(w: WorkspaceClient):
    """Lista todos los catálogos disponibles en Unity Catalog"""
    print("\n=== CATÁLOGOS DISPONIBLES ===\n")
    catalogs = list(w.catalogs.list())
    
    if not catalogs:
        print("No se encontraron catálogos.")
        return []
    
    for catalog in catalogs:
        print(f"📚 {catalog.name}")
        if catalog.comment:
            print(f"   Descripción: {catalog.comment}")
        print()
    
    return [c.name for c in catalogs]

def list_schemas_in_catalog(w: WorkspaceClient, catalog_name: str):
    """Lista todos los esquemas en un catálogo específico"""
    print(f"\n=== ESQUEMAS EN CATÁLOGO '{catalog_name}' ===\n")
    try:
        schemas = list(w.schemas.list(catalog_name=catalog_name))
        
        if not schemas:
            print(f"No se encontraron esquemas en el catálogo '{catalog_name}'.")
            return []
        
        for schema in schemas:
            print(f"📁 {schema.name}")
            if schema.comment:
                print(f"   Descripción: {schema.comment}")
            print()
        
        return [s.name for s in schemas]
    except Exception as e:
        print(f"Error al listar esquemas: {e}")
        return []

def list_tables_in_schema(w: WorkspaceClient, catalog_name: str, schema_name: str):
    """Lista todas las tablas en un esquema específico"""
    print(f"\n=== TABLAS EN ESQUEMA '{catalog_name}.{schema_name}' ===\n")
    try:
        tables = list(w.tables.list(catalog_name=catalog_name, schema_name=schema_name))
        
        if not tables:
            print(f"No se encontraron tablas en el esquema '{catalog_name}.{schema_name}'.")
            return
        
        for table in tables:
            table_type = table.table_type.value if table.table_type else "UNKNOWN"
            print(f"📊 {table.name} ({table_type})")
            if table.comment:
                print(f"   Descripción: {table.comment}")
            if table.columns:
                print(f"   Columnas: {len(table.columns)}")
                for col in table.columns[:5]:  # Mostrar primeras 5 columnas
                    print(f"      - {col.name}: {col.type_name}")
                if len(table.columns) > 5:
                    print(f"      ... y {len(table.columns) - 5} columnas más")
            print()
    except Exception as e:
        print(f"Error al listar tablas: {e}")

def main():
    # Verificar que las credenciales estén configuradas
    host = os.getenv('DATABRICKS_HOST')
    token = os.getenv('DATABRICKS_TOKEN')
    
    if not host or not token:
        print("❌ ERROR: Credenciales de Databricks no configuradas.\n")
        print("Por favor configura las siguientes variables de entorno:")
        print("  - DATABRICKS_HOST: URL de tu workspace (ej: https://tu-workspace.cloud.databricks.com)")
        print("  - DATABRICKS_TOKEN: Tu token de acceso personal")
        print("\nPuedes configurarlas en:")
        print("  1. Cursor Dashboard > Cloud Agents > Secrets (recomendado)")
        print("  2. O exportarlas en tu terminal:")
        print("     export DATABRICKS_HOST='https://tu-workspace.cloud.databricks.com'")
        print("     export DATABRICKS_TOKEN='tu-token-aqui'")
        sys.exit(1)
    
    print(f"🔗 Conectando a: {host}\n")
    
    try:
        # Crear cliente de Databricks
        w = WorkspaceClient(
            host=host,
            token=token
        )
        
        # Listar todos los catálogos
        catalog_names = list_catalogs(w)
        
        # Buscar esquema 'lfp' en todos los catálogos
        print("\n=== BUSCANDO ESQUEMA 'lfp' ===\n")
        found_lfp = False
        
        for catalog in catalog_names:
            schemas = list_schemas_in_catalog(w, catalog)
            if 'lfp' in schemas:
                found_lfp = True
                print(f"✅ Esquema 'lfp' encontrado en catálogo '{catalog}'\n")
                list_tables_in_schema(w, catalog, 'lfp')
        
        if not found_lfp:
            print("⚠️  No se encontró el esquema 'lfp' en ningún catálogo.")
            print("\nEsquemas disponibles por catálogo:")
            for catalog in catalog_names:
                schemas = list_schemas_in_catalog(w, catalog)
        
    except Exception as e:
        print(f"❌ Error al conectar con Databricks: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
