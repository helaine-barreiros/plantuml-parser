# Compilação da especificação em LaTeX

Requisitos: uma distribuição TeX Live com `latexmk` e `pdflatex`.

Na raiz do repositório:

```bash
make -C docs/registro/latex
```

O comando produz `docs/registro/latex/main.pdf`.

Comando equivalente sem `make`:

```bash
cd docs/registro/latex
latexmk -pdf -interaction=nonstopmode -halt-on-error main.tex
```

Para remover somente arquivos auxiliares:

```bash
make -C docs/registro/latex clean
```

Para remover também o PDF:

```bash
make -C docs/registro/latex distclean
```

O texto editável está integralmente em `main.tex`. O Markdown no diretório pai é uma versão de consulta; alterações substantivas devem ser reconciliadas entre as duas representações antes do depósito.
