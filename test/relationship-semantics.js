const conf = require('../conf');

const { expect } = require('chai');

describe('relationship semantic classification', () => {
  it('distinguishes solid, dotted and triangular arrows in both directions', () => {
    const { parse, formatters } = require(conf.dist.dir);
    const source = [
      '@startuml',
      'actor User',
      'actor Client',
      'usecase Base',
      'usecase Included',
      'usecase Extension',
      'User <|-- Client : left generalization',
      'Client --|> User : right generalization',
      'Base ..> Included : <<include>>',
      'Base <.. Extension : <<extend>>',
      'Client ..|> User : right realization',
      'User <|.. Client : left realization',
      'Client --> Base : association',
      'Client <--> User : bidirectional',
      '@enduml',
      '',
    ].join('\n');

    const formatted = JSON.parse(formatters.usecase_structured(parse(source)));
    const relationships = new Map(
      formatted.relationships.map(relationship => [relationship.label, relationship]),
    );

    expect(relationships.get('left generalization').relationshipType)
      .to.equal('generalization');
    expect(relationships.get('right generalization').relationshipType)
      .to.equal('generalization');
    expect(relationships.get('<<include>>').relationshipType)
      .to.equal('dependency');
    expect(relationships.get('<<extend>>').relationshipType)
      .to.equal('dependency');
    expect(relationships.get('right realization').relationshipType)
      .to.equal('realization');
    expect(relationships.get('left realization').relationshipType)
      .to.equal('realization');
    expect(relationships.get('association').relationshipType)
      .to.equal('association');
    expect(relationships.get('bidirectional').relationshipType)
      .to.equal('bidirectional');

    expect(relationships.get('<<include>>').sourceArrowBody).to.equal('.');
    expect(relationships.get('<<include>>').targetArrowBody).to.equal('.');
    expect(relationships.get('<<extend>>').sourceArrowHead).to.equal('<');
    expect(relationships.get('<<extend>>').targetArrowHead).to.equal('');
  });
});
