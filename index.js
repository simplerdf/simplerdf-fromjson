const rdf = require('rdf-ext')
const SimpleRDF = require('simplerdf-core')

const terms = {
  type: rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
}

function fromJSONValue (simple, value) {
  if (typeof value === 'object') {
    if (typeof value.iri === 'function') {
      return value
    }

    if (SimpleRDF.isArray(value)) {
      return value
    }

    return simple.child().fromJSON(value)
  } else {
    return value
  }
}

class SimpleFromJson {
  fromJSON (json) {
    if (!json) {
      return this
    }

    Object.keys(json).forEach((property) => {
      const value = json[property]

      if (property === '@id') {
        this.iri(value)
      } else if (property === '@type') {
        const graph = this.graph()

        if (Array.isArray(value)) {
          value.forEach((v) => {
            graph.add(rdf.quad(this.iri(), terms.type, rdf.namedNode(v)))
          })
        } else {
          graph.add(rdf.quad(this.iri(), terms.type, rdf.namedNode(value)))
        }
      } else {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            this[property].push(fromJSONValue(this, item))
          })
        } else {
          this[property] = fromJSONValue(this, value)
        }
      }
    })

    return this
  }

  static fromJSON (json, context, iri, graph, options) {
    return (new this(context, iri, graph, options)).fromJSON(json)
  }
}

module.exports = SimpleFromJson
