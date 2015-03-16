describe('app', function() {
  beforeEach(function() {
    browser.manage().timeouts().implicitlyWait(25000);
    browser.get('http://0.0.0.0:9000');
  });

  it('should have a title', function() {
    expect(browser.getTitle()).toMatch(/tree/i);
  });

  it('should open all pages', function() {
    // do login
    var email = element(by.model('login.email'));
    email.sendKeys('timhon@gmail.com');
    var password = element(by.model('login.pswd'));
    password.sendKeys('asdf');
    var signInBtn = element(by.cssContainingText('.btn', 'Sign In'));
    signInBtn.click();

    // check Trees page
    var speciesChkBoxLocator = by.css('input#checkBox_filter_species_273');
    // wait for login action to complete. we know it's done when there is a checkbox available
    browser.wait(function() {
      return browser.driver.isElementPresent(speciesChkBoxLocator);
    });
    var speciesChkBox = element(speciesChkBoxLocator).click();
    expect(speciesChkBox.isSelected()).toBe(true);
    element(speciesChkBoxLocator).click();
    expect(element(by.css('[filter-search-species] h3')).getText()).toEqual('SPECIES');
    //check Species list has at least 5 values in it
    expect(element.all(by.repeater('speciesType in initDataSpecies')).count()).toBeGreaterThan(5);
    //check Treatments list has at least 5 values in it
    expect(element.all(by.repeater('t in initDataTreatments')).count()).toBeGreaterThan(5);
    // check Client Type dropdown list has at least 10 client types
    expect(element.all(by.repeater('clientType in data')).count()).toBeGreaterThan(10);
    // check Client dropbown has at least 1 value
    expect(element.all(by.repeater('client in data')).count()).toBeGreaterThan(1);
    // check Property dropdown list has at least 5 values in it
    expect(element.all(by.repeater('site in data')).count()).toBeGreaterThan(5);
    //check Google Maps have loaded
    browser.driver.wait(function() {
      return browser.executeScript('return window.mapLoaded')
    });
    expect(element(by.css('#treeMap')).isPresent()).toBe(true);

    //check estimates page
    element(by.css('.fa-dollar')).click();
    expect(browser.driver.isElementPresent(by.css('h1.pull-left'))).toBe(true);
    expect(element(by.css('h1.pull-left')).getText()).toEqual('Estimates');
    // check estimates list has been populated and has at least 1 estimate
    expect(element.all(by.repeater('e in displayedEstimates')).count()).toBeGreaterThan(1);

    //check properties page
    element(by.css('.fa-home')).click();
    expect(browser.driver.isElementPresent(by.css('h1.pull-left'))).toBe(true);
    expect(element(by.css('h1.pull-left')).getText()).toEqual('Properties');
    // check properties list has at least 1 property
    expect(element.all(by.repeater('s in displayedSites')).count()).toBeGreaterThan(1);

    //check clients page
    element(by.css('.fa-user')).click();
    browser.wait(function() {
      return browser.driver.isElementPresent(by.css('.fa-plus'));
    });
    expect(browser.driver.isElementPresent(by.css('h1.pull-left'))).toBe(true);
    expect(element(by.css('h1.pull-left')).getText()).toEqual('Clients');
    // check clients list has at least 1 client
    expect(element.all(by.repeater('c in displayedClients')).count()).toBeGreaterThan(1);
  });
});
