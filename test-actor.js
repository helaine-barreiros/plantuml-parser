// test-actor.js
const { parse } = require('./dist/index'); // Ajuste o caminho conforme necessário

const plantUmlText = `
@startuml
actor Client as C1
actor SysAdmin as SA
actor FinancialAdvisor as FA
usecase "View Dashboard" as UC1
C1 -> UC1
@enduml
`;

try {
    const result = parse(plantUmlText, { 
        verbose: true, 
        trace: true,
        context: {} 
      });
    console.log(JSON.stringify(result, null, 2));
} catch (error) {
    console.error("Erro ao fazer parsing:", error);
}