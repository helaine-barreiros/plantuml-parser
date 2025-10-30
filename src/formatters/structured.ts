// src/formatters/structured.ts
import { File, UML, Component, UseCase, Actor, Group, Relationship } from '../types';

/**
 * Formatador que organiza elementos em categorias específicas:
 * actors, usecases, packages, rectangles, relationships
 */
export default function structuredFormatter(parseResult: (File | UML[])): string {
  // Estrutura do resultado final
  const result = {
    actors: [],
    usecases: [],
    packages: [],
    rectangles: [],
    relationships: []
  };

  // Função recursiva para extrair elementos
  (function extractElements(node: any) {
    if (node instanceof File) {
      // Se for um arquivo, processa cada diagrama dentro dele
      node.diagrams
        .filter(uml => uml instanceof UML)
        .forEach(uml => uml.elements.forEach(element => extractElements(element)));
    } else if (node instanceof Actor) {
      // Processa atores
      result.actors.push({
        name: node.name,
        title: node.title,
        stereotype: node.stereotype || []
      });
    } else if (node instanceof UseCase) {
      // Processa casos de uso
      result.usecases.push({
        name: node.name,
        title: node.title
      });
    } else if (node instanceof Group) {
      // Processa grupos (pacotes e retângulos)
      if (node.type === 'package') {
        result.packages.push({
          name: node.name,
          title: node.title,
          elements: extractGroupElements(node.elements)
        });
      } else if (node.type === 'rectangle') {
        result.rectangles.push({
          name: node.name,
          title: node.title,
          elements: extractGroupElements(node.elements)
        });
      }

      // Processa elementos dentro do grupo recursivamente
      node.elements.forEach(element => extractElements(element));
    } else if (node instanceof Relationship) {
      // Processa relacionamentos
      result.relationships.push({
        source: node.left,
        target: node.right,
        sourceType: getElementType(node.left),
        targetType: getElementType(node.right),
        label: node.label || '',
        sourceArrowHead: node.leftArrowHead,
        targetArrowHead: node.rightArrowHead
      });
    } else if (node instanceof Object && !(node instanceof Component)) {
      // Processa outros tipos de nós recursivamente
      Object.keys(node).forEach(k => extractElements(node[k]));
    }
  })(parseResult);

  // Função auxiliar para extrair elementos de um grupo
  function extractGroupElements(elements) {
    const result = [];
    elements.forEach(element => {
      if (element instanceof UseCase) {
        result.push({
          type: 'usecase',
          name: element.name,
          title: element.title
        });
      } else if (element instanceof Actor) {
        result.push({
          type: 'actor',
          name: element.name,
          title: element.title,
          stereotype: element.stereotype || []
        });
      }
      // Outros tipos podem ser adicionados conforme necessário
    });
    return result;
  }

  // Função auxiliar para determinar o tipo de um elemento pelo nome
  function getElementType(name) {
    // Procura nos atores
    const actor = result.actors.find(a => a.name === name);
    if (actor) return 'Actor';

    // Procura nos casos de uso
    const usecase = result.usecases.find(u => u.name === name);
    if (usecase) return 'UseCase';

    // Procura nos pacotes
    for (const pkg of result.packages) {
      if (pkg.name === name) return 'Package';

      // Procura nos elementos dentro do pacote
      const pkgElement = pkg.elements.find(e => e.name === name);
      if (pkgElement) return pkgElement.type;
    }

    // Procura nos retângulos
    for (const rect of result.rectangles) {
      if (rect.name === name) return 'Rectangle';

      // Procura nos elementos dentro do retângulo
      const rectElement = rect.elements.find(e => e.name === name);
      if (rectElement) return rectElement.type;
    }

    // Se não encontrar, retorna Unknown
    return 'Unknown';
  }

  // Retorna o resultado formatado como JSON
  return JSON.stringify(result, null, 2);
}