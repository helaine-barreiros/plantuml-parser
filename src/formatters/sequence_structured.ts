// src/formatters/sequence_structured.ts
import { File, UML, Actor, Relationship } from '../types';

/**
 * Formatador estruturado para diagramas de sequência
 * Organiza elementos em categorias específicas:
 * participants, messages
 */
export default function sequenceStructuredFormatter(parseResult: (File | UML[])): string {
  // Estrutura do resultado final
  const result = {
    participants: [],
    messages: []
  };

  // Mapa para rastrear participantes únicos por nome
  const participantMap = new Map<string, any>();

  // Função auxiliar para determinar o tipo de mensagem
  function determineMessageType(rel: Relationship): string {
    // Mensagem assíncrona (dotted): ..> ou .>
    if (rel.rightArrowBody === '.' || rel.leftArrowBody === '.') {
      if (rel.rightArrowHead === '>' && rel.leftArrowHead === '') {
        return 'asynchronous';
      }
      if (rel.leftArrowHead === '<' && rel.rightArrowHead === '') {
        return 'asynchronous_return';
      }
    }
    
    // Mensagem de retorno: <-- ou <-
    if (rel.leftArrowHead === '<' && rel.rightArrowHead === '') {
      return 'return';
    }
    
    // Mensagem bidirecional: <-> ou <-->
    if (rel.leftArrowHead === '<' && rel.rightArrowHead === '>') {
      return 'bidirectional';
    }
    
    // Criação: ->o ou -->o
    if (rel.rightArrowHead === 'o' || rel.rightArrowHead === '()') {
      return 'create';
    }
    
    // Destruição: ->x ou -->x
    if (rel.rightArrowHead === 'x') {
      return 'destroy';
    }
    
    // Mensagem síncrona: -> ou --> (padrão)
    if (rel.rightArrowHead === '>' && rel.leftArrowHead === '') {
      return 'synchronous';
    }
    
    return 'synchronous'; // padrão
  }

  // Função auxiliar para adicionar participante
  function addParticipant(name: string, type: string = 'participant', title?: string) {
    if (!participantMap.has(name)) {
      const participant = {
        name: name,
        title: title || name,
        type: type
      };
      participantMap.set(name, participant);
      result.participants.push(participant);
    }
  }

  // Função recursiva para extrair elementos
  (function extractElements(node: any) {
    if (node instanceof File) {
      // Se for um arquivo, processa cada diagrama dentro dele
      node.diagrams
        .filter(uml => uml instanceof UML)
        .forEach(uml => uml.elements.forEach(element => extractElements(element)));
    } else if (node instanceof Actor) {
      // Processa atores como participantes
      addParticipant(node.name, 'actor', node.title);
    } else if (node instanceof Relationship) {
      // Processa relacionamentos como mensagens
      
      // Adiciona participantes implícitos se ainda não existem
      addParticipant(node.left);
      addParticipant(node.right);
      
      const messageType = determineMessageType(node);
      
      const message = {
        from: node.left,
        to: node.right,
        label: node.label || '',
        messageType: messageType,
        leftArrowHead: node.leftArrowHead,
        rightArrowHead: node.rightArrowHead,
        leftArrowBody: node.leftArrowBody,
        rightArrowBody: node.rightArrowBody,
        hidden: node.hidden
      };
      
      result.messages.push(message);
    } else if (Array.isArray(node)) {
      // Processa arrays recursivamente
      node.forEach(element => extractElements(element));
    } else if (node instanceof Object) {
      // Processa outros tipos de nós recursivamente
      Object.keys(node).forEach(k => extractElements(node[k]));
    }
  })(parseResult);

  // Retorna o resultado formatado como JSON
  return JSON.stringify(result, null, 2);
}

