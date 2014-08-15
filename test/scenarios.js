describe('Aportantes App', function() {

  describe('Aportantes list view', function() {

    beforeEach(function() {
      browser.get('index.html');
    });


    it('should filter the aportantes list as user types into the search box', function() {

      var aportantesList = element.all(by.repeater('aportante in aportantes'));
      var query = element(by.model('query'));

      expect(aportantesList.count()).toBe(3);

      query.sendKeys('Buenos Aires');
      expect(aportantesList.count()).toBe(2);

      query.clear();
      query.sendKeys('pedro');
      expect(aportantesList.count()).toBe(1);
    });
  });
});
