describe('app', function() {
  beforeEach(function() {
    browser.manage().timeouts().implicitlyWait(25000);
    browser.get('http://0.0.0.0:9000');
  });

  it('should have a title', function() {
    expect(browser.getTitle()).toMatch(/tree/i);
  });

  it('should let user to login', function() {
    // do login
    var email = element(by.model('login.email'));
    email.sendKeys('timhon@gmail.com');
    var password = element(by.model('login.pswd'));
    password.sendKeys('asdf');
    var signInBtn = element(by.css('.btn[type=submit]'));
    signInBtn.click();

    // check Trees page
    var speciesChkBoxLocator = by.css('input#checkBox_filter_species_273');
    // wait for login action to complete. we know it's done when there is a checkbox available
    browser.wait(function() {
      return browser.driver.isElementPresent(speciesChkBoxLocator);
    });
    var speciesChkBox = element(speciesChkBoxLocator).click();
    expect(speciesChkBox.isSelected()).toBe(true);

    //check estimates page
    element(by.css('.fa-dollar')).click();
    expect(browser.driver.isElementPresent(by.css('h1.pull-left'))).toBe(true);
    expect(element(by.css('h1.pull-left')).getText()).toEqual('Estimates');

    //check properties page
    element(by.css('.fa-home')).click();
    expect(browser.driver.isElementPresent(by.css('h1.pull-left'))).toBe(true);
    expect(element(by.css('h1.pull-left')).getText()).toEqual('Properties');

    //check clients page
    element(by.css('.fa-user')).click();
    browser.wait(function() {
      return browser.driver.isElementPresent(by.css('.fa-plus'));
    });
    expect(browser.driver.isElementPresent(by.css('h1.pull-left'))).toBe(true);
    expect(element(by.css('h1.pull-left')).getText()).toEqual('Clients');
  });
});
