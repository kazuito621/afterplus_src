describe('app', function() {
    beforeEach(function() {
        browser.manage().timeouts().implicitlyWait(25000);
        browser.get('http://0.0.0.0:9000');
    });

    it('should have a title', function() {
        expect(browser.getTitle()).toMatch(/tree/i);
    });

    it('login & create estimate & check new estimate in estimate tab & navigate other tabs', function() { // Have to separate these 'it' functions. Studying.
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
        //var speciesChkBox = element(speciesChkBoxLocator).click();
        //expect(speciesChkBox.isSelected()).toBe(true);


        //Create estimate
        var propertyDropdown=element(by.id('select_site')); // Property dropdown
        propertyDropdown.click();

        element(by.repeater('site in data').row(7)).click(); // Select 10th at hoyt

        // Select trees
        var i= 0, j=5;
        element.all(by.repeater('tree in trees')).all(by.model('checked')).each(function(element) {
            if(i>=j) return;
            i++;
            element.click();
        });

        element(by.buttonText('Add to Estimate')).click(); // Add trees to estimate

        var list = element.all(by.repeater('item in groupedItems | limitTo : limit track by item.treeID'));

        expect(list.count()).toBe(j-i);

        element(by.css('i.fa.fa-gear._size5')).click(); // Adjust price
        for(var n=1;n<=10;n++){
            element(by.css('.panel-body')).element(by.css('.button')).click();
        }
        element(by.css('.panel-body')).element(by.css('.btn.btn-default')).element(by.css('i.fa.fa-check')).click();

        //Tries to naviage aways
        element(by.css('.fa-dollar')).click();

        //Cancel the navigation
        element(by.css('.modal-content')).element(by.css('.btn.btn-primary')).click();

        //Change the estimate name
        element(by.css('.name')).element(by.css('.reportName ')).click();
        var estName=randomString(7);
        var estimateNameField=element(by.css('.editable-controls')).element(by.model('$data'));
        estimateNameField.clear();
        estimateNameField.sendKeys(estName);
        element(by.css('.editable-controls')).element(by.css('.btn.btn-primary')).click();

        // Add service
        element(by.model('service.desc')).sendKeys('Test service');
        element(by.model('service.quantity')).clear();
        element(by.model('service.quantity')).sendKeys('3');
        element(by.model('service.price')).sendKeys('20');

        element(by.css('[ng-click="addMiscService(service.desc,service.quantity,service.price)"]')).click();

        //save the estimate
        element(by.css('[ng-click="saveReport()"]')).click();

        var totalPriceText="";
        element(by.css('.table_estimate')).element(by.css('.total-amount')).getText().then(function(text){
            totalPriceText=text;
        });


        //check estimates page
        element(by.css('.fa-dollar')).click();

        expect(browser.driver.isElementPresent(by.css('h1.pull-left'))).toBe(true);
        expect(element(by.css('h1.pull-left')).getText()).toEqual('Estimates');

        // Check if the previously created estimate is there (it will be first item of estimate list)
        var firstEstimate=element(by.repeater('e in displayedEstimates').row(0));
        expect(firstEstimate.element(by.binding('e.name_short')).getText()).toBe(estName);
        var estimatePrice="";
        firstEstimate.element(by.binding('e.total_price')).getText().then(function(text){
            estimatePrice=text;
            estimatePrice=estimatePrice.replace("$",""); // Removing special character for regex match
            expect(totalPriceText).toMatch(estimatePrice);
        });


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

function randomString(len) {
    var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}