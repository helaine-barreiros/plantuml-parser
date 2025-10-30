// src/formatters/structured.ts
import { File, UML, Component, UseCase, Actor, Group, Relationship } from '../types';

/**
 * Formatador que organiza elementos em categorias específicas
 * conforme a estrutura solicitada
 */
export default function useCaseStructuredFormatter(parseResult: (File | UML[])): string {
    // Estrutura do resultado final
    const result = {
        actors: [],
        usecases: [],
        packages: [],
        rectangles: [],
        relationships: []
    };

    // Mapas para rastrear elementos por nome e tipo
    const elementTypeMap = new Map();
    const usecases = new Map();

    // Função recursiva para extrair elementos
    (function extractElements(node: any) {
        if (node instanceof File) {
            // Se for um arquivo, processa cada diagrama dentro dele
            node.diagrams
                .filter(uml => uml instanceof UML)
                .forEach(uml => uml.elements.forEach(element => extractElements(element)));
        } else if (node instanceof Actor) {
            // Processa atores
            const actor = {
                name: node.name,
                title: node.title,
                stereotype: node.stereotype || []
            };
            result.actors.push(actor);
            elementTypeMap.set(node.name, 'Actor');
        } else if (node instanceof UseCase) {
            // Processa casos de uso
            const usecase = {
                name: node.name,
                title: node.title
            };
            result.usecases.push(usecase);
            usecases.set(node.name, usecase);
            elementTypeMap.set(node.name, 'UseCase');
        } else if (node instanceof Group) {
            // Processa grupos (pacotes e retângulos)
            if (node.type === 'package') {
                const pkg = {
                    name: node.name,
                    title: node.title,
                    elements: []
                };
                result.packages.push(pkg);
                elementTypeMap.set(node.name, 'Package');

                // Extrai elementos dentro do pacote
                node.elements.forEach(element => {
                    extractElements(element);
                    if (element instanceof UseCase || element instanceof Actor) {
                        pkg.elements.push({
                            type: element instanceof UseCase ? 'UseCase' : 'Actor',
                            name: element.name,
                            title: element.title
                        });
                    }
                });
            } else if (node.type === 'rectangle') {
                const rect = {
                    name: node.name,
                    title: node.title,
                    elements: []
                };
                result.rectangles.push(rect);
                elementTypeMap.set(node.name, 'Rectangle');

                // Extrai elementos dentro do retângulo
                node.elements.forEach(element => {
                    extractElements(element);
                    if (element instanceof UseCase) {
                        rect.elements.push({
                            type: 'UseCase',
                            name: element.name,
                            title: element.title
                        });
                        usecases.set(element.name, {
                            name: element.name,
                            title: element.title
                        });
                        elementTypeMap.set(element.name, 'UseCase');
                    } else if (element instanceof Actor) {
                        rect.elements.push({
                            type: 'Actor',
                            name: element.name,
                            title: element.title
                        });
                        elementTypeMap.set(element.name, 'Actor');
                    }
                });
            }
        } else if (node instanceof Relationship) {
            // Processa relacionamentos
            const rel = {
                source: node.left,
                target: node.right,
                sourceType: elementTypeMap.get(node.left) || 'Unknown',
                targetType: elementTypeMap.get(node.right) || 'Unknown',
                relationshipType: node.relationshipType,
                label: node.label || '',
                sourceArrowHead: node.leftArrowHead,
                targetArrowHead: node.rightArrowHead,
                sourceArrowBody: node.leftArrowBody,
                targetArrowBody: node.rightArrowBody
            };

            // Tenta determinar tipos para elementos que ainda não foram mapeados
            if (rel.sourceType === 'Unknown') {
                const actor = result.actors.find(a => a.name === node.left);
                if (actor) {
                    rel.sourceType = 'Actor';
                    elementTypeMap.set(node.left, 'Actor');
                } else if (usecases.has(node.left)) {
                    rel.sourceType = 'UseCase';
                    elementTypeMap.set(node.left, 'UseCase');
                }
            }

            if (rel.targetType === 'Unknown') {
                const actor = result.actors.find(a => a.name === node.right);
                if (actor) {
                    rel.targetType = 'Actor';
                    elementTypeMap.set(node.right, 'Actor');
                } else if (usecases.has(node.right)) {
                    rel.targetType = 'UseCase';
                    elementTypeMap.set(node.right, 'UseCase');
                }
            }

            result.relationships.push(rel);
        } else if (node instanceof Object && !(node instanceof Component)) {
            // Processa outros tipos de nós recursivamente
            Object.keys(node).forEach(k => extractElements(node[k]));
        }
    })(parseResult);

    // Retorna o resultado formatado como JSON
    return JSON.stringify(result, null, 2);
}