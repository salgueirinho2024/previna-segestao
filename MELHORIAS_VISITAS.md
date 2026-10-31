# Melhorias de visitas e buscas
- `/visitas`: visão com contadores de vencidas, mês atual, próximo mês, futuras, concluídas e todas. Vencidas = agendadas antes de hoje e ainda não concluídas. Próximo mês = datas do mês seguinte ainda não concluídas.
- Buscas instantâneas por empresa, responsável, título e descrição na área de visitas.
- `/visitas/nova`: empresa pesquisável por nome ou CNPJ; volta para a lista de visitas depois do cadastro.
- `/empresas`, `/funcionarios`, `/documentos`: busca textual; `/tarefas` já tinha busca, mantida.
- Não requer migração de banco. As visitas são agrupadas por sua data agendada, sem geração automática de recorrências. Frequência de retorno da empresa continua apenas informativa.
- Para publicar, substitua os arquivos no repositório e faça commit; Vercel realiza o deploy conforme a configuração.
