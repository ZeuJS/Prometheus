"use strict";

var SchemasBag = require('./bags/schemas.js');
var BehaviorsBag = require('./bags/behaviors.js');
var DataSourcesBag = require('./bags/datasources.js');
var SchemasMapper = require('./mappers/schemas.js');
var BehaviorsMapper = require('./mappers/behaviors.js');
var DatasourcesMapper = require('./mappers/datasources.js');

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
  ],
  events: [
    {
      on: 'zeujs_chaos_map',
      id: 'mapBagsStorage',
      call: function (modules, services) {
        var dataSourcesBag = services.findById('prometheusDatasources');
        var behaviorsBag = services.findById('prometheusBehaviors');
        var schemasBag = services.findById('prometheusSchemas');

        new DatasourcesMapper(services, dataSourcesBag, function () {
          new BehaviorsMapper(modules, behaviorsBag);
          new SchemasMapper(modules, schemasBag);
        });
      },
    },
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