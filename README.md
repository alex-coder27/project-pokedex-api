# ⚡️ Pokedex API - Desafio Técnico Avançado

Este projeto é uma implementação de uma Pokedex Web desenvolvida como parte de um desafio técnico do curso DevQuest. A aplicação permite visualizar uma lista de Pokémon, carregar mais itens e acessar uma página de detalhes completa para cada criatura, com a possibilidade de alternar entre temas claro e escuro.

## ✨ Funcionalidades

O projeto implementa todas as funcionalidades solicitadas no desafio:

* **Listagem de Pokémon:** Exibe uma lista inicial de 10 Pokémon.
* **Carregar Mais:** Botão que adiciona mais 10 Pokémon à lista existente.
* **Página de Detalhes:** Ao clicar em um Pokémon na lista, o usuário é levado a uma página dedicada que exibe:
    * Imagem do Pokémon.
    * Nome e Número (ID).
    * Tipos.
    * Status (HP, Attack, Defense, etc.).
    * Movimentos (Moves).
    * Habilidades (Abilities), incluindo um *tooltip* com a descrição da habilidade ao passar o mouse.
    * Habilidades ocultas (Hidden Abilities) são visualmente destacadas na lista de habilidades.
* **Alternância de Tema (Light/Dark Mode):** Botão no cabeçalho para alternar entre o tema claro e o tema escuro, utilizando o Styled Components.
* **Tratamento de Erros:** Exibição de mensagens amigáveis para falhas na busca ou para Pokémon não encontrado (erro 404).

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Finalidade | Por que foi escolhida |
| :--- | :--- | :--- |
| **React** | Biblioteca principal para construção da interface. | Padrão da indústria e do desafio, essencial para a construção de SPAs com componentes reutilizáveis. |
| **Styled Components** | Estilização da aplicação. | Permite escrever CSS diretamente no JavaScript (CSS-in-JS), oferecendo isolamento de escopo, dinamismo de estilos (para o tema) e melhor organização de componentes. |
| **`react-router-dom`** | Gerenciamento de rotas. | Solução padrão e robusta do ecossistema React para Single Page Applications (SPAs). |
| **Axios** | Cliente HTTP para requisições à PokeAPI. | Promove uma API limpa baseada em Promises para requisições assíncronas. |
| **Jest / React Testing Library** | Testes Unitários e de Integração. | Jest para o ambiente de teste e RTL para simular a interação real do usuário, garantindo alta cobertura e qualidade do código. |
| **PokeAPI** | Fonte de dados dos Pokémon. | API oficial do desafio. |

## 💡 Decisões Técnicas

1.  **Gerenciamento de Estado para Habilidades e Tooltip:**
    * **Decisão:** Utilização dos estados `abilityDescriptions` e `hoveredAbilityName` dentro de `DetailsPage`.
    * **Justificativa:** As descrições das habilidades são carregadas de forma assíncrona (on-demand) apenas quando o usuário passa o mouse sobre uma habilidade. Isso evita a sobrecarga da API e garante que o componente `AbilityTooltip` receba a descrição correta instantaneamente, minimizando o estado global.

2.  **Abortamento de Requisições (Cleanup Effect):**
    * **Decisão:** Implementação de `AbortController` nas chamadas da API (tanto para o Pokémon principal quanto para as descrições de habilidades) usando `useEffect` e `useRef`.
    * **Justificativa:** Evita "race conditions" e a atualização de estado em componentes desmontados, que causam vazamentos de memória e comportamentos inesperados (especialmente ao alternar rapidamente entre diferentes habilidades ou páginas). O teste de abortamento em `DetailsPage.test.js` confirma essa implementação crítica.

3.  **Filtro de Props Transitórias (`$typeColor` e `$isHidden`):**
    * **Decisão:** Utilização do prefixo `$` em props que não devem ser repassadas aos elementos DOM (como `$typeColor` e `$isHidden`), e uso de `StyleSheetManager` no `App.jsx` e `withConfig` nos styled components.
    * **Justificativa:** Soluciona o aviso do React (`Warning: Received ... for non-DOM attribute`) ao usar Styled Components, garantindo que apenas propriedades válidas do HTML sejam renderizadas no DOM final.

4.  **Componentização e Reutilização:**
    * **Decisão:** O design foi dividido em componentes menores e de propósito único (ex: `Header`, `AbilityTooltip`, `TypeItem`, etc.).
    * **Justificativa:** Promove a manutenibilidade, a legibilidade e a escalabilidade do projeto.

## 🚀 Como Rodar o Projeto

Siga os passos abaixo para ter o projeto rodando em sua máquina local.

### Pré-requisitos

Você precisa ter o **Node.js** e o **npm** (ou yarn/pnpm) instalados.

### Instalação

1.  Clone o repositório:
    ```bash
    git clone [https://github.com/alex-coder27/project-pokedex-api.git](https://github.com/alex-coder27/project-pokedex-api.git)
    cd project-pokedex-api
    ```

2.  Instale as dependências:
    ```bash
    npm install
    # ou yarn install
    ```

### Execução

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
# ou yarn dev