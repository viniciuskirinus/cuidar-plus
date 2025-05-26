# Cuidar+

Uma plataforma web desenvolvida como atividade extensionista acadêmica para o tema **Cuidado em Saúde**, proposta pela Fiocruz.  
O objetivo é conectar **pacientes** que precisam de cuidados domiciliares a **voluntários** dispostos a realizar visitas, além de oferecer conteúdos educativos e recursos locais.

---

## 📝 Desafio Acadêmico

- **Disciplina**: Atividade Acadêmica (AA) – Extensão em TI  
- **Tema obrigatório** (caso não haja empresa parceira): Cuidado em Saúde  
- **Grupo**: até 4 integrantes, entrega individual (ZIP + vídeo MP4)  
- **Critérios de avaliação**:  
  1. Criatividade e aderência ao tema – 20%  
  2. Funcionalidade e fluxo correto – 50%  
  3. Uso de JavaScript puro e tecnologias estudadas – 10%  
  4. Complexidade e design – 20%

---

## 🚀 Funcionalidades

- **Home** com estatísticas animadas (nº de voluntários e visitas) e listas rápidas  
- **Login / Cadastro** em abas, com persistência em `localStorage`  
- **Agendamento** de visitas via calendário custom (pacientes)  
- **Painel do Voluntário** (voluntários): cards de solicitações com “Aceitar”/“Recusar”  
- **Mapa de Recursos** (Leaflet): postos de saúde, farmácias e voluntários ativos  
- **Biblioteca Educativa**: filtros por categoria, busca, ordenação, favoritos e modal de detalhes  
- **Perfil de Usuário**: avatar, nome, e-mail, logout  
- **Feedback**: modal que grava opiniões em `localStorage`  
- **Voluntário Destaque** e **Dicas Rápidas de Saúde** na Home

---

## 🛠️ Tech Stack

- **HTML5** e **CSS3** (Flexbox, CSS Grid)  
- **JavaScript “vanilla”** (ES6+, módulos organizados)  
- **APIs nativas**: `localStorage`, `sessionStorage`, `fetch`  
- **Leaflet** para mapear recursos  
- **Picsum.photos** para imagens dinâmicas

---

## 💻 Como rodar localmente

1. Clone este repositório:  
   ```bash
   git clone https://github.com/SEU-USUARIO/cuidar-plus.git
   cd cuidar-plus
