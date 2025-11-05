// src/formatters/activity_structured.ts
import { 
  File, 
  UML, 
  Note, 
  Relationship,
  Activity,
  ActivityMarker,
  ActivityDecision,
  ActivityLoop,
  ActivityParallel,
  ActivityPartition
} from '../types';

/**
 * Formatador estruturado para diagramas de atividade
 * 
 * Organiza elementos de diagramas de atividade PlantUML em uma estrutura JSON hierárquica.
 * 
 * Elementos suportados:
 * - ✅ Activities: Ações individuais (:texto;)
 * - ✅ Markers: Marcadores de início/fim (start/stop/end)
 * - ✅ Decisions: Estruturas condicionais (if/then/else/endif)
 * - ✅ Loops: Estruturas de repetição (repeat...repeat while, while...endwhile)
 * - ✅ Parallels: Execução paralela (fork...fork again...end fork)
 * - ✅ Notes: Notas e comentários
 * - ⚠️ Transitions: Implícitas pela estrutura (array mantido vazio)
 * 
 * Futuro:
 * - 🔜 Partitions: Swimlanes (partition)
 */
export default function activityStructuredFormatter(parseResult: (File | UML[])): string {
  // Estrutura do resultado final
  const result = {
    activities: [], // Ações individuais no nível raiz
    decisions: [],  // Estruturas if/then/else
    loops: [],      // Estruturas de repetição (repeat/while)
    parallels: [],  // Estruturas fork (execução paralela)
    transitions: [], // Transições explícitas (geralmente vazio - fluxo é implícito)
    notes: [],      // Notas e comentários
    markers: {      // Marcadores de início/fim
      start: false,
      stop: false
    }
  };

  // Mapa para rastrear atividades
  const activityMap = new Map<string, any>();

  // Função auxiliar para processar notas
  function processNote(note: Note) {
    const noteData: any = {
      text: note.text,
      position: null,
      attachedTo: note.of || null
    };
    
    result.notes.push(noteData);
  }

  // Função auxiliar para processar transições/relacionamentos
  function processTransition(rel: Relationship) {
    const transition = {
      from: rel.left,
      to: rel.right,
      label: rel.label || '',
      condition: '', // Pode ser usado para condições if/else no futuro
      type: determineTransitionType(rel)
    };
    
    result.transitions.push(transition);
  }

  // Função auxiliar para determinar tipo de transição
  function determineTransitionType(rel: Relationship): string {
    // Transição condicional
    if (rel.label && (rel.label.includes('yes') || rel.label.includes('no') || 
                      rel.label.includes('true') || rel.label.includes('false'))) {
      return 'conditional';
    }
    
    // Transição normal
    if (rel.rightArrowHead === '>' && rel.leftArrowHead === '') {
      return 'normal';
    }
    
    // Transição pontilhada (para fluxos alternativos)
    if (rel.rightArrowBody === '.' || rel.leftArrowBody === '.') {
      return 'alternative';
    }
    
    return 'normal';
  }

  // Função recursiva para extrair elementos
  (function extractElements(node: any) {
    if (node instanceof File) {
      // Se for um arquivo, processa cada diagrama dentro dele
      node.diagrams
        .filter(uml => uml instanceof UML)
        .forEach(uml => uml.elements.forEach(element => extractElements(element)));
    } else if (node instanceof Note) {
      // Processa notas
      processNote(node);
    } else if (node instanceof Activity) {
      // Processa atividades
      result.activities.push({
        name: node.name,
        description: node.description,
        style: node.style
      });
      activityMap.set(node.name, node);
    } else if (node instanceof ActivityMarker) {
      // Processa marcadores (start/stop/end)
      if (node.type === 'start') {
        result.markers.start = true;
      } else if (node.type === 'stop' || node.type === 'end') {
        result.markers.stop = true;
      }
    } else if (node instanceof ActivityDecision) {
      // Processa decisões (if/then/else)
      // Converte os blocos recursivamente, mas SEM adicionar ao array principal
      const processBranch = (elements: any[]): any[] => {
        return elements.map((el: any) => {
          if (el instanceof Activity) {
            return { name: el.name, description: el.description };
          } else if (el instanceof ActivityDecision || 
                     el instanceof ActivityLoop || 
                     el instanceof ActivityParallel) {
            // Processa estruturas aninhadas recursivamente
            if (el instanceof ActivityDecision) {
              return {
                condition: el.condition,
                trueBlock: processBranch(el.trueBlock),
                falseBlock: processBranch(el.falseBlock)
              };
            } else if (el instanceof ActivityLoop) {
              return {
                type: el.type,
                condition: el.condition,
                body: processBranch(el.body)
              };
            } else if (el instanceof ActivityParallel) {
              return {
                branches: el.branches.map((branch: any[]) => processBranch(branch))
              };
            }
          }
          return el;
        });
      };
      
      result.decisions.push({
        condition: node.condition,
        trueBlock: processBranch(node.trueBlock),
        falseBlock: processBranch(node.falseBlock)
      });
    } else if (node instanceof ActivityLoop) {
      // Processa loops (while/repeat)
      // Função auxiliar para processar body sem duplicação
      const processBody = (elements: any[]): any[] => {
        return elements.map((el: any) => {
          if (el instanceof Activity) {
            return { name: el.name, description: el.description };
          } else if (el instanceof ActivityDecision || 
                     el instanceof ActivityLoop || 
                     el instanceof ActivityParallel) {
            // Processa estruturas aninhadas
            if (el instanceof ActivityDecision) {
              return {
                condition: el.condition,
                trueBlock: processBody(el.trueBlock),
                falseBlock: processBody(el.falseBlock)
              };
            } else if (el instanceof ActivityLoop) {
              return {
                type: el.type,
                condition: el.condition,
                body: processBody(el.body)
              };
            } else if (el instanceof ActivityParallel) {
              return {
                branches: el.branches.map((branch: any[]) => processBody(branch))
              };
            }
          }
          return el;
        });
      };
      
      result.loops.push({
        type: node.type,
        condition: node.condition,
        body: processBody(node.body)
      });
    } else if (node instanceof ActivityParallel) {
      // Processa estruturas paralelas (fork)
      // Função auxiliar para processar branches sem duplicação
      const processBranches = (branches: any[][]): any[][] => {
        return branches.map(branch => 
          branch.map((el: any) => {
            if (el instanceof Activity) {
              return { name: el.name, description: el.description };
            } else if (el instanceof ActivityDecision || 
                       el instanceof ActivityLoop || 
                       el instanceof ActivityParallel) {
              // Processa estruturas aninhadas
              if (el instanceof ActivityDecision) {
                return {
                  condition: el.condition,
                  trueBlock: branch.map((e: any) => 
                    e instanceof Activity ? { name: e.name, description: e.description } : e
                  ),
                  falseBlock: branch.map((e: any) => 
                    e instanceof Activity ? { name: e.name, description: e.description } : e
                  )
                };
              } else if (el instanceof ActivityLoop) {
                return {
                  type: el.type,
                  condition: el.condition,
                  body: el.body.map((e: any) => 
                    e instanceof Activity ? { name: e.name, description: e.description } : e
                  )
                };
              } else if (el instanceof ActivityParallel) {
                return {
                  branches: processBranches(el.branches)
                };
              }
            }
            return el;
          })
        );
      };
      
      result.parallels.push({
        branches: processBranches(node.branches)
      });
    } else if (node instanceof ActivityPartition) {
      // Processa partições
      // Por enquanto, apenas extrai os elementos internos
      node.elements.forEach(el => extractElements(el));
    } else if (node instanceof Relationship) {
      // Processa relacionamentos como transições
      processTransition(node);
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


