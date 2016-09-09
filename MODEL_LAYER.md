# Model Layer

# Edgefolio ORM Model Layer

[https://github.com/JamesMcGuigan/edgefolio-orm](https://github.com/JamesMcGuigan/edgefolio-orm)

A fully recursive, promised and lazy loading json object, 
representing a multi-endpoint REST API with foreign key support,
with timeseries financial calculations and extensive unit tests. 

```
it("should be possible to fully recurse through data model", function(done) {
  $q.all([
    ManagementCompany.load(2).$loadPromise,
    Fund.load(17).$loadPromise,
    ShareClass.load(1233).$loadPromise,
    ServiceProvider.load(1).$loadPromise,
    Manager.load(1).$loadPromise
  ]).then(function() {
    expect( ManagementCompany.load(2) ).to.equal( new ManagementCompany(2) );
    expect( ManagementCompany.load(2).fund_ids  ).to.contain( 17 );
    expect( ManagementCompany.load(2).fund_index[17] ).to.equal( Fund.load(17) );
    expect( ManagementCompany.load(2).fund_index[17].share_class_ids ).to.contain( 1233 );
    expect( ManagementCompany.load(2).fund_index[17].share_class_index[1233] ).to.equal( ShareClass.load(1233) );
    expect( ManagementCompany.load(2).fund_index[17].share_class_index[1233].fund_id ).to.equal( 17 );
    expect( ManagementCompany.load(2).fund_index[17].share_class_index[1233].fund ).to.equal( Fund.load(17) );
    expect( ManagementCompany.load(2).fund_index[17].share_class_index[1233].fund.service_provider_ids ).to.contain( 1 );
    expect( ManagementCompany.load(2).fund_index[17].share_class_index[1233].fund.service_provider_index[1] ).to.equal( ServiceProvider.load(1) );
    expect( ManagementCompany.load(2).fund_index[17].share_class_index[1233].fund.service_provider_index[1].funds[0].id ).to.equal( 84 );
    expect( ManagementCompany.load(2).fund_index[17].share_class_index[1233].fund.service_provider_index[1].funds[0].management_company_id ).to.equal( 2 );
    expect( ManagementCompany.load(2).fund_index[17].share_class_index[1233].fund.service_provider_index[1].funds[0].management_company ).to.equal( ManagementCompany.load(2) );
    done();
  });
  $httpBackend.flush();
  $rootScope.$apply();
});
``` 

