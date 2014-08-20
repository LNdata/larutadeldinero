'use strict';

describe('Directive: tipoVisualizacion', function () {

  // load the directive's module
  beforeEach(module('rutadineroApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<tipo-visualizacion></tipo-visualizacion>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the tipoVisualizacion directive');
  }));
});
