# hacktheborges

Portfólio de segurança ofensiva de Artur Borges: estudos para a CPTS, certificações, laboratórios e writeups.

🔗 **https://hacktheborges.github.io**

## Estrutura

| Caminho | O que é |
| --- | --- |
| `index.html` | Página inicial (ranks HTB/OffSec, certificações, contato) |
| `cpts/` | Hub da CPTS e writeups dos laboratórios |
| `assets/img/` | Imagens: `home/` (página inicial), `writeups/`, `certs/`, `badges/` |
| `404.html` | Página de erro servida pelo GitHub Pages |
| `sitemap.xml` | Mapa do site referenciado no `robots.txt` (atualizar ao publicar um writeup novo) |
| `.well-known/security.txt` | Contato para relato de vulnerabilidades (revisar a data de `Expires` anualmente) |

Site estático, sem build: qualquer alteração na branch principal é publicada pelo GitHub Pages.

Para testar localmente:

```bash
python3 -m http.server 8000
```
