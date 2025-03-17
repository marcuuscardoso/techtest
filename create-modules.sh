#!/bin/bash

set -e

create_module() {
  local folder_name=$1
  local files_name=${folder_name%?}
  
  local module_path="./src/modules/$folder_name"

  if [ -d "$module_path" ]; then
    echo "O módulo '$folder_name' já existe."
    exit 1
  fi

  mkdir -p "$module_path/infra/http/controllers"
  mkdir -p "$module_path/infra/http/routes"
  mkdir -p "$module_path/infra/repositories/fakes"
  mkdir -p "$module_path/services"

  touch "$module_path/infra/http/controllers/${files_name}.controller.ts"
  touch "$module_path/infra/http/routes/${files_name}.routes.ts"
  touch "$module_path/infra/repositories/fakes/fake${files_name^}.repository.ts"
  touch "$module_path/infra/repositories/${files_name}.repository.ts"

  populate_module $files_name $module_path

  echo "Módulo '$folder_name' criado com sucesso."
}

populate_module() {
  local files_name=$1
  local module_path=$2

  # Conteúdo da Rota
  local route_content="import { Router } from 'express';
import { ${files_name^}Controller } from '../controllers/${files_name}.controller';
import { errorMiddleware } from '@shared/errors/error.handler';

const ${files_name}Controller = new ${files_name^}Controller();

const router = Router();

router.get('/', errorMiddleware(async (req, res) => ${files_name}Controller.GetAll(req, res)));

export default router;"

  # Conteúdo do Controller
  local controller_content="import { Request, Response } from 'express';
  
  export class ${files_name^}Controller {
  constructor() {
  }
    
  async GetAll(req: Request, res: Response) {
    return res.status(200).json({ message: '${files_name^} module' });
  }
}"

  # Conteúdo do Repositório
  local repository_content="export class ${files_name^}Repository {
  constructor() {
  }
}"

  echo "$controller_content" > "$module_path/infra/http/controllers/${files_name}.controller.ts"
  echo "$route_content" > "$module_path/infra/http/routes/${files_name}.routes.ts"
  echo "$repository_content" > "$module_path/infra/repositories/${files_name}.repository.ts"
}

if [ -z "$1" ]; then
  echo "Uso: ./create-modules.sh <module_name> (module_name must always be in the plural)"
  exit 1
fi

MODULES_DIR="./src/modules"

[ ! -d "$MODULES_DIR" ] && mkdir "$MODULES_DIR"

create_module $1
