# 📘 Contribuindo com o projeto Ocupaê

Este projeto segue o padrão de commits **[Conventional Commits](https://www.conventionalcommits.org/)** para manter um histórico limpo e facilitar automações como geração de changelog.

## ✅ Padrão de commit

<tipo>(escopo opcional): descrição curta e objetiva

corpo opcional

footer opcional (ex: BREAKING CHANGE, refs, etc.)

### Exemplos:

feat(api): implementa criação de agendamentos
fix(schedule): corrige erro ao calcular horários disponíveis
refactor(auth): extrai verificação de token para middleware
docs: adiciona instruções de uso da API no README

---

## 📦 Tipos de commit

| Tipo       | Descrição                                             |
| ---------- | ----------------------------------------------------- |
| `feat`     | Nova funcionalidade                                   |
| `fix`      | Correção de bug                                       |
| `refactor` | Refatoração de código (sem alterar comportamento)     |
| `style`    | Mudanças de formatação (espaço, ponto e vírgula, etc) |
| `docs`     | Alterações na documentação                            |
| `test`     | Criação ou alteração de testes                        |
| `chore`    | Mudanças de configuração, deps, setup do projeto      |
| `perf`     | Melhoria de performance                               |
| `build`    | Alterações no processo de build                       |
| `ci`       | Mudanças na integração contínua (CI/CD)               |

---

## 🧩 Escopos sugeridos

Você pode usar escopos para deixar claro onde a alteração foi feita:

| Escopo     | Descrição                                               |
| ---------- | ------------------------------------------------------- |
| `api`      | Rotas, controladores e serviços do backend              |
| `auth`     | Autenticação e autorização                              |
| `db`       | Migrations, schemas, ou acesso ao banco (Prisma)        |
| `schedule` | Funcionalidades de agendamento                          |
| `user`     | Funcionalidades relacionadas a usuários                 |
| `email`    | Sistema de envio de e-mails (ex: confirmação, lembrete) |
| `ui`       | Componentes de interface                                |
| `layout`   | Estrutura visual da aplicação (Header, Footer, etc)     |
| `config`   | Configurações do projeto, como Docker, ESLint, etc      |
| `utils`    | Funções utilitárias e helpers                           |

---

## 💡 Dicas

- Use inglês para os tipos e escopos.
- A descrição pode ser em português, mas seja direto e claro.
- Use `BREAKING CHANGE:` no rodapé se a alteração for incompatível com versões anteriores.

---

## 🔒 Commits que quebram a API

Quando uma alteração quebra compatibilidade com versões anteriores da API, indique com:

feat(api): altera retorno da rota de agendamentos
BREAKING CHANGE: o campo "date" agora retorna um objeto com "start" e "end"

---

Com esse padrão, conseguimos manter o projeto organizado e preparado para automações no futuro.
