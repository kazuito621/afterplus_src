/**
 * Created by Imdadul Huq on 25-Jun-15.
 */

app.directive('jobExpenses',
    ['Api',function (Api) {
        'use strict';

        return {
            restrict: 'E',
            replace: true,
            transclude: false,
            templateUrl: 'js/common/directives/jobExpenses/jobExpenses.tpl.html',
            scope:{
                reportId:'@reportId',
                reportDeductions: '@reportDeductions'
            },
            link:function (scope, el, attrs) {
                scope.newDeduction = {};
                scope.newDeduction.description = '';
                scope.newDeduction.price = '';
                scope.deductions = scope.$eval(attrs.reportDeductions);
                if (scope.deductions == undefined) {
                    scope.deductions = [];
                }
                scope.totalExpenses = 0;

                _.each(scope.deductions, function(deduction){
                    scope.totalExpenses += parseFloat(deduction.price);
                }) ;

                scope.updateDeduction = function(deduction) {
                    Api.updateDeduction(scope.reportId,deduction.deductionID, deduction).then(function(data){
                        scope.totalExpenses = data.total_deduction;
                    });
                };

                scope.addDeduction = function() {
                    console.log(scope.newDeduction);
                    Api.addDeduction(scope.reportId, scope.newDeduction).then(function(data){
                        console.log(data);
                        var deduction = angular.copy(scope.newDeduction);
                        deduction.deductionID = data.deductionID;
                        deduction.reportID = data.reportID;

                        scope.deductions.push(deduction);

                        scope.totalExpenses = data.total_deduction;

                        // after save
                        scope.newDeduction.description = '';
                        scope.newDeduction.price = '';
                    });

                };

                scope.removeDeduction = function(deduction, index) {
                    Api.removeDeduction(scope.reportId,deduction.deductionID).then(function(data){
                        scope.totalExpenses -= parseFloat(deduction.price);
                        scope.deductions.splice(index, 1);
                    });
                };
            }
        };
    }]);


