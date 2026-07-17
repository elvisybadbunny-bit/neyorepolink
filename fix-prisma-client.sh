#!/usr/bin/env bash
set -euo pipefail
rm -rf node_modules/.prisma
PRISMA_SCHEMA_ENGINE_BINARY=/dev/null PRISMA_QUERY_ENGINE_LIBRARY=/dev/null ./node_modules/.bin/prisma generate
node -e "const c=require('@prisma/client'); console.log('keys',Object.keys(c)); console.log('PrismaClient',typeof c.PrismaClient)"
