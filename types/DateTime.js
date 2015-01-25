"use strict";
var DateTime = Date;
DateTime.prototype.valueFor = function (dbType) {
  return this;
};

module.exports = {
  id: "DateTime",
  type: DateTime
};