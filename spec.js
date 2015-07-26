describe('Demo test ', function() {
    it('should open web page', function () {
        browser.get('http://www.protractortest.org/#/tutorial');
        var body = element(by.css('body'));
        expect(body.isDisplayed()).toBeTruthy();
    });
});