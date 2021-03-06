"use strict";

var SchemasBag = require('./bags/schemas.js');
var BehaviorsBag = require('./bags/behaviors.js');
var DataSourcesBag = require('./bags/datasources.js');
var TypesBag = require('./bags/types.js');

var SchemasMapper = require('./mappers/schemas.js');
var BehaviorsMapper = require('./mappers/behaviors.js');
var DatasourcesMapper = require('./mappers/datasources.js');
var TypesMapper = require('./mappers/types.js');

module.exports =
{
  uninstallable: false,
  services: [
    {
      id: 'storage',
      factory: function factory(services) {
        return services.findById('prometheusSchemas');
      },
    },
    {
      id: 'prometheusDatasources',
      service: new DataSourcesBag(),
      servicesNeeded: true,
    },
    {
      id: 'prometheusSchemas',
      service: new SchemasBag(),
      servicesNeeded: true,
    },
    {
      id: 'prometheusBehaviors',
      service: new BehaviorsBag(),
    },
    {
      id: 'prometheusTypes',
      service: new TypesBag(),
    },
  ],
  events: [
    {
      on: 'zeujs_chaos_map',
      id: 'mapBagsStorage',
      call: function (modules, services) {
        var dataSourcesBag = services.findById('prometheusDatasources');
        var behaviorsBag = services.findById('prometheusBehaviors');
        var schemasBag = services.findById('prometheusSchemas');
        var typesBag = services.findById('prometheusTypes');

        new TypesMapper(modules, typesBag);
        new DatasourcesMapper(services, dataSourcesBag, function () {
          new BehaviorsMapper(modules, behaviorsBag);
          new SchemasMapper(modules, schemasBag);
        });
      },
    },
  ],
  prometheusTypes: [
    require('./types/Email.js'),
    require('./types/DateTime.js'),
    require('./types/ObjectID.js'),
  ],
  configs: {
    prometheus: {
      sources: {
        default: {
          "uriSource": 'mongodb://localhost:27017/zeuJS',
          "connector": "mongodb",
        },
      },
    },
  },
};