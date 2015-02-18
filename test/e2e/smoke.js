describe('app', function() {
  beforeEach(function() {
    browser.manage().timeouts().pageLoadTimeout(40000);
    browser.manage().timeouts().implicitlyWait(25000);
    browser.get('http://0.0.0.0:9000');
  });
  it('should have a title', function() {
    expect(browser.getTitle()).toEqual('ArborPlus Tree Management');
  });

  iit('should let user to login', function() {
    var email = element(by.model('login.email'));
    email.sendKeys('timhon@gmail.com');
    var password = element(by.model('login.pswd'));
    password.sendKeys('asdf');
    var signInBtn = element(by.css('.btn[type=submit]'));
    signInBtn.click();
    console.log('test');
    var speciesChkBoxLocator = by.css('input#checkBox_filter_species_273');
    browser.wait(function() {
      return browser.driver.isElementPresent(speciesChkBoxLocator);
    }, 8000);
    var speciesChkBox = element(speciesChkBoxLocator).click();
    expect(speciesChkBox.isSelected()).toBe(true);
  });
});
