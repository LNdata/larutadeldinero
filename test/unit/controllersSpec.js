describe('AportesCtrl', function(){

  beforeEach(module('AportesApp'));

  it('should create "aportes" model with 3 aportes', inject(function($controller) {
    var scope = {},
        ctrl = $controller('AportesCtrl', {$scope:scope});

    expect(scope.phones.length).toBe(3);
  }));

});
