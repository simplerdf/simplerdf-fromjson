/* global describe, it */

const assert = require('assert')
const rdf = require('rdf-ext')
const SimpleRDF = require('simplerdf-core').extend(require('..'))

const ns = {
  rdf: {
    type: rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
  }
}

describe('simplerdf-fromjson', () => {
  it('should be a constructor', () => {
    assert.equal(typeof SimpleRDF, 'function')
  })

  it('should have a fromJSON method', () => {
    const instance = new SimpleRDF()

    assert.equal(typeof instance.fromJSON, 'function')
  })

  it('should have a static fromJSON method', () => {
    assert.equal(typeof SimpleRDF.fromJSON, 'function')
  })

  it('should accept empty input', () => {
    const instance = SimpleRDF.fromJSON()

    assert.equal(instance.graph().length, 0)
  })

  it('should set IRI based on @id property', () => {
    const iri = 'http://example.org/subject'

    const instance = SimpleRDF.fromJSON({
      '@id': iri
    })

    assert.equal(instance.iri().value, iri)
  })

  it('should add a type triple for a single value', () => {
    const type = 'http://example.org/type'

    const instance = SimpleRDF.fromJSON({
      '@type': type
    })

    assert.equal(instance.graph().match(instance.iri(), ns.rdf.type, rdf.namedNode(type)).length, 1)
  })

  it('should add type triples for a array value', () => {
    const types = [
      'http://example.org/type0',
      'http://example.org/type1'
    ]

    const instance = SimpleRDF.fromJSON({
      '@type': types
    })

    assert.equal(instance.graph().match(instance.iri(), ns.rdf.type, rdf.namedNode(types[0])).length, 1)
    assert.equal(instance.graph().match(instance.iri(), ns.rdf.type, rdf.namedNode(types[1])).length, 1)
  })

  it('should assign a string value', () => {
    const property = rdf.namedNode('http://example.org/property')

    const instance = SimpleRDF.fromJSON({
      key: 'value'
    }, {
      key: property.value
    })

    assert.equal(instance.graph().match(instance.iri(), property, rdf.literal('value')).length, 1)
  })

  it('should assign a array value', () => {
    const property = rdf.namedNode('http://example.org/property')

    const instance = SimpleRDF.fromJSON({
      key: ['value0', 'value1']
    }, {
      key: {
        '@id': property.value,
        '@container': '@set'
      }
    })

    assert.equal(instance.graph().match(instance.iri(), property, rdf.literal('value0')).length, 1)
    assert.equal(instance.graph().match(instance.iri(), property, rdf.literal('value1')).length, 1)
  })

  it('should assign a plain object value', () => {
    const property = rdf.namedNode('http://example.org/property')

    const instance = SimpleRDF.fromJSON({
      key: {
        key: 'value'
      }
    }, {
      key: property.value
    })

    assert.equal(instance.graph().match(instance.iri(), property).length, 1)
    assert.equal(instance.graph().match(null, property, rdf.literal('value')).length, 1)
  })

  it('should assign a SimpleRDF value', () => {
    const property = rdf.namedNode('http://example.org/property')

    const instance0 = SimpleRDF.fromJSON()

    const instance1 = SimpleRDF.fromJSON({
      key: instance0
    }, {
      key: property.value
    })

    assert.equal(instance1.graph().match(instance1.iri(), property, instance0.iri()).length, 1)
  })

  it('should assign a SimpleArray value', () => {
    const property = rdf.namedNode('http://example.org/property')

    const array = SimpleRDF.fromJSON({
      key: ['value0', 'value1']
    }, {
      key: {
        '@id': property.value,
        '@container': '@set'
      }
    }).key

    const instance = SimpleRDF.fromJSON({
      key: array
    }, {
      key: {
        '@id': property.value,
        '@container': '@set'
      }
    })

    assert.equal(instance.graph().match(instance.iri(), property, rdf.literal('value0')).length, 1)
    assert.equal(instance.graph().match(instance.iri(), property, rdf.literal('value1')).length, 1)
  })
})
